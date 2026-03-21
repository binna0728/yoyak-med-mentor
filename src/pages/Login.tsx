import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { isInTossApp } from '@/utils/toss';
import { Loader2 } from 'lucide-react';

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { loginWithToss, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const inToss = isInTossApp();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/home';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
      return;
    }
    // 토스 인앱에서만 자동 로그인
    if (inToss) {
      handleLogin();
    }
  }, [isAuthenticated]);

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (inToss) {
        const tossToken = await getTossToken();
        await loginWithToss(tossToken);
      } else {
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

  // 토스 인앱: 자동 로그인 로딩 UI
  if (inToss) {
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
              <button onClick={handleLogin} className="tds-button-primary w-full">
                다시 시도
              </button>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">로그인 준비 중...</p>
          )}
        </div>
      </div>
    );
  }

  // 외부 브라우저: 시작하기 버튼 표시
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center safe-area-padding px-6">
      <div className="max-w-sm w-full text-center space-y-8">
        <div className="space-y-4">
          <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto">
            <span className="text-5xl">💊</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">요약</h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              AI 기반 복약 관리 서비스<br />
              약 등록부터 스케줄 관리까지 한 번에
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {isLoading ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-muted-foreground text-sm">로그인 중...</p>
            </div>
          ) : error ? (
            <div className="space-y-3">
              <p className="text-destructive text-sm">{error}</p>
              <button onClick={handleLogin} className="tds-button-primary w-full h-14 text-base font-semibold rounded-2xl">
                다시 시도
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogin}
              className="tds-button-primary w-full h-14 text-base font-semibold rounded-2xl"
            >
              시작하기
            </button>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          토스 앱에서 더 편리하게 이용할 수 있어요
        </p>
      </div>
    </div>
  );
};

export default Login;
