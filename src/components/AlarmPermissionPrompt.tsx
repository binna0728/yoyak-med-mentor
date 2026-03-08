import { Bell } from 'lucide-react';
import { useSeniorMode } from '@/contexts/SeniorModeContext';

interface AlarmPermissionPromptProps {
  onRequest: () => void;
}

const AlarmPermissionPrompt = ({ onRequest }: AlarmPermissionPromptProps) => {
  const { isSeniorMode: sr } = useSeniorMode();

  return (
    <button
      onClick={onRequest}
      className={`tds-card flex items-center gap-3 w-full text-left border-dashed border-primary/40 hover:border-primary transition-colors ${
        sr ? 'p-5' : 'p-4'
      }`}
    >
      <div className={`rounded-full bg-accent flex items-center justify-center flex-shrink-0 ${
        sr ? 'w-12 h-12' : 'w-10 h-10'
      }`}>
        <Bell className={`text-primary ${sr ? 'w-6 h-6' : 'w-5 h-5'}`} />
      </div>
      <div className="flex-1">
        <p className={`font-semibold text-foreground ${sr ? 'text-lg' : 'text-sm'}`}>
          🔔 알림 허용하기
        </p>
        <p className={`text-muted-foreground ${sr ? 'text-base' : 'text-xs'}`}>
          복약 시간에 알림을 받으려면 허용해주세요
        </p>
      </div>
    </button>
  );
};

export default AlarmPermissionPrompt;
