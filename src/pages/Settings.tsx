import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSeniorMode } from '@/contexts/SeniorModeContext';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

const Settings = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { isSeniorMode, toggleSeniorMode } = useSeniorMode();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="min-h-screen bg-background flex flex-col safe-area-padding">
      <header className="tds-header">
        <div className="flex items-center h-14 px-4 border-b border-border">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2"><ArrowLeft className="w-6 h-6 text-foreground" /></button>
          <div className="flex-1 text-center"><span className="text-lg font-bold text-foreground">설정</span></div>
          <div className="w-10" />
        </div>
      </header>

      <main className="flex-1 px-5 py-6 pb-24 max-w-lg mx-auto w-full">
        <div className="space-y-1">
          {/* Notification toggle */}
          <div className="tds-list-item rounded-t-2xl">
            <span className="text-foreground font-medium">알림</span>
            <button className="w-12 h-7 rounded-full bg-primary relative">
              <div className="w-5 h-5 rounded-full bg-card shadow absolute top-1 translate-x-6" />
            </button>
          </div>

          {/* Silver mode toggle */}
          <div className="tds-list-item">
            <span className="text-foreground font-medium">실버모드</span>
            <button
              onClick={toggleSeniorMode}
              className={`w-12 h-7 rounded-full relative transition-colors ${isSeniorMode ? 'bg-primary' : 'bg-muted'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-card shadow absolute top-1 transition-transform ${isSeniorMode ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          {/* Account */}
          <div className="tds-list-item cursor-pointer rounded-b-2xl" onClick={() => {}}>
            <span className="text-foreground font-medium">계정 관리</span>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>

        <div className="mt-8">
          <button onClick={handleLogout} className="w-full h-14 rounded-2xl border border-border bg-card text-muted-foreground font-medium transition-colors hover:bg-muted">
            로그아웃
          </button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Settings;
