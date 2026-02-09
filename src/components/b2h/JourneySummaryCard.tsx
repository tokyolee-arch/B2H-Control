'use client';

import React, { useMemo } from 'react';
import type { JourneyPlan } from '@/types/journey';
import { COLORS } from '@/constants/config';

interface JourneySummaryCardProps {
  plan: JourneyPlan;
}

export default function JourneySummaryCard({ plan }: JourneySummaryCardProps) {
  const hours = Math.floor(plan.totalDuration / 60);
  const mins = plan.totalDuration % 60;

  const chargingCount = useMemo(
    () => plan.waypoints.filter((w) => w.type === 'charging').length,
    [plan.waypoints],
  );

  const items = [
    { label: '총 거리', value: `${plan.totalDistance}`, unit: 'km', color: COLORS.textPrimary },
    { label: '총 소요', value: `${hours}h ${mins.toString().padStart(2, '0')}m`, unit: '', color: COLORS.textPrimary },
    { label: '충전 횟수', value: `${chargingCount}`, unit: '회', color: COLORS.accentOrange },
    { label: '도착 SOC', value: `${plan.finalArrivalSoc}`, unit: '%', color: plan.finalArrivalSoc < 25 ? COLORS.accentRed : COLORS.accentGreen },
  ];

  return (
    <div
      style={{
        background: COLORS.card,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 12,
        padding: 14,
      }}
    >
      <span
        style={{
          fontSize: 10,
          fontWeight: 600,
          color: COLORS.textDim,
          textTransform: 'uppercase',
          letterSpacing: '0.6px',
          display: 'block',
          marginBottom: 10,
        }}
      >
        여정 요약
      </span>

      <div className="grid grid-cols-2" style={{ gap: 8 }}>
        {items.map((item) => (
          <div
            key={item.label}
            className="flex flex-col items-center justify-center"
            style={{ padding: '8px 6px', background: '#0d1219', borderRadius: 8 }}
          >
            <span style={{ fontSize: 9, color: COLORS.textDim, marginBottom: 4 }}>{item.label}</span>
            <div className="flex items-baseline gap-0.5">
              <span className="font-mono-data" style={{ fontSize: 14, fontWeight: 700, color: item.color, lineHeight: 1 }}>
                {item.value}
              </span>
              {item.unit && (
                <span style={{ fontSize: 9, color: COLORS.textSecondary }}>{item.unit}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
