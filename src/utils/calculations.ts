import { SimulationInput, SimulationResult, MonthlyData, YearlyData } from '../types';

// Regional annual generation coefficient (kWh per kW installed, south-facing 30deg tilt)
const REGIONAL_COEFFICIENT: Record<string, number> = {
  '北海道': 1050,
  '東北': 1150,
  '関東': 1320,
  '中部': 1380,
  '北陸': 1100,
  '近畿': 1350,
  '中国': 1300,
  '四国': 1420,
  '九州': 1400,
  '沖縄': 1500,
};

// Roof direction adjustment factor
const DIRECTION_FACTOR: Record<string, number> = {
  '南': 1.00,
  '南東': 0.95,
  '南西': 0.95,
  '東': 0.87,
  '西': 0.87,
  '北東': 0.77,
  '北西': 0.77,
  '北': 0.65,
};

// Roof angle adjustment factor
const ANGLE_FACTOR: Record<number, number> = {
  0: 0.90,
  10: 0.95,
  20: 0.98,
  30: 1.00,
  40: 0.97,
};

// Monthly sunshine distribution (12 months, sums to 12)
const MONTHLY_SUNSHINE_FACTOR = [0.72, 0.80, 0.98, 1.07, 1.14, 1.00, 1.00, 1.08, 0.93, 0.90, 0.72, 0.63];

// Monthly consumption distribution (12 months, sums to 12)
const MONTHLY_CONSUMPTION_FACTOR = [1.20, 1.16, 1.01, 0.87, 0.82, 0.87, 1.11, 1.20, 1.01, 0.82, 0.82, 1.11];

const MONTH_NAMES = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

// Constants
const FIT_PRICE = 16; // yen/kWh
const DEFAULT_ELECTRICITY_PURCHASE_PRICE = 30; // yen/kWh
const ELECTRICITY_ESCALATION = 0.015; // 1.5% per year
const PANEL_DEGRADATION = 0.005; // 0.5% per year

export function calculateSelfConsumptionRate(hasBattery: boolean, batteryCapacity: number): number {
  if (!hasBattery) return 0.30;
  if (batteryCapacity <= 5) return 0.50;
  if (batteryCapacity <= 10) return 0.62;
  return 0.70;
}

