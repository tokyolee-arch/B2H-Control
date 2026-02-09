'use client';

import React, { useState, useCallback, useRef, useMemo } from 'react';
import type { JourneyWaypoint } from '@/types/journey';
import { COLORS } from '@/constants/config';

interface ChargingPlanCardProps {
  waypoint: JourneyWaypoint;
}

export default function ChargingPlanCard({ waypoint }: ChargingPlanCardProps) {
  const info = waypoint.stationInfo;
  const arrivalSoc = waypoint.arrivalSoc;
  const defaultTarget = waypoint.departureSoc ?? 80;

  const [targetSoc, setTargetSoc] = useState(defaultTarget);
  const trackRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const chargerLabel = info?.chargerType === 'superfast' ? '초급속' : '급속';
  const maxPower = info?.maxPower ?? 200;
  const pricePerKwh = info?.pricePerKwh ?? 350;

  // SOC 변경에 따른 충전시간/비용 재계산
  const computed = useMemo(() => {
    const socDelta = targetSoc - arrivalSoc;
    const kwhNeeded = (socDelta / 100) * 80; // 80kWh 배터리 기준
    const avgPower = maxPower * (targetSoc < 60 ? 0.85 : targetSoc < 80 ? 0.65 : 0.45);
    const chargingMinutes = Math.round((kwhNeeded / avgPower) * 60);
    const cost = Math.round(kwhNeeded * pricePerKwh);
    return { chargingMinutes, cost, kwhNeeded: Math.round(kwhNeeded * 10) / 10 };
  }, [targetSoc, arrivalSoc, maxPower, pricePerKwh]);

  const updateFromPointer = useCallback((clientX: number) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const soc = Math.round(arrivalSoc + ratio * (100 - arrivalSoc));
    setTargetSoc(Math.max(arrivalSoc + 5, Math.min(100, soc)));
  }, [arrivalSoc]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    draggingRef.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updateFromPointer(e.clientX);
  }, [updateFromPointer]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    updateFromPointer(e.clientX);
  }, [updateFromPointer]);

  const handlePointerUp = useCallback(() => {
    draggingRef.current = false;
  }, []);

  const fillPercent = ((targetSoc - arrivalSoc) / (100 - arrivalSoc)) * 100;

  return (
    <div
      style={{
        background: COLORS.card,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 12,
        padding: 14,
      }}
    >
      {/* 충전소명 + 운영사 */}
      <div style={{ marginBottom: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.textPrimary, display: 'block', lineHeight: 1.3 }}>
          {waypoint.name}
        </span>
        <div className="flex items-center gap-2" style={{ marginTop: 3 }}>
          <span style={{ fontSize: 10, color: COLORS.textDim }}>{info?.operator}</span>
          <span
            style={{
              fontSize: 9,
              fontWeight: 600,
              color: COLORS.accentGreen,
              background: `${COLORS.accentGreen}15`,
              borderRadius: 3,
              padding: '1px 5px',
            }}
          >
            {chargerLabel} {maxPower}kW
          </span>
          {info && (
            <span style={{ fontSize: 9, color: COLORS.textDim }}>
              {info.availableChargers}/{info.totalChargers} 사용가능
            </span>
          )}
        </div>
      </div>

      {/* SOC 슬라이더 */}
      <div style={{ marginBottom: 12 }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
          <span className="font-mono-data" style={{ fontSize: 11, fontWeight: 700, color: COLORS.accentOrange }}>
            {arrivalSoc}%
          </span>
          <span style={{ fontSize: 10, color: COLORS.textDim }}>목표 충전</span>
          <span className="font-mono-data" style={{ fontSize: 11, fontWeight: 700, color: COLORS.accentGreen }}>
            {targetSoc}%
          </span>
        </div>

        <div
          ref={trackRef}
          className="relative"
          style={{ height: 28, cursor: 'pointer', touchAction: 'none' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <div
            className="absolute"
            style={{ top: 10, left: 0, right: 0, height: 8, borderRadius: 4, background: '#1a2230' }}
          />
          <div
            className="absolute"
            style={{
              top: 10, left: 0, width: `${fillPercent}%`, height: 8, borderRadius: 4,
              background: `linear-gradient(90deg, ${COLORS.accentOrange}, ${COLORS.accentGreen})`,
              transition: draggingRef.current ? 'none' : 'width 0.15s ease',
            }}
          />
          <div
            className="absolute soc-slider-thumb"
            style={{
              top: 4, left: `${fillPercent}%`, width: 20, height: 20, borderRadius: '50%',
              background: '#fff', border: `2px solid ${COLORS.accentGreen}`,
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)', transform: 'translateX(-50%)',
              transition: draggingRef.current ? 'none' : 'left 0.15s ease',
            }}
          />
        </div>
      </div>

      {/* 하단 정보 */}
      <div className="flex items-center justify-between" style={{ paddingTop: 2 }}>
        <div className="flex items-center gap-1">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="6" r="4.5" stroke={COLORS.textSecondary} strokeWidth="1.2" />
            <path d="M6 3.5V6L7.5 7.5" stroke={COLORS.textSecondary} strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          <span style={{ fontSize: 10, color: COLORS.textDim }}>충전</span>
          <span className="font-mono-data" style={{ fontSize: 11, fontWeight: 700, color: COLORS.textPrimary }}>
            {computed.chargingMinutes}min
          </span>
        </div>
        <div className="flex items-center gap-1">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="6" r="4.5" stroke={COLORS.textSecondary} strokeWidth="1.2" />
            <text x="6" y="8" textAnchor="middle" fill={COLORS.textSecondary} fontSize="6" fontWeight="700" fontFamily="'JetBrains Mono', monospace">₩</text>
          </svg>
          <span className="font-mono-data" style={{ fontSize: 11, fontWeight: 700, color: COLORS.textPrimary }}>
            {computed.cost.toLocaleString()}원
          </span>
        </div>
      </div>
    </div>
  );
}
