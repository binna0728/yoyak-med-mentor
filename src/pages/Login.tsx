import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/home';

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

  return (
    <div className="min-h-screen bg-card flex flex-col safe-area-padding">
      <main className="flex-1 flex flex-col justify-center px-6">
        <div className="max-w-sm mx-auto w-full space-y-8">
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold text-foreground">로그인</h1>
            <p className="text-muted-foreground text-sm">간편하게 시작하세요</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="email" placeholder="이메일" value={email} onChange={(e) => setEmail(e.target.value)} className="tds-textfield" required />
            <input type="password" placeholder="비밀번호" value={password} onChange={(e) => setPassword(e.target.value)} className="tds-textfield" required />

            <button type="submit" disabled={isLoading} className="tds-button-primary w-full">
              {isLoading ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-5 h-5 animate-spin" />로그인 중...</span> : '로그인'}
            </button>
          </form>

          {/* Social login buttons */}
          <div className="space-y-3">
            <button className="w-full h-14 rounded-xl font-semibold text-base flex items-center justify-center gap-2 transition-colors" style={{ backgroundColor: '#FEE500', color: '#191919' }}>
              <span className="text-xl">💬</span>
              카카오 로그인
            </button>
            <button className="w-full h-14 rounded-xl font-semibold text-base flex items-center justify-center gap-2 border border-border bg-card text-foreground transition-colors hover:bg-muted">
              <span className="text-xl">G</span>
              구글 로그인
            </button>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            이 서비스는 약학 정보를 기반으로 안내하며,<br />의사의 진단을 대체하지 않습니다.
          </p>

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
