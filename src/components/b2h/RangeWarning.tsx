'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { COLORS } from '@/constants/config';

interface RangeWarningProps {
  currentRange: number;
  totalDistance: number;
  visible: boolean;
}

export default function RangeWarning({ currentRange, totalDistance, visible }: RangeWarningProps) {
  if (!visible) return null;

  return (
    <div
      role="alert"
      className="flex items-center gap-3"
      style={{
        margin: '10px 14px 0',
        padding: '12px 14px',
        background: `${COLORS.accentRed}1A`,
        border: `1px solid ${COLORS.accentRed}33`,
        borderRadius: 10,
      }}
    >
      {/* 경고 아이콘 (3초 주기 pulse) */}
      <div
        className="flex items-center justify-center warning-icon-pulse"
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: `${COLORS.accentRed}26`,
          flexShrink: 0,
        }}
      >
        <AlertTriangle size={16} color={COLORS.accentRed} strokeWidth={2.2} />
      </div>

      {/* 텍스트 */}
      <div className="flex flex-col" style={{ gap: 2, minWidth: 0 }}>
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: COLORS.accentRed,
            lineHeight: 1.3,
          }}
        >
          현재 배터리로 목적지 도달 불가
        </span>
        <span
          style={{
            fontSize: 11,
            color: `${COLORS.accentRed}CC`,
            lineHeight: 1.3,
          }}
        >
          잔여{' '}
          <span className="font-mono-data" style={{ fontWeight: 600 }}>
            {currentRange}km
          </span>
          {' / 필요 '}
          <span className="font-mono-data" style={{ fontWeight: 600 }}>
            {totalDistance}km
          </span>
          {' — 중간 충전 필수'}
        </span>
      </div>
    </div>
  );
}
