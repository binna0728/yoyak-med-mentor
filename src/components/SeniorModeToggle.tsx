import { useSeniorMode } from '@/contexts/SeniorModeContext';
import { useTranslation } from 'react-i18next';

const SeniorModeToggle = () => {
  const { isSeniorMode: sr, toggleSeniorMode } = useSeniorMode();
  const { t } = useTranslation();

  return (
    <button
      onClick={toggleSeniorMode}
      className={`flex items-center justify-center gap-0.5 rounded-full transition-all ${
        sr
          ? 'w-12 h-12 bg-primary text-primary-foreground'
          : 'w-9 h-9 bg-accent text-muted-foreground'
      }`}
      title={t('home.seniorMode')}
    >
      <span className={sr ? 'text-xs font-bold' : 'text-[10px] font-medium'}>가</span>
      <span className={sr ? 'text-base font-bold' : 'text-sm font-medium'}>가</span>
    </button>
  );
};

export default SeniorModeToggle;
