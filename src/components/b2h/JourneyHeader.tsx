'use client';

import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { COLORS } from '@/constants/config';

interface JourneyHeaderProps {
  onBack: () => void;
  totalDuration: number; // 분
  stationCount?: number; // 선택된 충전소 수
}

export default function JourneyHeader({ onBack, totalDuration, stationCount }: JourneyHeaderProps) {
  const hours = Math.floor(totalDuration / 60);
  const mins = totalDuration % 60;

  return (
    <div
      className="flex items-center"
      style={{
        height: 56,
        padding: '0 14px',
        borderBottom: `1px solid ${COLORS.border}`,
        flexShrink: 0,
        gap: 10,
      }}
    >
      {/* 뒤로가기 */}
      <button
        type="button"
        onClick={onBack}
        className="ivi-touch-target flex items-center justify-center"
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: COLORS.card,
          border: `1px solid ${COLORS.border}`,
          cursor: 'pointer',
          outline: 'none',
          flexShrink: 0,
        }}
        aria-label="뒤로 가기"
      >
        <ChevronLeft size={20} color={COLORS.textPrimary} strokeWidth={2.2} />
      </button>

      {/* 타이틀 */}
      <span style={{ fontSize: 18, fontWeight: 700, color: COLORS.textPrimary, flex: 1 }}>
        <span style={{ color: COLORS.accentBlue }}>여정</span> 플래너
      </span>

      {/* 충전소 수 뱃지 (있을 때만) */}
      {stationCount != null && stationCount > 0 && (
        <div
          className="font-mono-data flex items-center gap-1"
          style={{
            padding: '4px 8px',
            background: `${COLORS.accentOrange}12`,
            border: `1px solid ${COLORS.accentOrange}25`,
            borderRadius: 12,
            flexShrink: 0,
          }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M5.5 0.5L1.5 5.5H4L3.5 9.5L8.5 4.5H6L5.5 0.5Z" fill={COLORS.accentOrange} />
          </svg>
          <span style={{ fontSize: 11, fontWeight: 700, color: COLORS.accentOrange }}>
            {stationCount}
          </span>
        </div>
      )}

      {/* 총 소요시간 뱃지 */}
      <div
        className="font-mono-data flex items-center gap-1"
        style={{
          padding: '4px 10px',
          background: `${COLORS.accentBlue}12`,
          border: `1px solid ${COLORS.accentBlue}25`,
          borderRadius: 12,
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.accentBlue }}>
          {hours}h {mins.toString().padStart(2, '0')}m
        </span>
      </div>
    </div>
  );
}
