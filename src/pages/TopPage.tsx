import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function TopPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="py-20 px-6 bg-stone-50">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 rounded-full px-4 py-1.5 text-sm font-semibold mb-8 border border-primary-200">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            完全無料・登録不要
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-stone-900 mb-6 leading-tight">
            太陽光・蓄電池の<br />
            <span className="text-primary-700">経済効果を試算</span>する
          </h1>
          <p className="text-lg text-stone-500 mb-10 leading-relaxed">
            ご自宅の条件を入力するだけで、電気代削減・売電収入・
            投資回収期間を約3分でシミュレーションできます。
          </p>
          <button
            onClick={() => navigate('/simulate')}
            className="btn-primary text-base py-4 px-10"
          >
            シミュレーションを始める
            <svg className="ml-2 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
          <p className="mt-4 text-sm text-stone-400">所要時間：約3分 / 個人情報の入力不要</p>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="py-10 px-6 bg-white border-y border-stone-200">
        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: '約19万円', label: '年間経済効果（5kW例）' },
              { value: '約6,600kWh', label: '年間発電量（5kW・関東）' },
              { value: '約9年', label: '投資回収年数（目安）' },
              { value: '約150万円', label: '15年間累計経済効果' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-bold text-primary-700">{stat.value}</div>
                <div className="text-xs text-stone-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-stone-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="section-title">シミュレーターの特徴</h2>
            <p className="section-subtitle">精度の高い計算ロジックで、あなたの自宅に合った試算を提供</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="4"/>
                    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
                  </svg>
                ),
                title: '太陽光発電シミュレーション',
                desc: '地域・屋根の向き・傾斜角を考慮した月別発電量を詳細に計算します。',
              },
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="7" width="20" height="14" rx="2"/>
                    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                    <line x1="12" y1="12" x2="12" y2="16"/>
                    <line x1="10" y1="14" x2="14" y2="14"/>
                  </svg>
                ),
                title: '蓄電池効果計算',
                desc: '蓄電池容量に応じた自家消費率の向上と、追加の経済効果を試算します。',
              },
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                  </svg>
                ),
                title: '20年間の長期予測',
                desc: '電気代上昇・パネル劣化を織り込んだ、20年間の累計経済効果と回収期間を算出します。',
              },
            ].map((feature) => (
              <div key={feature.title} className="card-hover">
                <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-700 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-bold text-stone-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-stone-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="section-title">使い方</h2>
            <p className="section-subtitle">4つのステップで簡単にシミュレーションできます</p>
          </div>
          <div className="space-y-4">
            {[
              { step: 1, title: '地域・家族情報を入力', desc: 'お住まいの地域・都道府県、家族人数、生活スタイルを選択します。' },
              { step: 2, title: '現在の電気代を入力', desc: '月々の電気代の平均額を入力します。電力会社やプランは任意です。' },
              { step: 3, title: '太陽光パネルの設定', desc: '設置予定の容量、屋根の向き・傾斜角を選択します。' },
              { step: 4, title: '結果を確認', desc: '年間経済効果・投資回収期間・20年間のグラフが表示されます。' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex items-start gap-5 p-5 rounded-xl border border-stone-100 bg-stone-50">
                <div className="w-9 h-9 rounded-full bg-primary-700 text-white flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  {step}
                </div>
                <div>
                  <div className="font-semibold text-stone-900 mb-1">{title}</div>
                  <div className="text-sm text-stone-500 leading-relaxed">{desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <button
              onClick={() => navigate('/simulate')}
              className="btn-primary text-base py-4 px-10"
            >
              今すぐ始める
              <svg className="ml-2 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Sample Results */}
      <section className="py-20 px-6 bg-stone-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="section-title">結果サンプル</h2>
            <p className="section-subtitle">東京都・5kW設置・月2万円電気代の場合（参考例）</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="font-semibold text-stone-700 mb-5 pb-3 border-b border-stone-100">年間経済効果の内訳</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-stone-500 text-sm">売電収入（FIT）</span>
                  <span className="font-bold text-stone-900">約 68,640 円</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-500 text-sm">電気代削減額</span>
                  <span className="font-bold text-stone-900">約 119,040 円</span>
                </div>
                <div className="border-t border-stone-100 pt-4 flex justify-between items-center">
                  <span className="font-semibold text-stone-700">年間合計効果</span>
                  <span className="font-bold text-primary-700 text-xl">約 187,680 円</span>
                </div>
              </div>
            </div>
            <div className="card">
              <h3 className="font-semibold text-stone-700 mb-5 pb-3 border-b border-stone-100">長期経済効果</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-stone-500 text-sm">初期投資額（目安）</span>
                  <span className="font-bold text-stone-900">約 100万円</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-500 text-sm">投資回収年数</span>
                  <span className="font-bold text-accent-600">約 9年</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-500 text-sm">15年間累計効果</span>
                  <span className="font-bold text-stone-900">約 150万円</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-stone-100">
                  <span className="font-semibold text-stone-700">20年間累計効果</span>
                  <span className="font-bold text-primary-700 text-xl">約 200万円</span>
                </div>
              </div>
            </div>
          </div>
          <p className="text-center text-stone-400 text-xs mt-5">
            ※ 上記は参考例です。実際の効果はご自宅の条件によって異なります。
          </p>
          <div className="text-center mt-10">
            <button
              onClick={() => navigate('/simulate')}
              className="btn-primary text-base py-4 px-10"
            >
              あなたの自宅でシミュレーション
              <svg className="ml-2 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
