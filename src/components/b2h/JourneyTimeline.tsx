'use client';

import React, { useMemo } from 'react';
import type { JourneyPlan, JourneyWaypoint, JourneySegment } from '@/types/journey';
import type { SegmentHeightInfo } from '@/hooks/useJourneyCalculation';
import { COLORS } from '@/constants/config';

interface JourneyTimelineProps {
  plan: JourneyPlan;
  chargingDurations?: Record<string, number>;
  segmentHeights: SegmentHeightInfo;
}

function formatDuration(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m.toString().padStart(2, '0')}m` : `${m}min`;
}

/* ── 노드 높이 상수 ── */
const ORIGIN_NODE_H = 42;
const CHARGE_NODE_H = 36;
const CHARGE_BAR_BASE_H = 50;
const CHARGE_PX_PER_MIN = 2.2;
const DEPART_NODE_H = 24;
const DEST_NODE_H = 42;

/** 타임라인 노드를 렌더링하는 헬퍼 */
function WaypointNode({ wp, height }: { wp: JourneyWaypoint; height?: number }) {
  if (wp.type === 'origin') {
    return (
      <div className="flex items-start gap-3" style={{ paddingLeft: 10, height, flexShrink: 0 }}>
        <div className="flex flex-col items-center" style={{ width: 18, flexShrink: 0 }}>
          <div
            className="timeline-node-pulse"
            style={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: COLORS.accentBlue,
              boxShadow: `0 0 10px ${COLORS.accentBlue}60`,
            }}
          />
        </div>
        <div className="flex flex-col" style={{ minWidth: 0 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.textPrimary, lineHeight: 1.2 }}>
            {wp.name}
          </span>
          <span className="font-mono-data" style={{ fontSize: 12, fontWeight: 600, color: COLORS.accentBlue, marginTop: 2 }}>
            {wp.departureTime ?? wp.arrivalTime}
          </span>
        </div>
      </div>
    );
  }

  if (wp.type === 'charging') {
    return (
      <div className="flex items-start gap-3" style={{ paddingLeft: 10, height, flexShrink: 0 }}>
        <div className="flex flex-col items-center" style={{ width: 18, flexShrink: 0 }}>
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: '50%',
              background: `${COLORS.accentOrange}20`,
              border: `2px solid ${COLORS.accentOrange}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="9" height="9" viewBox="0 0 8 8" fill="none">
              <path d="M4.5 0.5L1.5 4.5H3.5L3 7.5L6.5 3.5H4.5L4.5 0.5Z" fill={COLORS.accentOrange} />
            </svg>
          </div>
        </div>
        <div className="flex flex-col" style={{ minWidth: 0 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: COLORS.accentOrange, lineHeight: 1.2 }}>
            {wp.name}
          </span>
          <span className="font-mono-data" style={{ fontSize: 11, fontWeight: 600, color: COLORS.textSecondary, marginTop: 2 }}>
            {wp.arrivalTime}
          </span>
        </div>
      </div>
    );
  }

  // destination
  return (
    <div className="flex items-start gap-3" style={{ paddingLeft: 10, height, flexShrink: 0 }}>
      <div className="flex flex-col items-center" style={{ width: 18, flexShrink: 0 }}>
        <div
          className="timeline-node-pulse"
          style={{
            width: 14,
            height: 14,
            borderRadius: '50%',
            background: COLORS.accentGreen,
            boxShadow: `0 0 10px ${COLORS.accentGreen}60`,
          }}
        />
      </div>
      <div className="flex flex-col" style={{ minWidth: 0 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.textPrimary, lineHeight: 1.2 }}>
          {wp.name}
        </span>
        <span className="font-mono-data" style={{ fontSize: 12, fontWeight: 600, color: COLORS.accentGreen, marginTop: 2 }}>
          {wp.arrivalTime}
        </span>
      </div>
    </div>
  );
}

