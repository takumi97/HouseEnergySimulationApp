import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, ResponsiveContainer, ReferenceLine
} from 'recharts';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useSimulation } from '../context/SimulationContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { exportPdf } from '../utils/exportPdf';
import { downloadMonthlyCsv, downloadYearlyCsv } from '../utils/exportCsv';

export default function ResultsPage() {
  const navigate = useNavigate();
  const { result, input } = useSimulation();
  const { user } = useAuth();
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveDone, setSaveDone] = useState(false);

  useEffect(() => {
    if (!result) {
      navigate('/simulate');
    }
  }, [result, navigate]);

  async function handleSave() {
    if (!user || !result) return;
    setIsSaving(true);
    setSaveError('');

    const title = `${input.prefecture || input.region} ${input.solarCapacity}kW ${new Date().toLocaleDateString('ja-JP')}`;

    const { error } = await supabase.from('simulations').insert({
      user_id: user.id,
      title,
      region: input.region,
      monthly_bill: input.monthlyElectricCost,
      electricity_provider: input.electricCompany,
      plan_name: input.electricPlan,
      solar_capacity: input.solarCapacity,
      roof_direction: input.roofDirection,
      roof_angle: input.roofAngle,
      has_battery: input.hasBattery,
      battery_capacity: input.batteryCapacity,
      annual_generation: result.annualGeneration,
      annual_saving: result.annualTotalEffect,
      monthly_saving: Math.round(result.annualTotalEffect / 12),
      payback_years: result.paybackYears,
      total_merit_20y: result.effect20Year,
      self_consumption_rate: result.selfConsumptionRate,
      monthly_data: result.monthlyData,
      yearly_data: result.longTermData,
    });

    if (error) {
      setSaveError('保存に失敗しました。再度お試しください。');
    } else {
      setSaveDone(true);
    }
    setIsSaving(false);
  }

  if (!result) return null;

  async function handleExportPdf() {
    setIsExportingPdf(true);
    try {
      await exportPdf(input, result!);
    } finally {
      setIsExportingPdf(false);
    }
  }

  const selfConsumptionPct = Math.round(result.selfConsumptionRate * 100);

  const monthlyChartData = result.monthlyData.map(d => ({
    name: d.monthName,
    '発電量': d.generation,
    '消費電力量': d.consumption,
  }));

  const costCompareData = result.monthlyData.map(d => ({
    name: d.monthName,
    '導入前': d.electricityCostBefore,
    '導入後': d.electricityCostAfter,
  }));

  const longTermChartData = result.longTermData.map(d => ({
    name: `${d.year}年`,
    '累計収支': d.cumulativeCost,
    year: d.year,
  }));

  const formatYen = (v: number) => `${v.toLocaleString('ja-JP')}円`;
  const formatKwh = (v: number) => `${v.toLocaleString('ja-JP')}kWh`;

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-12">

        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 rounded-full px-4 py-1.5 text-sm font-semibold mb-5 border border-primary-200">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            シミュレーション完了
          </div>
          <h1 className="text-3xl font-bold text-stone-900 mb-3">シミュレーション結果</h1>
          <p className="text-sm text-stone-500">
            {input.prefecture} / {input.solarCapacity}kW / {input.roofDirection}向き {input.roofAngle}° / 月々電気代 {input.monthlyElectricCost.toLocaleString('ja-JP')}円
            {input.hasBattery ? ` / 蓄電池 ${input.batteryCapacity}kWh` : ''}
          </p>
        </div>

        {/* Hero Numbers */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            {
              label: '年間経済効果',
              value: result.annualTotalEffect.toLocaleString('ja-JP'),
              unit: '円/年',
              accent: true,
            },
            {
              label: '年間発電量',
              value: result.annualGeneration.toLocaleString('ja-JP'),
              unit: 'kWh/年',
              accent: false,
            },
            {
              label: '投資回収年数',
              value: `約 ${result.paybackYears}`,
              unit: '年',
              accent: false,
            },
            {
              label: '自家消費率',
              value: selfConsumptionPct.toString(),
              unit: '%',
              accent: false,
            },
          ].map((item) => (
            <div key={item.label} className={`card text-center ${item.accent ? 'border-primary-200 bg-primary-50' : ''}`}>
              <div className="text-xs text-stone-500 mb-2">{item.label}</div>
              <div className={`text-2xl font-bold leading-none ${item.accent ? 'text-primary-700' : 'text-stone-900'}`}>
                {item.value}
              </div>
              <div className="text-sm text-stone-400 mt-1">{item.unit}</div>
            </div>
          ))}
        </div>

        {/* Economic Breakdown */}
        <div className="card mb-8">
          <h2 className="text-lg font-bold text-stone-900 mb-6">年間経済効果の内訳</h2>
          <div className="grid md:grid-cols-3 gap-5 mb-6">
            <div className="rounded-lg p-4 bg-stone-50 border border-stone-200">
              <div className="text-xs text-stone-500 mb-1">売電収入（FIT）</div>
              <div className="text-2xl font-bold text-stone-900">{result.annualFITIncome.toLocaleString('ja-JP')}<span className="text-sm font-normal text-stone-500 ml-1">円</span></div>
              <div className="text-xs text-stone-400 mt-2">余剰 {result.annualSurplus.toLocaleString('ja-JP')} kWh × 16円/kWh</div>
            </div>
            <div className="rounded-lg p-4 bg-stone-50 border border-stone-200">
              <div className="text-xs text-stone-500 mb-1">電気代削減</div>
              <div className="text-2xl font-bold text-stone-900">{result.annualElectricitySaving.toLocaleString('ja-JP')}<span className="text-sm font-normal text-stone-500 ml-1">円</span></div>
              <div className="text-xs text-stone-400 mt-2">自家消費 {result.annualSelfConsumption.toLocaleString('ja-JP')} kWh × 30円/kWh</div>
            </div>
            <div className="rounded-lg p-4 bg-primary-50 border border-primary-200">
              <div className="text-xs text-primary-600 mb-1">年間合計効果</div>
              <div className="text-2xl font-bold text-primary-700">{result.annualTotalEffect.toLocaleString('ja-JP')}<span className="text-sm font-normal text-primary-500 ml-1">円</span></div>
              <div className="text-xs text-primary-500 mt-2">初期投資 {(result.totalInitialCost / 10000).toLocaleString('ja-JP')}万円</div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: '年間発電量', value: `${result.annualGeneration.toLocaleString('ja-JP')} kWh` },
              { label: '自家消費量', value: `${result.annualSelfConsumption.toLocaleString('ja-JP')} kWh` },
              { label: '余剰電力量', value: `${result.annualSurplus.toLocaleString('ja-JP')} kWh` },
              { label: '年間消費電力', value: `${result.annualConsumption.toLocaleString('ja-JP')} kWh` },
            ].map(item => (
              <div key={item.label} className="text-center p-3 bg-stone-50 rounded-lg border border-stone-100">
                <div className="text-xs text-stone-500 mb-1">{item.label}</div>
                <div className="font-semibold text-stone-800 text-sm">{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Generation Chart */}
        <div className="card mb-8">
          <h2 className="text-lg font-bold text-stone-900 mb-1">月別 発電量・消費電力量</h2>
          <p className="text-sm text-stone-500 mb-6">月ごとの発電量と消費電力量の比較</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyChartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#78716c' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#78716c' }} unit="kWh" axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(value: number, name: string) => [formatKwh(value), name]}
                contentStyle={{ border: '1px solid #e7e5e4', borderRadius: '8px', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="発電量" fill="#0f766e" radius={[3, 3, 0, 0]} />
              <Bar dataKey="消費電力量" fill="#a8a29e" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Cost Comparison Chart */}
        <div className="card mb-8">
          <h2 className="text-lg font-bold text-stone-900 mb-1">月別 電気代比較</h2>
          <p className="text-sm text-stone-500 mb-6">太陽光導入前後の月々電気代の比較</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={costCompareData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#78716c' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#78716c' }} tickFormatter={v => `${(v / 1000).toFixed(0)}千`} unit="円" axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(value: number, name: string) => [formatYen(value), name]}
                contentStyle={{ border: '1px solid #e7e5e4', borderRadius: '8px', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="導入前" fill="#a8a29e" radius={[3, 3, 0, 0]} />
              <Bar dataKey="導入後" fill="#0f766e" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Long-term Chart */}
        <div className="card mb-8">
          <h2 className="text-lg font-bold text-stone-900 mb-1">20年間 累計収支シミュレーション</h2>
          <p className="text-sm text-stone-500 mb-6">初期投資からの回収・利益推移（マイナスは未回収、プラスは利益）</p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={longTermChartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#78716c' }} axisLine={false} tickLine={false} interval={1} />
              <YAxis
                tick={{ fontSize: 11, fill: '#78716c' }}
                tickFormatter={v => `${(v / 10000).toFixed(0)}万`}
                unit="円"
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(value: number) => [formatYen(value), '累計収支']}
                contentStyle={{ border: '1px solid #e7e5e4', borderRadius: '8px', fontSize: '12px' }}
              />
              <ReferenceLine
                y={0}
                stroke="#ea580c"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{ value: '回収ライン', position: 'insideTopRight', fontSize: 10, fill: '#ea580c' }}
              />
              <Line
                type="monotone"
                dataKey="累計収支"
                stroke="#0f766e"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4, fill: '#0f766e' }}
              />
            </LineChart>
          </ResponsiveContainer>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="rounded-lg p-4 bg-stone-50 border border-stone-200 text-center">
              <div className="text-xs text-stone-500 mb-1">15年間 累計経済効果</div>
              <div className={`text-2xl font-bold ${result.effect15Year >= 0 ? 'text-primary-700' : 'text-red-600'}`}>
                {result.effect15Year >= 0 ? '+' : ''}{result.effect15Year.toLocaleString('ja-JP')} <span className="text-sm font-normal text-stone-500">円</span>
              </div>
              <div className="text-xs text-stone-400 mt-1">初期投資 {(result.totalInitialCost / 10000).toFixed(0)}万円 含む</div>
            </div>
            <div className="rounded-lg p-4 bg-primary-50 border border-primary-200 text-center">
              <div className="text-xs text-primary-600 mb-1">20年間 累計経済効果</div>
              <div className={`text-2xl font-bold ${result.effect20Year >= 0 ? 'text-primary-700' : 'text-red-600'}`}>
                {result.effect20Year >= 0 ? '+' : ''}{result.effect20Year.toLocaleString('ja-JP')} <span className="text-sm font-normal text-stone-500">円</span>
              </div>
              <div className="text-xs text-primary-500 mt-1">初期投資 {(result.totalInitialCost / 10000).toFixed(0)}万円 含む</div>
            </div>
          </div>
        </div>

        {/* Save */}
        {user && (
          <div className="card mb-8 border-primary-200 bg-primary-50">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-base font-bold text-primary-800 mb-1 flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                    <polyline points="17 21 17 13 7 13 7 21"/>
                    <polyline points="7 3 7 8 15 8"/>
                  </svg>
                  このシミュレーションを保存
                </h2>
                <p className="text-xs text-primary-600">マイページからいつでも確認できます</p>
              </div>
              <div className="flex items-center gap-3">
                {saveDone ? (
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-primary-700">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                    保存済み
                  </span>
                ) : (
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="btn-primary text-sm py-2 px-5"
                  >
                    {isSaving ? '保存中...' : '結果を保存'}
                  </button>
                )}
              </div>
            </div>
            {saveError && <p className="text-xs text-red-600 mt-2">{saveError}</p>}
          </div>
        )}

        {/* Export */}
        <div className="card mb-8">
          <h2 className="text-base font-bold text-stone-700 mb-4 flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            レポート出力
          </h2>
          <div className="flex flex-wrap gap-3">
            <button onClick={handleExportPdf} disabled={isExportingPdf} className="btn-export">
              {isExportingPdf ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                  PDF生成中...
                </>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                  </svg>
                  PDFレポート出力
                </>
              )}
            </button>
            <button onClick={() => downloadMonthlyCsv(input, result!)} className="btn-export">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              月別CSV
            </button>
            <button onClick={() => downloadYearlyCsv(input, result!)} className="btn-export">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              20年間CSV
            </button>
          </div>
          <p className="text-xs text-stone-400 mt-3">PDFは提案書として印刷・共有できます。CSVはExcelで開けます（UTF-8 BOM付き）。</p>
        </div>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-10">
          <button onClick={() => navigate('/details')} className="btn-primary">
            詳細データを見る
            <svg className="ml-2 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
          <button onClick={() => navigate('/simulate')} className="btn-secondary">
            条件を変更する
          </button>
          <button onClick={() => navigate('/')} className="btn-ghost">
            最初からやり直す
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
