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

  // 이미 인증됐으면 홈으로
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
      return;
    }

    // 토스 인앱이든 외부 브라우저든 자동 로그인 시도
    handleAutoLogin();
  }, [isAuthenticated]);

  const handleAutoLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (inToss) {
        // 토스 WebView Bridge에서 토큰 획득
        const tossToken = await getTossToken();
        await loginWithToss(tossToken);
      } else {
        // 외부 브라우저: 데모 모드로 자동 진입
        await loginWithToss('demo_token');
      }
      navigate(from, { replace: true });
    } catch {
      setError('로그인에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const getTossToken = (): Promise<string> => {
    return new Promise((resolve) => {
      resolve('toss_demo_token');
    });
  };

  // 외부 브라우저에서도 자동 로그인하므로 별도 분기 불필요
  // 로딩/에러 UI만 표시

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
              onClick={handleAutoLogin}
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
