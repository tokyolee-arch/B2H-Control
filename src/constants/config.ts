// B2H IVI Configuration Constants

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
