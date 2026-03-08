import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { isInTossApp } from '@/utils/toss';

const Landing = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const inToss = isInTossApp();

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col safe-area-padding">
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 rounded-3xl bg-accent flex items-center justify-center mb-6 shadow-lg">
          <span className="text-4xl">💊</span>
        </div>

        <h1 className="text-3xl font-bold text-foreground mb-2">
          요약 <span className="text-primary">YoYak</span>
        </h1>
        <p className="text-lg text-primary font-medium mb-2">
          내 약, 쉽고 정확하게
        </p>
        <p className="text-muted-foreground text-base mb-10 max-w-xs">
          약 이름을 입력하면 AI가 복용법, 주의사항을 쉽게 알려드려요
        </p>

        <div className="w-full max-w-sm space-y-3 mb-10">
          <FeatureItem icon="🔍" text="약 정보 간단 확인" />
          <FeatureItem icon="👴" text="커다란 글씨로 보기 (시니어 모드)" />
          <FeatureItem icon="⏰" text="복용시간 알림" />
          <FeatureItem icon="⚡" text="약 이름 입력만으로 즉시 확인" />
        </div>

        <div className="w-full max-w-sm space-y-3">
          <button
            onClick={() => navigate('/signup')}
            className="tds-button-primary w-full"
          >
            시작하기
          </button>
          <button
            onClick={() => navigate('/login')}
            className="tds-button-secondary w-full"
          >
            로그인
          </button>
        </div>

        {inToss && (
          <p className="mt-4 text-xs text-muted-foreground">토스 앱에서 실행 중입니다</p>
        )}
      </div>

      <div className="py-6 text-center">
        <p className="text-xs text-muted-foreground">© 2026 요약(YoYak) · 복약 안내 서비스</p>
      </div>
    </div>
  );
};

const FeatureItem = ({ icon, text }: { icon: string; text: string }) => (
  <div className="tds-card flex items-center gap-4">
    <span className="text-2xl">{icon}</span>
    <span className="text-foreground font-medium text-left">{text}</span>
  </div>
);

export default Landing;
