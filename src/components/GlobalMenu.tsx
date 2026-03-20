import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useSeniorMode } from '@/contexts/SeniorModeContext';
import SideMenu from '@/components/SideMenu';

const HIDDEN_PATHS = ['/', '/login'];

const GlobalMenu = () => {
  const [open, setOpen] = useState(false);
  const { isSeniorMode: sr } = useSeniorMode();
  const { pathname } = useLocation();

  const isHidden = HIDDEN_PATHS.includes(pathname);
  if (isHidden) return null;

  return (
    <>
      <SideMenu open={open} onClose={() => setOpen(false)} />
      <div
        className={`z-[55] bg-card border-b border-border flex items-center shrink-0 ${
          sr ? 'h-11 px-4' : 'h-10 px-3'
        }`}
      >
        <button
          onClick={() => setOpen(!open)}
          className={`flex items-center justify-center rounded-lg hover:bg-muted transition-colors active:scale-90 ${
            sr ? 'w-9 h-9' : 'w-8 h-8'
          }`}
          aria-label="메뉴 열기"
        >
          <Menu className={sr ? 'w-6 h-6' : 'w-5 h-5'} />
        </button>
      </div>
    </>
  );
};

export default GlobalMenu;
