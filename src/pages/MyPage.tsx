import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { useSimulation } from '../context/SimulationContext';
import { supabase, SavedSimulation } from '../lib/supabase';
import { MonthlyData, YearlyData } from '../types';

export default function MyPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { setInput, setResult } = useSimulation();
  const [simulations, setSimulations] = useState<SavedSimulation[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchSimulations();
    }
  }, [user]);

  async function fetchSimulations() {
    setLoading(true);
    const { data, error } = await supabase
      .from('simulations')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setSimulations(data as SavedSimulation[]);
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    await supabase.from('simulations').delete().eq('id', id);
    setSimulations(prev => prev.filter(s => s.id !== id));
    setDeletingId(null);
  }

  function handleRestore(sim: SavedSimulation) {
    setInput({
      region: sim.region,
      prefecture: '',
      familySize: 3,
      lifestyle: 'normal',
      hasAllElectric: false,
      monthlyElectricCost: sim.monthly_bill,
      electricCompany: sim.electricity_provider,
      electricPlan: sim.plan_name,
      electricityRate: undefined,
      solarCapacity: sim.solar_capacity,
      roofDirection: sim.roof_direction,
      roofAngle: sim.roof_angle,
      solarInitialCost: 0,
      hasBattery: sim.has_battery,
      batteryCapacity: sim.battery_capacity,
      batteryMaker: '',
      batteryModel: '',
      batteryInitialCost: 0,
    });

    // Restore result from saved data
    const monthlyData = (sim.monthly_data as MonthlyData[]) || [];
    const longTermData = (sim.yearly_data as YearlyData[]) || [];

    setResult({
      annualGeneration: sim.annual_generation,
      annualSelfConsumption: Math.round(sim.annual_generation * sim.self_consumption_rate),
      annualSurplus: Math.round(sim.annual_generation * (1 - sim.self_consumption_rate)),
      selfConsumptionRate: sim.self_consumption_rate,
      annualFITIncome: Math.round(sim.annual_generation * (1 - sim.self_consumption_rate) * 16),
      annualElectricitySaving: sim.annual_saving - Math.round(sim.annual_generation * (1 - sim.self_consumption_rate) * 16),
      annualTotalEffect: sim.annual_saving,
      annualConsumption: Math.round((sim.monthly_bill - 1000) / 30) * 12,
      monthlyData: monthlyData || [],
      longTermData: longTermData || [],
      paybackYears: sim.payback_years,
      totalInitialCost: sim.solar_capacity * 200000,
      effect15Year: 0,
      effect20Year: sim.total_merit_20y,
    });

    navigate('/results');
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-stone-400 text-sm">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-12">

        {/* Page Header */}
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-stone-900 mb-2">マイページ</h1>
          <p className="text-sm text-stone-500">{user?.email}</p>
        </div>

        {/* Simulations */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-stone-900">保存したシミュレーション</h2>
            <Link to="/simulate" className="btn-primary text-sm py-2 px-4">
              新しいシミュレーション
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-16 text-stone-400 text-sm">読み込み中...</div>
          ) : simulations.length === 0 ? (
            <div className="card text-center py-16">
              <div className="w-14 h-14 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a8a29e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="4"/>
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
                </svg>
              </div>
              <p className="font-semibold text-stone-700 mb-2">保存済みシミュレーションはありません</p>
              <p className="text-sm text-stone-400 mb-6">シミュレーション結果画面から保存できます</p>
              <Link to="/simulate" className="btn-primary text-sm">
                シミュレーションを始める
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {simulations.map(sim => (
                <div key={sim.id} className="card card-hover">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-stone-900 mb-1 truncate">{sim.title}</h3>
                      <p className="text-xs text-stone-400 mb-4">
                        {new Date(sim.created_at).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="text-center p-2.5 bg-primary-50 rounded-lg border border-primary-100">
                          <div className="text-xs text-primary-600 mb-0.5">年間経済効果</div>
                          <div className="font-bold text-primary-700 text-sm">{sim.annual_saving.toLocaleString('ja-JP')}円</div>
                        </div>
                        <div className="text-center p-2.5 bg-stone-50 rounded-lg border border-stone-100">
                          <div className="text-xs text-stone-500 mb-0.5">発電容量</div>
                          <div className="font-bold text-stone-700 text-sm">{sim.solar_capacity}kW</div>
                        </div>
                        <div className="text-center p-2.5 bg-stone-50 rounded-lg border border-stone-100">
                          <div className="text-xs text-stone-500 mb-0.5">回収年数</div>
                          <div className="font-bold text-stone-700 text-sm">約{sim.payback_years}年</div>
                        </div>
                        <div className="text-center p-2.5 bg-stone-50 rounded-lg border border-stone-100">
                          <div className="text-xs text-stone-500 mb-0.5">20年累計</div>
                          <div className="font-bold text-stone-700 text-sm">{(sim.total_merit_20y / 10000).toFixed(0)}万円</div>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-stone-500">
                        <span className="bg-stone-100 rounded px-2 py-1">{sim.region}</span>
                        <span className="bg-stone-100 rounded px-2 py-1">{sim.roof_direction}向き {sim.roof_angle}°</span>
                        {sim.has_battery && <span className="bg-stone-100 rounded px-2 py-1">蓄電池 {sim.battery_capacity}kWh</span>}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleRestore(sim)}
                        className="btn-secondary text-xs py-1.5 px-3"
                      >
                        結果を見る
                      </button>
                      <button
                        onClick={() => handleDelete(sim.id)}
                        disabled={deletingId === sim.id}
                        className="text-xs text-stone-400 hover:text-red-500 transition-colors py-1.5 px-3 rounded border border-transparent hover:border-red-200 hover:bg-red-50"
                      >
                        {deletingId === sim.id ? '削除中...' : '削除'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
