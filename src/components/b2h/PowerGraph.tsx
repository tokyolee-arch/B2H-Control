'use client';

import React, { useMemo, useId } from 'react';
import { AreaChart, Area, ReferenceLine, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { PowerDataPoint } from '@/types/b2h';
import { COLORS } from '@/constants/config';

interface PowerGraphProps {
  data: PowerDataPoint[];
  color: string;
  maxPower: number;
  currentPower: number;
  compact?: boolean;
}

function LastPointDot({ data, color, maxPower, chartHeight }: { data: PowerDataPoint[]; color: string; maxPower: number; chartHeight: number }) {
  if (data.length < 2) return null;
  const lastPower = data[data.length - 1].power;
  const yDomain = Math.max(maxPower * 1.1, Math.max(...data.map(d => d.power)) * 1.1, 0.1);
  const yRatio = lastPower / yDomain;
  const topPx = chartHeight - yRatio * chartHeight;
  return (
    <div className="absolute" style={{ right: 0, top: topPx, transform: 'translate(50%, -50%)', zIndex: 5, pointerEvents: 'none' }}>
      <div className="absolute power-graph-dot-pulse" style={{ width: 18, height: 18, borderRadius: '50%', background: `${color}30`, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}80`, position: 'relative', zIndex: 6 }} />
    </div>
  );
}

const PowerGraph = React.memo(function PowerGraph({ data, color, maxPower, currentPower, compact = false }: PowerGraphProps) {
  const uid = useId();
  const gradientId = `power-grad-${uid.replace(/:/g, '')}`;
  const CHART_HEIGHT = compact ? 56 : 72;

  const chartData = useMemo(() => data.map((d, i) => ({ index: i, power: d.power })), [data]);
  const yMax = useMemo(() => {
    const dataPeak = data.length > 0 ? Math.max(...data.map(d => d.power)) : 0;
    return Math.max(maxPower * 1.15, dataPeak * 1.15, 0.5);
  }, [data, maxPower]);

  if (data.length < 2) {
    return (
      <div style={{ margin: '0 14px' }}>
        <div className="rounded-lg overflow-hidden" style={{ background: '#0d1219', border: `1px solid ${COLORS.border}` }}>
          <div className="flex items-center justify-center" style={{ height: CHART_HEIGHT + 28, opacity: 0.4 }}>
            <span style={{ fontSize: 15, color: COLORS.textDim }}>데이터 수집 중...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ margin: '0 14px' }}>
      <div className="flex items-end justify-between" style={{ marginBottom: 10 }}>
        <div className="flex items-baseline gap-1">
          <span className="font-mono-data" style={{ fontSize: 34, fontWeight: 700, color: color, lineHeight: 1 }}>{currentPower.toFixed(1)}</span>
          <span className="font-mono-data" style={{ fontSize: 17, color: color, opacity: 0.7 }}>kW</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span style={{ fontSize: 14, color: COLORS.textDim }}>MAX</span>
          <span className="font-mono-data" style={{ fontSize: 17, fontWeight: 600, color: COLORS.textSecondary }}>{maxPower.toFixed(1)}</span>
          <span className="font-mono-data" style={{ fontSize: 14, color: COLORS.textDim }}>kW</span>
        </div>
      </div>
      <div className="relative rounded-lg overflow-hidden" style={{ background: '#0d1219', border: `1px solid ${COLORS.border}` }}>
        <div className="relative" style={{ height: CHART_HEIGHT }}>
          <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
            <AreaChart data={chartData} margin={{ top: 4, right: 6, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="index" hide />
              <YAxis hide domain={[0, yMax]} />
              <ReferenceLine y={maxPower} stroke={COLORS.accentRed} strokeOpacity={0.3} strokeDasharray="4 4" ifOverflow="extendDomain" />
              <Area type="monotone" dataKey="power" stroke={color} strokeWidth={2} fill={`url(#${gradientId})`} dot={false} activeDot={false} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
          <LastPointDot data={data} color={color} maxPower={maxPower} chartHeight={CHART_HEIGHT} />
        </div>
        <div className="flex justify-between font-mono-data" style={{ fontSize: 13, color: COLORS.textDim, padding: '5px 12px 7px' }}>
          <span>-30m</span><span>-20m</span><span>-10m</span><span>Now</span>
        </div>
      </div>
    </div>
  );
});

export default PowerGraph;
