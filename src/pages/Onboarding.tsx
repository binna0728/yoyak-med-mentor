import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

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
      </div>

      <div className="flex items-center justify-center gap-2 pb-4">
        <div className="w-2 h-2 rounded-full bg-primary" />
        <div className="w-2 h-2 rounded-full bg-border" />
        <div className="w-2 h-2 rounded-full bg-border" />
      </div>

      <div className="px-5 pb-8 safe-area-padding">
        <Button className="w-full h-14 text-lg font-semibold rounded-2xl" onClick={() => navigate('/login')}>
          {t('app.start')}
        </Button>
      </div>
    </div>
  );
};

export default Onboarding;
