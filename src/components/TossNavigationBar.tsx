import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, MoreHorizontal } from 'lucide-react';
import { useSeniorMode } from '@/contexts/SeniorModeContext';
import { useState } from 'react';

interface TossNavigationBarProps {
  title?: string;
  showBackButton?: boolean;
  rightAction?: React.ReactNode;
  onBackOverride?: () => void;
}

/** 토스 비게임 미니앱 내비게이션 바 (출시 체크리스트 준수) */
const TossNavigationBar = ({
  title,
  showBackButton = true,
  rightAction,
  onBackOverride,
}: TossNavigationBarProps) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { isSeniorMode: sr } = useSeniorMode();
  const [moreOpen, setMoreOpen] = useState(false);

  // 홈(/home)이 최초 화면 → 뒤로가기 시 미니앱 종료
  const isHome = pathname === '/home';

  const handleBack = () => {
    if (onBackOverride) {
      onBackOverride();
      return;
    }
    if (isHome) {
      // 최초 화면에서 뒤로가기 → 미니앱 종료 (토스 WebView에서 history.back으로 종료됨)
      window.history.back();
    } else {
      navigate(-1);
    }
  };

  return (
    <>
      <header
        className="toss-nav-bar sticky top-0 z-50 bg-card"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className={`flex items-center ${sr ? 'h-14' : 'h-12'} px-2`}>
          {/* Left: 뒤로가기 */}
          <div className="w-12 flex items-center justify-center">
            {showBackButton && (
              <button
                onClick={handleBack}
                className="w-10 h-10 flex items-center justify-center rounded-full active:bg-muted transition-colors"
                aria-label="뒤로가기"
              >
                <ChevronLeft className={sr ? 'w-7 h-7' : 'w-6 h-6'} />
              </button>
            )}
          </div>

          {/* Center: 브랜드 로고 + 미니앱 이름 */}
          <div className="flex-1 flex items-center justify-center gap-1.5 min-w-0">
            <span className="text-lg">💊</span>
            <span className={`font-bold text-foreground truncate ${sr ? 'text-lg' : 'text-[15px]'}`}>
              {title || '요약'}
            </span>
          </div>

          {/* Right: 기능 버튼 (최대 1개) + 더보기(...) */}
          <div className="w-12 flex items-center justify-center gap-0.5">
            {rightAction || (
              <button
                onClick={() => setMoreOpen(!moreOpen)}
                className="w-10 h-10 flex items-center justify-center rounded-full active:bg-muted transition-colors"
                aria-label="더보기"
              >
                <MoreHorizontal className={sr ? 'w-6 h-6' : 'w-5 h-5'} />
              </button>
            )}
          </div>
        </div>
        <div className="h-px bg-border" />
      </header>

      {/* 더보기 메뉴: 토스 공통 기능 (신고, 공유 등) */}
      {moreOpen && (
        <>
          <div className="fixed inset-0 z-[60]" onClick={() => setMoreOpen(false)} />
          <div className="fixed top-12 right-2 z-[61] bg-card rounded-2xl shadow-lg border border-border py-2 min-w-[160px]"
            style={{ marginTop: 'env(safe-area-inset-top)' }}
          >
            <button
              className="w-full text-left px-4 py-3 text-sm hover:bg-muted transition-colors"
              onClick={() => {
                setMoreOpen(false);
                // 토스 공유 기능
                if (navigator.share) {
                  navigator.share({ title: '요약 - 복약 도우미', url: window.location.href });
                }
              }}
            >
              공유하기
            </button>
            <button
              className="w-full text-left px-4 py-3 text-sm hover:bg-muted transition-colors text-destructive"
              onClick={() => {
                setMoreOpen(false);
                // 신고 기능 placeholder
                alert('신고가 접수되었습니다.');
              }}
            >
              신고하기
            </button>
          </div>
        </>
      )}
    </>
  );
};

export default TossNavigationBar;
