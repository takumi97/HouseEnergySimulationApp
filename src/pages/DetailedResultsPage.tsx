import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useSimulation } from '../context/SimulationContext';
import { exportPdf } from '../utils/exportPdf';
import { downloadMonthlyCsv, downloadYearlyCsv } from '../utils/exportCsv';

export default function DetailedResultsPage() {
  const navigate = useNavigate();
  const { result, input } = useSimulation();
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  useEffect(() => {
    if (!result) {
      navigate('/input');
    }
  }, [result, navigate]);

  if (!result) return null;

  async function handleExportPdf() {
    setIsExportingPdf(true);
    try {
      await exportPdf(input, result!);
    } finally {
      setIsExportingPdf(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-12">

        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-stone-900 mb-3">詳細シミュレーションデータ</h1>
          <p className="text-sm text-stone-500">
            {input.prefecture} / {input.solarCapacity}kW / {input.roofDirection}向き {input.roofAngle}° / 月々電気代 {input.monthlyElectricCost.toLocaleString('ja-JP')}円
            {input.hasBattery ? ` / 蓄電池 ${input.batteryCapacity}kWh` : ''}
          </p>
        </div>

        {/* Monthly Table */}
        <div className="card mb-8">
          <h2 className="text-lg font-bold text-stone-900 mb-6 flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0f766e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4"/>
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
            </svg>
            月別詳細データ
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-max">
              <thead>
                <tr className="bg-stone-800 text-white">
                  <th className="py-3 px-3 text-center font-semibold rounded-tl-lg">月</th>
                  <th className="py-3 px-3 text-right font-semibold">発電量<br /><span className="font-normal text-stone-400 text-xs">kWh</span></th>
                  <th className="py-3 px-3 text-right font-semibold">消費電力<br /><span className="font-normal text-stone-400 text-xs">kWh</span></th>
                  <th className="py-3 px-3 text-right font-semibold">自家消費<br /><span className="font-normal text-stone-400 text-xs">kWh</span></th>
                  <th className="py-3 px-3 text-right font-semibold">余剰電力<br /><span className="font-normal text-stone-400 text-xs">kWh</span></th>
                  <th className="py-3 px-3 text-right font-semibold">売電収入<br /><span className="font-normal text-stone-400 text-xs">円</span></th>
                  <th className="py-3 px-3 text-right font-semibold">電気代削減<br /><span className="font-normal text-stone-400 text-xs">円</span></th>
                  <th className="py-3 px-3 text-right font-semibold">導入前<br /><span className="font-normal text-stone-400 text-xs">円</span></th>
                  <th className="py-3 px-3 text-right font-semibold">導入後<br /><span className="font-normal text-stone-400 text-xs">円</span></th>
                  <th className="py-3 px-3 text-right font-semibold rounded-tr-lg">月間節約<br /><span className="font-normal text-stone-400 text-xs">円</span></th>
                </tr>
              </thead>
              <tbody>
                {result.monthlyData.map((d, i) => (
                  <tr
                    key={d.month}
                    className={`border-b border-stone-100 transition-colors hover:bg-primary-50 ${i % 2 === 0 ? 'bg-white' : 'bg-stone-50'}`}
                  >
                    <td className="py-3 px-3 text-center font-semibold text-stone-700">{d.monthName}</td>
                    <td className="py-3 px-3 text-right text-primary-700 font-medium">{d.generation.toLocaleString('ja-JP')}</td>
                    <td className="py-3 px-3 text-right text-stone-600">{d.consumption.toLocaleString('ja-JP')}</td>
                    <td className="py-3 px-3 text-right text-stone-600">{d.selfConsumption.toLocaleString('ja-JP')}</td>
                    <td className="py-3 px-3 text-right text-stone-500">{d.surplus.toLocaleString('ja-JP')}</td>
                    <td className="py-3 px-3 text-right text-stone-700">{d.fitIncome.toLocaleString('ja-JP')}</td>
                    <td className="py-3 px-3 text-right text-stone-700">{d.electricitySaving.toLocaleString('ja-JP')}</td>
                    <td className="py-3 px-3 text-right text-stone-500">{d.electricityCostBefore.toLocaleString('ja-JP')}</td>
                    <td className="py-3 px-3 text-right text-stone-600">{d.electricityCostAfter.toLocaleString('ja-JP')}</td>
                    <td className="py-3 px-3 text-right font-bold text-primary-700">{d.totalSaving.toLocaleString('ja-JP')}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-stone-100 font-bold border-t-2 border-stone-300">
                  <td className="py-3 px-3 text-center text-stone-700 text-xs font-bold">年計</td>
                  <td className="py-3 px-3 text-right text-primary-700">
                    {result.monthlyData.reduce((s, d) => s + d.generation, 0).toLocaleString('ja-JP')}
                  </td>
                  <td className="py-3 px-3 text-right text-stone-700">
                    {result.monthlyData.reduce((s, d) => s + d.consumption, 0).toLocaleString('ja-JP')}
                  </td>
                  <td className="py-3 px-3 text-right text-stone-700">
                    {result.monthlyData.reduce((s, d) => s + d.selfConsumption, 0).toLocaleString('ja-JP')}
                  </td>
                  <td className="py-3 px-3 text-right text-stone-700">
                    {result.monthlyData.reduce((s, d) => s + d.surplus, 0).toLocaleString('ja-JP')}
                  </td>
                  <td className="py-3 px-3 text-right text-stone-700">
                    {result.monthlyData.reduce((s, d) => s + d.fitIncome, 0).toLocaleString('ja-JP')}
                  </td>
                  <td className="py-3 px-3 text-right text-stone-700">
                    {result.monthlyData.reduce((s, d) => s + d.electricitySaving, 0).toLocaleString('ja-JP')}
                  </td>
                  <td className="py-3 px-3 text-right text-stone-600">
                    {result.monthlyData.reduce((s, d) => s + d.electricityCostBefore, 0).toLocaleString('ja-JP')}
                  </td>
                  <td className="py-3 px-3 text-right text-stone-600">
                    {result.monthlyData.reduce((s, d) => s + d.electricityCostAfter, 0).toLocaleString('ja-JP')}
                  </td>
                  <td className="py-3 px-3 text-right text-primary-700">
                    {result.monthlyData.reduce((s, d) => s + d.totalSaving, 0).toLocaleString('ja-JP')}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Long-term Table */}
        <div className="card mb-8">
          <div className="flex items-start justify-between mb-2">
            <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0f766e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
              20年間 長期シミュレーション
            </h2>
          </div>
          <p className="text-sm text-stone-500 mb-1">
            パネル経年劣化（0.5%/年）・電気代上昇（1.5%/年）を考慮
          </p>
          <p className="text-sm text-stone-500 mb-6">
            投資回収年数：約 <span className="font-bold text-primary-700">{result.paybackYears}年目</span>
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-stone-800 text-white">
                  <th className="py-3 px-4 text-center font-semibold rounded-tl-lg">年度</th>
                  <th className="py-3 px-4 text-right font-semibold">年間経済効果<span className="block font-normal text-stone-400 text-xs">円</span></th>
                  <th className="py-3 px-4 text-right font-semibold">累計経済効果<span className="block font-normal text-stone-400 text-xs">円</span></th>
                  <th className="py-3 px-4 text-right font-semibold rounded-tr-lg">累計収支<span className="block font-normal text-stone-400 text-xs">円</span></th>
                </tr>
              </thead>
              <tbody>
                {result.longTermData.map((d, i) => {
                  const isPayback = d.year === result.paybackYears;
                  const is15 = d.year === 15;
                  const is20 = d.year === 20;
                  return (
                    <tr
                      key={d.year}
                      className={`border-b border-stone-100 transition-colors ${
                        isPayback
                          ? 'bg-accent-50 border-accent-200'
                          : is15 || is20
                          ? 'bg-primary-50'
                          : i % 2 === 0
                          ? 'bg-white'
                          : 'bg-stone-50'
                      } hover:bg-primary-50`}
                    >
                      <td className="py-3 px-4 text-center">
                        <span className={`font-semibold ${isPayback ? 'text-accent-700' : is15 || is20 ? 'text-primary-700' : 'text-stone-700'}`}>
                          {d.year}年目
                        </span>
                        {isPayback && (
                          <span className="ml-2 bg-accent-600 text-white text-xs px-2 py-0.5 rounded-full">回収完了</span>
                        )}
                        {is15 && !isPayback && (
                          <span className="ml-2 bg-primary-700 text-white text-xs px-2 py-0.5 rounded-full">15年</span>
                        )}
                        {is20 && !isPayback && (
                          <span className="ml-2 bg-primary-700 text-white text-xs px-2 py-0.5 rounded-full">20年</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right text-stone-700">{d.annualEffect.toLocaleString('ja-JP')}</td>
                      <td className="py-3 px-4 text-right">
                        <span className={`font-medium ${d.cumulativeEffect >= result.totalInitialCost ? 'text-primary-700' : 'text-stone-700'}`}>
                          {d.cumulativeEffect.toLocaleString('ja-JP')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={`font-bold ${d.cumulativeCost >= 0 ? 'text-primary-700' : 'text-stone-500'}`}>
                          {d.cumulativeCost >= 0 ? '+' : ''}{d.cumulativeCost.toLocaleString('ja-JP')}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-4 space-y-1 text-xs text-stone-400">
            <p>※ 累計収支 = 累計経済効果 - 初期投資額。プラスで投資回収完了。</p>
            <p>※ 累計経済効果 = 初期投資を考慮せず、発電効果の累計。</p>
          </div>
        </div>

        {/* Input Parameters */}
        <div className="card mb-8">
          <h2 className="text-lg font-bold text-stone-900 mb-6 flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#78716c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            入力パラメーター一覧
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-4 pb-2 border-b border-stone-100">基本情報</h3>
              <dl className="space-y-3 text-sm">
                {[
                  { label: '地域', value: input.region },
                  { label: '都道府県', value: input.prefecture },
                  { label: '家族人数', value: `${input.familySize}人` },
                  { label: '生活スタイル', value: input.lifestyle === 'daytime' ? '日中在宅' : input.lifestyle === 'evening' ? '夕方以降在宅' : '通常' },
                  { label: 'オール電化', value: input.hasAllElectric ? 'あり' : 'なし' },
                  { label: '月々電気代', value: `${input.monthlyElectricCost.toLocaleString('ja-JP')}円` },
                  { label: '電力会社', value: input.electricCompany || '未入力' },
                  { label: '料金プラン', value: input.electricPlan || '未入力' },
                ].map(item => (
                  <div key={item.label} className="flex justify-between gap-4">
                    <dt className="text-stone-500 flex-shrink-0">{item.label}</dt>
                    <dd className="font-semibold text-stone-800 text-right">{item.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-4 pb-2 border-b border-stone-100">太陽光・蓄電池設定</h3>
              <dl className="space-y-3 text-sm">
                {[
                  { label: 'パネル容量', value: `${input.solarCapacity}kW` },
                  { label: '屋根の向き', value: `${input.roofDirection}向き` },
                  { label: '屋根の傾斜角', value: `${input.roofAngle}°` },
                  { label: '太陽光初期費用', value: input.solarCost !== undefined ? `${input.solarCost.toLocaleString('ja-JP')}円（入力値）` : `${(input.solarCapacity * 20).toFixed(0)}万円（相場）` },
                  { label: '蓄電池', value: input.hasBattery ? 'あり' : 'なし' },
                  ...(input.hasBattery ? [
                    { label: '蓄電池容量', value: `${input.batteryCapacity}kWh` },
                    ...(input.batteryMaker ? [{ label: 'メーカー', value: input.batteryMaker }] : []),
                    ...(input.batteryModel ? [{ label: '型番', value: input.batteryModel }] : []),
                    { label: '蓄電池初期費用', value: input.batteryCost !== undefined ? `${input.batteryCost.toLocaleString('ja-JP')}円（入力値）` : `${(input.batteryCapacity * 15).toFixed(0)}万円（相場）` },
                  ] : []),
                ].map(item => (
                  <div key={item.label} className="flex justify-between gap-4">
                    <dt className="text-stone-500 flex-shrink-0">{item.label}</dt>
                    <dd className="font-semibold text-stone-800 text-right">{item.value}</dd>
                  </div>
                ))}
                <div className="flex justify-between gap-4 pt-3 border-t border-stone-100">
                  <dt className="font-semibold text-stone-600 flex-shrink-0">合計初期費用</dt>
                  <dd className="font-bold text-primary-700">{(result.totalInitialCost / 10000).toLocaleString('ja-JP')}万円</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="font-semibold text-stone-600 flex-shrink-0">自家消費率</dt>
                  <dd className="font-bold text-primary-700">{Math.round(result.selfConsumptionRate * 100)}%</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

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
          <button onClick={() => navigate('/results')} className="btn-primary">
            <svg className="mr-2 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            結果サマリーに戻る
          </button>
          <button onClick={() => navigate('/input')} className="btn-secondary">
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
