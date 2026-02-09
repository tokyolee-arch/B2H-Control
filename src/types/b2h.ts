// B2H Control System Type Definitions

export type TerminalType = 'ac' | 'dc';

export interface TerminalState {
  type: TerminalType;
  isOn: boolean;
  currentPower: number;   // kW
  maxPower: number;       // kW
  cumulativeEnergy: number; // kWh
  usageDuration: number;  // 초
  voltage: number;        // V
  frequency?: number;     // Hz (AC만)
}

export interface BatteryState {
  soc: number;            // % (0~100)
  totalCapacity: number;  // kWh
  reservePercent: number; // %
  estimatedRange: number; // km
}

export interface PowerDataPoint {
  time: number;           // timestamp (ms)
  power: number;          // kW
}

/** usePowerSimulation 훅 반환 타입 */
export interface SimulationData {
  batteryState: BatteryState;
  acTerminal: TerminalState;
  dcTerminal: TerminalState;
  acPowerHistory: PowerDataPoint[];
  dcPowerHistory: PowerDataPoint[];
  toggleTerminal: (type: TerminalType) => void;
  totalPowerConsumption: number;
  activePanelCount: number;
  estimatedRemainingTime: string;
  estimatedDepletionTime: string;
}
