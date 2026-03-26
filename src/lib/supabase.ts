import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface ElectricityPlan {
  id: string;
  provider_name: string;
  plan_name: string;
  region: string;
  base_charge: number;
  rate_per_kwh: number;
  fit_rate: number;
  plan_type: string;
  is_active: boolean;
}

export interface SavedSimulation {
  id: string;
  user_id: string;
  title: string;
  region: string;
  monthly_bill: number;
  electricity_provider: string;
  plan_name: string;
  solar_capacity: number;
  roof_direction: string;
  roof_angle: number;
  has_battery: boolean;
  battery_capacity: number;
  annual_generation: number;
  annual_saving: number;
  monthly_saving: number;
  payback_years: number;
  total_merit_20y: number;
  self_consumption_rate: number;
  monthly_data: unknown;
  yearly_data: unknown;
  created_at: string;
  updated_at: string;
}
