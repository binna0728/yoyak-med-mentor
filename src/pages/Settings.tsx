import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSeniorMode } from '@/contexts/SeniorModeContext';
import { ArrowLeft, ChevronRight, Bell, Eye, User, LogOut, Info, Shield } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

const Settings = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isSeniorMode, toggleSeniorMode } = useSeniorMode();
  const [notificationOn, setNotificationOn] = useState(true);

  const sr = isSeniorMode;

  const handleLogout = () => { logout(); navigate('/login'); };

  const Toggle = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
    <button
      onClick={onToggle}
      className={`relative rounded-full transition-colors ${sr ? 'w-16 h-9' : 'w-12 h-7'} ${on ? 'bg-primary' : 'bg-muted'}`}
    >
      <div className={`rounded-full bg-card shadow absolute top-1 transition-transform ${
        sr ? 'w-7 h-7' : 'w-5 h-5'
      } ${on ? (sr ? 'translate-x-8' : 'translate-x-6') : 'translate-x-1'}`} />
    </button>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col safe-area-padding">
      {/* Header */}
      <header className="tds-header">
        <div className="flex items-center h-14 px-4 border-b border-border">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <div className="flex-1 text-center">
            <span className={`font-bold text-foreground ${sr ? 'text-xl' : 'text-lg'}`}>설정</span>
          </div>
          <div className="w-10" />
        </div>
      </header>

      <main className={`flex-1 px-5 py-6 pb-24 max-w-lg mx-auto w-full ${sr ? 'space-y-6' : 'space-y-5'}`}>
        {/* Profile card */}
        <div className="tds-card flex items-center gap-4">
          <div className={`rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold ${
            sr ? 'w-16 h-16 text-2xl' : 'w-12 h-12 text-lg'
          }`}>
            {(user?.name || '사용자')[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`font-bold text-foreground ${sr ? 'text-xl' : 'text-base'}`}>
              {user?.name || '사용자'}
            </p>
            <p className={`text-muted-foreground truncate ${sr ? 'text-base' : 'text-sm'}`}>
              {user?.email || 'user@example.com'}
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        </div>

        {/* Settings groups */}
        <div>
          <p className={`text-muted-foreground font-medium mb-2 px-1 ${sr ? 'text-base' : 'text-xs'}`}>알림 및 표시</p>
          <div className="rounded-2xl border border-border overflow-hidden">
            {/* Notification toggle */}
            <div className={`flex items-center justify-between bg-card ${sr ? 'py-5 px-5' : 'py-4 px-5'} border-b border-muted`}>
              <div className="flex items-center gap-3">
                <Bell className={`text-primary ${sr ? 'w-6 h-6' : 'w-5 h-5'}`} />
                <span className={`text-foreground font-medium ${sr ? 'text-lg' : 'text-base'}`}>복약 알림</span>
              </div>
              <Toggle on={notificationOn} onToggle={() => setNotificationOn(v => !v)} />
            </div>

            {/* Silver mode toggle */}
            <div className={`flex items-center justify-between bg-card ${sr ? 'py-5 px-5' : 'py-4 px-5'}`}>
              <div className="flex items-center gap-3">
                <Eye className={`text-primary ${sr ? 'w-6 h-6' : 'w-5 h-5'}`} />
                <div>
                  <span className={`text-foreground font-medium ${sr ? 'text-lg' : 'text-base'}`}>실버모드</span>
                  <p className={`text-muted-foreground ${sr ? 'text-sm' : 'text-xs'}`}>큰 글씨 · 큰 버튼</p>
                </div>
              </div>
              <Toggle on={isSeniorMode} onToggle={toggleSeniorMode} />
            </div>
          </div>
        </div>

        <div>
          <p className={`text-muted-foreground font-medium mb-2 px-1 ${sr ? 'text-base' : 'text-xs'}`}>계정</p>
          <div className="rounded-2xl border border-border overflow-hidden">
            {/* Account management */}
            <button className={`flex items-center justify-between bg-card w-full ${sr ? 'py-5 px-5' : 'py-4 px-5'} border-b border-muted`}>
              <div className="flex items-center gap-3">
                <User className={`text-primary ${sr ? 'w-6 h-6' : 'w-5 h-5'}`} />
                <span className={`text-foreground font-medium ${sr ? 'text-lg' : 'text-base'}`}>계정 관리</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>

            {/* Privacy */}
            <button className={`flex items-center justify-between bg-card w-full ${sr ? 'py-5 px-5' : 'py-4 px-5'}`}>
              <div className="flex items-center gap-3">
                <Shield className={`text-primary ${sr ? 'w-6 h-6' : 'w-5 h-5'}`} />
                <span className={`text-foreground font-medium ${sr ? 'text-lg' : 'text-base'}`}>개인정보 처리방침</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className={`w-full rounded-2xl border border-border bg-card flex items-center justify-center gap-2 text-muted-foreground font-medium transition-colors hover:bg-muted ${
            sr ? 'h-16 text-lg' : 'h-14 text-base'
          }`}
        >
          <LogOut className={sr ? 'w-6 h-6' : 'w-5 h-5'} />
          로그아웃
        </button>

        {/* App info */}
        <div className="flex items-center justify-center gap-2 pt-2">
          <Info className="w-4 h-4 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">요약(要藥) v1.0.0</p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Settings;
