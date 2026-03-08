import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import authApi from '@/api/auth';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { t } = useTranslation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/home';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      toast({ title: t('auth.loginSuccess'), description: t('auth.loginSuccessDesc') });
      navigate(from, { replace: true });
    } catch (error: any) {
      const errData = error.response?.data;
      const detail = errData?.error_detail || errData?.detail || t('auth.loginFailedDesc');
      toast({ title: t('auth.loginFailed'), description: detail, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKakaoLogin = () => {
    window.location.href = authApi.getKakaoLoginUrl();
  };

  const handleGoogleLogin = () => {
    window.location.href = authApi.getGoogleLoginUrl();
  };

  return (
    <div className="min-h-screen bg-card flex flex-col safe-area-padding">
      <main className="flex-1 flex flex-col justify-center px-6">
        <div className="max-w-sm mx-auto w-full space-y-8">
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold text-foreground">{t('auth.login')}</h1>
            <p className="text-muted-foreground text-sm">{t('auth.loginSubtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="email" placeholder={t('auth.email')} value={email} onChange={(e) => setEmail(e.target.value)} className="tds-textfield" required />
            <input type="password" placeholder={t('auth.password')} value={password} onChange={(e) => setPassword(e.target.value)} className="tds-textfield" required />

            <button type="submit" disabled={isLoading} className="tds-button-primary w-full">
              {isLoading ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-5 h-5 animate-spin" />{t('auth.loggingIn')}</span> : t('auth.login')}
            </button>
          </form>

          <div className="space-y-3">
            <button onClick={handleKakaoLogin} className="w-full h-14 rounded-xl font-semibold text-base flex items-center justify-center gap-2 transition-colors" style={{ backgroundColor: '#FEE500', color: '#191919' }}>
              <span className="text-xl">💬</span>
              {t('auth.kakaoLogin')}
            </button>
            <button onClick={handleGoogleLogin} className="w-full h-14 rounded-xl font-semibold text-base flex items-center justify-center gap-2 border border-border bg-card text-foreground transition-colors hover:bg-muted">
              <span className="text-xl">G</span>
              {t('auth.googleLogin')}
            </button>
          </div>

          <button
            onClick={() => {
              localStorage.setItem('access_token', 'demo_token');
              window.location.href = '/home';
            }}
            className="w-full h-12 rounded-xl text-sm font-medium text-muted-foreground border border-border bg-card hover:bg-muted transition-colors"
          >
            둘러보기 (로그인 없이)
          </button>

          <p className="text-center text-xs text-muted-foreground whitespace-pre-line">
            {t('auth.disclaimer')}
          </p>

          <p className="text-center text-sm text-muted-foreground">
            {t('auth.noAccount')}{' '}
            <Link to="/signup" className="text-primary font-medium">{t('auth.signup')}</Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Login;
