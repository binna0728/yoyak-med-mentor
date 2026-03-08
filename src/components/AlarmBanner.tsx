import { X, Bell } from 'lucide-react';
import { useSeniorMode } from '@/contexts/SeniorModeContext';
import type { AlarmItem } from '@/hooks/useMedicationAlarm';
import { useTranslation } from 'react-i18next';

interface AlarmBannerProps {
  alarm: AlarmItem;
  onDismiss: () => void;
}

const AlarmBanner = ({ alarm, onDismiss }: AlarmBannerProps) => {
  const { isSeniorMode: sr } = useSeniorMode();
  const { t } = useTranslation();

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] animate-slide-down safe-area-padding">
      <div className={`mx-3 mt-3 rounded-2xl bg-primary text-primary-foreground shadow-lg border border-primary-dark/20 flex items-center gap-3 ${
        sr ? 'p-5' : 'p-4'
      }`}>
        <div className={`rounded-full bg-primary-foreground/20 flex items-center justify-center flex-shrink-0 ${
          sr ? 'w-12 h-12' : 'w-10 h-10'
        }`}>
          <Bell className={sr ? 'w-6 h-6' : 'w-5 h-5'} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`font-bold ${sr ? 'text-lg' : 'text-sm'}`}>{t('alarm.timeToTake')}</p>
          <p className={`opacity-90 ${sr ? 'text-base' : 'text-xs'} mt-0.5`}>{alarm.name} — {alarm.time}</p>
        </div>
        <button onClick={onDismiss} className={`flex-shrink-0 rounded-full bg-primary-foreground/20 hover:bg-primary-foreground/30 transition-colors ${sr ? 'p-3' : 'p-2'}`}>
          <X className={sr ? 'w-5 h-5' : 'w-4 h-4'} />
        </button>
      </div>
    </div>
  );
};

export default AlarmBanner;
