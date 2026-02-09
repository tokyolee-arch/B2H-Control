'use client';

import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { CheckCircle, Navigation } from 'lucide-react';
import type { RouteInfo, ChargingStation } from '@/types/charging';
import { COLORS } from '@/constants/config';
import RouteHeader from './RouteHeader';
import RouteSummary from './RouteSummary';
import RangeWarning from './RangeWarning';
import RouteProgressBar from './RouteProgressBar';
import StationCard from './StationCard';

interface ChargingSearchPageProps {
  route: RouteInfo;
  stations: ChargingStation[];
  currentSoc: number;
  onBack: () => void;
  onSelectStation: (stationId: string) => void;
  selectedStationIds: string[];
  onGoToJourneyPlanner?: () => void;
}

/* ── 충전소 정렬: 추천 > 도달가능 > 도달불가, 같은 그룹 내 거리순 ── */
function sortStations(stations: ChargingStation[]): ChargingStation[] {
  return [...stations].sort((a, b) => {
    const rank = (s: ChargingStation) =>
      s.isRecommended ? 2 : s.isReachable ? 1 : 0;
    const diff = rank(b) - rank(a);
    if (diff !== 0) return diff;
    return a.distanceFromOrigin - b.distanceFromOrigin;
  });
}

export default function ChargingSearchPage({
  route,
  stations,
  currentSoc,
  onBack,
  onSelectStation,
  selectedStationIds,
  onGoToJourneyPlanner,
}: ChargingSearchPageProps) {
  const isRangeInsufficient = route.currentRange < route.totalDistance;
  const sortedStations = useMemo(() => sortStations(stations), [stations]);
  const reachableCount = useMemo(
    () => stations.filter((s) => s.isReachable).length,
    [stations],
  );

  const selectedCount = selectedStationIds.length;

  /* ── 토스트 상태 ── */
  const [toast, setToast] = useState<{
    stationName: string;
    stationId: string;
    exiting: boolean;
    action: 'added' | 'removed';
  } | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const handleSelect = useCallback(
    (stationId: string) => {
      const station = stations.find((s) => s.id === stationId);
      if (!station) return;

      // 이전 타이머 정리
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);

      const isAlreadySelected = selectedStationIds.includes(stationId);
      const action = isAlreadySelected ? 'removed' : 'added';

      // 부모에 토글 전달
      onSelectStation(stationId);

      // 토스트 표시
      setToast({ stationName: station.name, stationId, exiting: false, action });

      // 3초 후 토스트 퇴장
      toastTimerRef.current = setTimeout(() => {
        setToast((prev) => (prev ? { ...prev, exiting: true } : null));
        toastTimerRef.current = setTimeout(() => {
          setToast(null);
        }, 300);
      }, 2500);
    },
    [stations, onSelectStation, selectedStationIds],
  );

  return (
    <div
      className="flex flex-col"
      style={{
        width: '100%',
        height: '100%',
        background: COLORS.primary,
        position: 'relative',
      }}
    >
      {/* ══════ 고정 상단 영역 ══════ */}
      <div style={{ flexShrink: 0 }}>
        <div className="cs-section-enter cs-stagger-0">
          <RouteHeader onBack={onBack} />
        </div>
        <div className="cs-section-enter cs-stagger-1">
          <RouteSummary route={route} />
        </div>
        <div className="cs-section-enter cs-stagger-2">
          <RangeWarning
            currentRange={route.currentRange}
            totalDistance={route.totalDistance}
            visible={isRangeInsufficient}
          />
        </div>
        <div className="cs-section-enter cs-stagger-3">
          <RouteProgressBar
            route={route}
            currentSoc={currentSoc}
            reserveSoc={25}
          />
        </div>
      </div>

      {/* ══════ 섹션 타이틀 ══════ */}
      <div
        className="cs-section-enter cs-stagger-4 flex items-center justify-between"
        style={{ flexShrink: 0, padding: '6px 18px 8px' }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: COLORS.textDim,
            letterSpacing: '1px',
            textTransform: 'uppercase',
          }}
        >
          경로 내 충전소
        </span>
        <div className="flex items-center gap-2">
          {selectedCount > 0 && (
            <span
              className="font-mono-data"
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: COLORS.accentGreen,
                background: `${COLORS.accentGreen}15`,
                border: `1px solid ${COLORS.accentGreen}30`,
                borderRadius: 10,
                padding: '1px 8px',
              }}
            >
              {selectedCount}개 선택
            </span>
          )}
          <span
            className="font-mono-data"
            style={{ fontSize: 11, fontWeight: 700, color: COLORS.accentBlue }}
          >
            {reachableCount}개
          </span>
        </div>
      </div>

      {/* ══════ 스크롤 가능 충전소 리스트 ══════ */}
      <div
        className="cs-section-enter cs-stagger-5"
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            paddingBottom: selectedCount > 0 ? 80 : 14,
          }}
        >
          {sortedStations.map((station) => (
            <StationCard
              key={station.id}
              station={station}
              onSelect={handleSelect}
              isSelected={selectedStationIds.includes(station.id)}
            />
          ))}
        </div>
      </div>

      {/* ══════ 여정 플래너로 이동 플로팅 버튼 ══════ */}
      {selectedCount > 0 && onGoToJourneyPlanner && (
        <div
          style={{
            position: 'absolute',
            bottom: 16,
            left: 14,
            right: 14,
            zIndex: 25,
            animation: 'fadeInUp 0.3s ease-out',
          }}
        >
          <button
            type="button"
            onClick={onGoToJourneyPlanner}
            className="flex items-center justify-center gap-2"
            style={{
              width: '100%',
              padding: '13px 16px',
              background: `linear-gradient(135deg, ${COLORS.accentBlue}, #1a5fd4)`,
              border: 'none',
              borderRadius: 12,
              cursor: 'pointer',
              outline: 'none',
              boxShadow: `0 4px 20px rgba(59,139,255,0.4)`,
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <Navigation size={16} color="#fff" strokeWidth={2.5} />
            <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>
              여정 플래너로 이동
            </span>
            <span
              className="font-mono-data"
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: 'rgba(255,255,255,0.7)',
                marginLeft: 4,
              }}
            >
              ({selectedCount}개 충전소)
            </span>
          </button>
        </div>
      )}

      {/* ══════ 토스트 알림 ══════ */}
      {toast && (
        <div
          className={toast.exiting ? 'toast-exit' : 'toast-enter'}
          style={{
            position: 'absolute',
            bottom: selectedCount > 0 ? 80 : 20,
            left: 14,
            right: 14,
            zIndex: 20,
            padding: '12px 16px',
            background: toast.action === 'added'
              ? 'rgba(59,139,255,0.12)'
              : 'rgba(255,159,67,0.12)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: `1px solid ${toast.action === 'added' ? 'rgba(59,139,255,0.25)' : 'rgba(255,159,67,0.25)'}`,
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <CheckCircle
            size={18}
            color={toast.action === 'added' ? COLORS.accentGreen : COLORS.accentOrange}
            strokeWidth={2}
            style={{ flexShrink: 0 }}
          />
          <span
            style={{
              fontSize: 12,
              color: COLORS.textPrimary,
              lineHeight: 1.4,
            }}
          >
            <span style={{ fontWeight: 700 }}>{toast.stationName}</span>
            {toast.action === 'added'
              ? ' 경유지로 추가되었습니다'
              : ' 경유지에서 해제되었습니다'}
          </span>
        </div>
      )}
    </div>
  );
}
