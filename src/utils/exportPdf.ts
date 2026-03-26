import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { SimulationInput, SimulationResult } from '../types';

// ---------------------------------------------------------------------------
// Design constants
// ---------------------------------------------------------------------------
const C = {
  primary:      '#0F766E',
  primaryLight: '#f0fdfa',
  stone900:     '#1c1917',
  stone700:     '#44403c',
  stone600:     '#57534e',
  stone500:     '#78716c',
  stone400:     '#a8a29e',
  stone200:     '#e7e5e4',
  stone100:     '#f5f5f4',
  stone50:      '#fafaf9',
  white:        '#ffffff',
};

const PAGE_W  = 794;   // A4 at 96 dpi
const PAGE_H  = 1123;
const PAD_X   = 56;
const FONT    = "'Hiragino Sans','Hiragino Kaku Gothic ProN','Yu Gothic UI','Meiryo','Noto Sans JP',sans-serif";

// ---------------------------------------------------------------------------
// Formatters
// ---------------------------------------------------------------------------
const fmt     = (v: number) => v.toLocaleString('ja-JP');
const fmtYen  = (v: number) => `${fmt(v)}円`;
const fmtWan  = (v: number) => `${(v / 10000).toFixed(1)}万円`;

// ---------------------------------------------------------------------------
// DOM helpers
// ---------------------------------------------------------------------------
function makePageDiv(html: string): HTMLDivElement {
  const div = document.createElement('div');
  div.style.cssText = [
    `width:${PAGE_W}px`,
    `height:${PAGE_H}px`,
    `font-family:${FONT}`,
    `background:${C.white}`,
    `overflow:hidden`,
    `box-sizing:border-box`,
    `position:relative`,
  ].join(';');
  div.innerHTML = html;
  return div;
}

async function captureDiv(div: HTMLDivElement): Promise<string> {
  div.style.position = 'fixed';
  div.style.top = '0';
  div.style.left = '-10000px';
  div.style.zIndex = '-9999';
  document.body.appendChild(div);

  const canvas = await html2canvas(div, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: C.white,
    width: PAGE_W,
    height: PAGE_H,
  });

  document.body.removeChild(div);
  return canvas.toDataURL('image/jpeg', 0.93);
}

// ---------------------------------------------------------------------------
// Page builders
// ---------------------------------------------------------------------------

