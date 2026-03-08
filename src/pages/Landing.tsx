import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Heart, Shield, Brain, Activity, ArrowRight } from 'lucide-react';

const Landing = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col safe-area-padding">
      {/* TDS Style Header */}
      <header className="tds-header">
        <div className="flex items-center justify-between h-14 px-5 border-b border-[#E5E8EB]">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-[#3182F6]" />
            <span className="text-lg font-bold text-[#191F28]">AI 헬스케어</span>
          </div>
          <Link to="/login" className="text-sm text-[#3182F6] font-medium">
            로그인
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 px-5 py-8">
        <div className="max-w-lg mx-auto text-center space-y-6">
          {/* Hero Icon */}
          <div className="w-20 h-20 mx-auto bg-[#E8F3FF] rounded-3xl flex items-center justify-center">
            <Heart className="w-10 h-10 text-[#3182F6]" />
          </div>

          <h1 className="text-2xl font-bold text-[#191F28] leading-tight">
            AI 기반의 스마트한
            <br />
            <span className="text-[#3182F6]">헬스케어 서비스</span>
          </h1>
          
          <p className="text-[#6B7684] text-sm leading-relaxed">
            최신 AI 기술을 활용하여 개인 맞춤형 건강 관리 솔루션을 제공합니다.
            당신의 건강을 더 스마트하게 관리하세요.
          </p>

          {/* CTA Buttons */}
          <div className="space-y-3 pt-4">
            <Link to="/signup" className="block">
              <button className="tds-button-primary w-full flex items-center justify-center gap-2">
                시작하기
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
            <Link to="/login" className="block">
              <button className="tds-button-secondary w-full">
                로그인
              </button>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-12 space-y-3">
          <FeatureCard
            icon={<Brain className="w-6 h-6" />}
            title="AI 분석"
            description="인공지능이 당신의 건강 데이터를 분석합니다"
          />
          <FeatureCard
            icon={<Shield className="w-6 h-6" />}
            title="안전한 데이터 관리"
            description="최고 수준의 보안으로 건강 정보를 보호합니다"
          />
          <FeatureCard
            icon={<Activity className="w-6 h-6" />}
            title="실시간 모니터링"
            description="건강 상태를 실시간으로 모니터링합니다"
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="px-5 py-6 border-t border-[#E5E8EB]">
        <p className="text-center text-xs text-[#8B95A1]">
          © 2024 AI HealthCare. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => (
  <div className="tds-card flex items-center gap-4">
    <div className="w-12 h-12 bg-[#E8F3FF] rounded-xl flex items-center justify-center text-[#3182F6] flex-shrink-0">
      {icon}
    </div>
    <div>
      <h3 className="text-base font-semibold text-[#191F28]">{title}</h3>
      <p className="text-sm text-[#6B7684]">{description}</p>
    </div>
  </div>
);

export default Landing;
