'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { COLORS } from '@/constants/config';

interface UsageAlertProps {
  remainingTime: string;
  estimatedDepletionTime: string;
  visible: boolean;
}

export default function UsageAlert({ remainingTime, estimatedDepletionTime, visible }: UsageAlertProps) {
  return (
    <div className="usage-alert-wrapper" style={{ display: 'grid', gridTemplateRows: visible ? '1fr' : '0fr', transition: 'grid-template-rows 0.2s ease-out', margin: '0 12px' }}>
      <div style={{ overflow: 'hidden' }}>
        <div role="alert" aria-live="polite" className="flex items-center gap-3 rounded-lg"
          style={{
            padding: '12px 16px', marginTop: 8,
            background: `${COLORS.accentOrange}1A`, border: `1px solid ${COLORS.accentOrange}33`,
            opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(-6px)',
            transition: visible ? 'opacity 0.2s ease-out 0.05s, transform 0.2s ease-out 0.05s' : 'opacity 0.15s ease-in, transform 0.15s ease-in',
          }}
        >
          <div className="flex items-center justify-center" style={{ width: 36, height: 36, borderRadius: 9, background: `${COLORS.accentOrange}26`, flexShrink: 0 }}>
            <AlertTriangle size={20} color={COLORS.accentOrange} strokeWidth={2} />
          </div>
          <div className="flex flex-col gap-0.5" style={{ minWidth: 0 }}>
            <span style={{ fontSize: 16, fontWeight: 600, color: COLORS.textPrimary, lineHeight: 1.3 }}>
              현재 소비율 기준 B2H 가용시간{' '}
              <span className="font-mono-data" style={{ color: COLORS.accentOrange, fontWeight: 700 }}>{remainingTime}</span>
            </span>
            <span style={{ fontSize: 15, color: COLORS.textSecondary, lineHeight: 1.3 }}>
              귀환 Reserve 25% 도달 예상:{' '}
              <span className="font-mono-data" style={{ color: COLORS.accentOrange, fontWeight: 600 }}>{estimatedDepletionTime}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
