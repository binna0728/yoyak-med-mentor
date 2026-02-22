import { Link, Navigate } from 'react-router-dom';
import { Camera, Pill, Clock, AlertTriangle, Users, CreditCard, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import heroImage from '@/assets/hero-medical.jpg';

const steps = [
  { icon: Camera, title: '처방전 촬영', desc: '사진으로 간편하게 약물 정보를 입력하세요' },
  { icon: Pill, title: '약 목록 확인', desc: '추출된 약물 정보를 한눈에 확인하고 수정하세요' },
  { icon: Clock, title: '골든타임 스케줄', desc: '최적의 복용 시간표를 자동으로 생성합니다' },
  { icon: AlertTriangle, title: '상호작용 체크', desc: '약물 간 충돌과 식사 타이밍을 검사합니다' },
  { icon: Users, title: '가족 관리', desc: '보호자가 환자의 복약 상태를 원격으로 확인합니다' },
  { icon: CreditCard, title: '응급 카드', desc: '인쇄 가능한 응급 의료 정보 카드를 만드세요' },
];

const Landing = () => {
  const { isAuthenticated, loading } = useAuth();

  if (!loading && isAuthenticated) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <Pill className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold text-foreground">요약</span>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/auth/login">로그인</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/auth/signup">시작하기</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="container grid items-center gap-8 py-12 md:grid-cols-2 md:py-20">
          <div className="animate-fade-in space-y-6">
            <div className="inline-block rounded-full bg-accent px-3 py-1 text-sm font-medium text-accent-foreground">
              🇰🇷 한국 처방전 최적화
            </div>
            <h1 className="text-3xl font-bold leading-tight text-foreground md:text-5xl">
              AI가 만드는<br />
              <span className="text-primary">쉬운 복약 가이드</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              처방전 촬영 한 번으로 복용 일정, 약물 상호작용 체크, 
              가족 관리까지. 어르신도 쉽게 사용할 수 있는 복약 도우미.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link to="/auth/signup">무료로 시작하기 <ChevronRight className="ml-1 h-4 w-4" /></Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/auth/login">데모 체험</Link>
              </Button>
            </div>
          </div>
          <div className="animate-slide-up">
            <img src={heroImage} alt="요약 앱 미리보기" className="rounded-2xl shadow-lg" />
          </div>
        </div>
      </section>

      {/* Flow Steps */}
      <section className="border-t border-border bg-card py-12 md:py-16">
        <div className="container">
          <h2 className="mb-8 text-center text-2xl font-bold text-foreground md:text-3xl">
            이렇게 사용해요
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {steps.map((step, i) => (
              <div key={i} className="group rounded-xl border border-border bg-background p-5 transition-shadow hover:shadow-md">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <step.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mb-1 font-semibold text-foreground">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted py-8">
        <div className="container text-center">
          <p className="mb-2 text-sm font-medium text-foreground">요약 (YoYak)</p>
          <p className="text-xs text-muted-foreground">
            ⚕️ 본 서비스는 의료 전문가의 상담을 대체하지 않습니다. 정확한 진단과 치료는 반드시 의사와 상담하세요.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">© 2026 요약. 데모 버전.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
