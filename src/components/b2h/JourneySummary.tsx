'use client';

import React from 'react';
import { COLORS } from '@/constants/config';

interface JourneySummaryProps {
  totalDistance: number;        // km
  totalDrivingDuration: number; // 분
  totalChargingDuration: number;// 분
  totalChargingCost: number;   // 원
}

function formatDur(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m.toString().padStart(2, '0')}m` : `${m}min`;
}

function formatCost(won: number): string {
  if (won >= 10000) return `${(won / 1000).toFixed(1)} 천원`;
  return `${won.toLocaleString()} 원`;
}

export default function JourneySummary({
  totalDistance,
  totalDrivingDuration,
  totalChargingDuration,
  totalChargingCost,
}: JourneySummaryProps) {
  const items = [
    { label: '총 거리', value: `${totalDistance}`, unit: 'km', color: COLORS.accentBlue },
    { label: '주행시간', value: formatDur(totalDrivingDuration), unit: '', color: COLORS.textPrimary },
    { label: '충전시간', value: formatDur(totalChargingDuration), unit: '', color: COLORS.accentPurple },
    { label: '충전비용', value: formatCost(totalChargingCost), unit: '', color: COLORS.accentOrange },
  ];

  return (
    <div
      style={{
        background: COLORS.card,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 10,
      }}
    >
      {/* 타이틀 */}
      <div className="flex items-center gap-1.5" style={{ padding: '10px 12px 0' }}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <rect x="1.5" y="1.5" width="9" height="9" rx="1.5" stroke={COLORS.textDim} strokeWidth="1" />
          <line x1="1.5" y1="4.5" x2="10.5" y2="4.5" stroke={COLORS.textDim} strokeWidth="0.8" />
          <line x1="5.5" y1="4.5" x2="5.5" y2="10.5" stroke={COLORS.textDim} strokeWidth="0.8" />
        </svg>
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: COLORS.textDim,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          여정 요약
        </span>
      </div>

      {/* 2×2 그리드 */}
      <div className="grid grid-cols-2" style={{ gap: 6, padding: '8px 10px 10px' }}>
        {items.map((item) => (
          <div
            key={item.label}
            className="flex flex-col items-center justify-center"
            style={{
              padding: '7px 6px',
              background: '#0d1219',
              borderRadius: 6,
            }}
          >
            <span style={{ fontSize: 8, color: COLORS.textDim, marginBottom: 3, letterSpacing: '0.3px' }}>
              {item.label}
            </span>
            <div className="flex items-baseline gap-0.5">
              <span
                className="font-mono-data"
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: item.color,
                  lineHeight: 1,
                  transition: 'color 0.15s ease',
                }}
              >
                {item.value}
              </span>
              {item.unit && (
                <span style={{ fontSize: 8, color: COLORS.textSecondary }}>{item.unit}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
