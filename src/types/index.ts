export interface SimulationInput {
  // Step 1: Region & Family
  region: string;
  prefecture: string;
  familySize: number;
  lifestyle: 'daytime' | 'evening' | 'normal';
  hasAllElectric: boolean;

  // Step 2: Current electricity
  monthlyElectricCost: number;
  electricCompany: string;
  electricPlan: string;
  electricityRate?: number;

  // Step 3: Solar
  solarCapacity: number;
  roofDirection: string;
  roofAngle: number;
  solarInitialCost: number;

  // Step 4: Battery
  hasBattery: boolean;
  batteryCapacity: number;
  batteryMaker: string;
  batteryModel: string;
  batteryInitialCost: number;
}

export interface MonthlyData {
  month: number;
  monthName: string;
  generation: number;
  consumption: number;
  selfConsumption: number;
  surplus: number;
  fitIncome: number;
  electricitySaving: number;
  electricityCostBefore: number;
  electricityCostAfter: number;
  totalSaving: number;
}

export interface YearlyData {
  year: number;
  annualEffect: number;
  cumulativeEffect: number;
  cumulativeCost: number;
}

export interface SimulationResult {
  annualGeneration: number;
  annualSelfConsumption: number;
  annualSurplus: number;
  selfConsumptionRate: number;
  annualFITIncome: number;
  annualElectricitySaving: number;
  annualTotalEffect: number;
  annualConsumption: number;
  monthlyData: MonthlyData[];
  longTermData: YearlyData[];
  paybackYears: number;
  totalInitialCost: number;
  effect15Year: number;
  effect20Year: number;
}
