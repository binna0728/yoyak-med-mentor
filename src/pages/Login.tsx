import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { isInTossApp, requestTossLogin } from '@/utils/toss';
import { Mail, Lock, Loader2 } from 'lucide-react';

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
      toast({ title: '로그인 성공', description: '환영합니다!' });
      navigate(from, { replace: true });
    } catch (error: any) {
      toast({ title: '로그인 실패', description: error.response?.data?.detail || '이메일 또는 비밀번호를 확인해주세요.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTossLogin = async () => {
    try {
      await requestTossLogin();
    } catch {
      toast({ title: '토스 로그인 불가', description: '토스 앱 내부에서만 사용 가능합니다.', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-card flex flex-col safe-area-padding">
      <header className="tds-header">
        <div className="flex items-center justify-center h-14 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="text-xl">💊</span>
            <span className="text-lg font-bold text-foreground">요약</span>
          </div>
        </div>
      </header>

      <main className="flex-1 px-5 py-8">
        <div className="max-w-sm mx-auto lg:max-w-md space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-foreground">로그인</h1>
            <p className="text-muted-foreground text-sm">내 약 정보를 확인하세요</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-muted-foreground">이메일</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input id="email" type="email" placeholder="example@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="tds-textfield pl-12" required />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-muted-foreground">비밀번호</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="tds-textfield pl-12" required />
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="tds-button-primary w-full">
              {isLoading ? (
                <span className="flex items-center justify-center gap-2"><Loader2 className="w-5 h-5 animate-spin" />로그인 중...</span>
              ) : '로그인'}
            </button>
          </form>

          {isInTossApp() && (
            <>
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">또는</span>
                <div className="flex-1 h-px bg-border" />
              </div>
              <button type="button" onClick={handleTossLogin} className="tds-button-secondary w-full flex items-center justify-center gap-2">
                토스로 로그인
              </button>
            </>
          )}

          <p className="text-center text-sm text-muted-foreground">
            계정이 없으신가요?{' '}
            <Link to="/signup" className="text-primary font-medium">회원가입</Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Login;
