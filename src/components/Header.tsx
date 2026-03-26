import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  return (
    <header className="bg-white border-b border-stone-200">
      <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-primary-700 flex items-center justify-center flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4"/>
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
            </svg>
          </div>
          <div>
            <div className="text-base font-bold text-stone-900 leading-tight">住宅エネルギーシミュレーター</div>
            <div className="text-xs text-stone-500 leading-tight">太陽光・蓄電池の経済効果を無料試算</div>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                to="/mypage"
                className="flex items-center gap-1.5 text-sm text-stone-600 hover:text-primary-700 transition-colors"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <span className="hidden sm:inline">マイページ</span>
              </Link>
              <button
                onClick={handleSignOut}
                className="text-sm text-stone-400 hover:text-stone-600 transition-colors border border-stone-200 rounded-lg px-3 py-1.5 hover:border-stone-300"
              >
                ログアウト
              </button>
            </>
          ) : (
            <Link to="/login" className="text-sm text-stone-600 hover:text-primary-700 transition-colors border border-stone-200 rounded-lg px-3 py-1.5 hover:border-primary-300">
              ログイン
            </Link>
          )}
          <button
            onClick={() => navigate('/simulate')}
            className="btn-primary text-sm py-2 px-4"
          >
            シミュレーション開始
          </button>
        </div>
      </div>
    </header>
  );
}