/** 주행/충전 구간 세로 바 */
function SegmentBar({ seg, height, displayDuration }: { seg: JourneySegment; height: number; displayDuration?: number }) {
  const isCharging = seg.type === 'charging';
  const lineColor = isCharging ? COLORS.accentOrange : COLORS.accentBlue;
  const lineWidth = isCharging ? 4 : 3;
  const dur = displayDuration ?? seg.duration;

  return (
    <div className="flex items-stretch" style={{ paddingLeft: 10, height, flexShrink: 0 }}>
      <div className="flex flex-col items-center" style={{ width: 18, flexShrink: 0 }}>
        <div
          style={{
            flex: 1,
            width: lineWidth,
            background: `${lineColor}40`,
            minHeight: 8,
            borderRadius: lineWidth / 2,
          }}
        />
      </div>
      <div className="flex flex-col justify-center" style={{ paddingLeft: 8 }}>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: isCharging ? COLORS.accentOrange : COLORS.textDim,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          {seg.label}
        </span>
        <span
          className="font-mono-data"
          style={{ fontSize: 12, fontWeight: 600, color: COLORS.textSecondary, marginTop: 2 }}
        >
          {formatDuration(dur)}
        </span>
        {seg.distance != null && (
          <span className="font-mono-data" style={{ fontSize: 11, color: COLORS.textDim, marginTop: 1 }}>
            {seg.distance}km
          </span>
        )}
      </div>
    </div>
  );
}

export default function JourneyTimeline({ plan, chargingDurations, segmentHeights }: JourneyTimelineProps) {
  const timelineItems = useMemo(() => {
    const items: React.ReactNode[] = [];
    const wps = plan.waypoints;
    const segs = plan.segments;

    for (let i = 0; i < wps.length; i++) {
      const wp = wps[i];

      // 노드 높이
      let nodeH: number | undefined;
      if (wp.type === 'origin') nodeH = ORIGIN_NODE_H;
      else if (wp.type === 'charging') nodeH = CHARGE_NODE_H;
      else if (wp.type === 'destination') nodeH = DEST_NODE_H;

      items.push(<WaypointNode key={`wp-${wp.id}`} wp={wp} height={nodeH} />);

      // 충전 경유지: 충전 바 → 출발 마커
      if (wp.type === 'charging') {
        const chargeSeg = segs.find((s) => s.type === 'charging' && s.fromId === wp.id);
        if (chargeSeg) {
          const displayDur = chargingDurations?.[wp.id] ?? chargeSeg.duration;
          const barH = Math.max(
            CHARGE_BAR_BASE_H,
            CHARGE_BAR_BASE_H + (displayDur - 10) * CHARGE_PX_PER_MIN,
          );
          items.push(
            <SegmentBar
              key={`seg-charge-${wp.id}`}
              seg={chargeSeg}
              height={barH}
              displayDuration={displayDur}
            />,
          );
        }
        if (wp.departureTime) {
          items.push(
            <div key={`depart-${wp.id}`} className="flex items-start gap-3" style={{ paddingLeft: 10, height: DEPART_NODE_H, flexShrink: 0 }}>
              <div className="flex flex-col items-center" style={{ width: 18, flexShrink: 0 }}>
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    background: 'transparent',
                    border: `2px solid ${COLORS.accentGreen}`,
                  }}
                />
              </div>
              <div className="flex flex-col">
                <span className="font-mono-data" style={{ fontSize: 11, fontWeight: 600, color: COLORS.accentGreen }}>
                  {wp.departureTime}
                </span>
              </div>
            </div>,
          );
        }
      }

      // 다음 waypoint까지의 주행 구간
      if (i < wps.length - 1) {
        const nextWp = wps[i + 1];
        const driveSeg = segs.find(
          (s) => s.type === 'driving' && s.fromId === wp.id && s.toId === nextWp.id,
        );
        if (driveSeg) {
          const dsIdx = segs.indexOf(driveSeg);
          const barH = segmentHeights.heights[dsIdx] ?? 150;
          items.push(
            <SegmentBar key={`seg-drive-${wp.id}-${nextWp.id}`} seg={driveSeg} height={barH} />,
          );
        }
      }
    }

    return items;
  }, [plan, chargingDurations, segmentHeights]);

  return (
    <div
      className="flex flex-col"
      style={{ width: 180, flexShrink: 0, position: 'relative' }}
    >
      {timelineItems}
    </div>
  );
}
