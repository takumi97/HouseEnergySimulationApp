import React, { createContext, useContext, useState } from 'react';
import { SimulationInput, SimulationResult } from '../types';

const defaultInput: SimulationInput = {
  region: '関東',
  prefecture: '東京都',
  familySize: 3,
  lifestyle: 'normal',
  hasAllElectric: false,
  monthlyElectricCost: 15000,
  electricCompany: '東京電力',
  electricPlan: '従量電灯B',
  electricityRate: undefined,
  solarCapacity: 5.0,
  roofDirection: '南',
  roofAngle: 30,
  hasBattery: false,
  batteryCapacity: 7.0,
  batteryMaker: '',
  batteryModel: '',
};

interface SimulationContextType {
  input: SimulationInput;
  setInput: React.Dispatch<React.SetStateAction<SimulationInput>>;
  result: SimulationResult | null;
  setResult: React.Dispatch<React.SetStateAction<SimulationResult | null>>;
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export function SimulationProvider({ children }: { children: React.ReactNode }) {
  const [input, setInput] = useState<SimulationInput>(defaultInput);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  return (
    <SimulationContext.Provider value={{ input, setInput, result, setResult, currentStep, setCurrentStep }}>
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation() {
  const ctx = useContext(SimulationContext);
  if (!ctx) throw new Error('useSimulation must be used within SimulationProvider');
  return ctx;
}
