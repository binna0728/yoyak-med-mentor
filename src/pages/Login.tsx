import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { isInTossApp } from '@/utils/toss';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { loginWithToss, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const inToss = isInTossApp();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/home';

  // 토스 앱 내부일 때 자동 로그인 시도
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
      return;
    }

    if (inToss) {
      handleTossAutoLogin();
    }
  }, [isAuthenticated]);

  const handleTossAutoLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 토스 WebView Bridge에서 토큰 획득 시도
      const tossToken = await getTossToken();
      await loginWithToss(tossToken);
      navigate(from, { replace: true });
    } catch {
      setError('토스 로그인에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const getTossToken = (): Promise<string> => {
    return new Promise((resolve) => {
      // 토스 앱 환경에서 WebView Bridge를 통해 토큰을 받음
      // 실제 구현 시 Toss SDK의 bridge 호출로 교체
      // 데모 모드: 바로 demo token 반환
      resolve('toss_demo_token');
    });
  };

  // 토스 앱 외부 접근 시
  if (!inToss) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center safe-area-padding px-6">
        <div className="max-w-sm w-full text-center space-y-6">
          <div className="w-20 h-20 rounded-2xl bg-accent flex items-center justify-center mx-auto">
            <span className="text-4xl">💊</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">요약</h1>
            <p className="text-muted-foreground text-sm">
              이 서비스는 토스 앱에서만 이용할 수 있습니다.
            </p>
          </div>
          <a
            href="https://toss.im/app"
            target="_blank"
            rel="noopener noreferrer"
            className="tds-button-primary w-full inline-flex items-center justify-center"
          >
            토스 앱 다운로드
          </a>

          {/* 개발 모드 둘러보기 */}
          {import.meta.env.DEV && (
            <button
              onClick={async () => {
                await loginWithToss('dev_demo_token');
                navigate('/home', { replace: true });
              }}
              className="w-full h-12 rounded-xl text-sm font-medium text-muted-foreground border border-border bg-card hover:bg-muted transition-colors"
            >
              둘러보기 (개발 모드)
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center safe-area-padding">
      <div className="max-w-sm w-full text-center space-y-6 px-6">
        <div className="w-20 h-20 rounded-2xl bg-accent flex items-center justify-center mx-auto">
          <span className="text-4xl">💊</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground">요약</h1>

        {isLoading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground text-sm">토스 계정으로 로그인 중...</p>
          </div>
        ) : error ? (
          <div className="space-y-4">
            <p className="text-destructive text-sm">{error}</p>
            <button
              onClick={handleTossAutoLogin}
              className="tds-button-primary w-full"
            >
              다시 시도
            </button>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">로그인 준비 중...</p>
        )}
      </div>
    </div>
  );
};

export default Login;
