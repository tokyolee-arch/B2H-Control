'use client';

import React from 'react';
import { COLORS } from '@/constants/config';

interface JourneyB2HImpactProps {
  acOn: boolean;
  dcOn: boolean;
  totalB2HConsumed: number;   // kWh
  rangeReduction: number;     // km
  onB2HToggle: (type: 'ac' | 'dc', isOn: boolean) => void;
}

/** 미니 토글 스위치 (30×16px) */
function MiniToggle({
  isOn,
  color,
  onToggle,
}: {
  isOn: boolean;
  color: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      role="switch"
      aria-checked={isOn}
      className="ivi-touch-target"
      style={{
        width: 30,
        height: 16,
        borderRadius: 8,
        background: isOn ? color : '#1a2230',
        border: 'none',
        cursor: 'pointer',
        position: 'relative',
        transition: 'background 0.2s ease',
        outline: 'none',
        flexShrink: 0,
        padding: 0,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 2,
          left: isOn ? 16 : 2,
          width: 12,
          height: 12,
          borderRadius: '50%',
          background: '#fff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
          transition: 'left 0.2s cubic-bezier(0.68,-0.2,0.27,1.2)',
        }}
      />
    </button>
  );
}

export default function JourneyB2HImpact({
  acOn,
  dcOn,
  totalB2HConsumed,
  rangeReduction,
  onB2HToggle,
}: JourneyB2HImpactProps) {
  return (
    <div
      style={{
        background: COLORS.card,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 10,
        padding: '10px 12px',
      }}
    >
      {/* 타이틀 */}
      <div className="flex items-center gap-1.5" style={{ marginBottom: 8 }}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M6.5 1L2 7h3l-.5 4L10 5H7l-.5-4Z" fill={COLORS.accentOrange} />
        </svg>
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: COLORS.textDim,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          B2H 전력 영향
        </span>
      </div>

      {/* AC / DC 토글 행 */}
      <div className="flex flex-col" style={{ gap: 6, marginBottom: 10 }}>
        {/* AC */}
        <div className="flex items-center" style={{ gap: 6 }}>
          <span
            className="font-mono-data"
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: COLORS.accentBlue,
              background: `${COLORS.accentBlue}15`,
              border: `1px solid ${COLORS.accentBlue}25`,
              borderRadius: 3,
              padding: '1px 5px',
              lineHeight: '14px',
            }}
          >
            AC
          </span>
          <span
            className="font-mono-data"
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: acOn ? COLORS.accentBlue : COLORS.textDim,
              flex: 1,
            }}
          >
            2.4kW
          </span>
          <MiniToggle
            isOn={acOn}
            color={COLORS.accentBlue}
            onToggle={() => onB2HToggle('ac', !acOn)}
          />
        </div>

        {/* DC */}
        <div className="flex items-center" style={{ gap: 6 }}>
          <span
            className="font-mono-data"
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: COLORS.accentGreen,
              background: `${COLORS.accentGreen}15`,
              border: `1px solid ${COLORS.accentGreen}25`,
              borderRadius: 3,
              padding: '1px 5px',
              lineHeight: '14px',
            }}
          >
            DC
          </span>
          <span
            className="font-mono-data"
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: dcOn ? COLORS.accentGreen : COLORS.textDim,
              flex: 1,
            }}
          >
            3.8kW
          </span>
          <MiniToggle
            isOn={dcOn}
            color={COLORS.accentGreen}
            onToggle={() => onB2HToggle('dc', !dcOn)}
          />
        </div>
      </div>

      {/* 요약 행 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: COLORS.accentOrange }} />
          <span style={{ fontSize: 10, color: COLORS.textDim }}>B2H 소모</span>
          <span
            className="font-mono-data"
            style={{ fontSize: 11, fontWeight: 700, color: COLORS.accentOrange, transition: 'color 0.15s ease' }}
          >
            {totalB2HConsumed.toFixed(1)}kWh
          </span>
        </div>
        <div className="flex items-center gap-1">
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: COLORS.accentRed }} />
          <span style={{ fontSize: 10, color: COLORS.textDim }}>거리 영향</span>
          <span
            className="font-mono-data"
            style={{ fontSize: 11, fontWeight: 700, color: COLORS.accentRed, transition: 'color 0.15s ease' }}
          >
            -{rangeReduction}km
          </span>
        </div>
      </div>
    </div>
  );
}
