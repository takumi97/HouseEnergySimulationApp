import { SimulationInput, SimulationResult } from '../types';

const BOM = '\uFEFF';

function downloadCsv(content: string, filename: string): void {
  const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function dateStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function downloadMonthlyCsv(input: SimulationInput, result: SimulationResult): void {
  const headers = [
    '月',
    '発電量(kWh)',
    '消費電力(kWh)',
    '自家消費(kWh)',
    '余剰売電(kWh)',
    '売電収入(円)',
    '電気代削減(円)',
    '導入前電気代(円)',
    '導入後電気代(円)',
    '月間節約(円)',
  ];

  const rows = result.monthlyData.map(d => [
    d.monthName,
    d.generation,
    d.consumption,
    d.selfConsumption,
    d.surplus,
    d.fitIncome,
    d.electricitySaving,
    d.electricityCostBefore,
    d.electricityCostAfter,
    d.totalSaving,
  ]);

  const totals = [
    '年計',
    result.monthlyData.reduce((s, d) => s + d.generation, 0),
    result.monthlyData.reduce((s, d) => s + d.consumption, 0),
    result.monthlyData.reduce((s, d) => s + d.selfConsumption, 0),
    result.monthlyData.reduce((s, d) => s + d.surplus, 0),
    result.monthlyData.reduce((s, d) => s + d.fitIncome, 0),
    result.monthlyData.reduce((s, d) => s + d.electricitySaving, 0),
    result.monthlyData.reduce((s, d) => s + d.electricityCostBefore, 0),
    result.monthlyData.reduce((s, d) => s + d.electricityCostAfter, 0),
    result.monthlyData.reduce((s, d) => s + d.totalSaving, 0),
  ];

  const meta = [
    `# 太陽光・蓄電池 導入シミュレーション 月別データ`,
    `# 作成日: ${new Date().toLocaleDateString('ja-JP')}`,
    `# 設置地域: ${input.prefecture} / パネル容量: ${input.solarCapacity}kW / 蓄電池: ${input.hasBattery ? input.batteryCapacity + 'kWh' : 'なし'}`,
    ``,
  ];

  const csvBody = [
    ...meta,
    headers.join(','),
    ...rows.map(r => r.join(',')),
    totals.join(','),
  ].join('\n');

  downloadCsv(csvBody, `solar_monthly_${dateStr()}.csv`);
}

export function downloadYearlyCsv(input: SimulationInput, result: SimulationResult): void {
  const headers = ['年度', '年間経済効果(円)', '累計経済効果(円)', '累計収支(円)', '備考'];

  const rows = result.longTermData.map(d => {
    let note = '';
    if (d.year === result.paybackYears) note = '投資回収完了';
    else if (d.year === 15) note = '15年目';
    else if (d.year === 20) note = '20年目';
    return [`${d.year}年目`, d.annualEffect, d.cumulativeEffect, d.cumulativeCost, note];
  });

  const meta = [
    `# 太陽光・蓄電池 導入シミュレーション 20年間長期データ`,
    `# 作成日: ${new Date().toLocaleDateString('ja-JP')}`,
    `# 設置地域: ${input.prefecture} / パネル容量: ${input.solarCapacity}kW / 初期費用: ${(result.totalInitialCost / 10000).toFixed(1)}万円`,
    `# パネル経年劣化: 0.5%/年 / 電気代上昇率: 1.5%/年`,
    ``,
  ];

  const csvBody = [
    ...meta,
    headers.join(','),
    ...rows.map(r => r.join(',')),
  ].join('\n');

  downloadCsv(csvBody, `solar_yearly_${dateStr()}.csv`);
}
