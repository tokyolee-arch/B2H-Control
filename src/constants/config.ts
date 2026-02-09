// B2H IVI Configuration Constants

import type { RouteInfo, ChargingStation } from '@/types/charging';
import type { JourneyPlan } from '@/types/journey';

export const IVI_RESOLUTION = {
  width: 1920,
  height: 1200,
} as const;

export const ZONE_WIDTH = {
  zoneA: 640,
  zoneB: 640,
  zoneC: 640,
} as const;

export const AC_SPEC = {
  voltage: 220,    // V
  frequency: 60,   // Hz
  maxPower: 3.6,   // kW
} as const;

export const DC_SPEC = {
  voltage: 48,     // V
  maxPower: 5.0,   // kW
} as const;

export const BATTERY_SPEC = {
  totalCapacity: 80, // kWh
  reservePercent: 25, // %
} as const;

export const COLORS = {
  primary: '#0a0e14',
  card: '#111820',
  cardHover: '#161e28',
  border: '#1e2a38',
  textPrimary: '#e8edf3',
  textSecondary: '#7a8ba0',
  textDim: '#4a5a6e',
  accentBlue: '#3b8bff',
  accentGreen: '#00d68f',
  accentOrange: '#ff9f43',
  accentRed: '#ff4757',
  accentPurple: '#a78bfa',
} as const;

/* ── 충전소 검색 목 데이터 ── */

export const ROUTE_GANGNAM_TO_JEONJU: RouteInfo = {
  origin: {
    name: '강남역',
    address: '서울 강남구 강남대로 396',
    lat: 37.4979,
    lng: 127.0276,
  },
  destination: {
    name: '현대자동차 전주공장',
    address: '전북 완주군 봉동읍 완주산단5로 163',
    lat: 35.9418,
    lng: 127.1186,
  },
  totalDistance: 271,
  estimatedDuration: 168, // 2시간 48분
  currentRange: 148,
};

export const MOCK_STATIONS: ChargingStation[] = [
  {
    id: 'station-1',
    name: '천안 현대 프리미엄 아울렛 충전소',
    operator: 'E-pit',
    address: '충남 천안시 동남구',
    distanceFromOrigin: 108,
    detourDistance: 2,
    chargerType: 'superfast',
    maxPower: 350,
    availableChargers: 2,
    totalChargers: 4,
    waitingCount: 0,
    pricePerKwh: 350,
    estimatedArrivalSoc: 33,
    estimatedChargingTime: 22,
    isReachable: true,
    isRecommended: true,
  },
  {
    id: 'station-2',
    name: '오창 휴게소 충전소 (하행)',
    operator: '한국전력',
    address: '충북 청주시 청원구',
    distanceFromOrigin: 125,
    detourDistance: 0,
    chargerType: 'fast',
    maxPower: 200,
    availableChargers: 3,
    totalChargers: 6,
    waitingCount: 0,
    pricePerKwh: 324,
    estimatedArrivalSoc: 24,
    estimatedChargingTime: 28,
    isReachable: true,
    isRecommended: true,
  },
  {
    id: 'station-3',
    name: '대전 유성 IC 충전소',
    operator: '차지비',
    address: '대전 유성구',
    distanceFromOrigin: 162,
    detourDistance: 1,
    chargerType: 'fast',
    maxPower: 100,
    availableChargers: 0,
    totalChargers: 3,
    waitingCount: 2,
    pricePerKwh: 310,
    estimatedArrivalSoc: null,
    estimatedChargingTime: 38,
    isReachable: false,
    isRecommended: false,
  },
  {
    id: 'station-4',
    name: '전주 완산 E-pit 충전소',
    operator: 'E-pit',
    address: '전북 전주시 완산구',
    distanceFromOrigin: 256,
    detourDistance: 0,
    chargerType: 'fast',
    maxPower: 200,
    availableChargers: 4,
    totalChargers: 4,
    waitingCount: 0,
    pricePerKwh: 340,
    estimatedArrivalSoc: null,
    estimatedChargingTime: null,
    isReachable: false,
    isRecommended: false,
  },
];

/* ── 여정 플래너 목업 데이터 ── */

export const MOCK_JOURNEY: JourneyPlan = {
  waypoints: [
    {
      id: 'wp-origin',
      type: 'origin',
      name: '강남역',
      address: '서울 강남구 강남대로 396',
      arrivalTime: '14:30',
      arrivalSoc: 72,
      departureSoc: 72,
    },
    {
      id: 'wp-charge-1',
      type: 'charging',
      name: '천안 충전소',
      address: '충남 천안시 동남구',
      arrivalTime: '15:38',
      departureTime: '16:00',
      arrivalSoc: 28,
      departureSoc: 80,
      stationInfo: {
        operator: 'E-pit',
        maxPower: 350,
        chargerType: 'superfast',
        availableChargers: 2,
        totalChargers: 4,
        pricePerKwh: 350,
      },
    },
    {
      id: 'wp-dest',
      type: 'destination',
      name: '전주공장',
      address: '전북 완주군 봉동읍 완주산단5로 163',
      arrivalTime: '17:42',
      arrivalSoc: 22,
    },
  ],
  segments: [
    {
      fromId: 'wp-origin',
      toId: 'wp-charge-1',
      type: 'driving',
      label: '주행 1',
      distance: 108,
      duration: 68,
      energyConsumed: 28.4,
      b2hConsumed: 7.0,
      b2hAcConsumed: 2.7,
      b2hDcConsumed: 4.3,
      socStart: 72,
      socEnd: 28,
      startTime: '14:30',
      endTime: '15:38',
    },
    {
      fromId: 'wp-charge-1',
      toId: 'wp-charge-1',
      type: 'charging',
      label: '충전',
      duration: 22,
      socStart: 28,
      socEnd: 80,
      chargeAmount: 41.6,
      startTime: '15:38',
      endTime: '16:00',
    },
    {
      fromId: 'wp-charge-1',
      toId: 'wp-dest',
      type: 'driving',
      label: '주행 2',
      distance: 163,
      duration: 102,
      energyConsumed: 42.8,
      b2hConsumed: 10.5,
      b2hAcConsumed: 4.1,
      b2hDcConsumed: 6.4,
      socStart: 80,
      socEnd: 22,
      startTime: '16:00',
      endTime: '17:42',
    },
  ],
  totalDistance: 271,
  totalDuration: 192,
  totalDrivingDuration: 170,
  totalChargingDuration: 22,
  totalB2HConsumed: 17.5,
  totalChargingCost: 14560,
  finalArrivalTime: '17:42',
  finalArrivalSoc: 22,
};
