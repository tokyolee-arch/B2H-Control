'use client';

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Play, CheckCircle } from 'lucide-react';
import type { ChargingStation } from '@/types/charging';
import type { JourneyPlan } from '@/types/journey';
import { COLORS } from '@/constants/config';
import { useJourneyCalculation } from '@/hooks/useJourneyCalculation';
import JourneyHeader from './JourneyHeader';
import JourneyTimeline from './JourneyTimeline';
import JourneyChargeCard from './JourneyChargeCard';
import JourneyB2HImpact from './JourneyB2HImpact';
import JourneySummary from './JourneySummary';

/* ═══════════════════════════════════════════
   메인 컴포넌트
   ═══════════════════════════════════════════ */
interface JourneyPlannerPageProps {
  plan: JourneyPlan;
  selectedStations: ChargingStation[];
  acOn?: boolean;
  dcOn?: boolean;
  onBack: () => void;
  onStart: () => void;
  onB2HChange?: (acOn: boolean, dcOn: boolean) => void;
}

export default function JourneyPlannerPage({
  plan,
  selectedStations,
  acOn: initialAcOn = true,
  dcOn: initialDcOn = true,
  onBack,
  onStart,
  onB2HChange,
}: JourneyPlannerPageProps) {
  const [toast, setToast] = useState<{ exiting: boolean } | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── 여정 계산 훅 ── */
  const {
    journey,
    segmentHeights,
    detailMarginTop,
    updateTargetSoc,
    updateB2HState,
    targetSocs,
    b2hState,
    chargeStopResults,
    globals,
    chargingDurations,
  } = useJourneyCalculation(plan, selectedStations, {
    acOn: initialAcOn,
    dcOn: initialDcOn,
  });

  /* ── 외부 AC/DC 변경 동기화 (메인→여정) ── */
  useEffect(() => {
    updateB2HState(initialAcOn, initialDcOn, b2hState.acPower, b2hState.dcPower);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialAcOn, initialDcOn]);

  /* ── 충전 경유지 목록 ── */
  const chargingWaypoints = useMemo(
    () => journey.waypoints.filter((wp) => wp.type === 'charging'),
    [journey.waypoints],
  );

  const destination = useMemo(
    () => journey.waypoints.find((wp) => wp.type === 'destination'),
    [journey.waypoints],
  );

  /* ── B2H 토글 핸들러 (여정→메인 양방향 동기화) ── */
  const handleB2HToggle = useCallback(
    (type: 'ac' | 'dc', isOn: boolean) => {
      const newAc = type === 'ac' ? isOn : b2hState.acOn;
      const newDc = type === 'dc' ? isOn : b2hState.dcOn;
      updateB2HState(newAc, newDc, b2hState.acPower, b2hState.dcPower);
      onB2HChange?.(newAc, newDc);
    },
    [b2hState, updateB2HState, onB2HChange],
  );

  /* ── 토스트 & 시작 ── */
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const handleStart = useCallback(() => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ exiting: false });
    toastTimerRef.current = setTimeout(() => {
      setToast((prev) => (prev ? { ...prev, exiting: true } : null));
      toastTimerRef.current = setTimeout(() => {
        setToast(null);
        onStart();
      }, 1300);
    }, 3000);
  }, [onStart]);

  return (
    <div
      className="flex flex-col"
      style={{ width: '100%', height: '100%', background: COLORS.primary, position: 'relative' }}
    >
      {/* ══════ 헤더 (56px 고정) ══════ */}
      <div className="cs-section-enter cs-stagger-0" style={{ flexShrink: 0 }}>
        <JourneyHeader
          onBack={onBack}
          totalDuration={globals.totalDuration}
          stationCount={selectedStations.length}
        />
      </div>

      {/* ══════ 스크롤 가능 본문 ══════ */}
      <div
        className="cs-section-enter cs-stagger-1"
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <div style={{ padding: '12px 0 0 0' }}>
          {chargingWaypoints.length === 0 ? (
            /* ── 충전소 미선택 안내 ── */
            <div
              className="flex flex-col items-center justify-center"
              style={{
                padding: '60px 24px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: `${COLORS.accentOrange}12`,
                  border: `2px solid ${COLORS.accentOrange}30`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                }}
              >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                  <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke={COLORS.accentOrange} strokeWidth="2" strokeLinejoin="round" fill="none" />
                </svg>
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: COLORS.textPrimary, marginBottom: 8 }}>
                충전소를 선택해 주세요
              </span>
              <span style={{ fontSize: 11, color: COLORS.textDim, lineHeight: 1.5 }}>
                충전소 검색에서 경유할 충전소를 선택하면
                <br />
                여정 계획이 자동으로 생성됩니다
              </span>
            </div>
          ) : (
            /* ── 2열 레이아웃: 타임라인(180px) + 카드 ── */
            <div className="flex" style={{ gap: 0, paddingLeft: 6 }}>
              {/* 좌측 타임라인 */}
              <JourneyTimeline plan={journey} chargingDurations={chargingDurations} segmentHeights={segmentHeights} />

              {/* 우측 detail-col */}
              <div
                className="flex flex-col"
                style={{
                  flex: 1,
                  gap: 8,
                  marginLeft: 8,
                  paddingRight: 14,
                  marginTop: detailMarginTop,
                }}
              >
                {/* ── 충전 계획 카드(들) ── */}
                {chargingWaypoints.map((wp, i) => {
                  const c = chargeStopResults[wp.id];
                  if (!c) return null;
                  const targetSoc = targetSocs[wp.id] ?? wp.departureSoc ?? 80;

                  return (
                    <div key={wp.id} className={`cs-section-enter cs-stagger-${i + 2}`}>
                      <JourneyChargeCard
                        waypoint={wp}
                        chargingSegment={c.chargingSegment}
                        nextDrivingSegment={c.nextDrivingSegment}
                        totalCapacity={80}
                        pricePerKwh={wp.stationInfo?.pricePerKwh ?? 350}
                        minTargetSoc={c.minTargetSoc}
                        currentTargetSoc={targetSoc}
                        onTargetSocChange={(soc) => updateTargetSoc(wp.id, soc)}
                        finalArrivalSoc={c.finalArrivalSoc}
                        chargingDuration={c.chargingDuration}
                        chargingCost={c.chargingCost}
                        destinationName={destination?.name}
                      />
                    </div>
                  );
                })}

                {/* ── B2H 전력 영향 ── */}
                <div className={`cs-section-enter cs-stagger-${chargingWaypoints.length + 2}`}>
                  <JourneyB2HImpact
                    acOn={b2hState.acOn}
                    dcOn={b2hState.dcOn}
                    totalB2HConsumed={globals.totalB2HConsumed}
                    rangeReduction={globals.rangeReduction}
                    onB2HToggle={handleB2HToggle}
                  />
                </div>

                {/* ── 여정 요약 ── */}
                <div className={`cs-section-enter cs-stagger-${chargingWaypoints.length + 3}`}>
                  <JourneySummary
                    totalDistance={journey.totalDistance}
                    totalDrivingDuration={globals.totalDrivingDuration}
                    totalChargingDuration={globals.totalChargingDuration}
                    totalChargingCost={globals.totalChargingCost}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ══════ 하단 고정: 도착 시각 (72px) ══════ */}
      <div
        className="cs-section-enter cs-stagger-5"
        style={{
          flexShrink: 0,
          margin: '0 14px',
          padding: '14px 18px',
          background: 'linear-gradient(135deg, rgba(0,214,143,0.06), rgba(59,139,255,0.04))',
          border: '1px solid rgba(0,214,143,0.2)',
          borderRadius: 14,
        }}
      >
        <div className="flex items-center justify-between">
          {/* 좌측: 도착 정보 */}
          <div className="flex flex-col" style={{ minWidth: 0 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: COLORS.textPrimary, lineHeight: 1.3 }}>
              {destination?.address
                ? destination.address.split(' ').slice(0, 3).join(' ')
                : destination?.name ?? ''}{' '}
              도착
            </span>
            <span style={{ fontSize: 10, color: COLORS.textDim, marginTop: 2 }}>
              충전 {globals.totalChargingDuration}분 포함 · 잔여 SOC {globals.finalArrivalSoc}%
            </span>
          </div>

          {/* 우측: 도착 시각 */}
          <div className="flex flex-col items-end" style={{ flexShrink: 0 }}>
            <span
              className="font-mono-data"
              style={{
                fontSize: 42,
                fontWeight: 800,
                color: COLORS.accentGreen,
                lineHeight: 1,
                letterSpacing: -2,
                transition: 'color 0.15s ease',
              }}
            >
              {globals.finalArrivalTime}
            </span>
            <span style={{ fontSize: 10, color: COLORS.textSecondary, marginTop: 2 }}>
              예상 도착
            </span>
          </div>
        </div>
      </div>

      {/* ══════ 시작 버튼 (50px) ══════ */}
      <div className="cs-section-enter cs-stagger-6" style={{ flexShrink: 0, padding: '8px 14px 14px' }}>
        <button
          type="button"
          onClick={handleStart}
          className="ivi-touch-target journey-start-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            width: '100%',
            padding: '13px 0',
            background: `linear-gradient(135deg, ${COLORS.accentBlue}, #1a5fd4)`,
            border: 'none',
            borderRadius: 12,
            cursor: 'pointer',
            outline: 'none',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: `0 4px 20px rgba(59,139,255,0.3)`,
          }}
        >
          <Play size={16} color="#fff" strokeWidth={2.5} fill="#fff" />
          <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>
            여정 시작
          </span>
        </button>
      </div>

      {/* ══════ 토스트 알림 ══════ */}
      {toast && (
        <div
          className={toast.exiting ? 'toast-exit' : 'toast-enter'}
          style={{
            position: 'absolute',
            bottom: 80,
            left: 14,
            right: 14,
            zIndex: 20,
            padding: '12px 16px',
            background: 'rgba(59,139,255,0.12)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid rgba(59,139,255,0.25)',
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <CheckCircle size={18} color={COLORS.accentGreen} strokeWidth={2} style={{ flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: COLORS.textPrimary, lineHeight: 1.4 }}>
            <span style={{ fontWeight: 700 }}>여정이 시작</span>되었습니다
          </span>
        </div>
      )}
    </div>
  );
}
