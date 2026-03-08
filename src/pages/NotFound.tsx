import { Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const NotFound = () => {
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    console.error('404 Error: User attempted to access non-existent route:', location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/10">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-bold text-foreground">{t('notFound.title')}</h1>
        <p className="text-xl text-muted-foreground">{t('notFound.desc')}</p>
        <Link to="/">
          <Button className="gap-2">
            <Home className="w-4 h-4" />
            {t('notFound.goHome')}
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
