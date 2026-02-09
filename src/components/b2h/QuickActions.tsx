'use client';

import React from 'react';
import { Settings, MapPin, Calendar, Power } from 'lucide-react';
import { COLORS } from '@/constants/config';

interface QuickActionsProps {
  onEmergencyStop: () => void;
  onNavigate: (action: string) => void;
}

interface ActionButton { id: string; label: string; icon: React.ReactNode; color: string; isDestructive?: boolean; }

export default function QuickActions({ onEmergencyStop, onNavigate }: QuickActionsProps) {
  const actions: ActionButton[] = [
    { id: 'limit', label: '사용한도 설정', icon: <Settings size={22} strokeWidth={2} />, color: COLORS.accentBlue },
    { id: 'charging-search', label: '충전소 검색', icon: <MapPin size={22} strokeWidth={2} />, color: COLORS.accentBlue },
    { id: 'planner', label: '여정 플래너', icon: <Calendar size={22} strokeWidth={2} />, color: COLORS.accentBlue },
    { id: 'stop', label: '전체 차단', icon: <Power size={22} strokeWidth={2} />, color: COLORS.accentRed, isDestructive: true },
  ];

  const handleClick = (action: ActionButton) => {
    if (action.isDestructive) { onEmergencyStop(); } else { onNavigate(action.id); }
  };

  return (
    <div className="grid grid-cols-2" style={{ margin: '0 12px', gap: 10 }}>
      {actions.map((action) => (
        <button key={action.id} type="button" onClick={() => handleClick(action)}
          className="ivi-quick-action flex items-center gap-3 rounded-lg cursor-pointer" aria-label={action.label}
          style={{
            padding: 14, background: COLORS.card,
            border: `1px solid ${action.isDestructive ? `${COLORS.accentRed}4D` : COLORS.border}`,
            outline: 'none', transition: 'background 0.15s ease, border-color 0.15s ease, transform 0.12s ease',
            WebkitTapHighlightColor: 'transparent', minHeight: 48,
          }}
        >
          <span style={{ color: action.color, flexShrink: 0 }}>{action.icon}</span>
          <span style={{ fontSize: 17, fontWeight: 500, color: action.isDestructive ? COLORS.accentRed : COLORS.textSecondary, lineHeight: 1, whiteSpace: 'nowrap' }}>
            {action.label}
          </span>
        </button>
      ))}
    </div>
  );
}
