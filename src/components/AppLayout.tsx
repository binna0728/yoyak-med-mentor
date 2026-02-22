import React from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { LayoutDashboard, Upload, Pill, User, Calendar, AlertTriangle, Users, LogOut, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSeniorMode } from '@/contexts/SeniorModeContext';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

const bottomTabs = [
  { path: '/app/dashboard', icon: LayoutDashboard, label: '대시보드' },
  { path: '/app/schedule', icon: Calendar, label: '스케줄' },
  { path: '/app/upload', icon: Upload, label: '업로드' },
  { path: '/app/medications', icon: Pill, label: '약물' },
  { path: '/app/profile', icon: User, label: '프로필' },
];

const desktopNav = [
  { path: '/app/dashboard', label: '대시보드' },
  { path: '/app/upload', label: '처방전 업로드' },
  { path: '/app/medications', label: '약물 목록' },
  { path: '/app/schedule', label: '복용 일정' },
  { path: '/app/warnings', label: '상호작용' },
  { path: '/app/family', label: '가족 관리' },
  { path: '/app/profile', label: '프로필' },
];

const AppLayout: React.FC = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isSeniorMode, toggle } = useSeniorMode();

  if (!user) {
    navigate('/auth/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="container flex h-14 items-center justify-between md:h-16">
          <Link to="/app/dashboard" className="flex items-center gap-2">
            <Pill className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold text-foreground">요약 <span className="text-sm font-normal text-muted-foreground">YoYak</span></span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {desktopNav.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent ${
                  pathname.startsWith(item.path) ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {/* Senior Mode Toggle */}
            <div className="flex items-center gap-1.5">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <Switch checked={isSeniorMode} onCheckedChange={toggle} aria-label="시니어 모드" />
              <span className="hidden text-xs text-muted-foreground sm:inline">크게보기</span>
            </div>

            <span className="hidden text-sm text-muted-foreground lg:inline">
              {user.name} ({user.role === 'patient' ? '환자' : '보호자'})
            </span>
            <Button variant="ghost" size="icon" onClick={() => { logout(); navigate('/'); }} aria-label="로그아웃">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="app-content container py-4 md:py-6">
        <Outlet />
      </main>

      {/* Bottom Tab Navigation - Mobile Only */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card md:hidden">
        <div className="flex items-center justify-around py-1">
          {bottomTabs.map(tab => {
            const isActive = pathname.startsWith(tab.path);
            return (
              <Link
                key={tab.path}
                to={tab.path}
                className={`flex flex-col items-center gap-0.5 px-2 py-1.5 text-xs transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <tab.icon className={`h-5 w-5 ${isActive ? 'text-primary' : ''}`} />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer disclaimer */}
      <footer className="hidden border-t border-border bg-muted py-4 text-center md:block">
        <p className="text-xs text-muted-foreground">
          ⚕️ 본 서비스는 의료 전문가의 상담을 대체하지 않습니다. 정확한 진단과 치료는 반드시 의사와 상담하세요.
        </p>
      </footer>
    </div>
  );
};

export default AppLayout;
