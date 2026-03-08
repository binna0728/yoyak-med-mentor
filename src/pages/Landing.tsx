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
    <div className="min-h-screen bg-white flex flex-col safe-area-padding">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 rounded-3xl bg-[#E8F3FF] flex items-center justify-center mb-6 shadow-lg">
          <span className="text-4xl">💊</span>
        </div>

        <h1 className="text-3xl font-bold text-[#191F28] mb-2">
          요약 <span className="text-[#3182F6]">YoYak</span>
        </h1>
        <p className="text-lg text-[#3182F6] font-medium mb-2">
          약사를 위한 AI 복약지도
        </p>
        <p className="text-[#6B7684] text-base mb-10 max-w-xs">
          약 이름 하나로 완성되는 복약지도
        </p>

        {/* Features */}
        <div className="w-full max-w-sm space-y-3 mb-10">
          <FeatureItem icon="🤖" text="AI가 자동 생성하는 복약지도" />
          <FeatureItem icon="👴" text="환자가 이해하기 쉬운 설명" />
          <FeatureItem icon="📸" text="이미지로 저장하여 전달 가능" />
          <FeatureItem icon="⚡" text="약 이름 입력만으로 즉시 생성" />
        </div>

        {/* CTA */}
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
          <p className="mt-4 text-xs text-[#8B95A1]">토스 앱에서 실행 중입니다</p>
        )}
      </div>

      {/* Footer */}
      <div className="py-6 text-center">
        <p className="text-xs text-[#8B95A1]">© 2026 요약(YoYak) · AI 복약지도 서비스</p>
      </div>
    </div>
  );
};

const FeatureItem = ({ icon, text }: { icon: string; text: string }) => (
  <div className="tds-card flex items-center gap-4">
    <span className="text-2xl">{icon}</span>
    <span className="text-[#191F28] font-medium text-left">{text}</span>
  </div>
);

export default Landing;
