'use client';

import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { COLORS } from '@/constants/config';

interface RouteHeaderProps {
  onBack: () => void;
}

export default function RouteHeader({ onBack }: RouteHeaderProps) {
  return (
    <div
      className="flex items-center justify-between"
      style={{
        height: 56,
        padding: '0 14px',
        borderBottom: `1px solid ${COLORS.border}`,
        flexShrink: 0,
      }}
    >
      {/* 좌측: 뒤로가기 버튼 */}
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
          flexShrink: 0,
          outline: 'none',
          transition: 'background 0.15s ease',
          WebkitTapHighlightColor: 'transparent',
        }}
        aria-label="뒤로 가기"
      >
        <ChevronLeft size={20} color={COLORS.textPrimary} strokeWidth={2.2} />
      </button>

      {/* 중앙: 타이틀 */}
      <span style={{ fontSize: 18, fontWeight: 700, color: COLORS.textPrimary }}>
        <span style={{ color: COLORS.accentBlue }}>충전소</span> 검색
      </span>

      {/* 우측: B2H 연동 뱃지 */}
      <span
        className="font-mono-data"
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: COLORS.accentBlue,
          background: `${COLORS.accentBlue}1F`,
          border: `1px solid ${COLORS.accentBlue}33`,
          borderRadius: 12,
          padding: '3px 10px',
          lineHeight: '16px',
          whiteSpace: 'nowrap',
        }}
      >
        B2H 연동
      </span>
    </div>
  );
}
