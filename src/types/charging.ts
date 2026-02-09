export interface RouteLocation {
  name: string;
  address: string;
  lat: number;
  lng: number;
}

export interface RouteInfo {
  origin: RouteLocation;
  destination: RouteLocation;
  totalDistance: number;       // km
  estimatedDuration: number;  // 분
  currentRange: number;       // 현재 배터리로 주행 가능 거리 (km)
}

export interface ChargingStation {
  id: string;
  name: string;
  operator: string;
  address: string;
  distanceFromOrigin: number; // km
  detourDistance: number;     // km (0이면 경로상)
  chargerType: 'fast' | 'superfast';
  maxPower: number;           // kW
  availableChargers: number;
  totalChargers: number;
  waitingCount: number;
  pricePerKwh: number;        // 원/kWh
  estimatedArrivalSoc: number | null;   // 도착 예상 SOC(%)
  estimatedChargingTime: number | null; // 80%까지 충전 예상 시간(분)
  isReachable: boolean;
  isRecommended: boolean;
}
