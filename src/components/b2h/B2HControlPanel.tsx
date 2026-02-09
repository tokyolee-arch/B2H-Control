'use client';

import React, { useCallback, useState, useEffect, useRef, useMemo } from 'react';
import { Bell, Settings, AlertTriangle } from 'lucide-react';
import { ZONE_WIDTH, IVI_RESOLUTION, COLORS, ROUTE_GANGNAM_TO_JEONJU, MOCK_STATIONS, MOCK_JOURNEY } from '@/constants/config';
import type { ChargingStation } from '@/types/charging';
import BatterySection from './BatterySection';
import TerminalCard from './TerminalCard';
import UsageAlert from './UsageAlert';
import EnergyDistribution from './EnergyDistribution';
import QuickActions from './QuickActions';
import ChargingSearchPage from './ChargingSearchPage';
import JourneyPlannerPage from './JourneyPlannerPage';
import UsageLimitPopup from './UsageLimitPopup';
import { usePowerSimulation } from '@/hooks/usePowerSimulation';
import type { B2HScreen } from '@/components/IVILayout';

interface B2HControlPanelProps {
  currentScreen: B2HScreen;
  onScreenChange: (screen: B2HScreen) => void;
}

export default function B2HControlPanel({
  currentScreen,
  onScreenChange,
}: B2HControlPanelProps) {
  const {
    batteryState,
    acTerminal,
    dcTerminal,
    acPowerHistory,
    dcPowerHistory,
    toggleTerminal,
    activePanelCount,
    estimatedRemainingTime,
    estimatedDepletionTime,
  } = usePowerSimulation();

  const isSupplying = acTerminal.isOn || dcTerminal.isOn;
  const isCompact = activePanelCount >= 2;

  /* ── 선택된 충전소 (충전소 검색 → 여정 플래너 연동) ── */
  const [selectedStations, setSelectedStations] = useState<ChargingStation[]>([]);

  /* ── 사용한도 설정 팝업 ── */
  const [showUsageLimitPopup, setShowUsageLimitPopup] = useState(false);

  /* ── 긴급 차단 카운트다운 ── */
  const [shutdownCountdown, setShutdownCountdown] = useState<number | null>(null);
  const [shutdownExiting, setShutdownExiting] = useState(false);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 카운트다운 인터벌 관리
  useEffect(() => {
    if (shutdownCountdown === null) return;

    if (shutdownCountdown <= 0) {
      // 0에 도달: 팝업 퇴장 → AC/DC 강제 OFF
      setShutdownExiting(true);
      const exitTimer = setTimeout(() => {
        if (acTerminal.isOn) toggleTerminal('ac');
        if (dcTerminal.isOn) toggleTerminal('dc');
        setShutdownCountdown(null);
        setShutdownExiting(false);
      }, 250);
      return () => clearTimeout(exitTimer);
    }

    countdownRef.current = setInterval(() => {
      setShutdownCountdown((prev) => (prev !== null && prev > 0 ? prev - 1 : prev));
    }, 1000);

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [shutdownCountdown, acTerminal.isOn, dcTerminal.isOn, toggleTerminal]);

  const handleEmergencyStop = useCallback(() => {
    if (shutdownCountdown !== null) return;
    setShutdownCountdown(5);
    setShutdownExiting(false);
  }, [shutdownCountdown]);

  const handleCancelShutdown = useCallback(() => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    setShutdownExiting(true);
    setTimeout(() => {
      setShutdownCountdown(null);
      setShutdownExiting(false);
    }, 200);
  }, []);

  const handleNavigate = useCallback(
    (action: string) => {
      if (action === 'charging-search') {
        onScreenChange('charging-search');
      } else if (action === 'planner') {
        onScreenChange('journey-planner');
      } else if (action === 'limit') {
        setShowUsageLimitPopup(true);
      } else {
        console.log(`[B2H] Navigate: ${action}`);
      }
    },
    [onScreenChange],
  );

  const handleUsageLimitSave = useCallback((limitKwh: number) => {
    console.log(`[B2H] Usage limit saved: ${limitKwh} kWh`);
  }, []);

  const handleBack = useCallback(() => {
    onScreenChange('main');
  }, [onScreenChange]);

  const handleSelectStation = useCallback(
    (stationId: string) => {
      setSelectedStations((prev) => {
        const exists = prev.some((s) => s.id === stationId);
        if (exists) {
          // 이미 선택됨 → 해제
          return prev.filter((s) => s.id !== stationId);
        }
        // 새로 선택
        const station = MOCK_STATIONS.find((s) => s.id === stationId);
        if (!station) return prev;
        return [...prev, station].sort((a, b) => a.distanceFromOrigin - b.distanceFromOrigin);
      });
    },
    [],
  );

  const handleGoToJourneyPlanner = useCallback(() => {
    onScreenChange('journey-planner');
  }, [onScreenChange]);

  const handleStartJourney = useCallback(() => {
    console.log('[B2H] Journey started');
    onScreenChange('main');
  }, [onScreenChange]);

  /* ── B2H 양방향 동기화 (여정 플래너 → 메인) ── */
  const handleJourneyB2HChange = useCallback(
    (acOn: boolean, dcOn: boolean) => {
      if (acOn !== acTerminal.isOn) toggleTerminal('ac');
      if (dcOn !== dcTerminal.isOn) toggleTerminal('dc');
    },
    [acTerminal.isOn, dcTerminal.isOn, toggleTerminal],
  );

  /* ── 스트립 오프셋 계산 ── */
  const stripOffset = useMemo(() => {
    switch (currentScreen) {
      case 'main': return 0;
      case 'charging-search': return ZONE_WIDTH.zoneB;
      case 'journey-planner': return ZONE_WIDTH.zoneB * 2;
      default: return 0;
    }
  }, [currentScreen]);

  return (
    <div
      className="relative"
      style={{
        width: ZONE_WIDTH.zoneB,
        height: IVI_RESOLUTION.height,
        overflow: 'hidden',
      }}
    >
      {/* ══════ 3장 스트립 (메인 | 충전소검색 | 여정플래너) ══════ */}
      <div
        style={{
          display: 'flex',
          width: ZONE_WIDTH.zoneB * 3,
          height: '100%',
          transform: `translateX(-${stripOffset}px)`,
          transition: 'transform 300ms ease-out',
        }}
      >
        {/* ── 1장: 메인 B2H 화면 ── */}
        <div
          style={{
            width: ZONE_WIDTH.zoneB,
            height: '100%',
            flexShrink: 0,
            background: COLORS.primary,
          }}
        >
          <div className="flex flex-col" style={{ width: '100%', height: '100%' }}>
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                overflowX: 'hidden',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              <div
                className="flex flex-col"
                style={{ minHeight: '100%', padding: '16px 0 28px' }}
              >
                {/* ── 상단 그룹 ── */}
                <div>
                  {/* 헤더 */}
                  <div
                    className="b2h-section-enter b2h-stagger-0 flex items-center justify-between"
                    style={{ padding: '0 16px', marginBottom: 12, height: 36 }}
                  >
                    <div className="flex items-center gap-2.5">
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                        <rect x="2" y="6" width="8" height="12" rx="1.5" stroke={COLORS.accentBlue} strokeWidth="1.5" />
                        <rect x="4" y="8" width="4" height="4" rx="0.5" fill={COLORS.accentBlue} opacity="0.3" />
                        <path d="M10 12H14" stroke={COLORS.accentBlue} strokeWidth="1.5" strokeLinecap="round" />
                        <path d="M12 10L14 12L12 14" stroke={COLORS.accentBlue} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M16 7V5C16 4.45 16.45 4 17 4H21C21.55 4 22 4.45 22 5V19C22 19.55 21.55 20 21 20H17C16.45 20 16 19.55 16 19V17" stroke={COLORS.accentGreen} strokeWidth="1.5" strokeLinecap="round" />
                        <path d="M18 9H20M18 12H20M18 15H20" stroke={COLORS.accentGreen} strokeWidth="1" strokeLinecap="round" />
                      </svg>
                      <span className="font-semibold" style={{ fontSize: 22, color: COLORS.textPrimary }}>
                        B2H Control
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                        style={{
                          background: isSupplying ? `${COLORS.accentGreen}15` : `${COLORS.textDim}15`,
                          border: `1px solid ${isSupplying ? COLORS.accentGreen : COLORS.textDim}30`,
                        }}
                      >
                        <div
                          className={`rounded-full ${isSupplying ? 'battery-dot-pulse' : ''}`}
                          style={{ width: 8, height: 8, background: isSupplying ? COLORS.accentGreen : COLORS.textDim }}
                        />
                        <span style={{ fontSize: 15, color: isSupplying ? COLORS.accentGreen : COLORS.textDim, fontWeight: 500 }}>
                          {isSupplying ? '공급중' : '대기중'}
                        </span>
                      </div>
                      <button type="button" className="ivi-touch-target flex items-center justify-center" style={{ width: 44, height: 44, background: 'transparent', border: 'none', cursor: 'pointer' }} aria-label="알림">
                        <Bell size={22} color={COLORS.textDim} strokeWidth={1.8} />
                      </button>
                      <button type="button" className="ivi-touch-target flex items-center justify-center" style={{ width: 44, height: 44, background: 'transparent', border: 'none', cursor: 'pointer' }} aria-label="설정">
                        <Settings size={22} color={COLORS.textDim} strokeWidth={1.8} />
                      </button>
                    </div>
                  </div>

                  {/* 배터리 */}
                  <div className="b2h-section-enter b2h-stagger-1">
                    <BatterySection batteryState={batteryState} isSupplying={isSupplying} />
                  </div>

                  {/* 출력 단자 제어 타이틀 */}
                  <div className="b2h-section-enter b2h-stagger-2" style={{ padding: '14px 16px 6px' }}>
                    <span style={{ fontSize: 17, fontWeight: 600, color: COLORS.textDim, letterSpacing: '0.04em' }}>
                      출력 단자 제어
                    </span>
                  </div>

                  {/* AC 터미널 */}
                  <div className="b2h-section-enter b2h-stagger-3" style={{ marginTop: 4 }}>
                    <TerminalCard terminal={acTerminal} powerHistory={acPowerHistory} onToggle={toggleTerminal} color={COLORS.accentBlue} compact={isCompact} />
                  </div>

                  {/* DC 터미널 */}
                  <div className="b2h-section-enter b2h-stagger-4" style={{ marginTop: 8 }}>
                    <TerminalCard terminal={dcTerminal} powerHistory={dcPowerHistory} onToggle={toggleTerminal} color={COLORS.accentGreen} compact={isCompact} />
                  </div>

                  {/* 경고 알림 */}
                  <div className="b2h-section-enter b2h-stagger-5">
                    <UsageAlert remainingTime={estimatedRemainingTime} estimatedDepletionTime={estimatedDepletionTime} visible={isSupplying} />
                  </div>
                </div>

                {/* ── 스페이서 ── */}
                <div style={{ flex: 1, minHeight: 16 }} />

                {/* ── 하단 그룹 ── */}
                <div>
                  <div className="b2h-section-enter b2h-stagger-6">
                    <EnergyDistribution acPower={acTerminal.currentPower} dcPower={dcTerminal.currentPower} totalCumulative={acTerminal.cumulativeEnergy + dcTerminal.cumulativeEnergy} compact={isCompact} />
                  </div>
                  <div className="b2h-section-enter b2h-stagger-7" style={{ marginTop: 8 }}>
                    <QuickActions onEmergencyStop={handleEmergencyStop} onNavigate={handleNavigate} />
                  </div>
                </div>
              </div>
            </div>

            {/* B2H CONTROL 라벨 */}
            <span
              className="absolute"
              style={{ bottom: 6, left: 16, fontSize: 14, color: COLORS.textDim, letterSpacing: '0.1em', opacity: 0.6, zIndex: 0 }}
            >
              B2H CONTROL
            </span>
          </div>
        </div>

        {/* ── 2장: 충전소 검색 화면 ── */}
        <div
          style={{
            width: ZONE_WIDTH.zoneB,
            height: '100%',
            flexShrink: 0,
          }}
        >
          <ChargingSearchPage
            route={ROUTE_GANGNAM_TO_JEONJU}
            stations={MOCK_STATIONS}
            currentSoc={batteryState.soc}
            onBack={handleBack}
            onSelectStation={handleSelectStation}
            selectedStationIds={selectedStations.map((s) => s.id)}
            onGoToJourneyPlanner={handleGoToJourneyPlanner}
          />
        </div>

        {/* ── 3장: 여정 플래너 화면 ── */}
        <div
          style={{
            width: ZONE_WIDTH.zoneB,
            height: '100%',
            flexShrink: 0,
          }}
        >
          <JourneyPlannerPage
            plan={MOCK_JOURNEY}
            selectedStations={selectedStations}
            acOn={acTerminal.isOn}
            dcOn={dcTerminal.isOn}
            onBack={handleBack}
            onStart={handleStartJourney}
            onB2HChange={handleJourneyB2HChange}
          />
        </div>
      </div>

      {/* ══════ 사용한도 설정 팝업 ══════ */}
      {showUsageLimitPopup && (
        <UsageLimitPopup
          batteryState={batteryState}
          onClose={() => setShowUsageLimitPopup(false)}
          onSave={handleUsageLimitSave}
        />
      )}

      {/* ══════ 긴급 차단 카운트다운 팝업 (스트립 밖, 최상단) ══════ */}
      {shutdownCountdown !== null && (
        <>
          {/* 배경 오버레이 */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 50,
              background: 'rgba(0,0,0,0.65)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
            }}
            onClick={handleCancelShutdown}
          />

          {/* 팝업 카드 */}
          <div
            className={shutdownExiting ? 'shutdown-popup-exit' : 'shutdown-popup-enter'}
            role="alertdialog"
            aria-label="긴급 차단 카운트다운"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              zIndex: 51,
              width: 'calc(100% - 48px)',
              maxWidth: 400,
              padding: '28px 24px',
              background: '#111820',
              border: `1px solid ${COLORS.accentRed}40`,
              borderRadius: 18,
              boxShadow: `0 0 40px ${COLORS.accentRed}20, 0 8px 32px rgba(0,0,0,0.5)`,
            }}
          >
            {/* 아이콘 + 카운트다운 링 */}
            <div className="flex flex-col items-center" style={{ marginBottom: 20 }}>
              <div className="relative flex items-center justify-center" style={{ width: 80, height: 80 }}>
                <div
                  className="absolute shutdown-ring-pulse"
                  style={{
                    top: '50%',
                    left: '50%',
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    border: `2px solid ${COLORS.accentRed}`,
                  }}
                />
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    background: `${COLORS.accentRed}15`,
                    border: `2px solid ${COLORS.accentRed}40`,
                  }}
                >
                  <AlertTriangle size={30} color={COLORS.accentRed} strokeWidth={2} />
                </div>
              </div>
            </div>

            {/* 메시지 */}
            <div className="flex flex-col items-center" style={{ gap: 8, textAlign: 'center' }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: COLORS.accentRed, lineHeight: 1.3 }}>
                고전압 출력을 강제 중단합니다
              </span>
              <span style={{ fontSize: 13, color: COLORS.textSecondary, lineHeight: 1.4 }}>
                AC · DC 모든 출력 단자의 전력 공급이 차단됩니다
              </span>
            </div>

            {/* 카운트다운 숫자 */}
            <div className="flex items-center justify-center" style={{ margin: '24px 0 20px' }}>
              <div
                className="flex items-center justify-center"
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  background: `${COLORS.accentRed}10`,
                  border: `2px solid ${COLORS.accentRed}30`,
                }}
              >
                <span
                  key={shutdownCountdown}
                  className="font-mono-data shutdown-countdown-tick"
                  style={{
                    fontSize: 36,
                    fontWeight: 700,
                    color: shutdownCountdown <= 2 ? COLORS.accentRed : COLORS.textPrimary,
                    lineHeight: 1,
                  }}
                >
                  {shutdownCountdown}
                </span>
              </div>
            </div>

            <span
              className="font-mono-data"
              style={{
                display: 'block',
                textAlign: 'center',
                fontSize: 13,
                fontWeight: 600,
                color: COLORS.textDim,
                marginBottom: 20,
              }}
            >
              {shutdownCountdown > 0 ? `${shutdownCountdown}초 후 차단` : '차단 중...'}
            </span>

            {/* 취소 버튼 */}
            {shutdownCountdown > 0 && (
              <button
                type="button"
                onClick={handleCancelShutdown}
                className="ivi-touch-target"
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '12px 0',
                  background: `${COLORS.textDim}15`,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 10,
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = `${COLORS.textDim}25`; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = `${COLORS.textDim}15`; }}
              >
                <span style={{ fontSize: 14, fontWeight: 600, color: COLORS.textSecondary }}>
                  취소
                </span>
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
