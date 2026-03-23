import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { isInTossApp } from '@/utils/toss';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Checkbox } from '@/components/ui/checkbox';

interface Term {
  id: string;
  title: string;
  content_url: string;
  is_required: boolean;
  term_type: string;
}

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [terms, setTerms] = useState<Term[]>([]);
  const [consents, setConsents] = useState<Record<string, boolean>>({});
  const { loginWithToss, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const inToss = isInTossApp();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/home';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
      return;
    }
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
          <div className="w-20 h-20 rounded-[28px] bg-accent flex items-center justify-center mx-auto shadow-lg">
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
              <button onClick={handleLogin} className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-[15px] active:scale-[0.98] transition-transform">
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

  // 외부 브라우저: 토스 스타일 온보딩
  return (
    <div className="min-h-screen bg-background flex flex-col safe-area-padding">
      {/* 상단 여백 + 메인 콘텐츠 */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="max-w-sm w-full text-center space-y-8">
          {/* 아이콘 */}
          <div className="relative inline-flex">
            <div className="w-28 h-28 rounded-[32px] bg-gradient-to-br from-primary/20 to-accent flex items-center justify-center mx-auto shadow-[0_8px_30px_-8px_hsl(var(--primary)/0.25)]">
              <span className="text-6xl drop-shadow-sm">💊</span>
            </div>
          </div>

          {/* 타이틀 & 설명 */}
          <div className="space-y-3">
            <h1 className="text-[28px] font-bold tracking-tight text-foreground">요약</h1>
            <p className="text-muted-foreground text-[15px] leading-relaxed">
              AI 기반 복약 관리 서비스<br />
              약 등록부터 스케줄 관리까지 한 번에
            </p>
          </div>

          {/* 기능 하이라이트 */}
          <div className="flex justify-center gap-6 pt-2">
            {[
              { icon: '📋', label: '처방전 인식' },
              { icon: '⏰', label: '복약 알림' },
              { icon: '🤖', label: 'AI 상담' },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-2xl bg-card border border-border flex items-center justify-center shadow-sm">
                  <span className="text-xl">{item.icon}</span>
                </div>
                <span className="text-xs text-muted-foreground font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 하단 CTA */}
      <div className="px-6 pb-8 pt-4 max-w-sm w-full mx-auto space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <Loader2 className="w-7 h-7 animate-spin text-primary" />
            <p className="text-muted-foreground text-sm">로그인 중...</p>
          </div>
        ) : error ? (
          <div className="space-y-3">
            <p className="text-destructive text-sm text-center">{error}</p>
            <button
              onClick={handleLogin}
              className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-semibold text-base active:scale-[0.98] transition-transform shadow-[0_4px_14px_-4px_hsl(var(--primary)/0.4)]"
            >
              다시 시도
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogin}
            className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-semibold text-base active:scale-[0.98] transition-transform shadow-[0_4px_14px_-4px_hsl(var(--primary)/0.4)]"
          >
            시작하기
          </button>
        )}

        <p className="text-xs text-muted-foreground text-center">
          토스 앱에서 더 편리하게 이용할 수 있어요
        </p>
      </div>
    </div>
  );
};

export default Login;
