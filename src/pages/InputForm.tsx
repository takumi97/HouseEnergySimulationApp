import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import StepIndicator from '../components/StepIndicator';
import { useSimulation } from '../context/SimulationContext';
import { runSimulation, REGIONS, DIRECTIONS, ANGLES } from '../utils/calculations';
import { supabase, ElectricityPlan } from '../lib/supabase';
import { batteryMakers, getModelsByMaker } from '../data/batteryProducts';

const STEP_LABELS = ['地域・家族情報', '電気代情報', '太陽光設定', '蓄電池設定'];

const PREFECTURES_BY_REGION: Record<string, string[]> = {
  '北海道': ['北海道'],
  '東北': ['青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県'],
  '関東': ['茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県', '山梨県'],
  '中部': ['長野県', '静岡県', '愛知県', '岐阜県', '三重県'],
  '北陸': ['新潟県', '富山県', '石川県', '福井県'],
  '近畿': ['滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県'],
  '中国': ['鳥取県', '島根県', '岡山県', '広島県', '山口県'],
  '四国': ['徳島県', '香川県', '愛媛県', '高知県'],
  '九州': ['福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県'],
  '沖縄': ['沖縄県'],
};

const MANUAL_RATE_KEY = '__manual__';

function SectionTitle({ step, title }: { step: number; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-8 pb-5 border-b border-stone-100">
      <div className="w-8 h-8 rounded-full bg-primary-700 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
        {step}
      </div>
      <h2 className="text-xl font-bold text-stone-900">{title}</h2>
    </div>
  );
}

