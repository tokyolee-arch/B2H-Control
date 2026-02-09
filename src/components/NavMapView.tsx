'use client';

import React from 'react';
import { ZONE_WIDTH, IVI_RESOLUTION, COLORS } from '@/constants/config';

const NavMapView = React.memo(function NavMapView() {
  return (
    <div
      className="relative overflow-hidden"
      style={{
        width: ZONE_WIDTH.zoneC,
        height: IVI_RESOLUTION.height,
        background: '#0f1923',
      }}
    >
      {/* ── 지도 배경: 서울 강남역 주변 도로망 ── */}
      <svg
        className="absolute inset-0"
        width={ZONE_WIDTH.zoneC}
        height={IVI_RESOLUTION.height}
        viewBox="0 0 640 1200"
        fill="none"
      >
        {/* 배경 블록 (건물 구획) */}
        <rect x="40" y="80" width="160" height="200" rx="4" fill="#141e2b" />
        <rect x="240" y="80" width="180" height="120" rx="4" fill="#131c28" />
        <rect x="460" y="80" width="140" height="200" rx="4" fill="#141e2b" />
        <rect x="40" y="340" width="120" height="180" rx="4" fill="#131c28" />
        <rect x="200" y="260" width="200" height="160" rx="4" fill="#151f2c" />
        <rect x="440" y="340" width="160" height="180" rx="4" fill="#131c28" />
        <rect x="40" y="580" width="180" height="160" rx="4" fill="#141e2b" />
        <rect x="260" y="480" width="160" height="200" rx="4" fill="#131c28" />
        <rect x="460" y="580" width="140" height="160" rx="4" fill="#141e2b" />
        <rect x="40" y="800" width="140" height="200" rx="4" fill="#131c28" />
        <rect x="220" y="740" width="200" height="180" rx="4" fill="#151f2c" />
        <rect x="460" y="800" width="140" height="200" rx="4" fill="#131c28" />
        <rect x="60" y="1060" width="180" height="120" rx="4" fill="#141e2b" />
        <rect x="280" y="980" width="160" height="160" rx="4" fill="#131c28" />
        <rect x="480" y="1060" width="120" height="120" rx="4" fill="#141e2b" />

        {/* ── 주요 도로 (테헤란로 — 가로 메인) ── */}
        <rect x="0" y="495" width="640" height="28" rx="2" fill="#1e2d3e" />
        <line x1="0" y1="509" x2="640" y2="509" stroke="#2a3d52" strokeWidth="1" strokeDasharray="8 6" />

        {/* 강남대로 (세로 메인) */}
        <rect x="175" y="0" width="26" height="1200" rx="2" fill="#1e2d3e" />
        <line x1="188" y1="0" x2="188" y2="1200" stroke="#2a3d52" strokeWidth="1" strokeDasharray="8 6" />

        {/* 봉은사로 (가로) */}
        <rect x="0" y="280" width="640" height="16" rx="1" fill="#182636" />

        {/* 역삼로 (가로) */}
        <rect x="0" y="750" width="640" height="16" rx="1" fill="#182636" />

        {/* 선릉로 (세로) */}
        <rect x="425" y="0" width="18" height="1200" rx="1" fill="#182636" />

        {/* 보조 도로 (세로) */}
        <rect x="95" y="80" width="10" height="1100" rx="1" fill="#152030" />
        <rect x="310" y="80" width="10" height="1100" rx="1" fill="#152030" />
        <rect x="540" y="80" width="10" height="1100" rx="1" fill="#152030" />

        {/* 보조 도로 (가로) */}
        <rect x="0" y="180" width="640" height="10" rx="1" fill="#152030" />
        <rect x="0" y="420" width="640" height="10" rx="1" fill="#152030" />
        <rect x="0" y="640" width="640" height="10" rx="1" fill="#152030" />
        <rect x="0" y="920" width="640" height="10" rx="1" fill="#152030" />

        {/* ── 네비 경로 (파란 하이라이트) ── */}
        <path
          d="M188 1200 L188 750 L188 509 L425 509 L425 280 L425 0"
          stroke={COLORS.accentBlue}
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.7"
        />
        <path
          d="M188 1200 L188 750 L188 509 L425 509 L425 280 L425 0"
          stroke={COLORS.accentBlue}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.4"
          strokeDasharray="0"
        >
          <animate attributeName="stroke-dashoffset" from="0" to="-60" dur="2s" repeatCount="indefinite" />
          <animate attributeName="stroke-dasharray" values="15 45" dur="2s" repeatCount="indefinite" />
        </path>

        {/* ── 도로 이름 라벨 ── */}
        <text x="450" y="507" fill="#4a6a8a" fontSize="11" fontFamily="'Outfit', sans-serif" fontWeight="500">테헤란로</text>
        <text x="150" y="470" fill="#4a6a8a" fontSize="11" fontFamily="'Outfit', sans-serif" fontWeight="500" transform="rotate(-90, 150, 470)">강남대로</text>
        <text x="450" y="273" fill="#3d5a75" fontSize="10" fontFamily="'Outfit', sans-serif">봉은사로</text>
        <text x="450" y="743" fill="#3d5a75" fontSize="10" fontFamily="'Outfit', sans-serif">역삼로</text>
        <text x="398" y="470" fill="#3d5a75" fontSize="10" fontFamily="'Outfit', sans-serif" transform="rotate(-90, 398, 470)">선릉로</text>

        {/* ── 강남역 마커 ── */}
        <circle cx="188" cy="509" r="14" fill={COLORS.accentBlue} opacity="0.15" />
        <circle cx="188" cy="509" r="8" fill={COLORS.accentBlue} opacity="0.3" />
        <circle cx="188" cy="509" r="4" fill="#fff" />
        <text x="205" y="505" fill="#fff" fontSize="12" fontFamily="'Outfit', sans-serif" fontWeight="600">강남역</text>
        <text x="205" y="520" fill={COLORS.textSecondary} fontSize="9" fontFamily="'Outfit', sans-serif">2호선</text>
      </svg>

      {/* ── 현재 위치 마커 + 방향 화살표 ── */}
      <div
        className="absolute"
        style={{ top: '62%', left: '29%', transform: 'translate(-50%, -50%)' }}
      >
        {/* 펄스 링 */}
        <div className="absolute rounded-full animate-pulse-ring" style={{ width: 48, height: 48, top: -14, left: -14, border: `2px solid ${COLORS.accentBlue}`, opacity: 0.3 }} />
        <div className="absolute rounded-full animate-pulse-ring" style={{ width: 48, height: 48, top: -14, left: -14, border: `2px solid ${COLORS.accentBlue}`, opacity: 0.3, animationDelay: '0.6s' }} />

        {/* 네비 방향 화살표 (위를 가리킴) */}
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ filter: `drop-shadow(0 0 8px ${COLORS.accentBlue}80)` }}>
          <polygon points="10,0 20,16 10,12 0,16" fill={COLORS.accentBlue} />
          <polygon points="10,2 17,14 10,11 3,14" fill="#5aa0ff" />
        </svg>
      </div>

      {/* ── 상단 경로 안내 바 ── */}
      <div
        className="absolute flex items-center gap-3"
        style={{
          top: 20, left: 16, right: 16,
          padding: '12px 16px',
          background: '#111820ee',
          borderRadius: 14,
          border: `1px solid ${COLORS.border}`,
          backdropFilter: 'blur(10px)',
        }}
      >
        {/* 회전 아이콘 */}
        <div
          className="flex items-center justify-center"
          style={{
            width: 40, height: 40, borderRadius: 10,
            background: `${COLORS.accentBlue}20`,
            flexShrink: 0,
          }}
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M11 18V6M11 6L6 11M11 6L16 11" stroke={COLORS.accentBlue} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="flex flex-col">
          <span style={{ fontSize: 18, fontWeight: 700, color: COLORS.textPrimary }}>
            350m 후 직진
          </span>
          <span style={{ fontSize: 12, color: COLORS.textSecondary }}>
            테헤란로 → 선릉로 방면
          </span>
        </div>
        <div className="flex flex-col items-end" style={{ marginLeft: 'auto' }}>
          <span className="font-mono-data" style={{ fontSize: 14, fontWeight: 600, color: COLORS.accentGreen }}>12분</span>
          <span style={{ fontSize: 11, color: COLORS.textDim }}>4.2 km</span>
        </div>
      </div>

      {/* ── 하단 도착 정보 ── */}
      <div
        className="absolute flex items-center justify-between"
        style={{
          bottom: 30, left: 16, right: 16,
          padding: '10px 16px',
          background: '#111820dd',
          borderRadius: 12,
          border: `1px solid ${COLORS.border}`,
        }}
      >
        <div className="flex flex-col">
          <span style={{ fontSize: 11, color: COLORS.textDim }}>도착 예정</span>
          <span className="font-mono-data" style={{ fontSize: 16, fontWeight: 700, color: COLORS.textPrimary }}>14:32</span>
        </div>
        <div style={{ width: 1, height: 28, background: COLORS.border }} />
        <div className="flex flex-col items-center">
          <span style={{ fontSize: 11, color: COLORS.textDim }}>남은 거리</span>
          <span className="font-mono-data" style={{ fontSize: 16, fontWeight: 700, color: COLORS.textPrimary }}>4.2km</span>
        </div>
        <div style={{ width: 1, height: 28, background: COLORS.border }} />
        <div className="flex flex-col items-end">
          <span style={{ fontSize: 11, color: COLORS.textDim }}>소요 시간</span>
          <span className="font-mono-data" style={{ fontSize: 16, fontWeight: 700, color: COLORS.accentGreen }}>12분</span>
        </div>
      </div>

      {/* 축척 바 */}
      <div className="absolute flex flex-col items-end" style={{ bottom: 90, right: 16 }}>
        <span className="font-mono-data" style={{ fontSize: 10, color: COLORS.textSecondary, marginBottom: 3 }}>200m</span>
        <div style={{ width: 60, height: 2, background: COLORS.textSecondary }} />
      </div>

      {/* 라벨 */}
      <span className="absolute" style={{ bottom: 8, left: 16, fontSize: 10, color: COLORS.textDim, letterSpacing: '0.1em', opacity: 0.5 }}>
        NAVIGATION
      </span>
    </div>
  );
});

export default NavMapView;
