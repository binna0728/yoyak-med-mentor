import { useSeniorMode } from '@/contexts/SeniorModeContext';

interface TossNavigationBarProps {
  title?: string;
}

/** 토스 WebView 미니앱용 단순 타이틀 바 — 뒤로가기/더보기는 granite 플랫폼에 위임 */
const TossNavigationBar = ({ title }: TossNavigationBarProps) => {
  const { isSeniorMode: sr } = useSeniorMode();

  return (
    <header
      className="sticky top-0 z-50 bg-card"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className={`flex items-center justify-center ${sr ? 'h-12' : 'h-11'} px-4`}>
        <div className="flex items-center gap-1.5">
          <span className="text-lg">💊</span>
          <span className={`font-bold text-foreground ${sr ? 'text-lg' : 'text-[15px]'}`}>
            {title || '요약'}
          </span>
        </div>
      </div>
      <div className="h-px bg-border" />
    </header>
  );
};

export default TossNavigationBar;
