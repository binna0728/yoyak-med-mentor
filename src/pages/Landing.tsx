import { Link, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Heart, Shield, Brain, Activity, ArrowRight } from 'lucide-react';

const Landing = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Heart className="w-6 h-6 text-primary" />
          </div>
          <span className="text-xl font-bold text-foreground">AI HealthCare</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" size="sm">로그인</Button>
          </Link>
          <Link to="/signup">
            <Button size="sm">회원가입</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
            AI 기반의 스마트한
            <br />
            <span className="text-primary">헬스케어 서비스</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            최신 AI 기술을 활용하여 개인 맞춤형 건강 관리 솔루션을 제공합니다.
            당신의 건강을 더 스마트하게 관리하세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="gap-2 px-8">
                시작하기
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="px-8">
                로그인
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <FeatureCard
            icon={<Brain className="w-8 h-8" />}
            title="AI 분석"
            description="인공지능이 당신의 건강 데이터를 분석하여 맞춤형 인사이트를 제공합니다."
          />
          <FeatureCard
            icon={<Shield className="w-8 h-8" />}
            title="안전한 데이터 관리"
            description="최고 수준의 보안으로 당신의 건강 정보를 안전하게 보호합니다."
          />
          <FeatureCard
            icon={<Activity className="w-8 h-8" />}
            title="실시간 모니터링"
            description="건강 상태를 실시간으로 모니터링하고 이상 징후를 조기에 발견합니다."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-border">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-muted-foreground text-sm">
          <p>© 2024 AI HealthCare. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground transition-colors">이용약관</a>
            <a href="#" className="hover:text-foreground transition-colors">개인정보처리방침</a>
            <a href="#" className="hover:text-foreground transition-colors">문의하기</a>
          </div>
        </div>
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
  <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6 space-y-4 hover:shadow-lg transition-shadow">
    <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-foreground">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

export default Landing;
