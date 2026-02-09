'use client';

import React from 'react';
import { Check } from 'lucide-react';
import type { ChargingStation } from '@/types/charging';
import { COLORS } from '@/constants/config';

interface StationCardProps {
  station: ChargingStation;
  onSelect: (stationId: string) => void;
  isSelected?: boolean;
}

/* ── 칩 내부 미니 아이콘 (SVG) ── */
function BoltIcon({ color }: { color: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
      <path d="M6.5 1L2.5 7H5.5L5 11L9.5 5H6.5L6.5 1Z" fill={color} />
    </svg>
  );
}

function ClockIcon({ color }: { color: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="6" cy="6" r="4.5" stroke={color} strokeWidth="1.2" />
      <path d="M6 3.5V6L7.5 7.5" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function CoinIcon({ color }: { color: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="6" cy="6" r="4.5" stroke={color} strokeWidth="1.2" />
      <text x="6" y="8" textAnchor="middle" fill={color} fontSize="6" fontWeight="700" fontFamily="'JetBrains Mono', monospace">₩</text>
    </svg>
  );
}

const StationCard = React.memo(function StationCard({ station, onSelect, isSelected = false }: StationCardProps) {
  const {
    id, name, operator, address,
    distanceFromOrigin, detourDistance,
    chargerType, maxPower,
    availableChargers, totalChargers, waitingCount,
    pricePerKwh, estimatedArrivalSoc, estimatedChargingTime,
    isReachable, isRecommended,
  } = station;

  const chargerLabel = chargerType === 'superfast' ? '초급속' : '급속';
  const hasAvailability = availableChargers > 0;

  // SOC 바 색상
  const socColor =
    estimatedArrivalSoc === null
      ? COLORS.accentRed
      : estimatedArrivalSoc >= 30
      ? COLORS.accentOrange
      : COLORS.accentRed;

  const socFillGradient =
    estimatedArrivalSoc === null
      ? 'transparent'
      : estimatedArrivalSoc >= 30
      ? `linear-gradient(90deg, ${COLORS.accentOrange}, ${COLORS.accentGreen})`
      : `linear-gradient(90deg, ${COLORS.accentRed}, ${COLORS.accentOrange})`;

  const socFillWidth =
    isReachable && estimatedArrivalSoc !== null
      ? `${Math.min(100, estimatedArrivalSoc)}%`
      : '0%';

  return (
    <div
      role="article"
      aria-label={`${name}${!isReachable ? ' — 도달 불가' : isRecommended ? ' — 추천' : ''}`}
      className="relative overflow-hidden station-card-touch"
      style={{
        margin: '0 14px',
        padding: 14,
        background: isSelected
          ? 'linear-gradient(135deg, rgba(0,214,143,0.06), rgba(0,214,143,0.02))'
          : isRecommended
          ? 'linear-gradient(135deg, rgba(59,139,255,0.04), rgba(59,139,255,0.01))'
          : COLORS.card,
        border: `1px solid ${
          isSelected
            ? 'rgba(0,214,143,0.5)'
            : isRecommended
            ? 'rgba(59,139,255,0.35)'
            : COLORS.border
        }`,
        borderRadius: 12,
        opacity: isReachable ? 1 : 0.45,
        transition: 'opacity 0.2s ease',
      }}
    >
      {/* 추천 카드 상단 shimmer 그라데이션 바 */}
      {isRecommended && (
        <div
          className="absolute top-0 left-0 right-0 station-recommended-shimmer"
          style={{ height: 2 }}
        />
      )}

      {/* ══════ 상단 영역: 좌측 정보 + 우측 거리 ══════ */}
      <div className="flex" style={{ gap: 12 }}>
        {/* 좌측 */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* 뱃지 행 */}
          <div className="flex flex-wrap" style={{ gap: 6, marginBottom: 6 }}>
            {isRecommended && (
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  color: COLORS.accentBlue,
                  background: `${COLORS.accentBlue}1F`,
                  border: `1px solid ${COLORS.accentBlue}33`,
                  borderRadius: 4,
                  padding: '1px 6px',
                  lineHeight: '15px',
                }}
              >
                ✦ 추천
              </span>
            )}
            <span
              style={{
                fontSize: 9,
                fontWeight: 600,
                color: COLORS.accentGreen,
                background: `${COLORS.accentGreen}15`,
                border: `1px solid ${COLORS.accentGreen}26`,
                borderRadius: 4,
                padding: '1px 6px',
                lineHeight: '15px',
              }}
            >
              {chargerLabel} {maxPower}kW
            </span>
            {hasAvailability ? (
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 600,
                  color: COLORS.accentGreen,
                  background: `${COLORS.accentGreen}15`,
                  borderRadius: 4,
                  padding: '1px 6px',
                  lineHeight: '15px',
                }}
              >
                {availableChargers}/{totalChargers} 사용가능
              </span>
            ) : (
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 600,
                  color: COLORS.accentOrange,
                  background: `${COLORS.accentOrange}15`,
                  borderRadius: 4,
                  padding: '1px 6px',
                  lineHeight: '15px',
                }}
              >
                대기 {waitingCount}대
              </span>
            )}
          </div>

          {/* 충전소명 */}
          <span
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: COLORS.textPrimary,
              display: 'block',
              lineHeight: 1.3,
            }}
          >
            {name}
          </span>

          {/* 운영사 · 주소 */}
          <span
            style={{
              fontSize: 11,
              color: COLORS.textDim,
              display: 'block',
              marginTop: 3,
              lineHeight: 1.3,
            }}
          >
            {operator} · {address}
          </span>
        </div>

        {/* 우측: 경유 거리 */}
        <div
          className="flex flex-col items-end"
          style={{ flexShrink: 0, marginLeft: 12, paddingTop: 2 }}
        >
          <span
            style={{
              fontSize: 9,
              fontWeight: 600,
              color: COLORS.textDim,
              textTransform: 'uppercase',
              letterSpacing: '0.4px',
              marginBottom: 3,
            }}
          >
            경유 거리
          </span>
          <span
            className="font-mono-data"
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: isReachable ? COLORS.textPrimary : COLORS.textDim,
              lineHeight: 1,
            }}
          >
            {distanceFromOrigin}
            <span style={{ fontSize: 11, fontWeight: 500, marginLeft: 1 }}>km</span>
          </span>
          <span
            className="font-mono-data"
            style={{
              fontSize: 11,
              color: !isReachable
                ? COLORS.accentRed
                : COLORS.textSecondary,
              marginTop: 3,
              fontWeight: !isReachable ? 600 : 400,
            }}
          >
            {!isReachable
              ? '도달 불가'
              : detourDistance > 0
              ? `+${detourDistance}min 우회`
              : '경로상'}
          </span>
        </div>
      </div>

      {/* ══════ 상세 정보 칩 행 ══════ */}
      <div className="flex flex-wrap" style={{ gap: 6, marginTop: 10 }}>
        {/* 도착 SOC 칩 */}
        <div
          className="flex items-center gap-1"
          style={{
            background: '#0d1219',
            borderRadius: 6,
            padding: '4px 8px',
          }}
        >
          <BoltIcon color={socColor} />
          <span style={{ fontSize: 10, color: COLORS.textDim }}>도착 SOC</span>
          <span
            className="font-mono-data"
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: socColor,
            }}
          >
            {estimatedArrivalSoc !== null ? `${estimatedArrivalSoc}%` : '— %'}
          </span>
        </div>

        {/* 충전 시간 칩 */}
        {estimatedChargingTime !== null && (
          <div
            className="flex items-center gap-1"
            style={{
              background: '#0d1219',
              borderRadius: 6,
              padding: '4px 8px',
            }}
          >
            <ClockIcon color={COLORS.textSecondary} />
            <span style={{ fontSize: 10, color: COLORS.textDim }}>충전</span>
            <span
              className="font-mono-data"
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: COLORS.textSecondary,
              }}
            >
              ~{estimatedChargingTime}min
            </span>
          </div>
        )}

        {/* 단가 칩 (도달 가능할 때만) */}
        {isReachable && (
          <div
            className="flex items-center gap-1"
            style={{
              background: '#0d1219',
              borderRadius: 6,
              padding: '4px 8px',
            }}
          >
            <CoinIcon color={COLORS.textSecondary} />
            <span
              className="font-mono-data"
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: COLORS.textSecondary,
              }}
            >
              {pricePerKwh}원/kWh
            </span>
          </div>
        )}
      </div>

      {/* ══════ SOC 바 ══════ */}
      <div
        className="flex items-center"
        style={{ gap: 8, marginTop: 10 }}
      >
        <span
          style={{
            fontSize: 10,
            color: COLORS.textDim,
            flexShrink: 0,
            width: 52,
          }}
        >
          {isReachable ? '도착 SOC' : '도달 불가'}
        </span>

        {/* 바 */}
        <div
          style={{
            flex: 1,
            height: 6,
            borderRadius: 3,
            background: '#1a2230',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: socFillWidth,
              height: '100%',
              borderRadius: 3,
              background: socFillGradient,
              transition: 'width 0.4s ease-out',
            }}
          />
        </div>

        <span
          className="font-mono-data"
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: socColor,
            flexShrink: 0,
            width: 36,
            textAlign: 'right',
          }}
        >
          {isReachable && estimatedArrivalSoc !== null
            ? `${estimatedArrivalSoc}%`
            : '— %'}
        </span>
      </div>

      {/* ══════ 선택 버튼 (도달 가능할 때만) ══════ */}
      {isReachable && (
        <button
          type="button"
          onClick={() => onSelect(id)}
          aria-label={`${name} ${isSelected ? '경유지 해제' : '경유지 설정'}`}
          className="flex items-center justify-center gap-2"
          style={{
            width: '100%',
            marginTop: 12,
            padding: 10,
            background: isSelected ? `${COLORS.accentGreen}18` : `${COLORS.accentBlue}14`,
            border: `1px solid ${isSelected ? `${COLORS.accentGreen}50` : `${COLORS.accentBlue}4D`}`,
            borderRadius: 8,
            cursor: 'pointer',
            outline: 'none',
            transition: 'background 0.15s ease, border-color 0.15s ease',
            WebkitTapHighlightColor: 'transparent',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = isSelected
              ? `${COLORS.accentGreen}28`
              : `${COLORS.accentBlue}26`;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = isSelected
              ? `${COLORS.accentGreen}18`
              : `${COLORS.accentBlue}14`;
          }}
        >
          <Check size={15} color={isSelected ? COLORS.accentGreen : COLORS.accentBlue} strokeWidth={2.5} />
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: isSelected ? COLORS.accentGreen : COLORS.accentBlue,
            }}
          >
            {isSelected ? '✓ 선택됨 — 터치하여 해제' : '이 충전소로 경유지 설정'}
          </span>
        </button>
      )}
    </div>
  );
});

export default StationCard;
