'use client';

import React, { useState, useCallback, useRef } from 'react';
import { X, Battery, CheckCircle } from 'lucide-react';
import { COLORS, BATTERY_SPEC } from '@/constants/config';
import type { BatteryState } from '@/types/b2h';

interface UsageLimitPopupProps {
  batteryState: BatteryState;
  onClose: () => void;
  onSave: (limitKwh: number) => void;
}

export default function UsageLimitPopup({
  batteryState,
  onClose,
  onSave,
}: UsageLimitPopupProps) {
  const totalCapacity = BATTERY_SPEC.totalCapacity; // 80
  const reservePercent = BATTERY_SPEC.reservePercent; // 25
  const currentSoc = batteryState.soc;

  /* ── 슬라이더: Reserve(25%) ~ 현재SOC 범위에서 사용한도 조절 ── */
  const [limitPercent, setLimitPercent] = useState(currentSoc - reservePercent);
  const trackRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const reserveKwh = Math.round((reservePercent / 100) * totalCapacity * 10) / 10;
  const currentKwh = Math.round((currentSoc / 100) * totalCapacity * 10) / 10;
  const limitKwh = Math.round((limitPercent / 100) * totalCapacity * 10) / 10;

  /* ── 슬라이더 포인터 ── */
  const updateFromPointer = useCallback(
    (clientX: number) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      // ratio maps to 0% ~ 100% of SOC range
      const rawSoc = Math.round(ratio * 100);
      // clamp between 0 and (currentSoc - reservePercent)
      const maxLimit = currentSoc - reservePercent;
      const clamped = Math.max(0, Math.min(maxLimit, rawSoc));
      setLimitPercent(clamped);
    },
    [currentSoc, reservePercent],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      draggingRef.current = true;
      trackRef.current?.setPointerCapture(e.pointerId);
      updateFromPointer(e.clientX);
    },
    [updateFromPointer],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!draggingRef.current) return;
      updateFromPointer(e.clientX);
    },
    [updateFromPointer],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      trackRef.current?.releasePointerCapture(e.pointerId);
    },
    [],
  );

  const handleSave = useCallback(() => {
    onSave(limitKwh);
    onClose();
  }, [limitKwh, onSave, onClose]);

  /* ── 슬라이더 위치 계산 ── */
  const reserveLeft = (reservePercent / 100) * 100; // 25%
  const currentLeft = (currentSoc / 100) * 100;     // 72%
  // 사용한도 thumb 위치: reserve + limitPercent
  const thumbLeft = ((reservePercent + limitPercent) / 100) * 100;

  return (
    <>
      {/* 배경 오버레이 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 60,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
        }}
        onClick={onClose}
      />

      {/* 팝업 카드 */}
      <div
        className="shutdown-popup-enter"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 61,
          width: 'calc(100% - 32px)',
          maxWidth: 440,
          background: '#111820',
          border: `1px solid ${COLORS.border}`,
          borderRadius: 20,
          overflow: 'hidden',
        }}
      >
        {/* ── 상단 핸들 ── */}
        <div className="flex justify-center" style={{ paddingTop: 10 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: COLORS.textDim, opacity: 0.4 }} />
        </div>

        {/* ── 헤더 ── */}
        <div className="flex items-center justify-between" style={{ padding: '12px 20px 8px' }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: COLORS.textPrimary }}>
            B2H 사용한도 설정
          </span>
          <button
            type="button"
            onClick={onClose}
            className="ivi-touch-target flex items-center justify-center"
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: COLORS.card,
              border: `1px solid ${COLORS.border}`,
              cursor: 'pointer',
              outline: 'none',
            }}
            aria-label="닫기"
          >
            <X size={18} color={COLORS.textSecondary} strokeWidth={2.2} />
          </button>
        </div>

        {/* ── 현재 배터리 정보 바 ── */}
        <div
          style={{
            margin: '8px 20px',
            padding: '12px 16px',
            background: COLORS.card,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 12,
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="flex items-center justify-center"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: `${COLORS.accentGreen}15`,
                  border: `1px solid ${COLORS.accentGreen}30`,
                }}
              >
                <Battery size={14} color={COLORS.accentGreen} strokeWidth={2} />
              </div>
              <div className="flex flex-col">
                <span style={{ fontSize: 10, color: COLORS.textDim }}>현재 잔량</span>
                <span className="font-mono-data" style={{ fontSize: 13, fontWeight: 700, color: COLORS.accentGreen }}>
                  {currentSoc}% · {currentKwh} kWh
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span style={{ fontSize: 10, color: COLORS.textDim }}>귀환 Reserve</span>
              <span className="font-mono-data" style={{ fontSize: 13, fontWeight: 700, color: COLORS.accentRed }}>
                {reservePercent}% · {reserveKwh} kWh
              </span>
            </div>
          </div>
        </div>

        {/* ── 핵심 수치: B2H 사용한도 ── */}
        <div className="flex flex-col items-center" style={{ padding: '20px 20px 8px' }}>
          <span
            className="font-mono-data"
            style={{
              fontSize: 56,
              fontWeight: 800,
              color: COLORS.accentOrange,
              lineHeight: 1,
              letterSpacing: -2,
            }}
          >
            {limitKwh.toFixed(1)}
            <span style={{ fontSize: 22, fontWeight: 600, color: COLORS.textSecondary, marginLeft: 4 }}>
              kWh
            </span>
          </span>
          <span style={{ fontSize: 13, color: COLORS.textSecondary, marginTop: 8 }}>
            배터리의{' '}
            <span className="font-mono-data" style={{ fontWeight: 700, color: COLORS.accentOrange }}>
              {limitPercent}%
            </span>
            {' '}사용 가능
          </span>
        </div>

        {/* ── 슬라이더 ── */}
        <div style={{ padding: '20px 20px 4px' }}>
          <div
            ref={trackRef}
            style={{
              position: 'relative',
              height: 36,
              cursor: 'pointer',
              touchAction: 'none',
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            {/* 트랙 배경 */}
            <div
              style={{
                position: 'absolute',
                top: 14,
                left: 0,
                right: 0,
                height: 8,
                borderRadius: 4,
                background: '#1a2230',
              }}
            />

            {/* 사용 가능 범위 채움 (reserve ~ thumb) */}
            <div
              style={{
                position: 'absolute',
                top: 14,
                left: `${reserveLeft}%`,
                width: `${thumbLeft - reserveLeft}%`,
                height: 8,
                borderRadius: 4,
                background: `linear-gradient(90deg, ${COLORS.accentOrange}, ${COLORS.accentGreen})`,
                transition: draggingRef.current ? 'none' : 'width 0.1s ease',
              }}
            />

            {/* 현재 SOC 범위 (reserve 이후, 사용 불가 영역 표시) */}
            <div
              style={{
                position: 'absolute',
                top: 14,
                left: `${thumbLeft}%`,
                width: `${currentLeft - thumbLeft}%`,
                height: 8,
                borderRadius: '0 4px 4px 0',
                background: `${COLORS.accentGreen}20`,
              }}
            />

            {/* Reserve 25% 마커 */}
            <div
              style={{
                position: 'absolute',
                left: `${reserveLeft}%`,
                top: 8,
                transform: 'translateX(-50%)',
              }}
            >
              <div style={{ width: 2, height: 20, background: COLORS.accentRed, margin: '0 auto' }} />
            </div>

            {/* Reserve 라벨 */}
            <div
              style={{
                position: 'absolute',
                left: `${reserveLeft}%`,
                top: -4,
                transform: 'translateX(-50%)',
              }}
            >
              <span
                className="font-mono-data"
                style={{
                  fontSize: 8,
                  fontWeight: 700,
                  color: COLORS.accentRed,
                  background: `${COLORS.accentRed}15`,
                  border: `1px solid ${COLORS.accentRed}30`,
                  borderRadius: 4,
                  padding: '1px 5px',
                  whiteSpace: 'nowrap',
                }}
              >
                Reserve {reservePercent}%
              </span>
            </div>

            {/* Thumb */}
            <div
              style={{
                position: 'absolute',
                left: `${thumbLeft}%`,
                top: 6,
                transform: 'translateX(-50%)',
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: '#fff',
                border: `3px solid ${COLORS.accentOrange}`,
                boxShadow: `0 2px 8px rgba(0,0,0,0.3), 0 0 12px ${COLORS.accentOrange}30`,
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS.accentOrange }} />
            </div>
          </div>

          {/* 슬라이더 하단 라벨 */}
          <div className="flex justify-between" style={{ padding: '0 2px', marginTop: 2 }}>
            <span className="font-mono-data" style={{ fontSize: 10, color: COLORS.textDim }}>0%</span>
            <span className="font-mono-data" style={{ fontSize: 10, color: COLORS.accentRed, fontWeight: 600 }}>
              {reservePercent}% Reserve
            </span>
            <span className="font-mono-data" style={{ fontSize: 10, color: COLORS.accentGreen, fontWeight: 600 }}>
              {currentSoc}% 현재
            </span>
            <span className="font-mono-data" style={{ fontSize: 10, color: COLORS.textDim }}>100%</span>
          </div>
        </div>

        {/* ── 계산 상세 ── */}
        <div style={{ padding: '16px 20px 12px' }}>
          <div
            style={{
              background: COLORS.card,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 12,
              padding: '12px 16px',
            }}
          >
            {[
              { label: '현재 잔량', value: `${currentKwh} kWh`, color: COLORS.textPrimary, sign: '' },
              { label: `귀환 Reserve (${reservePercent}%)`, value: `${reserveKwh} kWh`, color: COLORS.accentRed, sign: '−' },
              { label: 'B2H 사용한도', value: `${limitKwh.toFixed(1)} kWh`, color: COLORS.accentOrange, sign: '=', bold: true },
            ].map((row, i) => (
              <div key={row.label}>
                {i > 0 && (
                  <div style={{ height: 1, background: `${COLORS.border}80`, margin: '8px 0' }} />
                )}
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: 13, color: COLORS.textSecondary }}>{row.label}</span>
                  <span
                    className="font-mono-data"
                    style={{
                      fontSize: row.bold ? 16 : 14,
                      fontWeight: 700,
                      color: row.color,
                    }}
                  >
                    {row.sign && (
                      <span style={{ marginRight: 4, color: row.color, fontWeight: 600 }}>
                        {row.sign}
                      </span>
                    )}
                    {row.value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 저장 버튼 ── */}
        <div style={{ padding: '4px 20px 20px' }}>
          <button
            type="button"
            onClick={handleSave}
            className="ivi-touch-target flex items-center justify-center gap-2"
            style={{
              width: '100%',
              padding: 14,
              background: COLORS.accentOrange,
              border: 'none',
              borderRadius: 12,
              cursor: 'pointer',
              outline: 'none',
              boxShadow: `0 4px 20px ${COLORS.accentOrange}40`,
            }}
          >
            <CheckCircle size={18} color="#fff" strokeWidth={2.5} />
            <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>
              사용한도 저장
            </span>
          </button>
        </div>
      </div>
    </>
  );
}
