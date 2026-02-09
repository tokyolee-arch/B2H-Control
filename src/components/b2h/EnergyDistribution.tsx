'use client';

import React from 'react';
import { Activity } from 'lucide-react';
import { COLORS } from '@/constants/config';

interface EnergyDistributionProps {
  acPower: number;
  dcPower: number;
  totalCumulative: number;
  compact?: boolean;
}

interface RowData { color: string; label: string; value: string; unit: string; }

export default function EnergyDistribution({ acPower, dcPower, totalCumulative, compact = false }: EnergyDistributionProps) {
  const totalPower = acPower + dcPower;
  const rows: RowData[] = [
    { color: COLORS.accentBlue, label: 'AC 출력', value: acPower.toFixed(1), unit: 'kW' },
    { color: COLORS.accentGreen, label: 'DC 출력', value: dcPower.toFixed(1), unit: 'kW' },
    { color: COLORS.accentPurple, label: '합산 전력', value: totalPower.toFixed(1), unit: 'kW' },
    { color: COLORS.accentOrange, label: '총 누적', value: totalCumulative.toFixed(1), unit: 'kWh' },
  ];

  if (compact) {
    return (
      <div className="rounded-xl overflow-hidden" style={{ margin: '0 12px', background: COLORS.card, border: `1px solid ${COLORS.border}` }}>
        <div className="flex items-center gap-2" style={{ padding: '10px 16px 8px' }}>
          <Activity size={15} color={COLORS.textDim} strokeWidth={2} />
          <span style={{ fontSize: 15, fontWeight: 600, color: COLORS.textSecondary }}>에너지 분배</span>
        </div>
        <div className="grid grid-cols-2" style={{ gap: 1, padding: '0 1px 1px', background: COLORS.border }}>
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between" style={{ padding: '9px 14px', background: COLORS.card }}>
              <div className="flex items-center gap-2">
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: row.color, flexShrink: 0 }} />
                <span style={{ fontSize: 14, color: COLORS.textDim, lineHeight: 1 }}>{row.label}</span>
              </div>
              <div className="flex items-baseline gap-0.5">
                <span className="font-mono-data ivi-number-transition" style={{ fontSize: 17, fontWeight: 700, color: row.color, lineHeight: 1 }}>{row.value}</span>
                <span className="font-mono-data" style={{ fontSize: 13, color: row.color, opacity: 0.6 }}>{row.unit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden" style={{ margin: '0 12px', background: COLORS.card, border: `1px solid ${COLORS.border}` }}>
      <div className="flex items-center gap-2" style={{ padding: '12px 16px 10px' }}>
        <Activity size={17} color={COLORS.textDim} strokeWidth={2} />
        <span style={{ fontSize: 17, fontWeight: 600, color: COLORS.textSecondary, letterSpacing: '0.02em' }}>실시간 에너지 분배</span>
      </div>
      <div>
        {rows.map((row, idx) => (
          <div key={row.label} className="flex items-center justify-between" style={{ padding: '10px 16px', borderTop: idx > 0 ? `1px solid ${COLORS.border}` : undefined }}>
            <div className="flex items-center gap-2.5">
              <div style={{ width: 9, height: 9, borderRadius: '50%', background: row.color, flexShrink: 0, boxShadow: `0 0 6px ${row.color}40` }} />
              <span style={{ fontSize: 17, color: COLORS.textSecondary, lineHeight: 1 }}>{row.label}</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-mono-data energy-value-transition ivi-number-transition" style={{ fontSize: 18, fontWeight: 700, color: row.color, lineHeight: 1 }}>{row.value}</span>
              <span className="font-mono-data" style={{ fontSize: 14, color: row.color, opacity: 0.6 }}>{row.unit}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
