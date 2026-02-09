'use client';

import React, { useMemo } from 'react';
import type { RouteInfo } from '@/types/charging';
import { COLORS } from '@/constants/config';

interface RouteProgressBarProps {
  route: RouteInfo;
  currentSoc: number;
  reserveSoc?: number;
}

interface Marker {
  label: string;
  leftPercent: number;
  color: string;
  distance: number;
  dotType: 'glow' | 'ring' | 'small' | 'filled';
  dotSize: number;
}

export default function RouteProgressBar({
  route,
  currentSoc,
  reserveSoc = 25,
}: RouteProgressBarProps) {
  const { totalDistance, currentRange } = route;

  const calc = useMemo(() => {
    const rangePerPercent = currentSoc > 0 ? currentRange / currentSoc : 0;
    const chargeSoc = reserveSoc + 5; // 30%

    const soc30Distance = Math.round((currentSoc - chargeSoc) * rangePerPercent);
    const soc0Distance = currentRange;

    const soc30Pct = Math.min(100, (soc30Distance / totalDistance) * 100);
    const soc0Pct = Math.min(100, (soc0Distance / totalDistance) * 100);

    // 충전 추천 구간 (SOC 30% ± 5%)
    const zoneStartDist = Math.round((currentSoc - chargeSoc - 5) * rangePerPercent);
    const zoneEndDist = Math.round((currentSoc - chargeSoc + 5) * rangePerPercent);

    return { rangePerPercent, soc30Distance, soc0Distance, soc30Pct, soc0Pct, chargeSoc, zoneStartDist, zoneEndDist };
  }, [currentSoc, currentRange, totalDistance, reserveSoc]);

  const markers: Marker[] = [
    {
      label: `현재 ${currentSoc}%`,
      leftPercent: 0,
      color: COLORS.accentBlue,
      distance: 0,
      dotType: 'glow',
      dotSize: 8,
    },
    {
      label: `${calc.chargeSoc}% 도달`,
      leftPercent: calc.soc30Pct,
      color: COLORS.accentOrange,
      distance: calc.soc30Distance,
      dotType: 'ring',
      dotSize: 8,
    },
    {
      label: '0% 방전',
      leftPercent: calc.soc0Pct,
      color: COLORS.accentRed,
      distance: calc.soc0Distance,
      dotType: 'small',
      dotSize: 6,
    },
    {
      label: '목적지',
      leftPercent: 100,
      color: COLORS.accentGreen,
      distance: totalDistance,
      dotType: 'filled',
      dotSize: 8,
    },
  ];

  return (
    <div
      style={{
        margin: '10px 14px 0',
        padding: '14px 16px',
        background: COLORS.card,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 14,
      }}
    >
      {/* ── 타이틀 ── */}
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: COLORS.textDim,
          textTransform: 'uppercase',
          letterSpacing: '0.8px',
          display: 'block',
          marginBottom: 16,
        }}
      >
        경로 배터리 소모 예측
      </span>

      {/* ── 마커 라벨 행 ── */}
      <div className="relative" style={{ height: 14, marginBottom: 4 }}>
        {markers.map((m) => (
          <span
            key={m.label}
            className="font-mono-data"
            style={{
              position: 'absolute',
              left: `${m.leftPercent}%`,
              transform:
                m.leftPercent === 0
                  ? 'translateX(0)'
                  : m.leftPercent === 100
                  ? 'translateX(-100%)'
                  : 'translateX(-50%)',
              fontSize: 9,
              fontWeight: 700,
              color: m.color,
              whiteSpace: 'nowrap',
              lineHeight: 1,
            }}
          >
            {m.label}
          </span>
        ))}
      </div>

      {/* ── 마커 핀 + 프로그레스 바 ── */}
      <div className="relative" style={{ height: 36 }}>
        {/* 핀 라인 (라벨→바 연결) */}
        {markers.map((m) => (
          <div
            key={`pin-${m.label}`}
            style={{
              position: 'absolute',
              left: `${m.leftPercent}%`,
              top: 0,
              width: 2,
              height: 14,
              background: m.color,
              opacity: 0.5,
              transform: 'translateX(-50%)',
              borderRadius: 1,
            }}
          />
        ))}

        {/* 바 트랙 (세로 중앙) */}
        <div
          className="absolute"
          style={{
            left: 0,
            right: 0,
            top: 14,
            height: 8,
            borderRadius: 4,
            background: '#1a2230',
            overflow: 'hidden',
          }}
        >
          {/* 주행 가능 범위 채움 (green → orange) */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              width: `${calc.soc0Pct}%`,
              borderRadius: 4,
              background: `linear-gradient(90deg, ${COLORS.accentGreen}, ${COLORS.accentOrange})`,
              opacity: 0.6,
            }}
          />

          {/* Reserve 범위 채움 (SOC 30% 이상 = 안전 구간, 진한 초록) */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              width: `${calc.soc30Pct}%`,
              borderRadius: 4,
              background: `linear-gradient(90deg, ${COLORS.accentGreen}, ${COLORS.accentGreen}80)`,
              opacity: 0.7,
            }}
          />
        </div>

        {/* 마커 도트 (바 위에) */}
        {markers.map((m) => {
          const dotTop = 14 + 4; // 바 중앙 (14px offset + 4px = bar center)
          if (m.dotType === 'glow') {
            return (
              <div
                key={`dot-${m.label}`}
                className="route-glow-pulse"
                style={{
                  position: 'absolute',
                  left: `${m.leftPercent}%`,
                  top: dotTop,
                  width: m.dotSize,
                  height: m.dotSize,
                  borderRadius: '50%',
                  background: m.color,
                  zIndex: 3,
                }}
              />
            );
          }
          if (m.dotType === 'ring') {
            return (
              <div
                key={`dot-${m.label}`}
                style={{
                  position: 'absolute',
                  left: `${m.leftPercent}%`,
                  top: dotTop,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 3,
                }}
              >
                <div
                  style={{
                    width: m.dotSize,
                    height: m.dotSize,
                    borderRadius: '50%',
                    background: 'transparent',
                    border: `2px solid ${m.color}`,
                  }}
                />
              </div>
            );
          }
          if (m.dotType === 'small') {
            return (
              <div
                key={`dot-${m.label}`}
                style={{
                  position: 'absolute',
                  left: `${m.leftPercent}%`,
                  top: dotTop,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 3,
                }}
              >
                <div
                  style={{
                    width: m.dotSize,
                    height: m.dotSize,
                    borderRadius: '50%',
                    background: m.color,
                  }}
                />
              </div>
            );
          }
          // filled
          return (
            <div
              key={`dot-${m.label}`}
              style={{
                position: 'absolute',
                left: `${m.leftPercent}%`,
                top: dotTop,
                transform: 'translate(-50%, -50%)',
                zIndex: 3,
              }}
            >
              <div
                style={{
                  width: m.dotSize,
                  height: m.dotSize,
                  borderRadius: '50%',
                  background: m.color,
                }}
              />
            </div>
          );
        })}
      </div>

      {/* ── 하단 거리 라벨 ── */}
      <div className="relative" style={{ height: 14, marginTop: 4 }}>
        {markers.map((m) => (
          <span
            key={`dist-${m.label}`}
            className="font-mono-data"
            style={{
              position: 'absolute',
              left: `${m.leftPercent}%`,
              transform:
                m.leftPercent === 0
                  ? 'translateX(0)'
                  : m.leftPercent === 100
                  ? 'translateX(-100%)'
                  : 'translateX(-50%)',
              fontSize: 9,
              color: COLORS.textDim,
              whiteSpace: 'nowrap',
              lineHeight: 1,
            }}
          >
            {m.distance}km
          </span>
        ))}
      </div>

      {/* ── 충전 추천 구간 인디케이터 ── */}
      <div
        className="flex items-center gap-2"
        style={{
          marginTop: 12,
          padding: '8px 12px',
          background: `${COLORS.accentBlue}0F`,
          border: `1px solid ${COLORS.accentBlue}1A`,
          borderRadius: 8,
        }}
      >
        <div
          className="battery-dot-pulse"
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: COLORS.accentBlue,
            flexShrink: 0,
          }}
        />
        <span style={{ fontSize: 11, color: COLORS.textSecondary, lineHeight: 1.3 }}>
          <span style={{ fontWeight: 700 }}>충전 추천 구간:</span>{' '}
          <span className="font-mono-data">
            {calc.zoneStartDist}~{calc.zoneEndDist}km
          </span>{' '}
          지점 (SOC {calc.chargeSoc}%±)
        </span>
      </div>
    </div>
  );
}
