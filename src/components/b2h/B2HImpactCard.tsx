'use client';

import React, { useMemo } from 'react';
import type { JourneyPlan } from '@/types/journey';
import { COLORS } from '@/constants/config';

interface B2HImpactCardProps {
  plan: JourneyPlan;
}

export default function B2HImpactCard({ plan }: B2HImpactCardProps) {
  const impact = useMemo(() => {
    let acTotal = 0;
    let dcTotal = 0;
    for (const seg of plan.segments) {
      if (seg.type === 'driving') {
        acTotal += seg.b2hAcConsumed ?? 0;
        dcTotal += seg.b2hDcConsumed ?? 0;
      }
    }
    const totalKwh = plan.totalB2HConsumed;
    const rangeReduction = Math.round(totalKwh * 2.56); // ~2.56 km/kWh
    return { acTotal: Math.round(acTotal * 10) / 10, dcTotal: Math.round(dcTotal * 10) / 10, totalKwh, rangeReduction };
  }, [plan]);

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
        B2H 전력 영향
      </span>

      {/* AC / DC 뱃지 행 */}
      <div className="flex items-center gap-2" style={{ marginBottom: 10 }}>
        <div
          className="flex items-center gap-1.5"
          style={{
            flex: 1,
            padding: '6px 8px',
            background: `${COLORS.accentBlue}10`,
            border: `1px solid ${COLORS.accentBlue}20`,
            borderRadius: 8,
          }}
        >
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: COLORS.accentBlue }} />
          <span style={{ fontSize: 10, color: COLORS.textDim }}>AC</span>
          <span className="font-mono-data" style={{ fontSize: 11, fontWeight: 700, color: COLORS.accentBlue, marginLeft: 'auto' }}>
            {impact.acTotal}kWh
          </span>
        </div>
        <div
          className="flex items-center gap-1.5"
          style={{
            flex: 1,
            padding: '6px 8px',
            background: `${COLORS.accentGreen}10`,
            border: `1px solid ${COLORS.accentGreen}20`,
            borderRadius: 8,
          }}
        >
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: COLORS.accentGreen }} />
          <span style={{ fontSize: 10, color: COLORS.textDim }}>DC</span>
          <span className="font-mono-data" style={{ fontSize: 11, fontWeight: 700, color: COLORS.accentGreen, marginLeft: 'auto' }}>
            {impact.dcTotal}kWh
          </span>
        </div>
      </div>

      {/* 소모량 / 거리 감소 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: COLORS.accentPurple }} />
          <span style={{ fontSize: 10, color: COLORS.textDim }}>소모</span>
          <span className="font-mono-data" style={{ fontSize: 11, fontWeight: 700, color: COLORS.accentPurple }}>
            {impact.totalKwh}kWh
          </span>
        </div>
        <div className="flex items-center gap-1">
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: COLORS.accentRed }} />
          <span style={{ fontSize: 10, color: COLORS.textDim }}>거리</span>
          <span className="font-mono-data" style={{ fontSize: 11, fontWeight: 700, color: COLORS.accentRed }}>
            -{impact.rangeReduction}km
          </span>
        </div>
      </div>
    </div>
  );
}
