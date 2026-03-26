import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [signUpDone, setSignUpDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (tab === 'login') {
      const { error } = await signIn(email, password);
      if (error) {
        setError('メールアドレスまたはパスワードが正しくありません。');
      } else {
        navigate('/mypage');
      }
    } else {
      if (password.length < 6) {
        setError('パスワードは6文字以上で入力してください。');
        setLoading(false);
        return;
      }
      const { error } = await signUp(email, password);
      if (error) {
        setError(error.message.includes('already registered')
          ? 'このメールアドレスはすでに登録されています。'
          : '登録に失敗しました。もう一度お試しください。');
      } else {
        setSignUpDone(true);
      }
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">

          {/* Card */}
          <div className="card">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary-700 flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex rounded-lg border border-stone-200 p-1 mb-6 bg-stone-50">
              <button
                onClick={() => { setTab('login'); setError(''); setSignUpDone(false); }}
                className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${
                  tab === 'login'
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                ログイン
              </button>
              <button
                onClick={() => { setTab('signup'); setError(''); setSignUpDone(false); }}
                className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${
                  tab === 'signup'
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                新規登録
              </button>
            </div>

            {signUpDone ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-full bg-primary-50 border border-primary-200 flex items-center justify-center mx-auto mb-4">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0f766e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                </div>
                <p className="font-semibold text-stone-900 mb-2">確認メールを送信しました</p>
                <p className="text-sm text-stone-500 mb-6">
                  {email} にメールを送りました。<br />メール内のリンクをクリックして登録を完了してください。
                </p>
                <button
                  onClick={() => { setTab('login'); setSignUpDone(false); setPassword(''); }}
                  className="btn-primary w-full"
                >
                  ログインへ
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">メールアドレス</label>
                  <input
                    type="email"
                    className="input-field"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="example@email.com"
                    required
                    autoComplete="email"
                  />
                </div>
                <div>
                  <label className="label">パスワード{tab === 'signup' && <span className="text-stone-400 font-normal text-xs ml-1">（6文字以上）</span>}</label>
                  <input
                    type="password"
                    className="input-field"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder={tab === 'signup' ? '6文字以上' : 'パスワード'}
                    required
                    autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                  />
                </div>

                {error && (
                  <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                      </svg>
                      処理中...
                    </span>
                  ) : tab === 'login' ? 'ログイン' : 'アカウントを作成'}
                </button>
              </form>
            )}
          </div>

          <p className="text-center text-xs text-stone-400 mt-6">
            <Link to="/" className="hover:text-stone-600 transition-colors">トップページに戻る</Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
