import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { isInTossApp, requestTossLogin } from '@/utils/toss';
import { Heart, Mail, Lock, Loader2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      toast({
        title: '로그인 성공',
        description: '환영합니다!',
      });
      navigate(from, { replace: true });
    } catch (error: any) {
      toast({
        title: '로그인 실패',
        description: error.response?.data?.detail || '이메일 또는 비밀번호를 확인해주세요.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTossLogin = async () => {
    try {
      await requestTossLogin();
    } catch (error) {
      toast({
        title: '토스 로그인 불가',
        description: '토스 앱 내부에서만 사용 가능합니다.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col safe-area-padding">
      {/* TDS Style Header */}
      <header className="tds-header">
        <div className="flex items-center justify-center h-14 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-[#3182F6]" />
            <span className="text-lg font-bold text-gray-900">AI 헬스케어</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-5 py-8">
        <div className="max-w-sm mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">로그인</h1>
            <p className="text-gray-500 text-sm">AI 헬스케어 서비스에 오신 것을 환영합니다</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input - TDS Style */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">이메일</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="tds-textfield pl-12"
                  required
                />
              </div>
            </div>

            {/* Password Input - TDS Style */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">비밀번호</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="tds-textfield pl-12"
                  required
                />
              </div>
            </div>

            {/* Submit Button - TDS Style */}
            <button
              type="submit"
              disabled={isLoading}
              className="tds-button-primary w-full"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  로그인 중...
                </span>
              ) : (
                '로그인'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">또는</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Toss Login Button */}
          {isInTossApp() && (
            <button
              type="button"
              onClick={handleTossLogin}
              className="tds-button-secondary w-full flex items-center justify-center gap-2"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect width="24" height="24" rx="6" fill="#3182F6"/>
                <path d="M7 12H17M12 7V17" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              토스로 로그인
            </button>
          )}

          {/* Signup Link */}
          <p className="text-center text-sm text-gray-500">
            계정이 없으신가요?{' '}
            <Link to="/signup" className="text-[#3182F6] font-medium">
              회원가입
            </Link>
          </p>
        </div>
      </main>

      {/* Bottom Navigation - TDS Style */}
      <nav className="tds-bottom-nav">
        <Link to="/" className="tds-nav-item">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span>홈</span>
        </Link>
        <Link to="/login" className="tds-nav-item active">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span>로그인</span>
        </Link>
      </nav>
    </div>
  );
};

export default Login;
