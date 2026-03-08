import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSeniorMode } from '@/contexts/SeniorModeContext';
import { ArrowLeft, ChevronRight, Bell, Eye, User, LogOut, Info, Shield, Globe } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { useTranslation } from 'react-i18next';


const Settings = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isSeniorMode, toggleSeniorMode } = useSeniorMode();
  const [notificationOn, setNotificationOn] = useState(true);
  const { t, i18n } = useTranslation();

  const sr = isSeniorMode;

  const handleLogout = () => { logout(); navigate('/login'); };

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'ko' ? 'en' : 'ko');
  };

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
      <header className="tds-header">
        <div className="flex items-center h-14 px-4 border-b border-border">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <div className="flex-1 text-center">
            <span className={`font-bold text-foreground ${sr ? 'text-xl' : 'text-lg'}`}>{t('settings.title')}</span>
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
            {(user?.name || t('common.user'))[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`font-bold text-foreground ${sr ? 'text-xl' : 'text-base'}`}>
              {user?.name || t('common.user')}
            </p>
            <p className={`text-muted-foreground truncate ${sr ? 'text-base' : 'text-sm'}`}>
              {user?.email || 'user@example.com'}
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        </div>

        {/* Notification & Display */}
        <div>
          <p className={`text-muted-foreground font-medium mb-2 px-1 ${sr ? 'text-base' : 'text-xs'}`}>{t('settings.notifDisplay')}</p>
          <div className="rounded-2xl border border-border overflow-hidden">
            <div className={`flex items-center justify-between bg-card ${sr ? 'py-5 px-5' : 'py-4 px-5'}`}>
              <div className="flex items-center gap-3">
                <Bell className={`text-primary ${sr ? 'w-6 h-6' : 'w-5 h-5'}`} />
                <span className={`text-foreground font-medium ${sr ? 'text-lg' : 'text-base'}`}>{t('settings.medAlarm')}</span>
              </div>
              <Toggle on={notificationOn} onToggle={() => setNotificationOn(v => !v)} />
            </div>

            <div className="h-px bg-border mx-6" />

            <div className={`flex items-center justify-between bg-card ${sr ? 'py-5 px-5' : 'py-4 px-5'}`}>
              <div className="flex items-center gap-3">
                <Eye className={`text-primary ${sr ? 'w-6 h-6' : 'w-5 h-5'}`} />
                <div>
                  <span className={`text-foreground font-medium ${sr ? 'text-lg' : 'text-base'}`}>{t('settings.silverMode')}</span>
                  <p className={`text-muted-foreground ${sr ? 'text-sm' : 'text-xs'}`}>{t('settings.silverModeDesc')}</p>
                </div>
              </div>
              <Toggle on={isSeniorMode} onToggle={toggleSeniorMode} />
            </div>
          </div>
        </div>

        {/* Language */}
        <div>
          <p className={`text-muted-foreground font-medium mb-2 px-1 ${sr ? 'text-base' : 'text-xs'}`}>{t('settings.language')}</p>
          <div className="rounded-2xl border border-border overflow-hidden">
            <button onClick={toggleLanguage} className={`flex items-center justify-between bg-card w-full ${sr ? 'py-5 px-5' : 'py-4 px-5'}`}>
              <div className="flex items-center gap-3">
                <Globe className={`text-primary ${sr ? 'w-6 h-6' : 'w-5 h-5'}`} />
                <span className={`text-foreground font-medium ${sr ? 'text-lg' : 'text-base'}`}>
                  {i18n.language === 'ko' ? t('settings.korean') : t('settings.english')}
                </span>
              </div>
              <span className={`text-muted-foreground ${sr ? 'text-base' : 'text-sm'}`}>
                {i18n.language === 'ko' ? 'EN →' : 'KO →'}
              </span>
            </button>
          </div>
        </div>

        {/* Account */}
        <div>
          <p className={`text-muted-foreground font-medium mb-2 px-1 ${sr ? 'text-base' : 'text-xs'}`}>{t('settings.account')}</p>
          <div className="rounded-2xl border border-border overflow-hidden">
            <button className={`flex items-center justify-between bg-card w-full ${sr ? 'py-5 px-5' : 'py-4 px-5'}`}>
              <div className="flex items-center gap-3">
                <User className={`text-primary ${sr ? 'w-6 h-6' : 'w-5 h-5'}`} />
                <span className={`text-foreground font-medium ${sr ? 'text-lg' : 'text-base'}`}>{t('settings.accountMgmt')}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>

            <div className="h-px bg-border mx-6" />

            <button className={`flex items-center justify-between bg-card w-full ${sr ? 'py-5 px-5' : 'py-4 px-5'}`}>
              <div className="flex items-center gap-3">
                <Shield className={`text-primary ${sr ? 'w-6 h-6' : 'w-5 h-5'}`} />
                <span className={`text-foreground font-medium ${sr ? 'text-lg' : 'text-base'}`}>{t('settings.privacy')}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="h-4" />

        <button
          onClick={handleLogout}
          className={`w-full rounded-2xl border border-border bg-card flex items-center justify-center gap-2 text-muted-foreground font-medium transition-colors hover:bg-muted ${
            sr ? 'h-16 text-lg' : 'h-14 text-base'
          }`}
        >
          <LogOut className={sr ? 'w-6 h-6' : 'w-5 h-5'} />
          {t('auth.logout')}
        </button>

        <div className="flex items-center justify-center gap-2 pt-2">
          <Info className="w-4 h-4 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">{t('app.version')}</p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Settings;
