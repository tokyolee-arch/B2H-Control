'use client';

import React from 'react';
import { TerminalState, TerminalType, PowerDataPoint } from '@/types/b2h';
import { COLORS } from '@/constants/config';
import PowerGraph from './PowerGraph';

interface TerminalCardProps {
  terminal: TerminalState;
  powerHistory: PowerDataPoint[];
  onToggle: (type: TerminalType) => void;
  color: string;
  compact?: boolean;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m.toString().padStart(2, '0')}m`;
  return `${m}m`;
}

function ToggleSwitch({ isOn, color, onToggle, label }: { isOn: boolean; color: string; onToggle: () => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={isOn} aria-label={label} onClick={onToggle}
      className="relative flex items-center cursor-pointer"
      style={{ width: 56, height: 30, borderRadius: 15, background: isOn ? color : '#1a2230', border: `1px solid ${isOn ? color : '#2a3a4e'}`, padding: 3, transition: 'background 0.3s ease, border-color 0.3s ease', minWidth: 56, minHeight: 44, display: 'flex', alignItems: 'center', outline: 'none', WebkitTapHighlightColor: 'transparent' }}
    >
      <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.3)', transform: isOn ? 'translateX(26px) scale(1.05)' : 'translateX(0px) scale(1)', transition: 'transform 0.35s cubic-bezier(0.68, -0.2, 0.27, 1.2)' }} />
    </button>
  );
}

export default function TerminalCard({ terminal, powerHistory, onToggle, color, compact = false }: TerminalCardProps) {
  const { type, isOn, currentPower, maxPower, cumulativeEnergy, usageDuration, voltage, frequency } = terminal;
  const isAC = type === 'ac';
  const label = isAC ? 'AC 출력' : 'DC 출력';
  const specParts: string[] = [`${voltage}V`, ...(isAC && frequency ? [`${frequency}Hz`] : []), `Max ${maxPower}kW`];
  const specLine = specParts.join(' · ');

  return (
    <div className="rounded-xl overflow-hidden" style={{ margin: '0 12px', background: COLORS.card, border: `1px solid ${isOn ? `${color}4D` : COLORS.border}`, transition: 'border-color 0.3s ease' }}>
      <div className="flex items-center justify-between" style={{ padding: '16px 18px' }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center" style={{ width: 44, height: 44, borderRadius: 11, background: `${color}${isAC ? '26' : '1F'}`, border: `1px solid ${color}33`, flexShrink: 0 }}>
            <span className="font-mono-data" style={{ fontSize: 16, fontWeight: 700, color: color, letterSpacing: '0.02em' }}>{isAC ? 'AC' : 'DC'}</span>
          </div>
          <div className="flex flex-col">
            <span style={{ fontSize: 19, fontWeight: 600, color: COLORS.textPrimary, lineHeight: 1.2 }}>{label}</span>
            <span className="font-mono-data" style={{ fontSize: 14, color: COLORS.textDim, marginTop: 3, lineHeight: 1 }}>{specLine}</span>
          </div>
        </div>
        <ToggleSwitch isOn={isOn} color={color} onToggle={() => onToggle(type)} label={`${label} 전원 ${isOn ? '켜짐' : '꺼짐'}`} />
      </div>

      <div className="terminal-expand-grid" style={{ display: 'grid', gridTemplateRows: isOn ? '1fr' : '0fr', transition: 'grid-template-rows 0.3s ease-out' }}>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ opacity: isOn ? 1 : 0, transition: isOn ? 'opacity 0.2s ease-out 0.1s' : 'opacity 0.15s ease-in', padding: '0 18px 16px' }}>
            <div className="flex items-center justify-end gap-5" style={{ paddingTop: 10, paddingBottom: 10, borderTop: `1px solid ${COLORS.border}` }}>
              <div className="flex items-baseline gap-1">
                <span style={{ fontSize: 14, color: COLORS.textDim }}>누적</span>
                <span className="font-mono-data ivi-number-transition" style={{ fontSize: 18, fontWeight: 600, color: COLORS.textSecondary }}>{cumulativeEnergy.toFixed(1)}</span>
                <span className="font-mono-data" style={{ fontSize: 14, color: COLORS.textDim }}>kWh</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span style={{ fontSize: 14, color: COLORS.textDim }}>사용</span>
                <span className="font-mono-data ivi-number-transition" style={{ fontSize: 18, fontWeight: 600, color: COLORS.textSecondary }}>{formatDuration(usageDuration)}</span>
              </div>
            </div>
            <div style={{ margin: '0 -18px' }}>
              <PowerGraph data={powerHistory} color={color} maxPower={maxPower} currentPower={currentPower} compact={compact} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