export function runSimulation(input: SimulationInput): SimulationResult {
  const ELECTRICITY_PURCHASE_PRICE = input.electricityRate ?? DEFAULT_ELECTRICITY_PURCHASE_PRICE;
  const regionCoef = REGIONAL_COEFFICIENT[input.region] ?? 1320;
  const directionFactor = DIRECTION_FACTOR[input.roofDirection] ?? 1.0;
  const angleFactor = ANGLE_FACTOR[input.roofAngle] ?? 1.0;

  // Annual generation (kWh)
  const annualGeneration = input.solarCapacity * regionCoef * directionFactor * angleFactor;

  // Annual electricity consumption from monthly cost
  const basicCharge = 1000; // yen/month basic charge estimate
  const energyCost = input.monthlyElectricCost - basicCharge;
  const monthlyConsumption = Math.max(energyCost / ELECTRICITY_PURCHASE_PRICE, 100);
  const annualConsumption = monthlyConsumption * 12;

  // Self-consumption rate
  const selfConsumptionRate = calculateSelfConsumptionRate(input.hasBattery, input.batteryCapacity);

  // Annual self-consumption and surplus
  const maxSelfConsumption = Math.min(annualGeneration * selfConsumptionRate, annualConsumption);
  const annualSelfConsumption = maxSelfConsumption;
  const annualSurplus = annualGeneration - annualSelfConsumption;

  // Annual economic effects
  const annualFITIncome = annualSurplus * FIT_PRICE;
  const annualElectricitySaving = annualSelfConsumption * ELECTRICITY_PURCHASE_PRICE;
  const annualTotalEffect = annualFITIncome + annualElectricitySaving;

  // Monthly data
  const monthlyData: MonthlyData[] = MONTH_NAMES.map((monthName, i) => {
    const generation = (annualGeneration / 12) * MONTHLY_SUNSHINE_FACTOR[i];
    const consumption = (annualConsumption / 12) * MONTHLY_CONSUMPTION_FACTOR[i];
    const selfConsumption = Math.min(generation * selfConsumptionRate, consumption);
    const surplus = generation - selfConsumption;
    const fitIncome = surplus * FIT_PRICE;
    const electricitySaving = selfConsumption * ELECTRICITY_PURCHASE_PRICE;
    const electricityCostBefore = input.monthlyElectricCost * MONTHLY_CONSUMPTION_FACTOR[i];
    const remainingConsumption = consumption - selfConsumption;
    const electricityCostAfter = basicCharge + remainingConsumption * ELECTRICITY_PURCHASE_PRICE;
    const totalSaving = fitIncome + electricitySaving;

    return {
      month: i + 1,
      monthName,
      generation: Math.round(generation),
      consumption: Math.round(consumption),
      selfConsumption: Math.round(selfConsumption),
      surplus: Math.round(surplus),
      fitIncome: Math.round(fitIncome),
      electricitySaving: Math.round(electricitySaving),
      electricityCostBefore: Math.round(electricityCostBefore),
      electricityCostAfter: Math.round(electricityCostAfter),
      totalSaving: Math.round(totalSaving),
    };
  });

  // Initial cost (solarCost / batteryCost are in yen; undefined means use default estimate)
  const solarCostAmount = (input.solarCost !== undefined && input.solarCost >= 0)
    ? input.solarCost
    : input.solarCapacity * 200000;
  const batteryCostAmount = input.hasBattery
    ? ((input.batteryCost !== undefined && input.batteryCost >= 0)
        ? input.batteryCost
        : input.batteryCapacity * 150000)
    : 0;
  const totalInitialCost = solarCostAmount + batteryCostAmount;

  // Long-term simulation (20 years)
  const longTermData: YearlyData[] = [];
  let cumulative = -totalInitialCost;
  let paybackYears = 0;
  let effect15Year = -totalInitialCost;
  let effect20Year = -totalInitialCost;

  for (let year = 1; year <= 20; year++) {
    const degradation = Math.pow(1 - PANEL_DEGRADATION, year - 1);
    const escalation = Math.pow(1 + ELECTRICITY_ESCALATION, year - 1);
    const yearEffect = annualTotalEffect * degradation * escalation;
    cumulative += yearEffect;

    longTermData.push({
      year,
      annualEffect: Math.round(yearEffect),
      cumulativeEffect: Math.round(cumulative + totalInitialCost), // from investment start
      cumulativeCost: Math.round(cumulative),
    });

    if (paybackYears === 0 && cumulative >= 0) {
      paybackYears = year;
    }
    if (year === 15) effect15Year = Math.round(cumulative + totalInitialCost);
    if (year === 20) effect20Year = Math.round(cumulative + totalInitialCost);
  }

  return {
    annualGeneration: Math.round(annualGeneration),
    annualSelfConsumption: Math.round(annualSelfConsumption),
    annualSurplus: Math.round(annualSurplus),
    selfConsumptionRate,
    annualFITIncome: Math.round(annualFITIncome),
    annualElectricitySaving: Math.round(annualElectricitySaving),
    annualTotalEffect: Math.round(annualTotalEffect),
    annualConsumption: Math.round(annualConsumption),
    monthlyData,
    longTermData,
    paybackYears: paybackYears || 20,
    totalInitialCost,
    effect15Year,
    effect20Year,
  };
}

export const REGIONS = Object.keys(REGIONAL_COEFFICIENT);
export const DIRECTIONS = Object.keys(DIRECTION_FACTOR);
export const ANGLES = [0, 10, 20, 30, 40];