export default function InputForm() {
  const navigate = useNavigate();
  const { input, setInput, setResult, setCurrentStep } = useSimulation();
  const [step, setStep] = useState(1);
  const [plans, setPlans] = useState<ElectricityPlan[]>([]);
  const [isManualRate, setIsManualRate] = useState(false);

  useEffect(() => {
    async function fetchPlans() {
      const { data } = await supabase
        .from('electricity_plans')
        .select('*')
        .eq('region', input.region)
        .eq('is_active', true)
        .order('provider_name');
      if (data) setPlans(data as ElectricityPlan[]);
    }
    fetchPlans();
  }, [input.region]);

  const providers = [...new Set(plans.map(p => p.provider_name))];
  const filteredPlans = plans.filter(p => p.provider_name === input.electricCompany);

  const updateInput = (fields: Partial<typeof input>) => {
    setInput(prev => ({ ...prev, ...fields }));
  };

  const handleNext = () => {
    setStep(s => s + 1);
    setCurrentStep(step + 1);
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    setStep(s => s - 1);
    setCurrentStep(step - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = () => {
    const result = runSimulation(input);
    setResult(result);
    navigate('/results');
  };

  const estimatedAnnualConsumption = Math.max(((input.monthlyElectricCost - 1000) / 30), 100) * 12;

  // Battery maker/model helpers
  const selectedMakerIsManual = input.batteryMaker === '' || input.batteryMaker === 'その他（手動入力）';
  const modelsForMaker = selectedMakerIsManual ? [] : getModelsByMaker(input.batteryMaker);

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <Header />
      <main className="flex-1 max-w-xl mx-auto w-full px-4 py-10">
        {/* Step header */}
        <div className="mb-10">
          <h1 className="text-xl font-bold text-stone-900 mb-6 text-center">シミュレーション入力</h1>
          <StepIndicator currentStep={step} totalSteps={4} steps={STEP_LABELS} />
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="card">
            <SectionTitle step={1} title="地域・家族情報" />
            <div className="space-y-6">

              <div>
                <label className="label">地域 <span className="text-accent-600">*</span></label>
                <select
                  className="select-field"
                  value={input.region}
                  onChange={e => {
                    const region = e.target.value;
                    const prefectures = PREFECTURES_BY_REGION[region] || [];
                    updateInput({ region, prefecture: prefectures[0] || '' });
                  }}
                >
                  {REGIONS.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                <p className="help-text">発電量の計算に使用します</p>
              </div>

              <div>
                <label className="label">都道府県 <span className="text-accent-600">*</span></label>
                <select
                  className="select-field"
                  value={input.prefecture}
                  onChange={e => updateInput({ prefecture: e.target.value })}
                >
                  {(PREFECTURES_BY_REGION[input.region] || []).map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">家族人数 <span className="text-accent-600">*</span></label>
                <select
                  className="select-field"
                  value={input.familySize}
                  onChange={e => updateInput({ familySize: Number(e.target.value) })}
                >
                  {[1, 2, 3, 4, 5, 6].map(n => (
                    <option key={n} value={n}>{n === 6 ? '6人以上' : `${n}人`}</option>
                  ))}
                </select>
                <p className="help-text">消費電力量の目安計算に使用します</p>
              </div>

              <div>
                <label className="label">生活スタイル</label>
                <div className="space-y-2">
                  {[
                    { value: 'daytime', label: '日中在宅が多い', desc: '主婦・テレワーク等' },
                    { value: 'evening', label: '夕方以降在宅', desc: '共働き・学生等' },
                    { value: 'normal', label: '通常', desc: '標準的な生活スタイル' },
                  ].map(opt => (
                    <label key={opt.value} className={`flex items-start gap-3 cursor-pointer p-4 rounded-lg border transition-colors ${
                      input.lifestyle === opt.value
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}>
                      <input
                        type="radio"
                        name="lifestyle"
                        value={opt.value}
                        checked={input.lifestyle === opt.value}
                        onChange={() => updateInput({ lifestyle: opt.value as typeof input.lifestyle })}
                        className="mt-0.5 accent-primary-700 w-4 h-4 flex-shrink-0"
                      />
                      <div>
                        <div className="font-semibold text-stone-800 text-sm">{opt.label}</div>
                        <div className="text-xs text-stone-500">{opt.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
                <p className="help-text">自家消費率の計算に使用します</p>
              </div>

              <div>
                <label className="label">オール電化</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: true, label: 'あり', desc: 'IH・エコキュート等' },
                    { value: false, label: 'なし', desc: 'ガス使用' },
                  ].map(opt => (
                    <label key={String(opt.value)} className={`flex items-start gap-3 cursor-pointer p-4 rounded-lg border transition-colors ${
                      input.hasAllElectric === opt.value
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}>
                      <input
                        type="radio"
                        name="hasAllElectric"
                        checked={input.hasAllElectric === opt.value}
                        onChange={() => updateInput({ hasAllElectric: opt.value })}
                        className="mt-0.5 accent-primary-700 w-4 h-4 flex-shrink-0"
                      />
                      <div>
                        <div className="font-semibold text-stone-800 text-sm">{opt.label}</div>
                        <div className="text-xs text-stone-500">{opt.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-10 flex justify-end">
              <button onClick={handleNext} className="btn-primary">
                次へ
                <svg className="ml-2 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="card">
            <SectionTitle step={2} title="現在の電気代情報" />
            <div className="space-y-6">

              <div>
                <label className="label">月々の電気代平均 <span className="text-accent-600">*</span></label>
                <div className="relative">
                  <input
                    type="number"
                    className="input-field pr-10"
                    value={input.monthlyElectricCost}
                    min={1000}
                    max={100000}
                    step={500}
                    onChange={e => updateInput({ monthlyElectricCost: Number(e.target.value) })}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 text-sm">円</span>
                </div>
                <p className="help-text">直近12ヶ月の平均値を入力してください。電気代明細やアプリで確認できます。</p>
              </div>

              <div className="bg-primary-50 rounded-lg p-4 border border-primary-200">
                <div className="text-xs font-semibold text-primary-700 mb-2">推定年間消費電力量</div>
                <div className="text-2xl font-bold text-stone-900">
                  約 {Math.round(estimatedAnnualConsumption).toLocaleString('ja-JP')} <span className="text-base font-medium text-stone-500">kWh/年</span>
                </div>
                <div className="text-xs text-stone-500 mt-1">
                  月平均 約 {Math.round(estimatedAnnualConsumption / 12).toLocaleString('ja-JP')} kWh/月
                </div>
              </div>

              <div>
                <label className="label">電力会社 <span className="text-stone-400 font-normal text-xs">（任意）</span></label>
                {providers.length > 0 ? (
                  <select
                    className="select-field"
                    value={isManualRate ? MANUAL_RATE_KEY : input.electricCompany}
                    onChange={e => {
                      if (e.target.value === MANUAL_RATE_KEY) {
                        setIsManualRate(true);
                        updateInput({ electricCompany: '', electricPlan: '', electricityRate: undefined });
                      } else {
                        setIsManualRate(false);
                        updateInput({ electricCompany: e.target.value, electricPlan: '', electricityRate: undefined });
                      }
                    }}
                  >
                    <option value="">選択してください</option>
                    {providers.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                    <option value={MANUAL_RATE_KEY}>プランなし（単価を手動入力）</option>
                  </select>
                ) : (
                  <select
                    className="select-field"
                    value={isManualRate ? MANUAL_RATE_KEY : ''}
                    onChange={e => {
                      if (e.target.value === MANUAL_RATE_KEY) {
                        setIsManualRate(true);
                        updateInput({ electricCompany: '', electricPlan: '', electricityRate: undefined });
                      } else {
                        setIsManualRate(false);
                      }
                    }}
                  >
                    <option value="">電力会社を入力 または 単価を手動入力</option>
                    <option value={MANUAL_RATE_KEY}>プランなし（単価を手動入力）</option>
                  </select>
                )}
                {!isManualRate && providers.length === 0 && (
                  <input
                    type="text"
                    className="input-field mt-2"
                    value={input.electricCompany}
                    placeholder="例：東京電力、関西電力"
                    onChange={e => updateInput({ electricCompany: e.target.value })}
                  />
                )}
              </div>

              {isManualRate ? (
                <div>
                  <label className="label">電気料金単価 <span className="text-accent-600">*</span></label>
                  <div className="relative">
                    <input
                      type="number"
                      className="input-field pr-20"
                      value={input.electricityRate ?? ''}
                      min={0}
                      step={0.01}
                      placeholder="30"
                      onChange={e => updateInput({ electricityRate: e.target.value === '' ? undefined : Number(e.target.value) })}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 text-sm pointer-events-none">円/kWh</span>
                  </div>
                  <p className="help-text">電気の買電単価を入力してください（検針票に記載があります）</p>
                </div>
              ) : (
                <div>
                  <label className="label">料金プラン <span className="text-stone-400 font-normal text-xs">（任意）</span></label>
                  {filteredPlans.length > 0 ? (
                    <>
                      <select
                        className="select-field"
                        value={input.electricPlan}
                        onChange={e => {
                          const plan = filteredPlans.find(p => p.plan_name === e.target.value);
                          updateInput({
                            electricPlan: e.target.value,
                            electricityRate: plan?.rate_per_kwh,
                          });
                        }}
                      >
                        <option value="">選択してください</option>
                        {filteredPlans.map(p => (
                          <option key={p.id} value={p.plan_name}>{p.plan_name}</option>
                        ))}
                      </select>
                      {input.electricityRate && (
                        <p className="help-text text-primary-600 font-medium">
                          単価 {input.electricityRate}円/kWh で計算します
                        </p>
                      )}
                    </>
                  ) : (
                    <input
                      type="text"
                      className="input-field"
                      value={input.electricPlan}
                      placeholder="例：従量電灯B、スマートライフ"
                      onChange={e => updateInput({ electricPlan: e.target.value })}
                    />
                  )}
                </div>
              )}

              <div className="bg-stone-50 rounded-lg p-4 border border-stone-200 text-sm text-stone-600">
                <p className="font-semibold text-stone-700 mb-2 text-xs uppercase tracking-wider">計算上の前提条件</p>
                <ul className="space-y-1 text-sm text-stone-500">
                  <li>電力購入単価：{input.electricityRate ? `${input.electricityRate}円/kWh（入力値）` : '30円/kWh（全国平均目安）'}</li>
                  <li>基本料金：1,000円/月（目安）</li>
                  <li>FIT売電価格：16円/kWh（2024年度）</li>
                </ul>
              </div>
            </div>

            <div className="mt-10 flex justify-between">
              <button onClick={handleBack} className="btn-ghost">
                <svg className="mr-2 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                戻る
              </button>
              <button onClick={handleNext} className="btn-primary">
                次へ
                <svg className="ml-2 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="card">
            <SectionTitle step={3} title="太陽光パネル設定" />
            <div className="space-y-6">

              <div>
                <label className="label">設置容量 <span className="text-accent-600">*</span></label>
                <div className="relative">
                  <input
                    type="number"
                    className="input-field pr-12"
                    value={input.solarCapacity || ''}
                    min={1.0}
                    max={20.0}
                    step={0.1}
                    placeholder="5.5"
                    onChange={e => updateInput({ solarCapacity: Number(e.target.value) })}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 text-sm pointer-events-none">kW</span>
                </div>
                <p className="help-text">設置するパネルの合計容量を入力してください（例: 5.5kW）。一般的な住宅では3〜10kWが多いです。</p>
              </div>

              <div>
                <label className="label">屋根の向き <span className="text-accent-600">*</span></label>
                <div className="grid grid-cols-4 gap-2">
                  {DIRECTIONS.map(dir => (
                    <button
                      key={dir}
                      type="button"
                      onClick={() => updateInput({ roofDirection: dir })}
                      className={`py-2.5 px-2 rounded-lg border text-sm font-semibold transition-colors ${
                        input.roofDirection === dir
                          ? 'bg-primary-700 border-primary-700 text-white'
                          : 'bg-white border-stone-200 text-stone-700 hover:border-primary-300'
                      }`}
                    >
                      {dir}
                    </button>
                  ))}
                </div>
                <p className="help-text">南向きが最も発電効率が高くなります</p>
              </div>

              <div>
                <label className="label">屋根の傾斜角 <span className="text-accent-600">*</span></label>
                <div className="grid grid-cols-5 gap-2">
                  {ANGLES.map(angle => (
                    <button
                      key={angle}
                      type="button"
                      onClick={() => updateInput({ roofAngle: angle })}
                      className={`py-2.5 px-1 rounded-lg border text-sm font-semibold transition-colors ${
                        input.roofAngle === angle
                          ? 'bg-primary-700 border-primary-700 text-white'
                          : 'bg-white border-stone-200 text-stone-700 hover:border-primary-300'
                      }`}
                    >
                      {angle}°
                    </button>
                  ))}
                </div>
                <p className="help-text">30°が最も効率的です。わからない場合は30°を選択してください。</p>
              </div>

              <div>
                <label className="label">太陽光パネル初期費用（税込） <span className="text-stone-400 font-normal text-xs">（任意）</span></label>
                <div className="relative">
                  <input
                    type="number"
                    className="input-field pr-10"
                    value={input.solarCost !== undefined ? input.solarCost : ''}
                    min={0}
                    step={10000}
                    placeholder="1500000"
                    onChange={e => updateInput({ solarCost: e.target.value === '' ? undefined : Number(e.target.value) })}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 text-sm pointer-events-none">円</span>
                </div>
                <p className="help-text">
                  パネル・工事費の総額を入力してください。補助金適用後の実質負担額でもOKです。
                  {input.solarCost === undefined && (
                    <span className="block mt-1">未入力の場合：{input.solarCapacity.toFixed(1)}kW × 20万円/kW ＝ 約{(input.solarCapacity * 20).toFixed(0)}万円で計算</span>
                  )}
                </p>
              </div>

              <div className="bg-primary-50 rounded-lg p-4 border border-primary-200">
                <div className="text-xs font-semibold text-primary-700 mb-2">推定年間発電量</div>
                <div className="text-2xl font-bold text-stone-900">
                  約 {Math.round(input.solarCapacity * 1320 * (input.roofDirection === '南' ? 1.0 : input.roofDirection === '南東' || input.roofDirection === '南西' ? 0.95 : 0.87)).toLocaleString('ja-JP')} <span className="text-base font-medium text-stone-500">kWh/年</span>
                </div>
                <div className="text-xs text-stone-500 mt-1">※ 実際の計算では地域係数を使用します</div>
              </div>
            </div>

            <div className="mt-10 flex justify-between">
              <button onClick={handleBack} className="btn-ghost">
                <svg className="mr-2 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                戻る
              </button>
              <button onClick={handleNext} className="btn-primary">
                次へ
                <svg className="ml-2 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Step 4 */}
        {step === 4 && (
          <div className="card">
            <SectionTitle step={4} title="蓄電池設定" />
            <div className="space-y-6">

              <div>
                <label className="label">蓄電池の導入 <span className="text-accent-600">*</span></label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: true, label: '蓄電池あり', desc: '自家消費率がさらに向上' },
                    { value: false, label: '蓄電池なし', desc: '太陽光発電のみ' },
                  ].map(opt => (
                    <label key={String(opt.value)} className={`flex items-start gap-3 cursor-pointer p-4 rounded-lg border transition-colors ${
                      input.hasBattery === opt.value
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}>
                      <input
                        type="radio"
                        name="hasBattery"
                        checked={input.hasBattery === opt.value}
                        onChange={() => updateInput({ hasBattery: opt.value })}
                        className="mt-0.5 accent-primary-700 w-4 h-4 flex-shrink-0"
                      />
                      <div>
                        <div className="font-semibold text-stone-800 text-sm">{opt.label}</div>
                        <div className="text-xs text-stone-500">{opt.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {input.hasBattery && (
                <>
                  <div>
                    <label className="label">メーカー <span className="text-stone-400 font-normal text-xs">（任意）</span></label>
                    <select
                      className="select-field"
                      value={input.batteryMaker || 'その他（手動入力）'}
                      onChange={e => {
                        const maker = e.target.value === 'その他（手動入力）' ? '' : e.target.value;
                        updateInput({ batteryMaker: maker, batteryModel: '' });
                      }}
                    >
                      {batteryMakers.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>

                  {!selectedMakerIsManual && (
                    <div>
                      <label className="label">型番 <span className="text-stone-400 font-normal text-xs">（任意）</span></label>
                      <select
                        className="select-field"
                        value={input.batteryModel}
                        onChange={e => {
                          const model = modelsForMaker.find(m => m.model === e.target.value);
                          updateInput({
                            batteryModel: e.target.value,
                            batteryCapacity: model ? model.capacity : input.batteryCapacity,
                          });
                        }}
                      >
                        <option value="">選択してください</option>
                        {modelsForMaker.map(m => (
                          <option key={m.model} value={m.model}>{m.model}（{m.capacity}kWh・{m.type}）</option>
                        ))}
                      </select>
                      {input.batteryModel && (
                        <p className="help-text text-primary-600 font-medium">
                          容量 {input.batteryCapacity}kWh で計算します
                        </p>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="label">蓄電池容量 <span className="text-accent-600">*</span></label>
                    <div className="relative">
                      <input
                        type="number"
                        className="input-field pr-14"
                        value={input.batteryCapacity || ''}
                        min={0.1}
                        max={30.0}
                        step={0.1}
                        placeholder="9.8"
                        onChange={e => updateInput({ batteryCapacity: Number(e.target.value) })}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 text-sm pointer-events-none">kWh</span>
                    </div>
                    <p className="help-text">
                      {selectedMakerIsManual
                        ? '蓄電池の容量を入力してください（例: 9.8kWh）。一般家庭では7〜10kWhが標準的です。'
                        : '型番を選択すると自動入力されます。手動で変更も可能です。'}
                    </p>
                  </div>

                  <div className="bg-stone-50 rounded-lg p-4 border border-stone-200 text-sm">
                    <p className="font-semibold text-stone-700 mb-3 text-xs uppercase tracking-wider">容量と自家消費率の目安</p>
                    <div className="space-y-2">
                      {[
                        { range: '蓄電池なし', rate: '約30%' },
                        { range: '〜5kWh', rate: '約50%' },
                        { range: '5〜10kWh', rate: '約62%' },
                        { range: '10kWh以上', rate: '約70%' },
                      ].map(item => (
                        <div key={item.range} className="flex justify-between text-stone-600">
                          <span>{item.range}</span>
                          <span className="font-medium text-stone-700">{item.rate}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="label">蓄電池初期費用（税込） <span className="text-stone-400 font-normal text-xs">（任意）</span></label>
                    <div className="relative">
                      <input
                        type="number"
                        className="input-field pr-10"
                        value={input.batteryCost !== undefined ? input.batteryCost : ''}
                        min={0}
                        step={10000}
                        placeholder="1500000"
                        onChange={e => updateInput({ batteryCost: e.target.value === '' ? undefined : Number(e.target.value) })}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 text-sm pointer-events-none">円</span>
                    </div>
                    <p className="help-text">
                      蓄電池・工事費の総額を入力してください。補助金適用後の実質負担額でもOKです。
                      {input.batteryCost === undefined && (
                        <span className="block mt-1">未入力の場合：{input.batteryCapacity.toFixed(1)}kWh × 15万円/kWh ＝ 約{(input.batteryCapacity * 15).toFixed(0)}万円で計算</span>
                      )}
                    </p>
                  </div>
                </>
              )}

              {/* Input Summary */}
              <div className="bg-stone-50 rounded-lg p-4 border border-stone-200">
                <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">入力内容の確認</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  <div className="flex justify-between gap-2">
                    <span className="text-stone-500">地域</span>
                    <span className="font-semibold text-stone-800">{input.region}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-stone-500">都道府県</span>
                    <span className="font-semibold text-stone-800">{input.prefecture}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-stone-500">家族人数</span>
                    <span className="font-semibold text-stone-800">{input.familySize}人</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-stone-500">電気代</span>
                    <span className="font-semibold text-stone-800">{input.monthlyElectricCost.toLocaleString('ja-JP')}円/月</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-stone-500">パネル容量</span>
                    <span className="font-semibold text-stone-800">{input.solarCapacity}kW</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-stone-500">屋根方位・角度</span>
                    <span className="font-semibold text-stone-800">{input.roofDirection} {input.roofAngle}°</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 flex justify-between">
              <button onClick={handleBack} className="btn-ghost">
                <svg className="mr-2 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                戻る
              </button>
              <button onClick={handleSubmit} className="btn-primary py-3 px-8">
                シミュレーション実行
                <svg className="ml-2 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
