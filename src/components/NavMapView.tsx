'use client';

import React, { useMemo } from 'react';
import type { ChargingStation } from '@/types/charging';
import { ZONE_WIDTH, IVI_RESOLUTION, COLORS } from '@/constants/config';

interface NavMapViewProps {
  showRoute?: boolean;
  stations?: ChargingStation[];
  isJourneyPlanner?: boolean;
}

/* ── 경로상 좌표 계산 (SVG 좌표) ── */
/* 출발지: 화면 20% = Y240, 도착지: 화면 80% = Y960 */
const TOTAL_ROUTE_KM = 271;

function getRoutePos(km: number): { x: number; y: number } {
  const t = km / TOTAL_ROUTE_KM;
  const y = 240 + t * 720;
  const x = 320 + Math.sin(t * Math.PI * 1.3) * 80 - t * 40;
  return { x: Math.round(x), y: Math.round(y) };
}

/** 경로상 여러 점을 잇는 SVG polyline path 데이터 */
function generateRoutePathData(fromKm: number, toKm: number, steps: number = 24): string {
  const points: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const km = fromKm + (toKm - fromKm) * (i / steps);
    const pos = getRoutePos(km);
    points.push(`${pos.x},${pos.y}`);
  }
  return `M${points[0]} L${points.slice(1).join(' L')}`;
}

/* SOC 컬러 구간 정의 (여정 플래너용) */
/* Segment 1: origin(72%) → charging(28%) — 0~108km */
/* Segment 2: charging(80%) → destination(22%) — 108~271km */
const SOC_COLOR_SEGMENTS = [
  // Driving segment 1: 72% → 28%
  { from: 0, to: 54, color: COLORS.accentGreen },      // 72% → 50%
  { from: 54, to: 108, color: COLORS.accentOrange },    // 50% → 28%
  // After charging to 80%, driving segment 2: 80% → 22%
  { from: 108, to: 192, color: COLORS.accentGreen },    // 80% → 50%
  { from: 192, to: 263, color: COLORS.accentOrange },   // 50% → 25%
  { from: 263, to: 271, color: COLORS.accentRed },      // 25% → 22%
];

