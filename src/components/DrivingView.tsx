'use client';

import React from 'react';
import { ZONE_WIDTH, IVI_RESOLUTION, COLORS } from '@/constants/config';

interface DrivingViewProps {
  isChargingSearch?: boolean;
  isJourneyPlanner?: boolean;
}

const DrivingView = React.memo(function DrivingView({
  isChargingSearch = false,
  isJourneyPlanner = false,
}: DrivingViewProps) {
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
          top: 0, left: 0, right: 0, height: '35%',
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
        <defs>
          {/* ── 오토파일럿 블루 레인 가이드 그라디언트 ── */}
          <linearGradient id="autopilotFill" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="rgba(59,139,255,0.30)" />
            <stop offset="35%" stopColor="rgba(59,139,255,0.18)" />
            <stop offset="65%" stopColor="rgba(59,139,255,0.08)" />
            <stop offset="100%" stopColor="rgba(59,139,255,0)" />
          </linearGradient>
          <linearGradient id="autopilotEdge" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="rgba(59,139,255,0.50)" />
            <stop offset="40%" stopColor="rgba(59,139,255,0.25)" />
            <stop offset="75%" stopColor="rgba(59,139,255,0.08)" />
            <stop offset="100%" stopColor="rgba(59,139,255,0)" />
          </linearGradient>
        </defs>

        {/* 도로 면 */}
        <polygon points="240,0 400,0 640,780 0,780" fill="#1a1f28" />

        {/* 도로 가장자리 흰 실선 */}
        <line x1="240" y1="0" x2="0" y2="780" stroke="#2a3545" strokeWidth="3" />
        <line x1="400" y1="0" x2="640" y2="780" stroke="#2a3545" strokeWidth="3" />

        {/* 차선 구분 (회색 굵은 점선만) */}
        <line x1="280" y1="100" x2="160" y2="780" stroke="#3a4555" strokeWidth="2" strokeDasharray="16 20" />
        <line x1="360" y1="100" x2="480" y2="780" stroke="#3a4555" strokeWidth="2" strokeDasharray="16 20" />

        {/* ══════ 오토파일럿 블루 레인 가이드 ══════
            차량 헤드라이트 폭(x34~x96, VAN 130px → 스크린 289~351)에 맞춤
            전방(소실점)으로 갈수록 투명해짐 */}
        <polygon
          points="289,340 351,340 333,0 307,0"
          fill="url(#autopilotFill)"
        />
        {/* 레인 가이드 좌측 엣지 라인 */}
        <line
          x1="289" y1="340" x2="307" y2="0"
          stroke="url(#autopilotEdge)"
          strokeWidth="2.5"
        />
        {/* 레인 가이드 우측 엣지 라인 */}
        <line
          x1="351" y1="340" x2="333" y2="0"
          stroke="url(#autopilotEdge)"
          strokeWidth="2.5"
        />
      </svg>

      {/* ── 45° 후방 조감도 VAN 차량 (70% 위치, 20% 확대) ── */}
      <div
        className="absolute"
        style={{
          top: '70%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          filter: 'drop-shadow(0 6px 24px rgba(0,0,0,0.6))',
          zIndex: 5,
        }}
      >
        {/* viewBox 130x192 — 45° 후방에서 내려다본 VAN
            아래쪽(뒤)가 넓고, 위쪽(앞)이 좁은 사다리꼴 원근감 */}
        <svg width="130" height="192" viewBox="0 0 130 192" fill="none">

          {/* ── 바닥 그림자 ── */}
          <ellipse cx="65" cy="188" rx="52" ry="8" fill="rgba(0,0,0,0.35)" />

          {/* ══════ 차체 외곽 (사다리꼴 원근) ══════
              앞(상단)이 좁고, 뒤(하단)이 넓다 */}
          <path
            d="M38 12 L92 12 Q98 14 102 22 L112 140 Q114 158 108 168 L22 168 Q16 158 18 140 L28 22 Q32 14 38 12 Z"
            fill="#2c3a4e"
          />
          <path
            d="M38 12 L92 12 Q98 14 102 22 L112 140 Q114 158 108 168 L22 168 Q16 158 18 140 L28 22 Q32 14 38 12 Z"
            stroke="#3e5268"
            strokeWidth="1.2"
          />

          {/* ══════ 지붕 패널 (원근 사다리꼴) ══════ */}
          <path
            d="M42 26 L88 26 Q92 28 94 34 L100 108 Q100 112 96 114 L34 114 Q30 112 30 108 L36 34 Q38 28 42 26 Z"
            fill="#364a5e"
          />

          {/* ── 전면 윈드실드 (먼 쪽 = 상단, 좁고 작게) ── */}
          <path
            d="M44 26 L86 26 Q88 22 86 16 L44 16 Q42 22 44 26 Z"
            fill="#1c2e44"
            stroke="#4e6a84"
            strokeWidth="0.7"
          />
          {/* 윈드실드 반사 */}
          <path
            d="M50 18 L80 18 L78 24 L52 24 Z"
            fill="rgba(120,180,240,0.08)"
          />

          {/* ══════ 후면 (가까운 쪽 = 하단, 넓고 크게) ══════ */}
          {/* 뒷면 패널 (45도에서 보이는 수직면) */}
          <path
            d="M22 168 L108 168 Q110 172 108 180 L22 180 Q20 172 22 168 Z"
            fill="#222e3e"
            stroke="#3a4e65"
            strokeWidth="1"
          />
          {/* 뒷면 하단 범퍼 */}
          <path
            d="M24 180 L106 180 Q108 183 106 186 L24 186 Q22 183 24 180 Z"
            fill="#1e2a3a"
            stroke="#344860"
            strokeWidth="0.8"
          />

          {/* 후면 윈도우 (45도에서 크게 보임) */}
          <path
            d="M34 116 L96 116 L100 148 Q100 156 96 160 L34 160 Q30 156 30 148 L34 116 Z"
            fill="#1c2e44"
            stroke="#4e6a84"
            strokeWidth="0.8"
          />
          {/* 후면 윈도우 반사 */}
          <path
            d="M40 122 L90 122 L92 142 L38 142 Z"
            fill="rgba(120,180,240,0.06)"
          />
          {/* 후면 윈도우 와이퍼 */}
          <line x1="65" y1="155" x2="52" y2="128" stroke="#4e6a84" strokeWidth="0.6" opacity="0.5" />

          {/* ── 루프 중앙 라인 ── */}
          <line x1="65" y1="30" x2="65" y2="112" stroke="#3e5268" strokeWidth="0.6" opacity="0.4" />

          {/* ── 루프 랙 (VAN 특징, 원근 보정) ── */}
          <line x1="40" y1="42" x2="90" y2="42" stroke="#506878" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="38" y1="62" x2="92" y2="62" stroke="#506878" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="36" y1="82" x2="94" y2="82" stroke="#506878" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="34" y1="102" x2="96" y2="102" stroke="#506878" strokeWidth="1.8" strokeLinecap="round" />

          {/* ── 사이드 미러 (원근: 앞쪽 좁은 위치) ── */}
          <ellipse cx="26" cy="30" rx="6" ry="5" fill="#2c3a4e" stroke="#3e5268" strokeWidth="0.8" />
          <ellipse cx="26" cy="30" rx="4" ry="3" fill="#1c2e44" />
          <ellipse cx="104" cy="30" rx="6" ry="5" fill="#2c3a4e" stroke="#3e5268" strokeWidth="0.8" />
          <ellipse cx="104" cy="30" rx="4" ry="3" fill="#1c2e44" />

          {/* ── 좌측 측면 패널 (45도에서 약간 보임) ── */}
          <path
            d="M28 22 L18 140 Q16 158 22 168 L22 168 L28 22 Z"
            fill="#263646"
            stroke="#3a4e65"
            strokeWidth="0.6"
          />
          {/* ── 우측 측면 패널 ── */}
          <path
            d="M102 22 L112 140 Q114 158 108 168 L108 168 L102 22 Z"
            fill="#263646"
            stroke="#3a4e65"
            strokeWidth="0.6"
          />

          {/* ── 전조등 (먼 쪽 = 작게) ── */}
          <rect x="34" y="12" width="12" height="4" rx="2" fill="#e8d870" opacity="0.7" />
          <rect x="84" y="12" width="12" height="4" rx="2" fill="#e8d870" opacity="0.7" />

          {/* ── 후미등 (가까운 쪽 = 크고 밝게) ── */}
          <rect x="22" y="170" width="18" height="6" rx="2" fill="#ff4757" opacity="0.95" />
          <rect x="90" y="170" width="18" height="6" rx="2" fill="#ff4757" opacity="0.95" />
          {/* 후미등 glow */}
          <rect x="22" y="170" width="18" height="6" rx="2" fill="#ff4757" opacity="0.15" style={{ filter: 'blur(4px)' }} />
          <rect x="90" y="170" width="18" height="6" rx="2" fill="#ff4757" opacity="0.15" style={{ filter: 'blur(4px)' }} />
          {/* 번호판 영역 */}
          <rect x="48" y="181" width="34" height="10" rx="2" fill="#1a2636" stroke="#3a4e65" strokeWidth="0.6" />
          <text x="65" y="189" textAnchor="middle" fill="#6a7a8e" fontSize="5.5" fontWeight="600" fontFamily="'JetBrains Mono', monospace">
            12가 3456
          </text>

          {/* ── 바퀴 (뒤가 크고, 앞이 작음 — 원근) ── */}
          {/* 뒷바퀴 좌 (크게) */}
          <rect x="10" y="138" width="10" height="24" rx="4" fill="#1a2430" stroke="#2a3a4a" strokeWidth="1" />
          <line x1="15" y1="142" x2="15" y2="158" stroke="#2a3a4a" strokeWidth="0.5" />
          {/* 뒷바퀴 우 */}
          <rect x="110" y="138" width="10" height="24" rx="4" fill="#1a2430" stroke="#2a3a4a" strokeWidth="1" />
          <line x1="115" y1="142" x2="115" y2="158" stroke="#2a3a4a" strokeWidth="0.5" />
          {/* 앞바퀴 좌 (작게) */}
          <rect x="24" y="20" width="7" height="16" rx="3" fill="#1a2430" stroke="#2a3a4a" strokeWidth="0.8" />
          {/* 앞바퀴 우 */}
          <rect x="99" y="20" width="7" height="16" rx="3" fill="#1a2430" stroke="#2a3a4a" strokeWidth="0.8" />

          {/* ── B2H 루프 마크 ── */}
          <rect x="50" y="64" width="30" height="13" rx="4" fill="rgba(255,159,67,0.15)" stroke="rgba(255,159,67,0.45)" strokeWidth="0.7" />
          <text x="65" y="74" textAnchor="middle" fill="#ff9f43" fontSize="8" fontWeight="700" fontFamily="'JetBrains Mono', monospace">
            B2H
          </text>
        </svg>
      </div>

      {/* ── 전조등 빔 효과 (도로 위 투영) ── */}
      <div
        className="absolute"
        style={{
          top: '42%',
          left: '50%',
          transform: 'translate(-50%, 0)',
          width: 140,
          height: 240,
          background: 'radial-gradient(ellipse at 50% 100%, rgba(232,216,64,0.04) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 4,
        }}
      />

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

      {/* ── 충전소 검색 중 인디케이터 ── */}
      {isChargingSearch && (
        <div
          className="absolute charging-search-blink flex items-center gap-2"
          style={{
            bottom: 68,
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '5px 14px',
            background: `${COLORS.accentOrange}15`,
            border: `1px solid ${COLORS.accentOrange}30`,
            borderRadius: 20,
            whiteSpace: 'nowrap',
          }}
        >
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: COLORS.accentOrange, flexShrink: 0 }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.accentOrange }}>
            충전소 검색 중
          </span>
        </div>
      )}

      {/* ── 여정 계획 중 인디케이터 ── */}
      {isJourneyPlanner && (
        <div
          className="absolute flex flex-col items-center gap-2"
          style={{
            bottom: 62,
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          {/* 상태 뱃지 */}
          <div
            className="charging-search-blink flex items-center gap-2"
            style={{
              padding: '5px 14px',
              background: `${COLORS.accentBlue}15`,
              border: `1px solid ${COLORS.accentBlue}30`,
              borderRadius: 20,
              whiteSpace: 'nowrap',
            }}
          >
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: COLORS.accentBlue, flexShrink: 0 }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.accentBlue }}>
              여정 계획 중
            </span>
          </div>

          {/* 도착 예상 시각 */}
          <div className="flex items-center gap-2" style={{ whiteSpace: 'nowrap' }}>
            <span style={{ fontSize: 10, color: COLORS.textDim }}>도착</span>
            <span
              className="font-mono-data"
              style={{ fontSize: 18, fontWeight: 700, color: COLORS.accentGreen }}
            >
              17:42
            </span>
          </div>
        </div>
      )}

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
