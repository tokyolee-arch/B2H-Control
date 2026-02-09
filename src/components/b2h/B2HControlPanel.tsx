'use client';

import React, { useCallback } from 'react';
import { Bell, Settings } from 'lucide-react';
import { ZONE_WIDTH, IVI_RESOLUTION, COLORS } from '@/constants/config';
import BatterySection from './BatterySection';
import TerminalCard from './TerminalCard';
import UsageAlert from './UsageAlert';
import EnergyDistribution from './EnergyDistribution';
import QuickActions from './QuickActions';
import { usePowerSimulation } from '@/hooks/usePowerSimulation';

export default function B2HControlPanel() {
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

  const handleEmergencyStop = useCallback(() => {
    if (acTerminal.isOn) toggleTerminal('ac');
    if (dcTerminal.isOn) toggleTerminal('dc');
  }, [acTerminal.isOn, dcTerminal.isOn, toggleTerminal]);

  const handleNavigate = useCallback((action: string) => {
    console.log(`[B2H] Navigate: ${action}`);
  }, []);

  return (
    <div
      className="relative flex flex-col"
      style={{
        width: ZONE_WIDTH.zoneB,
        height: IVI_RESOLUTION.height,
        background: COLORS.primary,
        overflow: 'hidden',
      }}
    >
      {/* 스크롤 래퍼 */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {/* 내부 flex 컨테이너: 최소 높이 100%로 세로를 꽉 채움 */}
        <div
          className="flex flex-col"
          style={{
            minHeight: '100%',
            padding: '16px 0 28px',
          }}
        >
          {/* ── 상단 그룹: 헤더 + 배터리 + 터미널 ── */}
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

          {/* ── 스페이서: OFF 상태에서 빈 공간을 채워 하단 그룹을 바닥으로 ── */}
          <div style={{ flex: 1, minHeight: 16 }} />

          {/* ── 하단 그룹: 에너지 분배 + 퀵 액션 ── */}
          <div>
            {/* 에너지 분배 */}
            <div className="b2h-section-enter b2h-stagger-6">
              <EnergyDistribution acPower={acTerminal.currentPower} dcPower={dcTerminal.currentPower} totalCumulative={acTerminal.cumulativeEnergy + dcTerminal.cumulativeEnergy} compact={isCompact} />
            </div>

            {/* 퀵 액션 */}
            <div className="b2h-section-enter b2h-stagger-7" style={{ marginTop: 8 }}>
              <QuickActions onEmergencyStop={handleEmergencyStop} onNavigate={handleNavigate} />
            </div>
          </div>
        </div>
      </div>

      <span className="absolute" style={{ bottom: 6, left: 16, fontSize: 14, color: COLORS.textDim, letterSpacing: '0.1em', opacity: 0.6 }}>
        B2H CONTROL
      </span>
    </div>
  );
}
