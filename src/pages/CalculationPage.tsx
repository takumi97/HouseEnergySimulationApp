import Header from '../components/Header';
import Footer from '../components/Footer';

export default function CalculationPage() {
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-3xl mx-auto px-6 py-14 w-full">
        {/* タイトル */}
        <div className="mb-12">
          <h1 className="text-2xl font-bold text-stone-900 mb-3">計算ロジックについて</h1>
          <p className="text-stone-500 text-sm leading-relaxed">
            このシミュレーターが内部でどのように数値を計算しているかを説明します。
          </p>
        </div>

        {/* 概要 */}
        <section className="mb-12">
          <SectionTitle number="0" title="このシミュレーションの概要" />
          <div className="prose-sm text-stone-600 leading-relaxed space-y-3">
            <p>
              本シミュレーターは、住宅への太陽光発電パネルおよび蓄電池の導入時に期待できる
              <strong className="text-stone-800">年間の経済効果</strong>と、
              <strong className="text-stone-800">初期費用の投資回収年数</strong>を試算するツールです。
            </p>
            <p>
              地域・屋根の向き・傾斜角・月々の電気代などの入力情報をもとに、
              発電量・自家消費量・売電収入・電気代削減効果を計算し、20年間の長期推移までシミュレートします。
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-4">
              <p className="text-amber-800 text-sm font-medium mb-1">⚠️ ご注意</p>
              <p className="text-amber-700 text-sm leading-relaxed">
                本シミュレーションはあくまで<strong>簡易的な試算</strong>であり、
                実際の数値とは異なる場合があります。
                設置環境・使用状況・電力会社のプラン・天候・パネルの状態など、
                多くの要因によって実際の結果は変わります。
                導入の最終判断は必ず専門業者にご相談ください。
              </p>
            </div>
          </div>
        </section>

        {/* 太陽光発電量 */}
        <section className="mb-12">
          <SectionTitle number="1" title="太陽光発電量の計算" />
          <div className="space-y-6 text-stone-600 text-sm leading-relaxed">
            <p>
              1年間にどのくらい発電できるかを以下の計算式で求めます。
            </p>
            <Formula>
              年間発電量(kWh) = パネル容量(kW) × 地域別日射量係数 × 方位係数 × 傾斜角係数
            </Formula>

            {/* 地域別係数 */}
            <div>
              <h3 className="font-semibold text-stone-800 mb-3">地域別日射量係数（kWh / kW）</h3>
              <p className="text-stone-500 text-xs mb-3">
                南向き・傾斜角30度の標準条件における、パネル1kWあたりの年間発電量の目安です。
              </p>
              <div className="overflow-x-auto rounded-xl border border-stone-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-stone-100">
                      <th className="text-left px-4 py-3 font-semibold text-stone-700">地域</th>
                      <th className="text-right px-4 py-3 font-semibold text-stone-700">係数（kWh/kW）</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['北海道', 1050],
                      ['東北', 1150],
                      ['北陸', 1100],
                      ['関東', 1320],
                      ['中部', 1380],
                      ['近畿', 1350],
                      ['中国', 1300],
                      ['四国', 1420],
                      ['九州', 1400],
                      ['沖縄', 1500],
                    ].map(([region, value], i) => (
                      <tr key={String(region)} className={i % 2 === 0 ? 'bg-white' : 'bg-stone-50'}>
                        <td className="px-4 py-2.5 text-stone-700">{region}</td>
                        <td className="px-4 py-2.5 text-right text-stone-700 font-mono">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-stone-400 text-xs mt-2">
                ※ 日照時間・気温・大気透過率などを総合した簡易係数です。
              </p>
            </div>

            {/* 方位係数 */}
            <div>
              <h3 className="font-semibold text-stone-800 mb-3">方位係数（屋根の向き）</h3>
              <p className="mb-3">
                屋根がどの方角を向いているかによって発電効率が変わります。
                南向きが最も発電量が多く、北向きになるほど少なくなります。
              </p>
              <div className="overflow-x-auto rounded-xl border border-stone-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-stone-100">
                      <th className="text-left px-4 py-3 font-semibold text-stone-700">方角</th>
                      <th className="text-right px-4 py-3 font-semibold text-stone-700">係数</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['南', '1.00（基準）'],
                      ['南東 / 南西', '0.95'],
                      ['東 / 西', '0.87'],
                      ['北東 / 北西', '0.77'],
                      ['北', '0.65'],
                    ].map(([dir, val], i) => (
                      <tr key={String(dir)} className={i % 2 === 0 ? 'bg-white' : 'bg-stone-50'}>
                        <td className="px-4 py-2.5 text-stone-700">{dir}</td>
                        <td className="px-4 py-2.5 text-right text-stone-700 font-mono">{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 傾斜角係数 */}
            <div>
              <h3 className="font-semibold text-stone-800 mb-3">傾斜角係数（屋根の傾き）</h3>
              <p className="mb-3">
                屋根の傾き（勾配）によっても発電量が変わります。
                傾斜角30度が最も効率よく太陽光を受けられるとされています。
                陸屋根（傾斜0度）は最も効率が下がります。
              </p>
              <div className="overflow-x-auto rounded-xl border border-stone-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-stone-100">
                      <th className="text-left px-4 py-3 font-semibold text-stone-700">傾斜角</th>
                      <th className="text-right px-4 py-3 font-semibold text-stone-700">係数</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['0度（陸屋根）', '0.90'],
                      ['10度', '0.95'],
                      ['20度', '0.98'],
                      ['30度（最適）', '1.00'],
                      ['40度', '0.97'],
                    ].map(([angle, val], i) => (
                      <tr key={String(angle)} className={i % 2 === 0 ? 'bg-white' : 'bg-stone-50'}>
                        <td className="px-4 py-2.5 text-stone-700">{angle}</td>
                        <td className="px-4 py-2.5 text-right text-stone-700 font-mono">{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-stone-100 rounded-xl p-4">
              <p className="text-stone-600 text-xs leading-relaxed">
                <strong>計算例：</strong> 関東地方・南向き・傾斜30度・5kWのパネルの場合<br />
                年間発電量 = 5 × 1,320 × 1.00 × 1.00 = <strong>6,600 kWh</strong>
              </p>
            </div>
          </div>
        </section>

        {/* 自家消費率 */}
        <section className="mb-12">
          <SectionTitle number="2" title="自家消費率の計算" />
          <div className="space-y-4 text-stone-600 text-sm leading-relaxed">
            <p>
              発電した電気のうち、自分の家で使う割合を「自家消費率」と呼びます。
              余った電気は電力会社に売電（FIT売電）します。
            </p>
            <p>
              蓄電池があると、昼間に発電した余剰電力を夜間に使えるため、自家消費率が上がります。
            </p>
            <div className="overflow-x-auto rounded-xl border border-stone-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-stone-100">
                    <th className="text-left px-4 py-3 font-semibold text-stone-700">条件</th>
                    <th className="text-right px-4 py-3 font-semibold text-stone-700">自家消費率</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['蓄電池なし', '30%'],
                    ['蓄電池あり（5kWh以下）', '50%'],
                    ['蓄電池あり（5〜10kWh）', '62%'],
                    ['蓄電池あり（10kWh超）', '70%'],
                  ].map(([cond, rate], i) => (
                    <tr key={String(cond)} className={i % 2 === 0 ? 'bg-white' : 'bg-stone-50'}>
                      <td className="px-4 py-2.5 text-stone-700">{cond}</td>
                      <td className="px-4 py-2.5 text-right text-stone-700 font-mono">{rate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-stone-500 text-xs">
              ※ 実際の自家消費率は家族人数・在宅時間・電力使用パターンによって大きく変わります。
              本シミュレーターでは代表的な数値として上記のステップ値を使用しています。
            </p>
          </div>
        </section>

        {/* 経済効果 */}
        <section className="mb-12">
          <SectionTitle number="3" title="経済効果の計算" />
          <div className="space-y-5 text-stone-600 text-sm leading-relaxed">
            <p>
              年間の経済効果は「売電収入」と「電気代削減」の2つを合計したものです。
            </p>

            <div>
              <h3 className="font-semibold text-stone-800 mb-2">① 売電収入（FIT売電）</h3>
              <p className="mb-2">
                自家消費しきれなかった余剰電力は、電力会社に固定価格で買い取ってもらえます（FIT制度）。
              </p>
              <Formula>
                売電収入(円) = 余剰発電量(kWh) × FIT買取単価(16円/kWh)
              </Formula>
            </div>

            <div>
              <h3 className="font-semibold text-stone-800 mb-2">② 電気代削減</h3>
              <p className="mb-2">
                自家消費した分は、電力会社から購入しなくて済むため、その分の電気代が浮きます。
              </p>
              <Formula>
                電気代削減(円) = 自家消費量(kWh) × 買電単価(円/kWh)
              </Formula>
              <p className="text-stone-500 text-xs mt-2">
                ※ 買電単価のデフォルト値は <strong>30円/kWh</strong> です。入力フォームで実際の単価に変更できます。
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-stone-800 mb-2">③ 年間経済効果（合計）</h3>
              <Formula>
                年間経済効果(円) = 売電収入 + 電気代削減
              </Formula>
            </div>
          </div>
        </section>

        {/* 投資回収年数 */}
        <section className="mb-12">
          <SectionTitle number="4" title="投資回収年数" />
          <div className="space-y-4 text-stone-600 text-sm leading-relaxed">
            <p>
              初期費用を年間経済効果で割ることで、何年で元が取れるかを計算します。
            </p>
            <Formula>
              投資回収年数(年) = (太陽光初期費用 + 蓄電池初期費用) ÷ 年間経済効果
            </Formula>
            <p>
              初期費用が0円の場合は即回収（0年）として表示されます。
            </p>
            <p className="text-stone-500 text-xs">
              ※ 初期費用の入力がない場合、太陽光は <strong>パネル容量(kW) × 20万円/kW</strong>、
              蓄電池は <strong>容量(kWh) × 15万円/kWh</strong> をデフォルトの概算として使用します。
            </p>
          </div>
        </section>

        {/* 20年シミュレーション */}
        <section className="mb-12">
          <SectionTitle number="5" title="20年間長期シミュレーション" />
          <div className="space-y-5 text-stone-600 text-sm leading-relaxed">
            <p>
              長期的な経済効果を把握するため、2つの変化要因を毎年の計算に反映させています。
            </p>

            <div>
              <h3 className="font-semibold text-stone-800 mb-2">電気代上昇率</h3>
              <p>
                電気料金は毎年少しずつ値上がりする傾向があります。
                本シミュレーターでは <strong>年1.5%の上昇</strong> を想定しています。
                これにより、自家消費による電気代削減の価値が年々大きくなります。
              </p>
              <Formula>
                年間経済効果(N年目) = 初年度の年間経済効果 × (1 + 0.015)^(N-1) × パネル残存率
              </Formula>
            </div>

            <div>
              <h3 className="font-semibold text-stone-800 mb-2">パネル劣化率</h3>
              <p>
                太陽光パネルは経年とともに少しずつ発電効率が低下します。
                本シミュレーターでは <strong>年0.5%の劣化</strong> を想定しています。
              </p>
              <Formula>
                パネル残存率(N年目) = (1 - 0.005)^(N-1)
              </Formula>
              <p className="text-stone-500 text-xs mt-2">
                例：20年目のパネル残存率 = 0.995^19 ≈ 91%
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-stone-800 mb-2">累計経済効果</h3>
              <p>
                各年の経済効果を積み上げていき、初期投資額を差し引いた累計値を表示します。
                累計がプラスに転じた時点が「投資回収」のタイミングです。
              </p>
            </div>
          </div>
        </section>

        {/* 前提条件 */}
        <section className="mb-12">
          <SectionTitle number="6" title="使用している前提条件" />
          <div className="space-y-4 text-stone-600 text-sm leading-relaxed">
            <p>
              計算に使用している固定の前提条件をまとめました。
            </p>
            <div className="overflow-x-auto rounded-xl border border-stone-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-stone-100">
                    <th className="text-left px-4 py-3 font-semibold text-stone-700">項目</th>
                    <th className="text-right px-4 py-3 font-semibold text-stone-700">値</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['FIT買取単価', '16円/kWh'],
                    ['デフォルト買電単価', '30円/kWh'],
                    ['電気代年間上昇率', '1.5%'],
                    ['パネル年間劣化率', '0.5%'],
                    ['基本料金（推定）', '1,000円/月'],
                    ['太陽光費用（未入力時）', '20万円/kW'],
                    ['蓄電池費用（未入力時）', '15万円/kWh'],
                  ].map(([item, value], i) => (
                    <tr key={String(item)} className={i % 2 === 0 ? 'bg-white' : 'bg-stone-50'}>
                      <td className="px-4 py-2.5 text-stone-700">{item}</td>
                      <td className="px-4 py-2.5 text-right text-stone-700 font-mono">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-stone-100 rounded-xl p-4">
              <p className="text-stone-700 text-xs font-semibold mb-2">参考データについて</p>
              <ul className="text-stone-500 text-xs leading-relaxed space-y-1 list-disc list-inside">
                <li>地域別日射量係数は NEDO（国立研究開発法人 新エネルギー・産業技術総合開発機構）の日射量データベースをもとにした簡易値です。</li>
                <li>FIT買取単価は経済産業省が定める固定価格買取制度（FIT）の参考値です。実際の単価は契約時期・設備容量によって異なります。</li>
                <li>電気代上昇率・パネル劣化率は一般的な業界標準値を参考にした想定値です。</li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function SectionTitle({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-7 h-7 rounded-lg bg-primary-700 flex items-center justify-center flex-shrink-0">
        <span className="text-white text-xs font-bold">{number}</span>
      </div>
      <h2 className="text-lg font-bold text-stone-900">{title}</h2>
    </div>
  );
}

function Formula({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-stone-100 border border-stone-200 rounded-xl px-5 py-3.5 font-mono text-sm text-stone-800 leading-relaxed overflow-x-auto">
      {children}
    </div>
  );
}
