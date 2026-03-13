import { Bell, BellOff } from 'lucide-react';
import { useSeniorMode } from '@/contexts/SeniorModeContext';
import { useTranslation } from 'react-i18next';

interface AlarmPermissionPromptProps {
  granted: boolean;
  onRequest: () => void;
  onRevoke: () => void;
}

const AlarmPermissionPrompt = ({ granted, onRequest, onRevoke }: AlarmPermissionPromptProps) => {
  const { isSeniorMode: sr } = useSeniorMode();
  const { t } = useTranslation();

  return (
    <button
      onClick={granted ? onRevoke : onRequest}
      className={`tds-card flex items-center gap-3 w-full text-left transition-colors mb-4 ${
        granted
          ? 'border-primary/30 bg-primary/5'
          : 'border-dashed border-primary/40 hover:border-primary'
      } ${sr ? 'p-5' : 'p-4'}`}
    >
      <div className={`rounded-full flex items-center justify-center flex-shrink-0 ${
        granted ? 'bg-primary/10' : 'bg-accent'
      } ${sr ? 'w-12 h-12' : 'w-10 h-10'}`}>
        {granted
          ? <Bell className={`text-primary ${sr ? 'w-6 h-6' : 'w-5 h-5'}`} />
          : <BellOff className={`text-muted-foreground ${sr ? 'w-6 h-6' : 'w-5 h-5'}`} />}
      </div>
      <div className="flex-1">
        <p className={`font-semibold ${granted ? 'text-primary' : 'text-foreground'} ${sr ? 'text-lg' : 'text-sm'}`}>
          {granted ? '🔔 알림 허용됨' : t('alarm.enableNotif')}
        </p>
        <p className={`text-muted-foreground ${sr ? 'text-base' : 'text-xs'}`}>
          {granted ? '복약 시간에 알림을 보내드려요 · 탭하여 해제' : t('alarm.enableNotifDesc')}
        </p>
      </div>
    </button>
  );
};

export default AlarmPermissionPrompt;
