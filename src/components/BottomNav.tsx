import { Link, useLocation } from 'react-router-dom';
import { Home, ClipboardList, Settings } from 'lucide-react';

const BottomNav = () => {
  const { pathname } = useLocation();

  const items = [
    { to: '/home', icon: Home, label: '홈' },
    { to: '/schedule', icon: ClipboardList, label: '기록' },
    { to: '/settings', icon: Settings, label: '설정' },
  ];

  return (
    <nav className="tds-bottom-nav lg:hidden">
      {items.map(({ to, icon: Icon, label }) => (
        <Link
          key={to}
          to={to}
          className={`tds-nav-item ${pathname === to ? 'active' : ''}`}
        >
          <Icon className="w-5 h-5" />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
};

export default BottomNav;
