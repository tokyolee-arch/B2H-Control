'use client';

import React from 'react';
import { ZONE_WIDTH, IVI_RESOLUTION, COLORS } from '@/constants/config';

const DrivingView = React.memo(function DrivingView() {
  return (
    <div
      className="relative overflow-hidden"
      style={{
        width: ZONE_WIDTH.zoneA,
        height: IVI_RESOLUTION.height,
        background: '#0b1018',
      }}
    >
      {/* ── 하늘 그라데이션 ── */}
      <div
        className="absolute"
        style={{
          top: 0,
          left: 0,
          right: 0,
          height: '35%',
          background: 'linear-gradient(180deg, #0a1628 0%, #121e30 40%, #1a2a42 70%, #253548 100%)',
        }}
      />

      {/* ── 원경 산/빌딩 실루엣 ── */}
      <svg
        className="absolute"
        style={{ top: '26%', left: 0, width: '100%', height: '12%' }}
        viewBox="0 0 640 80"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          d="M0 80 L0 55 Q30 40 60 50 Q100 35 140 45 Q160 30 200 40 Q220 25 260 35 L280 20 L300 35 Q340 28 370 38 Q400 30 430 40 Q470 25 500 38 Q530 32 560 42 Q590 35 620 45 L640 40 L640 80Z"
          fill="#111c2a"
        />
        {/* 빌딩 실루엣 */}
        <rect x="180" y="35" width="12" height="25" fill="#0f1a26" />
        <rect x="196" y="28" width="8" height="32" fill="#0f1a26" />
        <rect x="210" y="38" width="15" height="22" fill="#0f1a26" />
        <rect x="420" y="30" width="10" height="30" fill="#0f1a26" />
        <rect x="435" y="35" width="14" height="25" fill="#0f1a26" />
        <rect x="455" y="25" width="8" height="35" fill="#0f1a26" />
      </svg>

      {/* ── 도로 (원근감 있는 사다리꼴) ── */}
      <svg
        className="absolute"
        style={{ top: '35%', left: 0, width: '100%', height: '65%' }}
        viewBox="0 0 640 780"
        preserveAspectRatio="none"
        fill="none"
      >
        {/* 도로 바닥 */}
        <polygon points="240,0 400,0 640,780 0,780" fill="#1a1f28" />

        {/* 갓길 좌 */}
        <line x1="240" y1="0" x2="0" y2="780" stroke="#2a3545" strokeWidth="3" />
        {/* 갓길 우 */}
        <line x1="400" y1="0" x2="640" y2="780" stroke="#2a3545" strokeWidth="3" />

        {/* 중앙선 (점선) — 원근 효과 */}
        <line x1="320" y1="0" x2="320" y2="60" stroke="#e8c840" strokeWidth="2" strokeDasharray="8 12" />
        <line x1="320" y1="60" x2="320" y2="150" stroke="#e8c840" strokeWidth="2.5" strokeDasharray="14 18" />
        <line x1="320" y1="150" x2="320" y2="300" stroke="#e8c840" strokeWidth="3" strokeDasharray="22 26" />
        <line x1="320" y1="300" x2="320" y2="500" stroke="#e8c840" strokeWidth="3.5" strokeDasharray="35 35" />
        <line x1="320" y1="500" x2="320" y2="780" stroke="#e8c840" strokeWidth="4" strokeDasharray="50 40" />

        {/* 좌측 차선 (점선) */}
        <line x1="280" y1="0" x2="160" y2="780" stroke="#3a4555" strokeWidth="1.5" strokeDasharray="6 10" />
        <line x1="280" y1="100" x2="160" y2="780" stroke="#3a4555" strokeWidth="2" strokeDasharray="16 20" />

        {/* 우측 차선 (점선) */}
        <line x1="360" y1="0" x2="480" y2="780" stroke="#3a4555" strokeWidth="1.5" strokeDasharray="6 10" />
        <line x1="360" y1="100" x2="480" y2="780" stroke="#3a4555" strokeWidth="2" strokeDasharray="16 20" />
      </svg>

      {/* ── 전방 차량 (먼 거리) ── */}
      <div className="absolute" style={{ top: '42%', left: '50%', transform: 'translate(-50%, -50%)' }}>
        <svg width="40" height="24" viewBox="0 0 40 24" fill="none">
          <rect x="4" y="8" width="32" height="14" rx="3" fill="#1e2836" stroke="#2a3a4e" strokeWidth="0.8" />
          <rect x="8" y="4" width="24" height="8" rx="2" fill="#141c28" stroke="#2a3a4e" strokeWidth="0.5" />
          <circle cx="8" cy="20" r="2" fill="#0d1520" stroke="#2a3a4e" strokeWidth="0.5" />
          <circle cx="32" cy="20" r="2" fill="#0d1520" stroke="#2a3a4e" strokeWidth="0.5" />
          {/* 미등 */}
          <rect x="5" y="10" width="3" height="2" rx="0.5" fill="#ff4757" opacity="0.8" />
          <rect x="32" y="10" width="3" height="2" rx="0.5" fill="#ff4757" opacity="0.8" />
        </svg>
      </div>

      {/* ── HUD 속도 표시 ── */}
      <div className="absolute flex flex-col items-center" style={{ top: 60, left: '50%', transform: 'translateX(-50%)' }}>
        <span
          className="font-mono-data font-bold"
          style={{ fontSize: 88, color: COLORS.textPrimary, lineHeight: 1, textShadow: '0 2px 20px rgba(0,0,0,0.6)' }}
        >
          85
        </span>
        <span
          className="font-mono-data"
          style={{ fontSize: 16, color: COLORS.textSecondary, marginTop: 4, letterSpacing: '0.05em' }}
        >
          km/h
        </span>
      </div>

      {/* ── 하단 정보 바 ── */}
      <div
        className="absolute flex items-center justify-between"
        style={{ bottom: 30, left: 24, right: 24 }}
      >
        {/* 기어 */}
        <div className="flex items-center gap-3">
          {['P', 'R', 'N', 'D'].map((gear) => (
            <span
              key={gear}
              className="font-mono-data font-semibold"
              style={{
                fontSize: gear === 'D' ? 26 : 16,
                color: gear === 'D' ? COLORS.accentBlue : COLORS.textDim,
                opacity: gear === 'D' ? 1 : 0.4,
              }}
            >
              {gear}
            </span>
          ))}
        </div>

        {/* 배터리 */}
        <div className="flex items-center gap-2">
          <svg width="36" height="18" viewBox="0 0 36 18" fill="none">
            <rect x="1" y="3" width="30" height="12" rx="2" stroke={COLORS.accentGreen} strokeWidth="1.5" />
            <rect x="31" y="6" width="4" height="6" rx="1" fill={COLORS.accentGreen} opacity="0.6" />
            <rect x="3" y="5" width={`${0.72 * 26}`} height="8" rx="1" fill={COLORS.accentGreen} />
          </svg>
          <span className="font-mono-data font-semibold" style={{ fontSize: 18, color: COLORS.accentGreen }}>
            72%
          </span>
        </div>
      </div>

      {/* 라벨 */}
      <span className="absolute" style={{ bottom: 8, left: 16, fontSize: 10, color: COLORS.textDim, letterSpacing: '0.1em', opacity: 0.5 }}>
        DRIVING VIEW
      </span>
    </div>
  );
});

export default DrivingView;
