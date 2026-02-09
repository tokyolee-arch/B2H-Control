'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { TerminalState, BatteryState, PowerDataPoint, TerminalType } from '@/types/b2h';
import { AC_SPEC, DC_SPEC, BATTERY_SPEC } from '@/constants/config';

/* ══════════════════════════════════════════════
   유틸리티
   ══════════════════════════════════════════════ */

/** min~max 범위 난수 */
function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/** 값을 min~max로 클램프 */
function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

/** 초 → "Xh Ym" 형식 */
function formatDurationHM(totalSeconds: number): string {
  if (totalSeconds <= 0) return '—';
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  if (h > 0) return `${h}h ${m.toString().padStart(2, '0')}m`;
  return `${m}m`;
}

/** 시:분 형식 "HH:MM" */
function formatTimeHHMM(date: Date): string {
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

/* ══════════════════════════════════════════════
   시뮬레이션 내부 상태 타입
   ══════════════════════════════════════════════ */

type ACPhase = 'off' | 'ramp_up' | 'running' | 'ramp_down';
type DCPhase = 'off' | 'ramp_up' | 'compressor_on' | 'compressor_off' | 'spike_to_on' | 'spike_to_off' | 'ramp_down';

interface ACSimState {
  phase: ACPhase;
  rampElapsed: number;    // ramp 진행 시간 (초)
  rampStartPower: number; // ramp 시작 전력
}

interface DCSimState {
  phase: DCPhase;
  phaseTimer: number;         // 현재 페이즈 남은 시간 (초)
  targetOnDuration: number;   // 이번 ON 구간 목표 시간
  targetOffDuration: number;  // 이번 OFF 구간 목표 시간
  rampElapsed: number;
  rampStartPower: number;
}

/* ══════════════════════════════════════════════
   상수
   ══════════════════════════════════════════════ */

const TICK_INTERVAL = 2000;           // 2초 간격
const TICK_SEC = TICK_INTERVAL / 1000;
const HISTORY_MAX = 60;               // 최근 60포인트 (2초 × 60 = 120초 ≒ 2분)
const INITIAL_SOC = 72;
const KM_PER_SOC = 2.05;             // 100% = 205km 기준
const RAMP_UP_DURATION = 2;          // AC ramp-up 총 시간 (초)
const RAMP_DOWN_DURATION = 2;        // ramp-down 총 시간 (초)

// AC 미세 변동 범위
const AC_POWER_BASE = 2.4;
const AC_POWER_MIN = 2.0;
const AC_POWER_MAX = 2.8;

// DC 컴프레셔 사이클
const DC_ON_POWER_MIN = 3.5;
const DC_ON_POWER_MAX = 4.5;
const DC_OFF_POWER_MIN = 0.3;
const DC_OFF_POWER_MAX = 0.8;
const DC_ON_DURATION_MIN = 30;        // 초
const DC_ON_DURATION_MAX = 60;
const DC_OFF_DURATION_MIN = 20;
const DC_OFF_DURATION_MAX = 40;
const DC_INRUSH_POWER = 5.0;         // 돌입전류 피크

/* ══════════════════════════════════════════════
   초기 터미널 상태
   ══════════════════════════════════════════════ */

const initialACTerminal: TerminalState = {
  type: 'ac',
  isOn: false,
  currentPower: 0,
  maxPower: AC_SPEC.maxPower,
  cumulativeEnergy: 0,
  usageDuration: 0,
  voltage: AC_SPEC.voltage,
  frequency: AC_SPEC.frequency,
};

const initialDCTerminal: TerminalState = {
  type: 'dc',
  isOn: false,
  currentPower: 0,
  maxPower: DC_SPEC.maxPower,
  cumulativeEnergy: 0,
  usageDuration: 0,
  voltage: DC_SPEC.voltage,
};

const initialBattery: BatteryState = {
  soc: INITIAL_SOC,
  totalCapacity: BATTERY_SPEC.totalCapacity,
  reservePercent: BATTERY_SPEC.reservePercent,
  estimatedRange: INITIAL_SOC * KM_PER_SOC,
};

/* ══════════════════════════════════════════════
   메인 훅
   ══════════════════════════════════════════════ */

export function usePowerSimulation() {
  /* ── React 상태 ── */
  const [acTerminal, setACTerminal] = useState<TerminalState>(initialACTerminal);
  const [dcTerminal, setDCTerminal] = useState<TerminalState>(initialDCTerminal);
  const [batteryState, setBatteryState] = useState<BatteryState>(initialBattery);
  const [acPowerHistory, setACPowerHistory] = useState<PowerDataPoint[]>([]);
  const [dcPowerHistory, setDCPowerHistory] = useState<PowerDataPoint[]>([]);

  /* ── Ref: interval 클로저 안에서 최신 상태 접근 ── */
  const acSimRef = useRef<ACSimState>({
    phase: 'off',
    rampElapsed: 0,
    rampStartPower: 0,
  });
  const dcSimRef = useRef<DCSimState>({
    phase: 'off',
    phaseTimer: 0,
    targetOnDuration: rand(DC_ON_DURATION_MIN, DC_ON_DURATION_MAX),
    targetOffDuration: rand(DC_OFF_DURATION_MIN, DC_OFF_DURATION_MAX),
    rampElapsed: 0,
    rampStartPower: 0,
  });

  const acRef = useRef(acTerminal);
  const dcRef = useRef(dcTerminal);
  const batteryRef = useRef(batteryState);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const totalCumulativeRef = useRef(0); // 전체 누적 에너지 (kWh)

  // 최신 state를 ref에 동기화
  acRef.current = acTerminal;
  dcRef.current = dcTerminal;
  batteryRef.current = batteryState;

  /* ═══════════════════════════════════════════
     토글 핸들러
     ═══════════════════════════════════════════ */

  const toggleTerminal = useCallback((type: TerminalType) => {
    if (type === 'ac') {
      setACTerminal(prev => {
        const turningOn = !prev.isOn;
        const acSim = acSimRef.current;

        if (turningOn) {
          acSim.phase = 'ramp_up';
          acSim.rampElapsed = 0;
          acSim.rampStartPower = 0;
        } else {
          acSim.phase = 'ramp_down';
          acSim.rampElapsed = 0;
          acSim.rampStartPower = prev.currentPower;
        }

        return { ...prev, isOn: turningOn };
      });
    } else {
      setDCTerminal(prev => {
        const turningOn = !prev.isOn;
        const dcSim = dcSimRef.current;

        if (turningOn) {
          dcSim.phase = 'ramp_up';
          dcSim.rampElapsed = 0;
          dcSim.rampStartPower = 0;
          dcSim.targetOnDuration = rand(DC_ON_DURATION_MIN, DC_ON_DURATION_MAX);
          dcSim.phaseTimer = dcSim.targetOnDuration;
        } else {
          dcSim.phase = 'ramp_down';
          dcSim.rampElapsed = 0;
          dcSim.rampStartPower = prev.currentPower;
        }

        return { ...prev, isOn: turningOn };
      });
    }
  }, []);

  /* ═══════════════════════════════════════════
     시뮬레이션 tick 함수들
     ═══════════════════════════════════════════ */

  /** AC 전력 계산 (1 tick) */
  const computeACPower = useCallback((): number => {
    const sim = acSimRef.current;
    const ac = acRef.current;

    if (!ac.isOn && sim.phase !== 'ramp_down') {
      sim.phase = 'off';
      return 0;
    }

    switch (sim.phase) {
      case 'off':
        return 0;

      case 'ramp_up': {
        sim.rampElapsed += TICK_SEC;
        const progress = clamp(sim.rampElapsed / RAMP_UP_DURATION, 0, 1);
        // ease-out 커브
        const eased = 1 - Math.pow(1 - progress, 3);
        const power = AC_POWER_BASE * eased;
        if (progress >= 1) {
          sim.phase = 'running';
        }
        return power;
      }

      case 'running': {
        // 미세 변동: 이전 값 기준 ±0.15 랜덤 워크
        const prev = ac.currentPower || AC_POWER_BASE;
        const delta = rand(-0.15, 0.15);
        return clamp(prev + delta, AC_POWER_MIN, AC_POWER_MAX);
      }

      case 'ramp_down': {
        sim.rampElapsed += TICK_SEC;
        const progress = clamp(sim.rampElapsed / RAMP_DOWN_DURATION, 0, 1);
        const power = sim.rampStartPower * (1 - progress);
        if (progress >= 1) {
          sim.phase = 'off';
          return 0;
        }
        return power;
      }

      default:
        return 0;
    }
  }, []);

  /** DC 전력 계산 (1 tick) — 컴프레셔 사이클 */
  const computeDCPower = useCallback((): number => {
    const sim = dcSimRef.current;
    const dc = dcRef.current;

    if (!dc.isOn && sim.phase !== 'ramp_down') {
      sim.phase = 'off';
      return 0;
    }

    switch (sim.phase) {
      case 'off':
        return 0;

      case 'ramp_up': {
        sim.rampElapsed += TICK_SEC;
        const progress = clamp(sim.rampElapsed / RAMP_UP_DURATION, 0, 1);
        const targetPower = rand(DC_ON_POWER_MIN, DC_ON_POWER_MAX);
        const power = targetPower * progress;
        if (progress >= 1) {
          sim.phase = 'compressor_on';
          sim.phaseTimer = sim.targetOnDuration;
        }
        return power;
      }

      case 'compressor_on': {
        sim.phaseTimer -= TICK_SEC;
        if (sim.phaseTimer <= 0) {
          // ON→OFF 전환: 돌입전류 스파이크
          sim.phase = 'spike_to_off';
          sim.targetOffDuration = rand(DC_OFF_DURATION_MIN, DC_OFF_DURATION_MAX);
          sim.phaseTimer = sim.targetOffDuration;
          return DC_INRUSH_POWER;
        }
        // ON 구간: 3.5~4.5kW 범위 미세 변동
        const prev = dc.currentPower || 4.0;
        const delta = rand(-0.2, 0.2);
        return clamp(prev + delta, DC_ON_POWER_MIN, DC_ON_POWER_MAX);
      }

      case 'spike_to_off': {
        // 스파이크 1 tick 후 → OFF 구간으로
        sim.phase = 'compressor_off';
        return rand(DC_OFF_POWER_MIN, DC_OFF_POWER_MAX);
      }

      case 'compressor_off': {
        sim.phaseTimer -= TICK_SEC;
        if (sim.phaseTimer <= 0) {
          // OFF→ON 전환: 돌입전류 스파이크
          sim.phase = 'spike_to_on';
          sim.targetOnDuration = rand(DC_ON_DURATION_MIN, DC_ON_DURATION_MAX);
          sim.phaseTimer = sim.targetOnDuration;
          return DC_INRUSH_POWER;
        }
        // OFF 구간: 0.3~0.8kW 범위
        const prev = dc.currentPower || 0.5;
        const delta = rand(-0.05, 0.05);
        return clamp(prev + delta, DC_OFF_POWER_MIN, DC_OFF_POWER_MAX);
      }

      case 'spike_to_on': {
        // 스파이크 1 tick 후 → ON 구간으로
        sim.phase = 'compressor_on';
        return rand(DC_ON_POWER_MIN, DC_ON_POWER_MAX);
      }

      case 'ramp_down': {
        sim.rampElapsed += TICK_SEC;
        const progress = clamp(sim.rampElapsed / RAMP_DOWN_DURATION, 0, 1);
        const power = sim.rampStartPower * (1 - progress);
        if (progress >= 1) {
          sim.phase = 'off';
          return 0;
        }
        return power;
      }

      default:
        return 0;
    }
  }, []);

  /* ═══════════════════════════════════════════
     메인 시뮬레이션 루프
     ═══════════════════════════════════════════ */

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const now = Date.now();

      // 전력 계산
      const acPower = computeACPower();
      const dcPower = computeDCPower();

      // 소수점 2자리로 반올림 (부동소수점 누적 방지)
      const acPowerRound = Math.round(acPower * 100) / 100;
      const dcPowerRound = Math.round(dcPower * 100) / 100;

      // ── AC 상태 업데이트 ──
      setACTerminal(prev => {
        const isActive = prev.isOn || acSimRef.current.phase === 'ramp_down';
        return {
          ...prev,
          currentPower: acPowerRound,
          cumulativeEnergy: isActive
            ? prev.cumulativeEnergy + (acPowerRound * TICK_SEC / 3600)
            : prev.cumulativeEnergy,
          usageDuration: prev.isOn
            ? prev.usageDuration + TICK_SEC
            : prev.usageDuration,
          // ramp_down 완료 시 isOn 유지 (이미 false)
        };
      });

      // ── DC 상태 업데이트 ──
      setDCTerminal(prev => {
        const isActive = prev.isOn || dcSimRef.current.phase === 'ramp_down';
        return {
          ...prev,
          currentPower: dcPowerRound,
          cumulativeEnergy: isActive
            ? prev.cumulativeEnergy + (dcPowerRound * TICK_SEC / 3600)
            : prev.cumulativeEnergy,
          usageDuration: prev.isOn
            ? prev.usageDuration + TICK_SEC
            : prev.usageDuration,
        };
      });

      // ── 전력 히스토리 ──
      setACPowerHistory(prev => {
        const next = [...prev, { time: now, power: acPowerRound }];
        return next.slice(-HISTORY_MAX);
      });

      setDCPowerHistory(prev => {
        const next = [...prev, { time: now, power: dcPowerRound }];
        return next.slice(-HISTORY_MAX);
      });

      // ── 배터리 연동 ──
      const totalPowerThisTick = acPowerRound + dcPowerRound;
      const energyThisTick = totalPowerThisTick * TICK_SEC / 3600; // kWh
      totalCumulativeRef.current += energyThisTick;

      setBatteryState(() => {
        const newSoc = clamp(
          INITIAL_SOC - (totalCumulativeRef.current / BATTERY_SPEC.totalCapacity * 100),
          BATTERY_SPEC.reservePercent,
          100
        );
        return {
          soc: Math.round(newSoc * 100) / 100,
          totalCapacity: BATTERY_SPEC.totalCapacity,
          reservePercent: BATTERY_SPEC.reservePercent,
          estimatedRange: Math.max(0, Math.round(newSoc * KM_PER_SOC * 10) / 10),
        };
      });
    }, TICK_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [computeACPower, computeDCPower]);

  /* ═══════════════════════════════════════════
     파생 값 (메모이제이션)
     ═══════════════════════════════════════════ */

  const totalPowerConsumption = useMemo(() => {
    return Math.round((acTerminal.currentPower + dcTerminal.currentPower) * 100) / 100;
  }, [acTerminal.currentPower, dcTerminal.currentPower]);

  /** ON 상태인 터미널 개수 (0, 1, 2) */
  const activePanelCount = useMemo(() => {
    return (acTerminal.isOn ? 1 : 0) + (dcTerminal.isOn ? 1 : 0);
  }, [acTerminal.isOn, dcTerminal.isOn]);

  const estimatedRemainingTime = useMemo(() => {
    const availableEnergy = Math.max(
      0,
      (batteryState.soc - batteryState.reservePercent) / 100 * batteryState.totalCapacity
    );
    if (totalPowerConsumption <= 0) return '—';
    const remainingSec = (availableEnergy / totalPowerConsumption) * 3600;
    return formatDurationHM(remainingSec);
  }, [batteryState.soc, batteryState.reservePercent, batteryState.totalCapacity, totalPowerConsumption]);

  const estimatedDepletionTime = useMemo(() => {
    const availableEnergy = Math.max(
      0,
      (batteryState.soc - batteryState.reservePercent) / 100 * batteryState.totalCapacity
    );
    if (totalPowerConsumption <= 0) return '—';
    const remainingMs = (availableEnergy / totalPowerConsumption) * 3600 * 1000;
    const depletionDate = new Date(Date.now() + remainingMs);
    return formatTimeHHMM(depletionDate);
  }, [batteryState.soc, batteryState.reservePercent, batteryState.totalCapacity, totalPowerConsumption]);

  /* ═══════════════════════════════════════════
     반환
     ═══════════════════════════════════════════ */

  return {
    batteryState,
    acTerminal,
    dcTerminal,
    acPowerHistory,
    dcPowerHistory,
    toggleTerminal,
    totalPowerConsumption,
    activePanelCount,
    estimatedRemainingTime,
    estimatedDepletionTime,
  };
}
