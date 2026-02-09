'use client';

import React from 'react';
import { BatteryState } from '@/types/b2h';
import { COLORS } from '@/constants/config';

interface BatterySectionProps {
  batteryState: BatteryState;
  isSupplying: boolean;
}

export default function BatterySection({ batteryState, isSupplying }: BatterySectionProps) {
  const { soc, totalCapacity, reservePercent, estimatedRange } = batteryState;
  const remainingCapacity = (totalCapacity * soc) / 100;
  const usableEnergy = Math.max(0, (totalCapacity * (soc - reservePercent)) / 100);
  const socFillPercent = Math.max(0, Math.min(100, soc));
  const reservePosition = reservePercent;

  return (
    <div
      className="relative overflow-hidden rounded-xl"
      style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, margin: '0 12px', padding: '18px 20px' }}
    >
      <div className="absolute top-0 left-0 right-0 battery-gradient-bar" style={{ height: 3 }} />

      {/* SOC + 상태 뱃지 */}
      <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
        <div className="flex items-baseline gap-1">
          <span className="font-mono-data ivi-number-transition" style={{ fontSize: 42, fontWeight: 700, color: COLORS.textPrimary, lineHeight: 1, letterSpacing: '-0.02em' }}>
            {Math.round(soc)}
          </span>
          <span className="font-mono-data" style={{ fontSize: 20, fontWeight: 500, color: COLORS.textSecondary, lineHeight: 1 }}>%</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: isSupplying ? `${COLORS.accentGreen}1F` : `${COLORS.textDim}15`, border: `1px solid ${isSupplying ? COLORS.accentGreen : COLORS.textDim}30` }}>
          <div className={isSupplying ? 'battery-dot-pulse' : ''} style={{ width: 8, height: 8, borderRadius: '50%', background: isSupplying ? COLORS.accentGreen : COLORS.textDim, flexShrink: 0 }} />
          <span style={{ fontSize: 15, fontWeight: 500, color: isSupplying ? COLORS.accentGreen : COLORS.textDim, whiteSpace: 'nowrap' }}>
            {isSupplying ? '공급 중' : '대기'}
          </span>
        </div>
      </div>

      {/* 배터리 바 */}
      <div className="relative overflow-hidden" style={{ height: 32, borderRadius: 8, background: '#0a0e14', border: `1px solid ${COLORS.border}` }}>
        <div className="absolute top-0 left-0 bottom-0 battery-fill-shimmer" style={{ width: `${socFillPercent}%`, borderRadius: '7px 4px 4px 7px', background: `linear-gradient(90deg, ${COLORS.accentGreen}, ${COLORS.accentBlue})`, transition: 'width 0.8s ease-out' }} />
        <div className="absolute top-0 bottom-0 flex flex-col items-center" style={{ left: `${reservePosition}%`, transform: 'translateX(-50%)', zIndex: 2 }}>
          <div style={{ width: 2, height: '100%', background: COLORS.accentRed, opacity: 0.9, boxShadow: `0 0 6px ${COLORS.accentRed}80` }} />
        </div>
      </div>

      {/* 하단 라벨 */}
      <div className="relative" style={{ marginTop: 6, height: 18 }}>
        <span className="font-mono-data absolute left-0" style={{ fontSize: 13, color: COLORS.textDim }}>0%</span>
        <span className="absolute" style={{ fontSize: 13, color: COLORS.accentRed, left: `${reservePosition}%`, transform: 'translateX(-50%)', whiteSpace: 'nowrap', fontWeight: 500 }}>
          {reservePercent}% 귀환예비
        </span>
        <span className="font-mono-data absolute right-0" style={{ fontSize: 13, color: COLORS.textDim }}>100%</span>
      </div>

      {/* 3컬럼 정보 그리드 */}
      <div className="grid grid-cols-3 gap-3" style={{ marginTop: 16, padding: '12px 0 4px', borderTop: `1px solid ${COLORS.border}` }}>
        <div className="flex flex-col items-center">
          <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.textDim, letterSpacing: '0.06em', marginBottom: 5 }}>잔여 용량</span>
          <div className="flex items-baseline gap-0.5">
            <span className="font-mono-data ivi-number-transition" style={{ fontSize: 21, fontWeight: 700, color: COLORS.textPrimary, lineHeight: 1 }}>{remainingCapacity.toFixed(1)}</span>
            <span className="font-mono-data" style={{ fontSize: 14, color: COLORS.textSecondary }}>kWh</span>
          </div>
        </div>
        <div className="flex flex-col items-center">
          <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.textDim, letterSpacing: '0.06em', marginBottom: 5 }}>사용한도</span>
          <div className="flex items-baseline gap-0.5">
            <span className="font-mono-data ivi-number-transition" style={{ fontSize: 21, fontWeight: 700, color: COLORS.accentOrange, lineHeight: 1 }}>{usableEnergy.toFixed(1)}</span>
            <span className="font-mono-data" style={{ fontSize: 14, color: COLORS.accentOrange, opacity: 0.7 }}>kWh</span>
          </div>
        </div>
        <div className="flex flex-col items-center">
          <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.textDim, letterSpacing: '0.06em', marginBottom: 5 }}>주행 가능</span>
          <div className="flex items-baseline gap-0.5">
            <span className="font-mono-data ivi-number-transition" style={{ fontSize: 21, fontWeight: 700, color: COLORS.accentGreen, lineHeight: 1 }}>{Math.round(estimatedRange)}</span>
            <span className="font-mono-data" style={{ fontSize: 14, color: COLORS.accentGreen, opacity: 0.7 }}>km</span>
          </div>
        </div>
      </div>
    </div>
  );
}
