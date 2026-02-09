'use client';

import React, { useCallback, useRef } from 'react';
import type { JourneyWaypoint, JourneySegment } from '@/types/journey';
import { COLORS } from '@/constants/config';

export interface JourneyChargeCardProps {
  waypoint: JourneyWaypoint;
  chargingSegment: JourneySegment;
  nextDrivingSegment: JourneySegment;
  totalCapacity: number;        // 80kWh
  pricePerKwh: number;          // 350원
  minTargetSoc: number;         // 최소 충전 SOC (52%)
  currentTargetSoc: number;     // 현재 슬라이더 값 (80)
  onTargetSocChange: (newSoc: number) => void;
  finalArrivalSoc: number;      // 최종 도착 잔량 (22%)
  chargingDuration: number;     // 현재 충전 시간 (분)
  chargingCost: number;         // 현재 충전 비용 (원)
  destinationName?: string;     // 최종 도착지 이름 (예: "전주공장")
}

export default function JourneyChargeCard({
  waypoint,
  totalCapacity,
  minTargetSoc,
  currentTargetSoc,
  onTargetSocChange,
  finalArrivalSoc,
  chargingDuration,
  chargingCost,
  destinationName,
}: JourneyChargeCardProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const arrivalSoc = waypoint.arrivalSoc;
  const info = waypoint.stationInfo;
  const maxPower = info?.maxPower ?? 200;
  const chargerLabel = info?.chargerType === 'superfast' ? '초급속' : '급속';
  const chargeKwh = Math.round(((currentTargetSoc - arrivalSoc) / 100) * totalCapacity * 10) / 10;

  /* ── 최소 충전 kWh 계산 ── */
  const minChargeKwh = Math.round(((minTargetSoc - arrivalSoc) / 100) * totalCapacity * 10) / 10;

  /* ── 슬라이더 → SOC 변환 ── */
  const updateFromPointer = useCallback(
    (clientX: number) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      // 전체 범위: arrivalSoc ~ 100
      const rawSoc = Math.round(arrivalSoc + ratio * (100 - arrivalSoc));
      // 최소 SOC 이하로는 드래그 불가 → snap back
      const clamped = Math.max(minTargetSoc, Math.min(100, rawSoc));
      onTargetSocChange(clamped);
    },
    [arrivalSoc, minTargetSoc, onTargetSocChange],
  );

  /* ── 포인터 이벤트: trackRef에 capture 고정 ── */
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      draggingRef.current = true;
      // 항상 트랙 div 에 capture → 자식(thumb 등)에 걸리는 문제 방지
      trackRef.current?.setPointerCapture(e.pointerId);
      updateFromPointer(e.clientX);
    },
    [updateFromPointer],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!draggingRef.current) return;
      updateFromPointer(e.clientX);
    },
    [updateFromPointer],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      trackRef.current?.releasePointerCapture(e.pointerId);
    },
    [],
  );

  /* ── 위치 퍼센트 계산 ── */
  const sliderRange = 100 - arrivalSoc;                       // 슬라이더가 커버하는 SOC 범위
  const fillPercent = ((currentTargetSoc - arrivalSoc) / sliderRange) * 100;
  const minMarkerPercent = ((minTargetSoc - arrivalSoc) / sliderRange) * 100;

  return (
    <div
      style={{
        background: COLORS.card,
        border: `1px solid rgba(255,159,67,0.3)`,
        borderRadius: 12,
        overflow: 'hidden',
      }}
    >
      {/* ── 상단 2px 그라데이션 바 ── */}
      <div
        style={{
          height: 2,
          background: `linear-gradient(90deg, ${COLORS.accentOrange}, ${COLORS.accentGreen})`,
        }}
      />

      <div style={{ padding: 12 }}>
        {/* ══════ 헤더 행 ══════ */}
        <div className="flex items-start justify-between" style={{ marginBottom: 10 }}>
          {/* 좌측: 충전소명 + 스펙 */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: COLORS.textPrimary,
                display: 'block',
                lineHeight: 1.3,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {waypoint.name}
            </span>
            <span style={{ fontSize: 10, color: COLORS.textDim, display: 'block', marginTop: 2 }}>
              {info?.operator ?? ''} · {maxPower}kW {chargerLabel}
              {info ? ` · ${info.availableChargers}/${info.totalChargers} 가능` : ''}
            </span>
          </div>

          {/* 우측: SOC 흐름 */}
          <div className="font-mono-data flex items-baseline gap-0.5" style={{ flexShrink: 0, marginLeft: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: COLORS.accentOrange }}>
              {arrivalSoc}
            </span>
            <span style={{ fontSize: 11, color: COLORS.textDim, margin: '0 2px' }}>→</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: COLORS.accentGreen }}>
              {currentTargetSoc}%
            </span>
          </div>
        </div>

        {/* ══════ 슬라이더 영역 ══════ */}
        <div style={{ marginBottom: 10 }}>
          {/* 현재 값 + 충전량 행 */}
          <div className="flex items-end justify-between" style={{ marginBottom: 4 }}>
            <span
              className="font-mono-data"
              style={{ fontSize: 26, fontWeight: 700, color: COLORS.accentGreen, lineHeight: 1 }}
            >
              {currentTargetSoc}
              <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.textSecondary, marginLeft: 1 }}>%</span>
            </span>
            <span
              className="font-mono-data"
              style={{ fontSize: 12, fontWeight: 600, color: COLORS.accentOrange }}
            >
              +{chargeKwh} kWh
            </span>
          </div>

          {/* ── 최소 충전 안내 (슬라이더 위) ── */}
          <div
            className="flex items-center gap-1.5"
            style={{
              marginBottom: 6,
              padding: '4px 8px',
              background: `${COLORS.accentRed}08`,
              border: `1px solid ${COLORS.accentRed}20`,
              borderRadius: 6,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
              <path
                d="M6 1L1 10.5H11L6 1Z"
                stroke={COLORS.accentRed}
                strokeWidth="1.2"
                strokeLinejoin="round"
                fill="none"
              />
              <line x1="6" y1="5" x2="6" y2="7.5" stroke={COLORS.accentRed} strokeWidth="1.2" strokeLinecap="round" />
              <circle cx="6" cy="9" r="0.6" fill={COLORS.accentRed} />
            </svg>
            <span style={{ fontSize: 10, color: COLORS.textSecondary, lineHeight: 1.3 }}>
              <span style={{ color: COLORS.accentRed, fontWeight: 700 }}>
                {destinationName ?? '목적지'}
              </span>
              까지 최소{' '}
              <span className="font-mono-data" style={{ fontWeight: 700, color: COLORS.accentRed }}>
                {minTargetSoc}%
              </span>
              {' '}충전 필요{' '}
              <span className="font-mono-data" style={{ color: COLORS.textDim, fontSize: 9 }}>
                (+{minChargeKwh}kWh)
              </span>
            </span>
          </div>

          {/* 슬라이더 트랙 */}
          <div
            ref={trackRef}
            className="relative"
            style={{ height: 36, cursor: 'pointer', touchAction: 'none' }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            {/* 배경 트랙 */}
            <div
              className="absolute"
              style={{
                top: 14,
                left: 0,
                right: 0,
                height: 8,
                borderRadius: 4,
                background: '#1a2230',
              }}
            />

            {/* 채움 트랙 */}
            <div
              className="absolute"
              style={{
                top: 14,
                left: 0,
                width: `${fillPercent}%`,
                height: 8,
                borderRadius: 4,
                background: `linear-gradient(90deg, ${COLORS.accentOrange}, ${COLORS.accentGreen})`,
                transition: draggingRef.current ? 'none' : 'width 0.12s ease',
              }}
            />

            {/* 최소 충전 마커 (빨간 세로선) */}
            <div
              className="absolute"
              style={{
                top: 4,
                left: `${minMarkerPercent}%`,
                transform: 'translateX(-50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                pointerEvents: 'none',
              }}
            >
              {/* 라벨 */}
              <span
                className="font-mono-data"
                style={{
                  fontSize: 7,
                  fontWeight: 700,
                  color: COLORS.accentRed,
                  background: `${COLORS.accentRed}15`,
                  border: `1px solid ${COLORS.accentRed}30`,
                  borderRadius: 3,
                  padding: '0px 3px',
                  whiteSpace: 'nowrap',
                  lineHeight: '12px',
                }}
              >
                최소 {minTargetSoc}%
              </span>
              {/* 세로선 */}
              <div
                style={{
                  width: 1,
                  height: 14,
                  background: `${COLORS.accentRed}80`,
                  marginTop: 1,
                }}
              />
            </div>

            {/* 썸(thumb) */}
            <div
              className="absolute soc-slider-thumb"
              style={{
                top: 3,
                left: `${fillPercent}%`,
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: '#fff',
                border: `2px solid ${COLORS.accentGreen}`,
                boxShadow: `0 2px 8px rgba(0,0,0,0.35), 0 0 10px ${COLORS.accentGreen}40`,
                transform: 'translateX(-50%)',
                transition: draggingRef.current ? 'none' : 'left 0.12s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
              }}
            >
              {/* 중앙 도트 */}
              <div
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: COLORS.accentGreen,
                }}
              />
            </div>
          </div>

          {/* 하단 눈금 라벨 */}
          <div className="flex items-center justify-between" style={{ marginTop: 2 }}>
            <span className="font-mono-data" style={{ fontSize: 8, color: COLORS.textDim }}>
              {arrivalSoc}%
            </span>
            <span className="font-mono-data" style={{ fontSize: 8, color: COLORS.accentRed, fontWeight: 600 }}>
              {minTargetSoc}% min
            </span>
            <span className="font-mono-data" style={{ fontSize: 8, color: COLORS.textDim }}>
              100%
            </span>
          </div>
        </div>

        {/* ══════ 하단 결과 칩 — 3열 ══════ */}
        <div className="grid grid-cols-3" style={{ gap: 6 }}>
          {/* 충전시간 */}
          <div
            className="flex flex-col items-center justify-center"
            style={{
              padding: '6px 4px',
              background: '#0d1219',
              borderRadius: 6,
            }}
          >
            <span style={{ fontSize: 8, color: COLORS.textDim, marginBottom: 3 }}>충전시간</span>
            <span
              className="font-mono-data"
              style={{ fontSize: 12, fontWeight: 700, color: COLORS.accentPurple, lineHeight: 1 }}
            >
              {chargingDuration}
              <span style={{ fontSize: 8, fontWeight: 500, marginLeft: 1 }}>min</span>
            </span>
          </div>

          {/* 충전비용 */}
          <div
            className="flex flex-col items-center justify-center"
            style={{
              padding: '6px 4px',
              background: '#0d1219',
              borderRadius: 6,
            }}
          >
            <span style={{ fontSize: 8, color: COLORS.textDim, marginBottom: 3 }}>충전비용</span>
            <span
              className="font-mono-data"
              style={{ fontSize: 12, fontWeight: 700, color: COLORS.textPrimary, lineHeight: 1 }}
            >
              {chargingCost.toLocaleString()}
              <span style={{ fontSize: 8, fontWeight: 500, marginLeft: 1 }}>원</span>
            </span>
          </div>

          {/* 도착잔량 */}
          <div
            className="flex flex-col items-center justify-center"
            style={{
              padding: '6px 4px',
              background: '#0d1219',
              borderRadius: 6,
            }}
          >
            <span style={{ fontSize: 8, color: COLORS.textDim, marginBottom: 3 }}>도착잔량</span>
            <span
              className="font-mono-data"
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: finalArrivalSoc < 25 ? COLORS.accentRed : COLORS.accentOrange,
                lineHeight: 1,
              }}
            >
              {finalArrivalSoc}
              <span style={{ fontSize: 8, fontWeight: 500, marginLeft: 1 }}>%</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
