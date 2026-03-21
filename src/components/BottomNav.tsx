import { Link, useLocation } from 'react-router-dom';
import { Home, CalendarDays, Bot, PlusCircle } from 'lucide-react';
import { useSeniorMode } from '@/contexts/SeniorModeContext';
import { useTranslation } from 'react-i18next';

const BottomNav = () => {
  const { pathname } = useLocation();
  const { isSeniorMode } = useSeniorMode();
  const { t } = useTranslation();

  const items = [
    { to: '/home', icon: Home, label: t('nav.home') },
    { to: '/schedule', icon: CalendarDays, label: t('nav.schedule') },
    { to: '/add/supplement', icon: PlusCircle, label: '약 추가' },
    { to: '/ai-chat', icon: Bot, label: t('nav.ai') },
  ];

  const isActive = (to: string) => {
    if (to === '/home') return pathname === '/home';
    return pathname.startsWith(to);
  };

  return (
    <nav className="tds-bottom-nav">
      {items.map(({ to, icon: Icon, label }) => (
        <Link
          key={to}
          to={to}
          className={`tds-nav-item ${isActive(to) ? 'active' : ''}`}
        >
          <Icon className={isSeniorMode ? 'w-7 h-7' : 'w-5 h-5'} />
          <span className={isSeniorMode ? 'text-sm' : ''}>{label}</span>
        </Link>
      ))}
    </nav>
  );
};

export default BottomNav;
