export enum TabId {
  DEVICE = 'device',
  VIEW = 'view',
  CHAT = 'chat',
  DISCOVER = 'discover',
  MINE = 'mine'
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface DeviceStatus {
  battery: number;
  flightTime: number; // minutes
  isConnected: boolean;
  gpsSignal: 'strong' | 'medium' | 'weak';
  compassStatus: 'normal' | 'abnormal';
  pressureStatus: 'normal' | 'low';
}

export enum FlightMode {
  STANDBY = 'STANDBY',
  WARMUP = 'WARMUP',
  FLYING = 'FLYING'
}

export enum PlatformMode {
  LOCKED = 'LOCKED',
  STABILIZING = 'STABILIZING'
}

export enum DiscoveryFeature {
  NONE = 'none',
  BIO_GUIDE = 'bio_guide',
  AR_FINDER = 'ar_finder',
  LIGHT_EMITTER = 'light_emitter',
  CHECKLIST = 'checklist',
  TIDE_NOISE = 'tide_noise',
  SEA_PROPHET = 'sea_prophet',
  RESCUE_RADAR = 'rescue_radar'
}