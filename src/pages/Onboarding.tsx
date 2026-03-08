import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const Onboarding = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const { t } = useTranslation();

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col safe-area-padding">
      <div className="flex justify-end px-5 pt-4">
        <button onClick={() => navigate('/login')} className="text-sm text-muted-foreground">{t('app.intro')}</button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <h1 className="text-4xl font-bold text-foreground mb-1">{t('app.name')}</h1>
        <p className="text-muted-foreground text-sm mb-8">{t('app.subtitle')}</p>

        <div className="w-32 h-32 rounded-3xl bg-accent flex items-center justify-center mb-12">
          <span className="text-6xl">💊</span>
        </div>

        <button onClick={() => navigate('/login')} className="tds-button-primary w-full max-w-xs">
          {t('app.start')}
        </button>
      </div>

      <div className="flex items-center justify-center gap-2 pb-8">
        <div className="w-2 h-2 rounded-full bg-primary" />
        <div className="w-2 h-2 rounded-full bg-border" />
        <div className="w-2 h-2 rounded-full bg-border" />
      </div>
    </div>
  );
};

export default Onboarding;