const NavMapView = React.memo(function NavMapView({
  showRoute = false,
  stations,
  isJourneyPlanner = false,
}: NavMapViewProps) {

  /* ── SOC 컬러 경로 SVG path 데이터 (메모이제이션) ── */
  const socPathSegments = useMemo(() => {
    return SOC_COLOR_SEGMENTS.map((seg) => ({
      ...seg,
      path: generateRoutePathData(seg.from, seg.to),
    }));
  }, []);

  /* ── 단일 경로 path (충전소 검색 모드용) ── */
  const fullRoutePath = useMemo(
    () => generateRoutePathData(0, TOTAL_ROUTE_KM),
    [],
  );

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

        {/* 보조 도로 */}
        <rect x="95" y="80" width="10" height="1100" rx="1" fill="#152030" />
        <rect x="310" y="80" width="10" height="1100" rx="1" fill="#152030" />
        <rect x="540" y="80" width="10" height="1100" rx="1" fill="#152030" />
        <rect x="0" y="180" width="640" height="10" rx="1" fill="#152030" />
        <rect x="0" y="420" width="640" height="10" rx="1" fill="#152030" />
        <rect x="0" y="640" width="640" height="10" rx="1" fill="#152030" />
        <rect x="0" y="920" width="640" height="10" rx="1" fill="#152030" />

        {/* ── 기본 네비 경로 (showRoute=false일 때만) ── */}
        {!showRoute && (
          <>
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
            >
              <animate attributeName="stroke-dashoffset" from="0" to="-60" dur="2s" repeatCount="indefinite" />
              <animate attributeName="stroke-dasharray" values="15 45" dur="2s" repeatCount="indefinite" />
            </path>
          </>
        )}

        {/* 도로 이름 라벨 */}
        <text x="450" y="507" fill="#4a6a8a" fontSize="11" fontFamily="'Outfit', sans-serif" fontWeight="500">테헤란로</text>
        <text x="150" y="470" fill="#4a6a8a" fontSize="11" fontFamily="'Outfit', sans-serif" fontWeight="500" transform="rotate(-90, 150, 470)">강남대로</text>
        <text x="450" y="273" fill="#3d5a75" fontSize="10" fontFamily="'Outfit', sans-serif">봉은사로</text>
        <text x="450" y="743" fill="#3d5a75" fontSize="10" fontFamily="'Outfit', sans-serif">역삼로</text>
        <text x="398" y="470" fill="#3d5a75" fontSize="10" fontFamily="'Outfit', sans-serif" transform="rotate(-90, 398, 470)">선릉로</text>

        {/* 강남역 마커 (기본 모드에서만) */}
        {!showRoute && (
          <>
            <circle cx="188" cy="509" r="14" fill={COLORS.accentBlue} opacity="0.15" />
            <circle cx="188" cy="509" r="8" fill={COLORS.accentBlue} opacity="0.3" />
            <circle cx="188" cy="509" r="4" fill="#fff" />
            <text x="205" y="505" fill="#fff" fontSize="12" fontFamily="'Outfit', sans-serif" fontWeight="600">강남역</text>
            <text x="205" y="520" fill={COLORS.textSecondary} fontSize="9" fontFamily="'Outfit', sans-serif">2호선</text>
          </>
        )}
      </svg>

      {/* ── 기본 모드 UI ── */}
      {!showRoute && (
        <>
          {/* 현재 위치 마커 */}
          <div className="absolute" style={{ top: '62%', left: '29%', transform: 'translate(-50%, -50%)' }}>
            <div className="absolute rounded-full animate-pulse-ring" style={{ width: 48, height: 48, top: -14, left: -14, border: `2px solid ${COLORS.accentBlue}`, opacity: 0.3 }} />
            <div className="absolute rounded-full animate-pulse-ring" style={{ width: 48, height: 48, top: -14, left: -14, border: `2px solid ${COLORS.accentBlue}`, opacity: 0.3, animationDelay: '0.6s' }} />
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ filter: `drop-shadow(0 0 8px ${COLORS.accentBlue}80)` }}>
              <polygon points="10,0 20,16 10,12 0,16" fill={COLORS.accentBlue} />
              <polygon points="10,2 17,14 10,11 3,14" fill="#5aa0ff" />
            </svg>
          </div>

          {/* 상단 경로 안내 바 */}
          <div
            className="absolute flex items-center gap-3"
            style={{ top: 20, left: 16, right: 16, padding: '12px 16px', background: '#111820ee', borderRadius: 14, border: `1px solid ${COLORS.border}`, backdropFilter: 'blur(10px)' }}
          >
            <div className="flex items-center justify-center" style={{ width: 40, height: 40, borderRadius: 10, background: `${COLORS.accentBlue}20`, flexShrink: 0 }}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M11 18V6M11 6L6 11M11 6L16 11" stroke={COLORS.accentBlue} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span style={{ fontSize: 18, fontWeight: 700, color: COLORS.textPrimary }}>350m 후 직진</span>
              <span style={{ fontSize: 12, color: COLORS.textSecondary }}>테헤란로 → 선릉로 방면</span>
            </div>
            <div className="flex flex-col items-end" style={{ marginLeft: 'auto' }}>
              <span className="font-mono-data" style={{ fontSize: 14, fontWeight: 600, color: COLORS.accentGreen }}>12분</span>
              <span style={{ fontSize: 11, color: COLORS.textDim }}>4.2 km</span>
            </div>
          </div>

          {/* 하단 도착 정보 */}
          <div
            className="absolute flex items-center justify-between"
            style={{ bottom: 30, left: 16, right: 16, padding: '10px 16px', background: '#111820dd', borderRadius: 12, border: `1px solid ${COLORS.border}` }}
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
        </>
      )}

      {/* ══════ 경로 오버레이 (showRoute=true) ══════ */}
      {showRoute && stations && (
        <div className="absolute inset-0 nav-route-fade-in">
          {/* 지도 어둡게 */}
          <div className="absolute inset-0" style={{ background: 'rgba(10,14,20,0.6)' }} />

          {/* 경로 라인 + 마커 */}
          <svg
            className="absolute inset-0"
            width={ZONE_WIDTH.zoneC}
            height={IVI_RESOLUTION.height}
            viewBox="0 0 640 1200"
            fill="none"
          >
            {/* ══════ 여정 플래너: SOC 컬러 경로 ══════ */}
            {isJourneyPlanner ? (
              <>
                {/* glow layer (전체 경로) */}
                <path
                  d={fullRoutePath}
                  stroke={COLORS.accentBlue}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  opacity="0.08"
                />

                {/* SOC 컬러 구간별 경로 */}
                {socPathSegments.map((seg, i) => (
                  <React.Fragment key={i}>
                    {/* glow */}
                    <path
                      d={seg.path}
                      stroke={seg.color}
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                      opacity="0.2"
                    />
                    {/* main line */}
                    <path
                      d={seg.path}
                      stroke={seg.color}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                      opacity="0.9"
                    />
                  </React.Fragment>
                ))}

                {/* 충전소 마커 (충전 아이콘 + 분리 표시) */}
                {(() => {
                  const chargePos = getRoutePos(108);
                  return (
                    <g>
                      <circle cx={chargePos.x} cy={chargePos.y} r="18" fill={COLORS.accentOrange} opacity="0.12" />
                      <circle cx={chargePos.x} cy={chargePos.y} r="11" fill="#111820" stroke={COLORS.accentOrange} strokeWidth="2.5" />
                      <path
                        d={`M${chargePos.x} ${chargePos.y - 5}L${chargePos.x - 3} ${chargePos.y + 1}H${chargePos.x + 1.5}L${chargePos.x} ${chargePos.y + 6}`}
                        stroke={COLORS.accentOrange}
                        strokeWidth="1.8"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </g>
                  );
                })()}

                {/* SOC 라벨 (구간 전환점에 표시) */}
                {[
                  { km: 0, soc: '72%', color: COLORS.accentGreen },
                  { km: 54, soc: '50%', color: COLORS.accentOrange },
                  { km: 108, soc: '28%', color: COLORS.accentOrange },
                  { km: 192, soc: '50%', color: COLORS.accentOrange },
                  { km: 263, soc: '25%', color: COLORS.accentRed },
                ].map(({ km, soc, color }, i) => {
                  const pos = getRoutePos(km);
                  return (
                    <g key={i}>
                      <rect
                        x={pos.x + 16}
                        y={pos.y - 9}
                        width="34"
                        height="16"
                        rx="4"
                        fill="#111820"
                        stroke={color}
                        strokeWidth="1"
                        opacity="0.9"
                      />
                      <text
                        x={pos.x + 33}
                        y={pos.y + 3}
                        textAnchor="middle"
                        fill={color}
                        fontSize="9"
                        fontWeight="700"
                        fontFamily="'JetBrains Mono', monospace"
                      >
                        {soc}
                      </text>
                    </g>
                  );
                })}
              </>
            ) : (
              /* ══════ 충전소 검색: 단일 파란색 경로 ══════ */
              <>
                {/* glow */}
                <path
                  d={fullRoutePath}
                  stroke={COLORS.accentBlue}
                  strokeWidth="10"
                  strokeLinecap="round"
                  fill="none"
                  opacity="0.15"
                />
                {/* 메인 라인 */}
                <path
                  d={fullRoutePath}
                  stroke={COLORS.accentBlue}
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                  opacity="0.85"
                />
                {/* 흐르는 애니메이션 */}
                <path
                  d={fullRoutePath}
                  stroke="#5aa0ff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                  opacity="0.5"
                  strokeDasharray="12 24"
                >
                  <animate attributeName="stroke-dashoffset" from="0" to="-36" dur="1.5s" repeatCount="indefinite" />
                </path>
              </>
            )}

            {/* ── 출발지 마커 (강남역) — 20% 지점 ── */}
            <circle cx="320" cy="240" r="16" fill={COLORS.accentBlue} opacity="0.15" />
            <circle cx="320" cy="240" r="9" fill={COLORS.accentBlue} opacity="0.35" />
            <circle cx="320" cy="240" r="5" fill="#fff" />

            {/* ── 도착지 마커 (전주공장) — 80% 지점 ── */}
            {(() => {
              const destPos = getRoutePos(TOTAL_ROUTE_KM);
              return (
                <>
                  <circle cx={destPos.x} cy={destPos.y} r="16" fill={COLORS.accentGreen} opacity="0.15" />
                  <circle cx={destPos.x} cy={destPos.y} r="9" fill={COLORS.accentGreen} opacity="0.35" />
                  <circle cx={destPos.x} cy={destPos.y} r="5" fill="#fff" />
                </>
              );
            })()}

            {/* ── 충전소 마커 (충전소 검색 모드만) ── */}
            {!isJourneyPlanner && stations.map((s) => {
              const pos = getRoutePos(s.distanceFromOrigin);
              const markerColor = s.isRecommended
                ? COLORS.accentBlue
                : s.isReachable
                ? COLORS.textSecondary
                : COLORS.textDim;
              const markerOpacity = s.isReachable ? 1 : 0.4;

              return (
                <g key={s.id} opacity={markerOpacity}>
                  <circle cx={pos.x} cy={pos.y} r="14" fill={markerColor} opacity="0.12" />
                  <circle cx={pos.x} cy={pos.y} r="9" fill="#111820" stroke={markerColor} strokeWidth="2" />
                  <path
                    d={`M${pos.x} ${pos.y - 4}L${pos.x - 2} ${pos.y + 1}H${pos.x + 1}L${pos.x} ${pos.y + 5}`}
                    stroke={markerColor}
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {s.isRecommended && (
                    <>
                      <rect x={pos.x + 12} y={pos.y - 8} width="26" height="14" rx="4" fill={COLORS.accentBlue} opacity="0.9" />
                      <text x={pos.x + 25} y={pos.y + 1} textAnchor="middle" fill="#fff" fontSize="8" fontWeight="700" fontFamily="'Outfit', sans-serif">추천</text>
                    </>
                  )}
                </g>
              );
            })}
          </svg>

          {/* ── 출발지 라벨 (20% 지점) ── */}
          <div
            className="absolute flex items-center gap-2"
            style={{ top: 212, left: 345, pointerEvents: 'none' }}
          >
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS.accentBlue }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.textPrimary }}>강남역</span>
            <span style={{ fontSize: 10, color: COLORS.textDim }}>출발</span>
          </div>

          {/* ── 도착지 라벨(80% 지점) ── */}
          <div
            className="absolute flex items-center gap-2"
            style={{ top: 940, left: 240, pointerEvents: 'none' }}
          >
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS.accentGreen }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.textPrimary }}>전주공장</span>
            <span style={{ fontSize: 10, color: COLORS.textDim }}>도착</span>
          </div>

          {/* ── 상단 경로 정보 바 ── */}
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
            <div
              className="flex items-center justify-center"
              style={{ width: 40, height: 40, borderRadius: 10, background: isJourneyPlanner ? `${COLORS.accentGreen}20` : `${COLORS.accentBlue}20`, flexShrink: 0 }}
            >
              {isJourneyPlanner ? (
                /* 여정 플래너 아이콘 (달력/경로) */
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect x="3" y="4" width="14" height="13" rx="2" stroke={COLORS.accentGreen} strokeWidth="1.5" />
                  <line x1="3" y1="8" x2="17" y2="8" stroke={COLORS.accentGreen} strokeWidth="1.5" />
                  <line x1="7" y1="2" x2="7" y2="5" stroke={COLORS.accentGreen} strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="13" y1="2" x2="13" y2="5" stroke={COLORS.accentGreen} strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M7 12L9 14L13 10" stroke={COLORS.accentGreen} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                /* 충전 검색 아이콘 */
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 2L3 10H7V18H13V10H17L10 2Z" fill={COLORS.accentBlue} opacity="0.8" />
                </svg>
              )}
            </div>
            <div className="flex flex-col" style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: COLORS.textPrimary }}>
                <span style={{ color: COLORS.accentBlue }}>강남역</span>
                <span style={{ color: COLORS.textDim, margin: '0 6px', fontSize: 12 }}>→</span>
                <span style={{ color: COLORS.accentGreen }}>전주공장</span>
              </span>
              <span style={{ fontSize: 11, color: COLORS.textSecondary, marginTop: 2 }}>
                {isJourneyPlanner ? '여정 계획 중 · B2H 연동' : '충전소 경로 검색 중'}
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="font-mono-data" style={{ fontSize: 14, fontWeight: 600, color: COLORS.textPrimary }}>271km</span>
              <span className="font-mono-data" style={{ fontSize: 11, color: COLORS.textDim }}>
                {isJourneyPlanner ? '3h 12m' : '2h 48m'}
              </span>
            </div>
          </div>

          {/* ── 하단 정보 바 ── */}
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
            {isJourneyPlanner ? (
              /* ── 여정 플래너 하단 바 ── */
              <>
                <div className="flex flex-col">
                  <span style={{ fontSize: 11, color: COLORS.textDim }}>도착 예정</span>
                  <span className="font-mono-data" style={{ fontSize: 16, fontWeight: 700, color: COLORS.accentGreen }}>17:42</span>
                </div>
                <div style={{ width: 1, height: 28, background: COLORS.border }} />
                <div className="flex flex-col items-center">
                  <span style={{ fontSize: 11, color: COLORS.textDim }}>충전 경유</span>
                  <span className="font-mono-data" style={{ fontSize: 16, fontWeight: 700, color: COLORS.accentOrange }}>1회</span>
                </div>
                <div style={{ width: 1, height: 28, background: COLORS.border }} />
                <div className="flex flex-col items-center">
                  <span style={{ fontSize: 11, color: COLORS.textDim }}>도착 SOC</span>
                  <span className="font-mono-data" style={{ fontSize: 16, fontWeight: 700, color: COLORS.accentOrange }}>22%</span>
                </div>
                <div style={{ width: 1, height: 28, background: COLORS.border }} />
                <div className="flex flex-col items-end">
                  <span style={{ fontSize: 11, color: COLORS.textDim }}>B2H 소모</span>
                  <span className="font-mono-data" style={{ fontSize: 16, fontWeight: 700, color: COLORS.accentRed }}>17.5kWh</span>
                </div>
              </>
            ) : (
              /* ── 충전소 검색 하단 바 ── */
              <>
                <div className="flex flex-col">
                  <span style={{ fontSize: 11, color: COLORS.textDim }}>경로 내 충전소</span>
                  <span className="font-mono-data" style={{ fontSize: 16, fontWeight: 700, color: COLORS.accentBlue }}>
                    {stations.filter((s) => s.isReachable).length}개
                    <span style={{ fontSize: 12, fontWeight: 400, color: COLORS.textDim }}> 도달 가능</span>
                  </span>
                </div>
                <div style={{ width: 1, height: 28, background: COLORS.border }} />
                <div className="flex flex-col items-center">
                  <span style={{ fontSize: 11, color: COLORS.textDim }}>추천 충전소</span>
                  <span className="font-mono-data" style={{ fontSize: 16, fontWeight: 700, color: COLORS.accentGreen }}>
                    {stations.filter((s) => s.isRecommended).length}개
                  </span>
                </div>
                <div style={{ width: 1, height: 28, background: COLORS.border }} />
                <div className="flex flex-col items-end">
                  <span style={{ fontSize: 11, color: COLORS.textDim }}>주행 가능</span>
                  <span className="font-mono-data" style={{ fontSize: 16, fontWeight: 700, color: COLORS.accentOrange }}>148km</span>
                </div>
              </>
            )}
          </div>

          {/* ── SOC 범례 (여정 플래너만) ── */}
          {isJourneyPlanner && (
            <div
              className="absolute flex items-center gap-4"
              style={{
                bottom: 82, left: 16, right: 16,
                padding: '6px 12px',
                background: '#11182090',
                borderRadius: 8,
                border: `1px solid ${COLORS.border}60`,
              }}
            >
              <span style={{ fontSize: 9, color: COLORS.textDim, letterSpacing: '0.05em' }}>SOC</span>
              {[
                { label: '50%+', color: COLORS.accentGreen },
                { label: '25-50%', color: COLORS.accentOrange },
                { label: '25%-', color: COLORS.accentRed },
              ].map(({ label, color }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <div style={{ width: 16, height: 3, borderRadius: 2, background: color, opacity: 0.9 }} />
                  <span style={{ fontSize: 9, color, fontWeight: 600 }}>{label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 축척 바 */}
      <div className="absolute flex flex-col items-end" style={{ bottom: 90, right: 16 }}>
        <span className="font-mono-data" style={{ fontSize: 10, color: COLORS.textSecondary, marginBottom: 3 }}>
          {showRoute ? '50km' : '200m'}
        </span>
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
