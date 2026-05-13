export type FarmerStatus = 'pending' | 'active' | 'triggered' | 'expired' | 'returned';

export interface Farmer {
  id: string;
  name: string;
  phone: string;
  latitude: number;
  longitude: number;
  region: string | null;
  crop_type: string | null;
  farm_size_ha: number | null;
  season_start: string;
  season_end: string;
  drought_threshold_mm: number;
  coverage_usdc: number;
  premium_usdc: number;
  premium_paid: boolean;
  stellar_wallet: string | null;
  stellar_secret: string | null;
  contract_id: string | null;
  payout_triggered: boolean;
  payout_triggered_at: string | null;
  trigger_rainfall_mm: number | null;
  status: FarmerStatus;
  created_at: string;
}

export interface OracleCheck {
  id: string;
  farmer_id: string;
  checked_at: string;
  season_start: string;
  check_date: string;
  rainfall_cumulative_mm: number | null;
  threshold_mm: number | null;
  triggered: boolean;
  open_meteo_raw: unknown;
  tx_hash: string | null;
}

export interface CoveragePool {
  id: string;
  name: string;
  sponsor_name: string | null;
  region: string | null;
  season_start: string | null;
  season_end: string | null;
  total_usdc: number | null;
  policies_count: number;
  contract_id: string | null;
  status: string;
  created_at: string;
}

export type OracleStatus = 'safe' | 'warning' | 'trigger';

export interface RainfallReading {
  totalMm: number;
  dailyMm: number[];
  raw: unknown;
}

export interface FarmerRegistrationPayload {
  name: string;
  phone: string;
  latitude: number;
  longitude: number;
  region?: string;
  crop_type?: string;
  farm_size_ha?: number;
  season_start: string;
  season_end: string;
  drought_threshold_mm?: number;
  coverage_usdc: number;
  premium_usdc: number;
}
