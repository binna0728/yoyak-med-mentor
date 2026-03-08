import { Link, useLocation } from 'react-router-dom';
import { Home, ScanLine, CalendarDays, Bot, Settings } from 'lucide-react';
import { useSeniorMode } from '@/contexts/SeniorModeContext';

const BottomNav = () => {
  const { pathname } = useLocation();
  const { isSeniorMode } = useSeniorMode();

  const items = [
    { to: '/home', icon: Home, label: '홈' },
    { to: '/capture', icon: ScanLine, label: '스캔' },
    { to: '/schedule', icon: CalendarDays, label: '스케줄' },
    { to: '/ai-chat', icon: Bot, label: 'AI' },
    { to: '/settings', icon: Settings, label: '설정' },
  ];

  const isActive = (to: string) => {
    if (to === '/home') return pathname === '/home';
    return pathname.startsWith(to);
  };

  return (
    <nav className="tds-bottom-nav lg:hidden">
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
