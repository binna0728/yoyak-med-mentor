import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Onboarding = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col safe-area-padding">
      {/* Top right link */}
      <div className="flex justify-end px-5 pt-4">
        <button onClick={() => navigate('/login')} className="text-sm text-muted-foreground">서비스 소개</button>
      </div>

      {/* Center content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <h1 className="text-4xl font-bold text-foreground mb-1">요약<span className="text-muted-foreground text-lg ml-1">(要藥)</span></h1>
        <p className="text-muted-foreground text-sm mb-8">AI 복약 안내 서비스</p>

        {/* Pill illustration placeholder */}
        <div className="w-32 h-32 rounded-3xl bg-accent flex items-center justify-center mb-12">
          <span className="text-6xl">💊</span>
        </div>

        <button
          onClick={() => navigate('/login')}
          className="tds-button-primary w-full max-w-xs"
        >
          시작하기
        </button>
      </div>

      {/* Page indicator dots */}
      <div className="flex items-center justify-center gap-2 pb-8">
        <div className="w-2 h-2 rounded-full bg-primary" />
        <div className="w-2 h-2 rounded-full bg-border" />
        <div className="w-2 h-2 rounded-full bg-border" />
      </div>
    </div>
  );
};

export default Onboarding;