/** Cover page */
function buildCover(input: SimulationInput, result: SimulationResult): HTMLDivElement {
  const createdDate = new Date().toLocaleDateString('ja-JP', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const condRows = [
    ['設置地域',        `${input.prefecture}（${input.region}）`],
    ['月々電気代',      `${fmt(input.monthlyElectricCost)}円`],
    ['太陽光パネル容量', `${input.solarCapacity}kW`],
    ['屋根の向き・角度', `${input.roofDirection}向き ${input.roofAngle}°`],
    ['蓄電池',          input.hasBattery ? `あり（${input.batteryCapacity}kWh）` : 'なし'],
    ['初期投資総額',     fmtWan(result.totalInitialCost)],
  ].map(([label, val]) =>
    `<tr style="border-bottom:1px solid ${C.stone200};">` +
    `<td style="padding:9px 0;color:${C.stone500};font-size:13px;width:44%;">${label}</td>` +
    `<td style="padding:9px 0;color:${C.stone900};font-size:13px;font-weight:600;text-align:right;">${val}</td>` +
    `</tr>`
  ).join('');

  const metricCards = [
    { label: '年間経済効果',   value: fmtYen(result.annualTotalEffect),              sub: '売電収入＋電気代削減' },
    { label: '投資回収年数',   value: `約${result.paybackYears}年`,                   sub: `初期費用 ${fmtWan(result.totalInitialCost)}` },
    { label: '20年間累計効果', value: fmtWan(result.effect20Year + result.totalInitialCost), sub: '発電効果の20年累計' },
  ].map(m =>
    `<div style="flex:1;border:1.5px solid ${C.primary};border-radius:10px;padding:18px 10px;text-align:center;">` +
    `<div style="font-size:10px;color:${C.stone500};margin-bottom:6px;">${m.label}</div>` +
    `<div style="font-size:19px;font-weight:700;color:${C.primary};line-height:1.25;">${m.value}</div>` +
    `<div style="font-size:10px;color:${C.stone400};margin-top:5px;">${m.sub}</div>` +
    `</div>`
  ).join('');

  const html = `
<div style="background:${C.primary};height:8px;"></div>
<div style="padding:64px ${PAD_X}px 0;height:calc(100% - 8px);box-sizing:border-box;display:flex;flex-direction:column;">
  <div style="flex:1;">
    <div style="font-size:11px;color:${C.primary};font-weight:700;letter-spacing:.12em;text-transform:uppercase;margin-bottom:16px;">
      Solar &amp; Battery · Simulation Report
    </div>
    <h1 style="font-size:34px;font-weight:800;color:${C.stone900};line-height:1.4;margin:0;">
      太陽光・蓄電池<br>導入シミュレーション<br>レポート
    </h1>
    <div style="width:60px;height:5px;background:${C.primary};border-radius:2px;margin:22px 0;"></div>
    <p style="font-size:14px;color:${C.stone500};margin:0 0 52px;">作成日：${createdDate}</p>

    <div style="background:${C.stone100};border-radius:12px;padding:26px 30px;margin-bottom:28px;">
      <h2 style="font-size:12px;font-weight:700;color:${C.stone700};margin:0 0 14px;letter-spacing:.06em;text-transform:uppercase;">
        シミュレーション条件
      </h2>
      <table style="width:100%;border-collapse:collapse;">${condRows}</table>
    </div>

    <div style="display:flex;gap:14px;">${metricCards}</div>
  </div>

  <div style="padding:18px 0;">
    <div style="border-top:1px solid ${C.stone200};padding-top:12px;">
      <span style="font-size:9px;color:${C.stone400};">
        本レポートはシミュレーション値であり、実際の効果を保証するものではありません。
      </span>
    </div>
  </div>
</div>
<div style="position:absolute;bottom:0;left:0;right:0;background:${C.primary};height:4px;"></div>
`;

  return makePageDiv(html);
}

/** Shared wrapper for content pages 1–3 */
function wrapPage(content: string, pageNum: number, totalPages: number): HTMLDivElement {
  const html = `
<div style="background:${C.primary};height:5px;"></div>
<div style="display:flex;flex-direction:column;height:calc(100% - 5px);padding:22px ${PAD_X}px 26px;box-sizing:border-box;">
  <div style="display:flex;justify-content:space-between;align-items:center;padding-bottom:12px;border-bottom:2.5px solid ${C.primary};margin-bottom:22px;flex-shrink:0;">
    <span style="font-size:10px;color:${C.primary};font-weight:700;letter-spacing:.06em;">
      太陽光・蓄電池 導入シミュレーションレポート
    </span>
    <span style="font-size:10px;color:${C.stone400};">${pageNum} / ${totalPages}</span>
  </div>
  <div style="flex:1;overflow:hidden;">${content}</div>
  <div style="flex-shrink:0;border-top:1px solid ${C.stone200};padding-top:9px;margin-top:14px;display:flex;justify-content:space-between;align-items:center;">
    <span style="font-size:9px;color:${C.stone400};">
      本シミュレーションは概算値です。実際の効果は設置環境・気象条件等により異なります。
    </span>
    <span style="font-size:9px;color:${C.stone400};">— ${pageNum} —</span>
  </div>
</div>
`;
  return makePageDiv(html);
}

/** Page 1 – Summary */
function buildSummaryPage(input: SimulationInput, result: SimulationResult): HTMLDivElement {
  const heroCards = [
    { label: '年間削減額',       value: fmtYen(result.annualTotalEffect),                         sub: '売電収入＋電気代削減', accent: true  },
    { label: '月平均削減額',     value: fmtYen(Math.round(result.annualTotalEffect / 12)),         sub: '年間効果の月平均',     accent: false },
    { label: '投資回収年数',     value: `約${result.paybackYears}年`,                               sub: `初期費用 ${fmtWan(result.totalInitialCost)}`, accent: false },
    { label: '20年間累計メリット', value: (result.effect20Year >= 0 ? '+' : '') + fmtYen(result.effect20Year), sub: '初期投資差引後の純利益', accent: true },
  ].map(item =>
    `<div style="border:1.5px solid ${item.accent ? C.primary : C.stone200};border-radius:8px;padding:13px 14px;background:${item.accent ? C.primaryLight : C.white};">` +
    `<div style="font-size:10px;color:${item.accent ? C.primary : C.stone500};margin-bottom:5px;">${item.label}</div>` +
    `<div style="font-size:21px;font-weight:700;color:${item.accent ? C.primary : C.stone900};line-height:1.2;">${item.value}</div>` +
    `<div style="font-size:10px;color:${C.stone400};margin-top:4px;">${item.sub}</div>` +
    `</div>`
  ).join('');

  const breakdownCards = [
    { label: '売電収入（FIT）', value: fmtYen(result.annualFITIncome),          sub: `余剰 ${fmt(result.annualSurplus)} kWh × 16円/kWh` },
    { label: '電気代削減',      value: fmtYen(result.annualElectricitySaving),  sub: `自家消費 ${fmt(result.annualSelfConsumption)} kWh × 30円/kWh` },
    { label: '年間合計効果',    value: fmtYen(result.annualTotalEffect),         sub: `初期費用 ${fmtWan(result.totalInitialCost)}` },
  ].map(item =>
    `<div style="flex:1;border:1px solid ${C.stone200};border-radius:8px;padding:12px;text-align:center;">` +
    `<div style="font-size:10px;color:${C.stone500};margin-bottom:5px;">${item.label}</div>` +
    `<div style="font-size:17px;font-weight:700;color:${C.stone900};line-height:1.2;">${item.value}</div>` +
    `<div style="font-size:10px;color:${C.stone400};margin-top:4px;">${item.sub}</div>` +
    `</div>`
  ).join('');

  const genRows = [
    { label: '年間発電量',     value: `${fmt(result.annualGeneration)} kWh`,       note: `パネル ${input.solarCapacity}kW` },
    { label: '年間自家消費量', value: `${fmt(result.annualSelfConsumption)} kWh`,   note: `自家消費率 ${Math.round(result.selfConsumptionRate * 100)}%` },
    { label: '年間余剰売電量', value: `${fmt(result.annualSurplus)} kWh`,           note: 'FIT 16円/kWh' },
    { label: '年間消費電力量', value: `${fmt(result.annualConsumption)} kWh`,       note: `月々電気代 ${fmt(input.monthlyElectricCost)}円` },
  ].map((item, i) =>
    `<tr style="background:${i % 2 === 0 ? C.white : C.stone50};border-bottom:1px solid ${C.stone100};">` +
    `<td style="padding:7px 12px;font-size:12px;color:${C.stone600};">${item.label}</td>` +
    `<td style="padding:7px 12px;font-size:12px;font-weight:600;color:${C.primary};text-align:right;">${item.value}</td>` +
    `<td style="padding:7px 12px;font-size:11px;color:${C.stone400};text-align:right;">${item.note}</td>` +
    `</tr>`
  ).join('');

  const condItems = [
    ['地域',       input.prefecture],
    ['月々電気代', `${fmt(input.monthlyElectricCost)}円`],
    ['パネル容量', `${input.solarCapacity}kW`],
    ['屋根向き',   `${input.roofDirection}向き ${input.roofAngle}°`],
    ['蓄電池',     input.hasBattery ? `${input.batteryCapacity}kWh` : 'なし'],
    ['初期費用',   fmtWan(result.totalInitialCost)],
  ].map(([label, val]) =>
    `<div style="font-size:11px;"><span style="color:${C.stone500};">${label}：</span>` +
    `<span style="color:${C.stone900};font-weight:600;">${val}</span></div>`
  ).join('');

  const thStyle = `padding:8px 12px;font-size:12px;font-weight:600;`;

  const content = `
<h2 style="font-size:17px;font-weight:700;color:${C.stone900};margin:0 0 14px;">サマリー</h2>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;">${heroCards}</div>
<h3 style="font-size:12px;font-weight:700;color:${C.stone700};margin:0 0 9px;">年間経済効果の内訳</h3>
<div style="display:flex;gap:10px;margin-bottom:16px;">${breakdownCards}</div>
<h3 style="font-size:12px;font-weight:700;color:${C.stone700};margin:0 0 9px;">発電・消費データ</h3>
<table style="width:100%;border-collapse:collapse;margin-bottom:14px;">
  <thead>
    <tr style="background:#292524;color:${C.white};">
      <th style="${thStyle}text-align:left;">項目</th>
      <th style="${thStyle}text-align:right;">数値</th>
      <th style="${thStyle}text-align:right;">備考</th>
    </tr>
  </thead>
  <tbody>${genRows}</tbody>
</table>
<div style="padding:13px 16px;background:${C.stone100};border-radius:8px;">
  <span style="font-size:11px;font-weight:700;color:${C.stone700};">入力条件</span>
  <div style="display:flex;flex-wrap:wrap;gap:7px 20px;margin-top:7px;">${condItems}</div>
</div>
`;

  return wrapPage(content, 1, 3);
}

/** Page 2 – Monthly table */
function buildMonthlyPage(result: SimulationResult): HTMLDivElement {
  const thCss = (align: string) =>
    `padding:7px 8px;font-size:10px;font-weight:600;color:${C.white};text-align:${align};white-space:nowrap;`;

  const theadRow =
    `<tr style="background:#292524;">` +
    `<th style="${thCss('center')}">月</th>` +
    `<th style="${thCss('right')}">発電量<br><span style="font-weight:400;color:#a8a29e;font-size:9px;">kWh</span></th>` +
    `<th style="${thCss('right')}">消費電力<br><span style="font-weight:400;color:#a8a29e;font-size:9px;">kWh</span></th>` +
    `<th style="${thCss('right')}">自家消費<br><span style="font-weight:400;color:#a8a29e;font-size:9px;">kWh</span></th>` +
    `<th style="${thCss('right')}">余剰売電<br><span style="font-weight:400;color:#a8a29e;font-size:9px;">kWh</span></th>` +
    `<th style="${thCss('right')}">売電収入<br><span style="font-weight:400;color:#a8a29e;font-size:9px;">円</span></th>` +
    `<th style="${thCss('right')}">電気代削減<br><span style="font-weight:400;color:#a8a29e;font-size:9px;">円</span></th>` +
    `<th style="${thCss('right')}">導入前<br><span style="font-weight:400;color:#a8a29e;font-size:9px;">円</span></th>` +
    `<th style="${thCss('right')}">導入後<br><span style="font-weight:400;color:#a8a29e;font-size:9px;">円</span></th>` +
    `<th style="${thCss('right')}">月間節約<br><span style="font-weight:400;color:#a8a29e;font-size:9px;">円</span></th>` +
    `</tr>`;

  const tdCss = (align: string, color: string, bold = false) =>
    `padding:6px 8px;font-size:11px;text-align:${align};color:${color};${bold ? 'font-weight:700;' : ''}`;

  const dataRows = result.monthlyData.map((d, i) =>
    `<tr style="background:${i % 2 === 0 ? C.white : C.stone50};border-bottom:1px solid ${C.stone100};">` +
    `<td style="${tdCss('center', C.stone700, true)}">${d.monthName}</td>` +
    `<td style="${tdCss('right', C.primary, true)}">${fmt(d.generation)}</td>` +
    `<td style="${tdCss('right', C.stone600)}">${fmt(d.consumption)}</td>` +
    `<td style="${tdCss('right', C.stone600)}">${fmt(d.selfConsumption)}</td>` +
    `<td style="${tdCss('right', C.stone500)}">${fmt(d.surplus)}</td>` +
    `<td style="${tdCss('right', C.stone700)}">${fmt(d.fitIncome)}</td>` +
    `<td style="${tdCss('right', C.stone700)}">${fmt(d.electricitySaving)}</td>` +
    `<td style="${tdCss('right', C.stone500)}">${fmt(d.electricityCostBefore)}</td>` +
    `<td style="${tdCss('right', C.stone600)}">${fmt(d.electricityCostAfter)}</td>` +
    `<td style="${tdCss('right', C.primary, true)}">${fmt(d.totalSaving)}</td>` +
    `</tr>`
  ).join('');

  const sum = (key: keyof typeof result.monthlyData[0]) =>
    result.monthlyData.reduce((s, d) => s + (d[key] as number), 0);

  const tfootRow =
    `<tr style="background:${C.stone100};border-top:2px solid #a8a29e;font-weight:700;">` +
    `<td style="${tdCss('center', C.stone700, true)}">年計</td>` +
    `<td style="${tdCss('right', C.primary, true)}">${fmt(sum('generation'))}</td>` +
    `<td style="${tdCss('right', C.stone700, true)}">${fmt(sum('consumption'))}</td>` +
    `<td style="${tdCss('right', C.stone700, true)}">${fmt(sum('selfConsumption'))}</td>` +
    `<td style="${tdCss('right', C.stone700, true)}">${fmt(sum('surplus'))}</td>` +
    `<td style="${tdCss('right', C.stone700, true)}">${fmt(sum('fitIncome'))}</td>` +
    `<td style="${tdCss('right', C.stone700, true)}">${fmt(sum('electricitySaving'))}</td>` +
    `<td style="${tdCss('right', C.stone600, true)}">${fmt(sum('electricityCostBefore'))}</td>` +
    `<td style="${tdCss('right', C.stone600, true)}">${fmt(sum('electricityCostAfter'))}</td>` +
    `<td style="${tdCss('right', C.primary, true)}">${fmt(sum('totalSaving'))}</td>` +
    `</tr>`;

  const content = `
<h2 style="font-size:17px;font-weight:700;color:${C.stone900};margin:0 0 6px;">月別詳細データ</h2>
<p style="font-size:11px;color:${C.stone500};margin:0 0 14px;">月ごとの発電量・消費電力・経済効果の詳細</p>
<table style="width:100%;border-collapse:collapse;">
  <thead>${theadRow}</thead>
  <tbody>${dataRows}</tbody>
  <tfoot>${tfootRow}</tfoot>
</table>
`;

  return wrapPage(content, 2, 3);
}

/** Page 3 – Long-term table + disclaimer */
function buildLongtermPage(result: SimulationResult): HTMLDivElement {
  const thCss = (align: string) =>
    `padding:8px 12px;font-size:11px;font-weight:600;color:${C.white};text-align:${align};`;

  const theadRow =
    `<tr style="background:#292524;">` +
    `<th style="${thCss('center')}">年度</th>` +
    `<th style="${thCss('right')}">年間経済効果<br><span style="font-weight:400;color:#a8a29e;font-size:9px;">円</span></th>` +
    `<th style="${thCss('right')}">累計経済効果<br><span style="font-weight:400;color:#a8a29e;font-size:9px;">円</span></th>` +
    `<th style="${thCss('right')}">累計収支<br><span style="font-weight:400;color:#a8a29e;font-size:9px;">円</span></th>` +
    `</tr>`;

  const dataRows = result.longTermData.map((d, i) => {
    const isPayback = d.year === result.paybackYears;
    const is15 = d.year === 15;
    const is20 = d.year === 20;

    let bg        = i % 2 === 0 ? C.white : C.stone50;
    let yearColor = C.stone700;
    let badge     = '';

    if (isPayback) {
      bg        = '#fff7ed';
      yearColor = '#c2410c';
      badge     = `<span style="margin-left:5px;background:#ea580c;color:white;font-size:9px;padding:2px 6px;border-radius:10px;white-space:nowrap;">回収完了</span>`;
    } else if (is20) {
      bg        = C.primaryLight;
      yearColor = C.primary;
      badge     = `<span style="margin-left:5px;background:${C.primary};color:white;font-size:9px;padding:2px 6px;border-radius:10px;">20年</span>`;
    } else if (is15) {
      bg        = C.primaryLight;
      yearColor = C.primary;
      badge     = `<span style="margin-left:5px;background:${C.primary};color:white;font-size:9px;padding:2px 6px;border-radius:10px;">15年</span>`;
    }

    const profitColor = d.cumulativeCost >= 0 ? C.primary : C.stone500;
    const effectColor = d.cumulativeEffect >= result.totalInitialCost ? C.primary : C.stone700;

    return (
      `<tr style="background:${bg};border-bottom:1px solid ${C.stone100};">` +
      `<td style="padding:6px 12px;font-size:11px;font-weight:600;color:${yearColor};text-align:center;">` +
        `${d.year}年目${badge}` +
      `</td>` +
      `<td style="padding:6px 12px;font-size:11px;color:${C.stone700};text-align:right;">${fmt(d.annualEffect)}</td>` +
      `<td style="padding:6px 12px;font-size:11px;color:${effectColor};font-weight:${effectColor === C.primary ? '600' : '400'};text-align:right;">${fmt(d.cumulativeEffect)}</td>` +
      `<td style="padding:6px 12px;font-size:11px;color:${profitColor};font-weight:700;text-align:right;">${d.cumulativeCost >= 0 ? '+' : ''}${fmt(d.cumulativeCost)}</td>` +
      `</tr>`
    );
  }).join('');

  const content = `
<h2 style="font-size:17px;font-weight:700;color:${C.stone900};margin:0 0 5px;">長期シミュレーション（20年間）</h2>
<p style="font-size:11px;color:${C.stone500};margin:0 0 3px;">パネル経年劣化（0.5%/年）・電気代上昇（1.5%/年）を考慮</p>
<p style="font-size:11px;color:${C.stone500};margin:0 0 12px;">
  投資回収年数：約 <span style="font-weight:700;color:${C.primary};">${result.paybackYears}年目</span>
</p>
<table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
  <thead>${theadRow}</thead>
  <tbody>${dataRows}</tbody>
</table>
<div style="padding:12px 16px;background:${C.stone100};border-radius:8px;border-left:3px solid ${C.stone400};margin-bottom:12px;">
  <p style="font-size:10px;color:${C.stone500};margin:0 0 4px;">※ 累計収支 = 累計経済効果 - 初期投資額。プラスで投資回収完了。</p>
  <p style="font-size:10px;color:${C.stone500};margin:0 0 4px;">※ 累計経済効果 = 初期投資を考慮せず、発電効果の累計。</p>
  <p style="font-size:10px;color:${C.stone500};margin:0;">※ FIT売電価格は本シミュレーション時点の参考値です。実際の契約内容により異なります。</p>
</div>
<div style="padding:12px 16px;background:#fff7ed;border-radius:8px;border-left:3px solid #fb923c;">
  <h4 style="font-size:11px;font-weight:700;color:#9a3412;margin:0 0 6px;">免責事項</h4>
  <p style="font-size:10px;color:#c2410c;margin:0;line-height:1.75;">
    本レポートに記載の数値はシミュレーション結果であり、実際の発電量・節約効果・投資回収期間を保証するものではありません。
    実際の効果は設置場所の日射量・気象条件・電気使用量・電力料金の変動・設備の状態等により異なります。
    本資料はお客様への参考情報の提供を目的としており、導入を強制するものではありません。
  </p>
</div>
`;

  return wrapPage(content, 3, 3);
}

// ---------------------------------------------------------------------------
// Main export function
// ---------------------------------------------------------------------------
export async function exportPdf(input: SimulationInput, result: SimulationResult): Promise<void> {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const pages = [
    buildCover(input, result),
    buildSummaryPage(input, result),
    buildMonthlyPage(result),
    buildLongtermPage(result),
  ];

  for (let i = 0; i < pages.length; i++) {
    if (i > 0) pdf.addPage();
    const imgData = await captureDiv(pages[i]);
    pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
  }

  const date = new Date().toISOString().slice(0, 10);
  pdf.save(`太陽光蓄電池シミュレーションレポート_${date}.pdf`);
}
