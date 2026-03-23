import { useSeniorMode } from '@/contexts/SeniorModeContext';
import { useTranslation } from 'react-i18next';

const SeniorModeToggle = () => {
  const { isSeniorMode: sr, toggleSeniorMode } = useSeniorMode();
  const { t } = useTranslation();

  return (
    <button
      onClick={toggleSeniorMode}
      className={`flex items-center justify-center rounded-full transition-all ${
        sr ? 'w-10 h-10 bg-primary text-primary-foreground' : 'w-10 h-10 bg-accent text-primary'
      }`}
      title={t('home.seniorMode')}
    >
      <span className="flex items-baseline gap-0.5 font-bold leading-none">
        <span className="text-xs">가</span>
        <span className="text-base">가</span>
      </span>
    </button>
  );
};

export default SeniorModeToggle;
