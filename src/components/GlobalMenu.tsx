import { useLocation } from 'react-router-dom';
import TossNavigationBar from '@/components/TossNavigationBar';

const HIDDEN_PATHS = ['/', '/login'];

/** 앱 전역 내비게이션 바 — 토스 미니앱 체크리스트 기준 */
const GlobalMenu = () => {
  const { pathname } = useLocation();
  if (HIDDEN_PATHS.includes(pathname)) return null;

  return <TossNavigationBar />;
};

export default GlobalMenu;
