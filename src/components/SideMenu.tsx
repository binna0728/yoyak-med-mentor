import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSeniorMode } from '@/contexts/SeniorModeContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  X, Home, Camera, CalendarDays, Bot, Music, MapPin,
  Newspaper, BookImage, Pill, Settings, LogOut
} from 'lucide-react';

interface SideMenuProps {
  open: boolean;
  onClose: () => void;
}

const menuItems = [
  { to: '/home', icon: Home, label: '홈', emoji: '🏠' },
  { to: '/capture', icon: Camera, label: '약 등록', emoji: '📷' },
  { to: '/schedule', icon: CalendarDays, label: '복약 스케줄', emoji: '📋' },
  { to: '/add/supplement', icon: Pill, label: '약 추가', emoji: '💊' },
  { to: '/ai-chat', icon: Bot, label: 'AI 상담', emoji: '🤖' },
  { type: 'divider' as const },
  { to: '/sounds', icon: Music, label: '사운드', emoji: '🎵', tab: 'sounds' },
  { to: '/sounds', icon: MapPin, label: '가까운 약국', emoji: '🏥', tab: 'pharmacy' },
  { to: '/sounds', icon: Newspaper, label: '건강 블로그', emoji: '📰', tab: 'blog' },
  { to: '/sounds', icon: BookImage, label: '상식 웹툰', emoji: '📚', tab: 'webtoon' },
  { type: 'divider' as const },
  { to: '/settings', icon: Settings, label: '설정', emoji: '⚙️' },
];

const SideMenu = ({ open, onClose }: SideMenuProps) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { isSeniorMode: sr } = useSeniorMode();
  const { user, logout } = useAuth();
  const overlayRef = useRef<HTMLDivElement>(null);

  // ESC 키로 닫기
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // 바깥 클릭으로 닫기
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const handleNav = (to: string, tab?: string) => {
    if (tab) {
      // 더보기 탭으로 이동 시 state로 탭 전달
      navigate(to, { state: { tab } });
    } else {
      navigate(to);
    }
    onClose();
  };

  const handleLogout = () => {
    logout();
    onClose();
    navigate('/login');
  };

  return (
    <>
      {/* 오버레이 */}
      <div
        ref={overlayRef}
        onClick={handleOverlayClick}
        className={`fixed inset-0 bg-black/40 z-50 transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* 사이드 패널 */}
      <div
        className={`fixed top-0 left-0 h-full bg-card z-50 shadow-2xl transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        } ${sr ? 'w-72' : 'w-64'}`}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <p className={`font-bold text-foreground ${sr ? 'text-xl' : 'text-lg'}`}>
              {user?.name || '사용자'}님
            </p>
            <p className={`text-muted-foreground ${sr ? 'text-sm' : 'text-xs'}`}>
              요약(YoYak)
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <X className={sr ? 'w-6 h-6' : 'w-5 h-5'} />
          </button>
        </div>

        {/* 메뉴 리스트 */}
        <nav className="flex-1 overflow-y-auto py-2">
          {menuItems.map((item, idx) => {
            if ('type' in item && item.type === 'divider') {
              return <div key={`div-${idx}`} className="my-2 mx-5 border-t border-border" />;
            }
            const menuItem = item as { to: string; icon: typeof Home; label: string; emoji: string; tab?: string };
            const Icon = menuItem.icon;
            const isActive = menuItem.tab
              ? false
              : pathname === menuItem.to || (menuItem.to !== '/home' && pathname.startsWith(menuItem.to));

            return (
              <button
                key={`${menuItem.to}-${menuItem.tab || idx}`}
                onClick={() => handleNav(menuItem.to, menuItem.tab)}
                className={`w-full flex items-center gap-3 px-5 transition-colors text-left ${
                  sr ? 'py-3.5' : 'py-2.5'
                } ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                <span className={sr ? 'text-xl' : 'text-lg'}>{menuItem.emoji}</span>
                <span className={`font-medium ${sr ? 'text-base' : 'text-sm'}`}>{menuItem.label}</span>
              </button>
            );
          })}
        </nav>

        {/* 로그아웃 */}
        <div className="border-t border-border px-5 py-4">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 text-muted-foreground hover:text-destructive transition-colors ${
              sr ? 'py-2' : 'py-1'
            }`}
          >
            <LogOut className={sr ? 'w-5 h-5' : 'w-4 h-4'} />
            <span className={`font-medium ${sr ? 'text-base' : 'text-sm'}`}>로그아웃</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default SideMenu;
