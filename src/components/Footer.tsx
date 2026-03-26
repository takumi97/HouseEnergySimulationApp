import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-stone-200 mt-20">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded bg-primary-700 flex items-center justify-center flex-shrink-0">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="4"/>
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
                </svg>
              </div>
              <span className="font-semibold text-stone-900 text-sm">住宅エネルギーシミュレーター</span>
            </div>
            <p className="text-xs text-stone-400 max-w-xs leading-relaxed">
              太陽光発電・蓄電池導入の経済効果を無料で試算できるシミュレーターです。
            </p>
            <div className="mt-3">
              <Link
                to="/calculation"
                className="text-xs text-stone-400 hover:text-primary-700 hover:underline transition-colors"
              >
                計算ロジックについて
              </Link>
            </div>
          </div>
          <p className="text-xs text-stone-400 max-w-sm leading-relaxed">
            ※ 本シミュレーションの結果は概算値です。実際の経済効果は設置環境・使用状況・電力会社のプラン等により異なります。導入の判断は専門業者にご相談ください。
          </p>
        </div>
        <div className="border-t border-stone-100 mt-8 pt-6 text-center text-xs text-stone-400">
          © 2024 住宅エネルギーシミュレーター. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
