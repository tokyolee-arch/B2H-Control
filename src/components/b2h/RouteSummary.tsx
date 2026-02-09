'use client';

import React from 'react';
import type { RouteInfo } from '@/types/charging';
import { COLORS } from '@/constants/config';

interface RouteSummaryProps {
  route: RouteInfo;
}

export default function RouteSummary({ route }: RouteSummaryProps) {
  const isRangeInsufficient = route.currentRange < route.totalDistance;

  const hours = Math.floor(route.estimatedDuration / 60);
  const mins = route.estimatedDuration % 60;

  return (
    <div
      style={{
        margin: '10px 14px 0',
        padding: 16,
        background: COLORS.card,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 14,
      }}
    >
      {/* ── 경로 표시: 타임라인 + 장소 정보 ── */}
      <div className="flex" style={{ gap: 12 }}>
        {/* 좌측 세로 타임라인 */}
        <div
          className="flex flex-col items-center"
          style={{ width: 20, flexShrink: 0, paddingTop: 4 }}
        >
          {/* 출발지: 빈 원 (파란 테두리) */}
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              border: `2px solid ${COLORS.accentBlue}`,
              background: 'transparent',
              flexShrink: 0,
            }}
          />
          {/* 점선 연결 */}
          <div
            style={{
              flex: 1,
              width: 0,
              minHeight: 24,
              margin: '4px 0',
              borderLeft: `2px dashed ${COLORS.textDim}`,
            }}
          />
          {/* 도착지: 채워진 원 (초록) */}
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: COLORS.accentGreen,
              flexShrink: 0,
            }}
          />
        </div>

        {/* 우측 장소 정보 */}
        <div className="flex flex-col" style={{ flex: 1 }}>
          {/* 출발지 */}
          <div>
            <span
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: COLORS.textPrimary,
                display: 'block',
                lineHeight: 1.3,
              }}
            >
              {route.origin.name}
            </span>
            <span
              style={{
                fontSize: 11,
                color: COLORS.textDim,
                display: 'block',
                marginTop: 2,
                lineHeight: 1.3,
              }}
            >
              {route.origin.address}
            </span>
          </div>

          {/* 간격 */}
          <div style={{ height: 12 }} />

          {/* 도착지 */}
          <div>
            <span
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: COLORS.textPrimary,
                display: 'block',
                lineHeight: 1.3,
              }}
            >
              {route.destination.name}
            </span>
            <span
              style={{
                fontSize: 11,
                color: COLORS.textDim,
                display: 'block',
                marginTop: 2,
                lineHeight: 1.3,
              }}
            >
              {route.destination.address}
            </span>
          </div>
        </div>
      </div>

      {/* ── 구분선 ── */}
      <div
        style={{
          height: 1,
          background: `${COLORS.border}99`,
          margin: '14px 0 12px',
        }}
      />

      {/* ── 하단 3컬럼 정보 ── */}
      <div className="grid grid-cols-3" style={{ textAlign: 'center' }}>
        {/* 총 거리 */}
        <div className="flex flex-col items-center">
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: COLORS.textDim,
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              marginBottom: 5,
            }}
          >
            총 거리
          </span>
          <div className="flex items-baseline justify-center gap-1">
            <span
              className="font-mono-data"
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: COLORS.textPrimary,
                lineHeight: 1,
              }}
            >
              {route.totalDistance}
            </span>
            <span
              style={{
                fontSize: 11,
                color: COLORS.textSecondary,
              }}
            >
              km
            </span>
          </div>
        </div>

        {/* 예상 시간 */}
        <div
          className="flex flex-col items-center"
          style={{
            borderLeft: `1px solid ${COLORS.border}60`,
            borderRight: `1px solid ${COLORS.border}60`,
          }}
        >
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: COLORS.textDim,
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              marginBottom: 5,
            }}
          >
            예상 시간
          </span>
          <div className="flex items-baseline justify-center gap-0.5">
            <span
              className="font-mono-data"
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: COLORS.textPrimary,
                lineHeight: 1,
              }}
            >
              {hours}h {mins.toString().padStart(2, '0')}
            </span>
            <span
              style={{
                fontSize: 11,
                color: COLORS.textSecondary,
              }}
            >
              m
            </span>
          </div>
        </div>

        {/* 현재 주행가능 */}
        <div className="flex flex-col items-center">
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: COLORS.textDim,
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              marginBottom: 5,
            }}
          >
            현재 주행가능
          </span>
          <div className="flex items-baseline justify-center gap-1">
            <span
              className="font-mono-data"
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: isRangeInsufficient
                  ? COLORS.accentOrange
                  : COLORS.accentGreen,
                lineHeight: 1,
              }}
            >
              {route.currentRange}
            </span>
            <span
              style={{
                fontSize: 11,
                color: isRangeInsufficient
                  ? COLORS.accentOrange
                  : COLORS.accentGreen,
                opacity: 0.7,
              }}
            >
              km
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
