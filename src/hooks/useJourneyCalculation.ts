'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type { JourneyPlan, JourneySegment, JourneyWaypoint } from '@/types/journey';
import type { ChargingStation } from '@/types/charging';
import { BATTERY_SPEC } from '@/constants/config';

/* ═══════════════════════════════════════════
   포맷 유틸
   ═══════════════════════════════════════════ */

/** 68 → "1h 08m" */
export function minutesToTimeString(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m.toString().padStart(2, '0')}m` : `${m}min`;
}

/** "14:30" + 68분 → "15:38" */
export function addMinutesToTime(baseTime: string, minutes: number): string {
  const [h, m] = baseTime.split(':').map(Number);
  const total = h * 60 + m + minutes;
  const newH = Math.floor(total / 60) % 24;
  const newM = total % 60;
  return `${newH.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`;
}

/** 14560 → "14,560" */
export function formatCurrency(won: number): string {
  return won.toLocaleString('ko-KR');
}

/* ═══════════════════════════════════════════
   충전 시간 계산 (비선형 충전 속도)
   ═══════════════════════════════════════════ */
function calcChargingDuration(
  arrivalSoc: number,
  targetSoc: number,
  maxPower: number,
  totalCapacity: number,
): number {
  const bands: { from: number; to: number; factor: number }[] = [
    { from: 0, to: 80, factor: 0.8 },
    { from: 80, to: 90, factor: 0.4 },
    { from: 90, to: 100, factor: 0.15 },
  ];
  let totalMinutes = 0;
  for (const band of bands) {
    const lo = Math.max(arrivalSoc, band.from);
    const hi = Math.min(targetSoc, band.to);
    if (lo >= hi) continue;
    const kwhInBand = ((hi - lo) / 100) * totalCapacity;
    const effectivePower = maxPower * band.factor;
    totalMinutes += (kwhInBand / effectivePower) * 60;
  }
  return Math.round(totalMinutes);
}

/* ═══════════════════════════════════════════
   선택된 충전소로 동적 여정 계획 생성
   ═══════════════════════════════════════════ */

/** 에너지 소비 상수 (MOCK_JOURNEY 기반) */
const ENERGY_PER_KM = 0.263;  // kWh/km (순수 주행)
const DURATION_PER_KM = 0.628; // min/km (평균 속도)
const DEFAULT_TARGET_SOC = 80;

export function buildDynamicJourney(
  basePlan: JourneyPlan,
  selectedStations: ChargingStation[],
): JourneyPlan {
  const totalCapacity = BATTERY_SPEC.totalCapacity;
  const origin = basePlan.waypoints.find((w) => w.type === 'origin')!;
  const dest = basePlan.waypoints.find((w) => w.type === 'destination')!;
  const totalDistance = basePlan.totalDistance;

  // 거리순 정렬
  const sorted = [...selectedStations].sort((a, b) => a.distanceFromOrigin - b.distanceFromOrigin);

  const waypoints: JourneyWaypoint[] = [{ ...origin }];
  const segments: JourneySegment[] = [];

  let currentKm = 0;
  let currentSoc = origin.arrivalSoc;
  let cursor = origin.arrivalTime;
  let prevWpId = origin.id;
  let driveIdx = 1;

  for (const station of sorted) {
    const dist = station.distanceFromOrigin - currentKm;
    const dur = Math.round(dist * DURATION_PER_KM);
    const energy = Math.round(dist * ENERGY_PER_KM * 10) / 10;
    const b2hKw = 6.2; // AC 2.4 + DC 3.8 기본
    const b2h = Math.round((dur / 60) * b2hKw * 10) / 10;
    const b2hAc = Math.round((dur / 60) * 2.4 * 10) / 10;
    const b2hDc = Math.round((dur / 60) * 3.8 * 10) / 10;
    const socConsumed = ((energy + b2h) / totalCapacity) * 100;
    const arrSoc = Math.max(0, Math.round(currentSoc - socConsumed));

    const driveEndTime = addMinutesToTime(cursor, dur);
    const wpId = `wp-charge-${driveIdx}`;

    // 주행 세그먼트
    segments.push({
      fromId: prevWpId,
      toId: wpId,
      type: 'driving',
      label: `주행 ${driveIdx}`,
      distance: dist,
      duration: dur,
      energyConsumed: energy,
      b2hConsumed: b2h,
      b2hAcConsumed: b2hAc,
      b2hDcConsumed: b2hDc,
      socStart: currentSoc,
      socEnd: arrSoc,
      startTime: cursor,
      endTime: driveEndTime,
    });

    // 초기 충전 시간 계산
    const maxPw = station.maxPower;
    const initChargeDur = calcChargingDuration(arrSoc, DEFAULT_TARGET_SOC, maxPw, totalCapacity);
    const chargeEndTime = addMinutesToTime(driveEndTime, initChargeDur);

    // 충전 경유지 waypoint
    waypoints.push({
      id: wpId,
      type: 'charging',
      name: station.name,
      address: station.address,
      arrivalTime: driveEndTime,
      departureTime: chargeEndTime,
      arrivalSoc: arrSoc,
      departureSoc: DEFAULT_TARGET_SOC,
      stationInfo: {
        operator: station.operator,
        maxPower: station.maxPower,
        chargerType: station.chargerType,
        availableChargers: station.availableChargers,
        totalChargers: station.totalChargers,
        pricePerKwh: station.pricePerKwh,
      },
    });

    // 충전 세그먼트
    const chargeKwh = Math.round(((DEFAULT_TARGET_SOC - arrSoc) / 100) * totalCapacity * 10) / 10;
    segments.push({
      fromId: wpId,
      toId: wpId,
      type: 'charging',
      label: '충전',
      duration: initChargeDur,
      socStart: arrSoc,
      socEnd: DEFAULT_TARGET_SOC,
      chargeAmount: chargeKwh,
      startTime: driveEndTime,
      endTime: chargeEndTime,
    });

    currentKm = station.distanceFromOrigin;
    currentSoc = DEFAULT_TARGET_SOC;
    cursor = chargeEndTime;
    prevWpId = wpId;
    driveIdx++;
  }

  // 마지막 주행 세그먼트 (목적지까지)
  const finalDist = totalDistance - currentKm;
  const finalDur = Math.round(finalDist * DURATION_PER_KM);
  const finalEnergy = Math.round(finalDist * ENERGY_PER_KM * 10) / 10;
  const finalB2h = Math.round((finalDur / 60) * 6.2 * 10) / 10;
  const finalB2hAc = Math.round((finalDur / 60) * 2.4 * 10) / 10;
  const finalB2hDc = Math.round((finalDur / 60) * 3.8 * 10) / 10;
  const finalSocConsumed = ((finalEnergy + finalB2h) / totalCapacity) * 100;
  const finalArrSoc = Math.max(0, Math.round(currentSoc - finalSocConsumed));
  const finalEndTime = addMinutesToTime(cursor, finalDur);

  segments.push({
    fromId: prevWpId,
    toId: dest.id,
    type: 'driving',
    label: `주행 ${driveIdx}`,
    distance: finalDist,
    duration: finalDur,
    energyConsumed: finalEnergy,
    b2hConsumed: finalB2h,
    b2hAcConsumed: finalB2hAc,
    b2hDcConsumed: finalB2hDc,
    socStart: currentSoc,
    socEnd: finalArrSoc,
    startTime: cursor,
    endTime: finalEndTime,
  });

  waypoints.push({
    ...dest,
    arrivalTime: finalEndTime,
    arrivalSoc: finalArrSoc,
  });

  // 합계
  const drivingSegs = segments.filter((s) => s.type === 'driving');
  const chargingSegs = segments.filter((s) => s.type === 'charging');
  const totalDrivingDuration = drivingSegs.reduce((sum, s) => sum + s.duration, 0);
  const totalChargingDuration = chargingSegs.reduce((sum, s) => sum + s.duration, 0);
  const totalB2H = drivingSegs.reduce((sum, s) => sum + (s.b2hConsumed ?? 0), 0);
  const totalChargingCost = chargingSegs.reduce((sum, s) => {
    const wp = waypoints.find((w) => w.id === s.fromId && w.type === 'charging');
    return sum + Math.round((s.chargeAmount ?? 0) * (wp?.stationInfo?.pricePerKwh ?? 350));
  }, 0);

  return {
    waypoints,
    segments,
    totalDistance,
    totalDuration: totalDrivingDuration + totalChargingDuration,
    totalDrivingDuration,
    totalChargingDuration,
    totalB2HConsumed: Math.round(totalB2H * 10) / 10,
    totalChargingCost,
    finalArrivalTime: finalEndTime,
    finalArrivalSoc: finalArrSoc,
  };
}

/* ═══════════════════════════════════════════
   세그먼트 높이 계산 (N개 충전소 지원)
   ═══════════════════════════════════════════ */

const TOTAL_AVAILABLE_HEIGHT = 920;
const MIN_DRIVING_H = 120;
const MIN_CHARGING_H = 80;
const ORIGIN_NODE_H = 42;

export interface SegmentHeightInfo {
  heights: number[];
  detailMarginTop: number;
}

function calcSegmentHeights(
  segments: JourneySegment[],
  totalDuration: number,
): SegmentHeightInfo {
  const heights = segments.map((seg) => {
    const proportional = (seg.duration / totalDuration) * TOTAL_AVAILABLE_HEIGHT;
    const min = seg.type === 'charging' ? MIN_CHARGING_H : MIN_DRIVING_H;
    return Math.max(proportional, min);
  });

  let marginTop = ORIGIN_NODE_H;
  for (let i = 0; i < segments.length; i++) {
    if (segments[i].type === 'charging') break;
    marginTop += heights[i];
  }
  marginTop -= 10;

  return { heights, detailMarginTop: marginTop };
}

/* ═══════════════════════════════════════════
   B2H 상태
   ═══════════════════════════════════════════ */

export interface B2HState {
  acOn: boolean;
  dcOn: boolean;
  acPower: number;
  dcPower: number;
}

const DEFAULT_B2H: B2HState = {
  acOn: true,
  dcOn: true,
  acPower: 2.4,
  dcPower: 3.8,
};

/* ═══════════════════════════════════════════
   충전소별 계산 결과
   ═══════════════════════════════════════════ */

export interface ChargeStopComputed {
  chargingDuration: number;
  chargingCost: number;
  chargeKwh: number;
  minTargetSoc: number;
  finalArrivalSoc: number;
  chargingSegment: JourneySegment;
  nextDrivingSegment: JourneySegment;
}

/* ═══════════════════════════════════════════
   반환 인터페이스
   ═══════════════════════════════════════════ */

export interface JourneyCalculation {
  journey: JourneyPlan;
  segmentHeights: SegmentHeightInfo;
  detailMarginTop: number;
  updateTargetSoc: (waypointId: string, newSoc: number) => void;
  updateB2HState: (acOn: boolean, dcOn: boolean, acPower: number, dcPower: number) => void;
  minTargetSocs: Record<string, number>;
  targetSocs: Record<string, number>;
  b2hState: B2HState;
  chargeStopResults: Record<string, ChargeStopComputed>;
  globals: {
    totalDuration: number;
    totalDrivingDuration: number;
    totalChargingDuration: number;
    totalChargingCost: number;
    finalArrivalSoc: number;
    finalArrivalTime: string;
    totalB2HConsumed: number;
    rangeReduction: number;
  };
  chargingDurations: Record<string, number>;
}

/* ═══════════════════════════════════════════
   메인 훅
   ═══════════════════════════════════════════ */

export function useJourneyCalculation(
  basePlan: JourneyPlan,
  selectedStations: ChargingStation[],
  initialB2H?: Partial<B2HState>,
): JourneyCalculation {
  const totalCapacity = BATTERY_SPEC.totalCapacity;

  /* ── 동적 여정 계획 생성 ── */
  const effectivePlan = useMemo(
    () => buildDynamicJourney(basePlan, selectedStations),
    [basePlan, selectedStations],
  );

  /* ── B2H 상태 ── */
  const [b2hState, setB2HState] = useState<B2HState>(() => ({
    ...DEFAULT_B2H,
    ...initialB2H,
  }));

  /* ── 각 충전 경유지의 목표 SOC (id → soc) ── */
  const [targetSocs, setTargetSocs] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    for (const wp of effectivePlan.waypoints) {
      if (wp.type === 'charging' && wp.departureSoc != null) {
        map[wp.id] = wp.departureSoc;
      }
    }
    return map;
  });

  /* ── selectedStations 변경 시 targetSocs 리셋 ── */
  const prevStationIdsRef = useRef(
    selectedStations.map((s) => s.id).join(','),
  );
  useEffect(() => {
    const key = selectedStations.map((s) => s.id).join(',');
    if (key !== prevStationIdsRef.current) {
      prevStationIdsRef.current = key;
      const map: Record<string, number> = {};
      for (const wp of effectivePlan.waypoints) {
        if (wp.type === 'charging' && wp.departureSoc != null) {
          map[wp.id] = wp.departureSoc;
        }
      }
      setTargetSocs(map);
    }
  }, [selectedStations, effectivePlan]);

  /* ═══════════════════════════════════════
     1단계: B2H 반영한 세그먼트 재계산
     ═══════════════════════════════════════ */
  const b2hAdjustedSegments = useMemo((): JourneySegment[] => {
    const totalB2HPower =
      (b2hState.acOn ? b2hState.acPower : 0) + (b2hState.dcOn ? b2hState.dcPower : 0);

    return effectivePlan.segments.map((seg): JourneySegment => {
      if (seg.type !== 'driving') return seg;
      const b2hConsumed = Math.round(((seg.duration / 60) * totalB2HPower) * 10) / 10;
      const b2hAcConsumed = b2hState.acOn
        ? Math.round(((seg.duration / 60) * b2hState.acPower) * 10) / 10
        : 0;
      const b2hDcConsumed = b2hState.dcOn
        ? Math.round(((seg.duration / 60) * b2hState.dcPower) * 10) / 10
        : 0;
      return { ...seg, b2hConsumed, b2hAcConsumed, b2hDcConsumed };
    });
  }, [effectivePlan.segments, b2hState]);

  /* ═══════════════════════════════════════
     2단계: 연쇄 SOC 재계산 + 충전소별 결과
     ═══════════════════════════════════════ */
  const { chargeStopResults, minTargetSocs, recalcSegments, recalcWaypoints } = useMemo(() => {
    const results: Record<string, ChargeStopComputed> = {};
    const mins: Record<string, number> = {};
    const segs = b2hAdjustedSegments.map((s) => ({ ...s }));
    const wps = effectivePlan.waypoints.map((w) => ({ ...w }));
    let currentSoc = wps[0]?.arrivalSoc ?? 72;

    for (let i = 0; i < segs.length; i++) {
      const seg = segs[i];

      if (seg.type === 'driving') {
        seg.socStart = currentSoc;
        const consumptionKwh = (seg.energyConsumed ?? 0) + (seg.b2hConsumed ?? 0);
        const consumptionSoc = (consumptionKwh / totalCapacity) * 100;
        seg.socEnd = Math.max(0, Math.round((currentSoc - consumptionSoc) * 10) / 10);
        currentSoc = seg.socEnd;
        const destWp = wps.find((w) => w.id === seg.toId);
        if (destWp) destWp.arrivalSoc = Math.round(currentSoc);
      } else if (seg.type === 'charging') {
        const chargeWp = wps.find((w) => w.id === seg.fromId && w.type === 'charging');
        if (!chargeWp) continue;

        const arrivalSoc = chargeWp.arrivalSoc;
        const maxPower = chargeWp.stationInfo?.maxPower ?? 200;
        const pricePerKwh = chargeWp.stationInfo?.pricePerKwh ?? 350;

        const nextDriveSeg = segs.find(
          (s, idx) => idx > i && s.type === 'driving' && s.fromId === chargeWp.id,
        );

        let minTargetSoc = arrivalSoc + 5;
        if (nextDriveSeg) {
          const nextConsumptionKwh =
            (nextDriveSeg.energyConsumed ?? 0) + (nextDriveSeg.b2hConsumed ?? 0);
          const nextConsumptionSoc = (nextConsumptionKwh / totalCapacity) * 100;
          minTargetSoc = Math.ceil(nextConsumptionSoc + arrivalSoc + 5);
        }
        minTargetSoc = Math.min(minTargetSoc, 100);
        mins[chargeWp.id] = minTargetSoc;

        let targetSoc = targetSocs[chargeWp.id] ?? chargeWp.departureSoc ?? 80;
        if (targetSoc < minTargetSoc) targetSoc = minTargetSoc;

        const chargeKwh = Math.round(((targetSoc - arrivalSoc) / 100) * totalCapacity * 10) / 10;
        const chargingDuration = calcChargingDuration(arrivalSoc, targetSoc, maxPower, totalCapacity);
        const chargingCost = Math.round(chargeKwh * pricePerKwh);

        seg.socStart = arrivalSoc;
        seg.socEnd = targetSoc;
        seg.duration = chargingDuration;
        seg.chargeAmount = chargeKwh;
        chargeWp.departureSoc = targetSoc;
        currentSoc = targetSoc;

        let finalArrivalSoc = targetSoc;
        if (nextDriveSeg) {
          const nextConsumptionKwh =
            (nextDriveSeg.energyConsumed ?? 0) + (nextDriveSeg.b2hConsumed ?? 0);
          const nextConsumptionSoc = (nextConsumptionKwh / totalCapacity) * 100;
          finalArrivalSoc = Math.max(0, Math.round(targetSoc - nextConsumptionSoc));
        }

        results[chargeWp.id] = {
          chargingDuration,
          chargingCost,
          chargeKwh,
          minTargetSoc,
          finalArrivalSoc,
          chargingSegment: seg,
          nextDrivingSegment: nextDriveSeg ?? seg,
        };
      }
    }

    return { chargeStopResults: results, minTargetSocs: mins, recalcSegments: segs, recalcWaypoints: wps };
  }, [effectivePlan.waypoints, b2hAdjustedSegments, targetSocs, totalCapacity]);

  /* ═══════════════════════════════════════
     3단계: 글로벌 파생값
     ═══════════════════════════════════════ */
  const globals = useMemo(() => {
    let totalDrivingDuration = 0;
    let totalChargingDuration = 0;
    for (const seg of recalcSegments) {
      if (seg.type === 'driving') totalDrivingDuration += seg.duration;
      else if (seg.type === 'charging') totalChargingDuration += seg.duration;
    }
    const totalDuration = totalDrivingDuration + totalChargingDuration;
    const lastSeg = recalcSegments[recalcSegments.length - 1];
    const finalArrivalSoc = Math.round(lastSeg?.socEnd ?? effectivePlan.finalArrivalSoc);
    const originWp = recalcWaypoints.find((wp) => wp.type === 'origin');
    const finalArrivalTime = addMinutesToTime(originWp?.arrivalTime ?? '14:30', totalDuration);
    let totalChargingCost = 0;
    for (const r of Object.values(chargeStopResults)) totalChargingCost += r.chargingCost;
    const totalB2HPower =
      (b2hState.acOn ? b2hState.acPower : 0) + (b2hState.dcOn ? b2hState.dcPower : 0);
    const totalB2HConsumed = Math.round(((totalDrivingDuration / 60) * totalB2HPower) * 10) / 10;
    const rangeReduction = Math.round(totalB2HConsumed * 2.56);

    return {
      totalDuration, totalDrivingDuration, totalChargingDuration,
      totalChargingCost, finalArrivalSoc, finalArrivalTime,
      totalB2HConsumed, rangeReduction,
    };
  }, [recalcSegments, recalcWaypoints, effectivePlan.finalArrivalSoc, chargeStopResults, b2hState]);

  /* ═══════════════════════════════════════
     4단계: 세그먼트 높이 + detailMarginTop
     ═══════════════════════════════════════ */
  const segmentHeights = useMemo(
    () => calcSegmentHeights(recalcSegments, globals.totalDuration),
    [recalcSegments, globals.totalDuration],
  );

  /* ═══════════════════════════════════════
     5단계: 재조립된 JourneyPlan
     ═══════════════════════════════════════ */
  const journey = useMemo((): JourneyPlan => {
    const originWp = recalcWaypoints.find((wp) => wp.type === 'origin');
    let cursor = originWp?.arrivalTime ?? '14:30';
    const updatedSegments = recalcSegments.map((seg) => {
      const startTime = cursor;
      const endTime = addMinutesToTime(cursor, seg.duration);
      cursor = endTime;
      return { ...seg, startTime, endTime };
    });
    const updatedWaypoints = recalcWaypoints.map((wp) => {
      if (wp.type === 'origin') return wp;
      const arrivalSeg = updatedSegments.find((s) => s.toId === wp.id && s.type === 'driving');
      const arrivalTime = arrivalSeg?.endTime ?? wp.arrivalTime;
      if (wp.type === 'charging') {
        const chargeSeg = updatedSegments.find((s) => s.fromId === wp.id && s.type === 'charging');
        const departureTime = chargeSeg?.endTime ?? wp.departureTime;
        return { ...wp, arrivalTime, departureTime };
      }
      return { ...wp, arrivalTime };
    });

    return {
      waypoints: updatedWaypoints,
      segments: updatedSegments,
      totalDistance: effectivePlan.totalDistance,
      totalDuration: globals.totalDuration,
      totalDrivingDuration: globals.totalDrivingDuration,
      totalChargingDuration: globals.totalChargingDuration,
      totalB2HConsumed: globals.totalB2HConsumed,
      totalChargingCost: globals.totalChargingCost,
      finalArrivalTime: globals.finalArrivalTime,
      finalArrivalSoc: globals.finalArrivalSoc,
    };
  }, [effectivePlan.totalDistance, recalcSegments, recalcWaypoints, globals]);

  const chargingDurations = useMemo(() => {
    const map: Record<string, number> = {};
    for (const [id, r] of Object.entries(chargeStopResults)) map[id] = r.chargingDuration;
    return map;
  }, [chargeStopResults]);

  const updateTargetSoc = useCallback((waypointId: string, newSoc: number) => {
    setTargetSocs((prev) => ({ ...prev, [waypointId]: newSoc }));
  }, []);

  const updateB2HState = useCallback(
    (acOn: boolean, dcOn: boolean, acPower: number, dcPower: number) => {
      setB2HState((prev) => {
        if (prev.acOn === acOn && prev.dcOn === dcOn && prev.acPower === acPower && prev.dcPower === dcPower) return prev;
        return { acOn, dcOn, acPower, dcPower };
      });
    },
    [],
  );

  return {
    journey, segmentHeights, detailMarginTop: segmentHeights.detailMarginTop,
    updateTargetSoc, updateB2HState, minTargetSocs, targetSocs,
    b2hState, chargeStopResults, globals, chargingDurations,
  };
}
