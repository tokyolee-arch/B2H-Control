export interface JourneyWaypoint {
  id: string;
  type: 'origin' | 'charging' | 'destination';
  name: string;
  address?: string;
  arrivalTime: string;           // "14:30" 형태
  departureTime?: string;        // 충전소의 경우 충전 후 출발 시각
  arrivalSoc: number;            // 도착 시 SOC %
  departureSoc?: number;         // 출발 시 SOC % (충전소만)
  stationInfo?: {
    operator: string;
    maxPower: number;             // kW
    chargerType: 'fast' | 'superfast';
    availableChargers: number;
    totalChargers: number;
    pricePerKwh: number;          // 원/kWh
  };
}

export interface JourneySegment {
  fromId: string;
  toId: string;
  type: 'driving' | 'charging';
  label: string;                  // "주행 1", "충전", "주행 2"
  distance?: number;              // km (driving만)
  duration: number;               // 분
  energyConsumed?: number;        // kWh (주행 소모)
  b2hConsumed?: number;           // kWh (B2H 소모)
  b2hAcConsumed?: number;         // kWh
  b2hDcConsumed?: number;         // kWh
  socStart: number;
  socEnd: number;
  chargeAmount?: number;          // kWh (충전량, charging만)
  startTime: string;
  endTime: string;
}

export interface JourneyPlan {
  waypoints: JourneyWaypoint[];
  segments: JourneySegment[];
  totalDistance: number;
  totalDuration: number;          // 분 (충전 시간 포함)
  totalDrivingDuration: number;   // 분 (순수 주행)
  totalChargingDuration: number;  // 분 (충전 시간)
  totalB2HConsumed: number;       // kWh
  totalChargingCost: number;      // 원
  finalArrivalTime: string;       // "17:42"
  finalArrivalSoc: number;        // %
}
