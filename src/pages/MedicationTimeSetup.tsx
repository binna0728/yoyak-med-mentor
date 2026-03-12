import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useSeniorMode } from '@/contexts/SeniorModeContext';

type PeriodKey = 'morning' | 'afternoon' | 'evening' | 'bedtime';

interface PeriodSetting {
  hour: number;
  minute: number;
  mealTiming: '식전' | '식후' | '상관없음';
}

const DEFAULT_SETTINGS: Record<PeriodKey, PeriodSetting> = {
  morning:   { hour: 9,  minute: 0, mealTiming: '식후' },
  afternoon: { hour: 12, minute: 0, mealTiming: '식후' },
  evening:   { hour: 18, minute: 0, mealTiming: '식후' },
  bedtime:   { hour: 22, minute: 0, mealTiming: '상관없음' },
};

const MedicationTimeSetup = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isSeniorMode: sr } = useSeniorMode();
  const [activeTab, setActiveTab] = useState<PeriodKey>('morning');
  const [settings, setSettings] = useState<Record<PeriodKey, PeriodSetting>>(DEFAULT_SETTINGS);

  useEffect(() => {
    // saved_schedules에서 현재 시간 로드
    const raw = localStorage.getItem('saved_schedules');
    if (!raw) return;
    try {
      const saved = JSON.parse(raw);
      const loaded = { ...DEFAULT_SETTINGS };
      for (const item of saved) {
        const p = item.period as PeriodKey;
        if (p && item.time) {
          const [h, m] = item.time.split(':').map(Number);
          loaded[p] = {
            hour: isNaN(h) ? loaded[p].hour : h,
            minute: isNaN(m) ? loaded[p].minute : m,
            mealTiming: (item.schedule?.includes('식전') ? '식전' : item.schedule?.includes('식후') ? '식후' : '상관없음') as PeriodSetting['mealTiming'],
          };
        }
      }
      setSettings(loaded);
    } catch {
      // ignore
    }
  }, []);

  const cur = settings[activeTab];

  const updateCur = (patch: Partial<PeriodSetting>) => {
    setSettings(prev => ({ ...prev, [activeTab]: { ...prev[activeTab], ...patch } }));
  };

  const handleSave = () => {
    const raw = localStorage.getItem('saved_schedules');
    if (!raw) { toast.error('등록된 스케줄이 없습니다'); navigate('/schedule'); return; }
    try {
      const saved = JSON.parse(raw);
      const updated = saved.map((item: { period: string; time: string; schedule: string }) => {
        const p = item.period as PeriodKey;
        if (!settings[p]) return item;
        const s = settings[p];
        const newTime = `${String(s.hour).padStart(2, '0')}:${String(s.minute).padStart(2, '0')}`;
        return { ...item, time: newTime, schedule: s.mealTiming };
      });
      localStorage.setItem('saved_schedules', JSON.stringify(updated));
      toast.success('복약 시간이 저장되었습니다');
      navigate('/schedule', { replace: true });
    } catch {
      toast.error('저장에 실패했습니다');
    }
  };

  const tabs: { key: PeriodKey; label: string; emoji: string }[] = [
    { key: 'morning',   label: t('timeSetup.morning'),  emoji: '🌅' },
    { key: 'afternoon', label: t('timeSetup.afternoon'), emoji: '☀️' },
    { key: 'evening',   label: t('timeSetup.evening'),   emoji: '🌆' },
    { key: 'bedtime',   label: '취침 전',                emoji: '🌙' },
  ];

  const mealOptions: { value: PeriodSetting['mealTiming']; label: string }[] = [
    { value: '식전',   label: t('timeSetup.beforeMeal') },
    { value: '식후',   label: t('timeSetup.afterMeal') },
    { value: '상관없음', label: '상관없음' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col safe-area-padding">
      <header className="tds-header">
        <div className="flex items-center h-14 px-4 border-b border-border">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft className={`text-foreground ${sr ? 'w-7 h-7' : 'w-6 h-6'}`} />
          </button>
          <div className="flex-1 text-center">
            <span className={`font-bold text-foreground ${sr ? 'text-xl' : 'text-lg'}`}>{t('timeSetup.title')}</span>
          </div>
          <div className="w-10" />
        </div>
      </header>

      <main className="flex-1 px-5 py-6 pb-28 overflow-y-auto">
        <div className="max-w-sm mx-auto space-y-6">

          {/* 시간대 탭 */}
          <div className="grid grid-cols-4 gap-1.5">
            {tabs.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`tds-chip text-center py-2 ${sr ? 'text-sm' : 'text-xs'} ${activeTab === tab.key ? 'active' : ''}`}>
                <span className="block text-base mb-0.5">{tab.emoji}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* 시간 설정 */}
          <div className="tds-card space-y-5">
            <div>
              <label className={`text-muted-foreground font-medium mb-3 block ${sr ? 'text-base' : 'text-sm'}`}>{t('timeSetup.selectTime')}</label>
              <div className="flex items-center justify-center gap-4">
                <div className="flex flex-col items-center gap-1">
                  <button onClick={() => updateCur({ hour: (cur.hour + 1) % 24 })}
                    className={`rounded-xl bg-muted flex items-center justify-center text-foreground font-bold ${sr ? 'w-14 h-14 text-2xl' : 'w-10 h-10 text-lg'}`}>+</button>
                  <span className={`font-bold text-foreground text-center ${sr ? 'text-4xl w-16' : 'text-3xl w-14'}`}>{String(cur.hour).padStart(2, '0')}</span>
                  <button onClick={() => updateCur({ hour: (cur.hour - 1 + 24) % 24 })}
                    className={`rounded-xl bg-muted flex items-center justify-center text-foreground font-bold ${sr ? 'w-14 h-14 text-2xl' : 'w-10 h-10 text-lg'}`}>−</button>
                </div>
                <span className={`font-bold text-foreground ${sr ? 'text-4xl' : 'text-3xl'}`}>:</span>
                <div className="flex flex-col items-center gap-1">
                  <button onClick={() => updateCur({ minute: (cur.minute + 5) % 60 })}
                    className={`rounded-xl bg-muted flex items-center justify-center text-foreground font-bold ${sr ? 'w-14 h-14 text-2xl' : 'w-10 h-10 text-lg'}`}>+</button>
                  <span className={`font-bold text-foreground text-center ${sr ? 'text-4xl w-16' : 'text-3xl w-14'}`}>{String(cur.minute).padStart(2, '0')}</span>
                  <button onClick={() => updateCur({ minute: (cur.minute - 5 + 60) % 60 })}
                    className={`rounded-xl bg-muted flex items-center justify-center text-foreground font-bold ${sr ? 'w-14 h-14 text-2xl' : 'w-10 h-10 text-lg'}`}>−</button>
                </div>
              </div>
            </div>

            {/* 식전/식후 */}
            <div>
              <label className={`text-muted-foreground font-medium mb-2 block ${sr ? 'text-base' : 'text-sm'}`}>{t('timeSetup.dosageTime')}</label>
              <div className="flex gap-2">
                {mealOptions.map(opt => (
                  <button key={opt.value} onClick={() => updateCur({ mealTiming: opt.value })}
                    className={`tds-chip flex-1 ${sr ? 'h-14 text-base' : 'h-10 text-sm'} ${cur.mealTiming === opt.value ? 'active' : ''}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 전체 요약 */}
          <div className="tds-card space-y-2">
            <p className="text-xs text-muted-foreground font-medium mb-2">전체 설정 요약</p>
            {tabs.map(tab => {
              const s = settings[tab.key];
              return (
                <div key={tab.key} className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{tab.emoji} {tab.label}</span>
                  <span className={`text-sm font-medium ${activeTab === tab.key ? 'text-primary' : 'text-muted-foreground'}`}>
                    {String(s.hour).padStart(2, '0')}:{String(s.minute).padStart(2, '0')} · {s.mealTiming}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 safe-area-padding">
        <div className="max-w-sm mx-auto">
          <button onClick={handleSave} className={`tds-button-primary w-full ${sr ? 'h-14 text-lg' : ''}`}>{t('timeSetup.save')}</button>
        </div>
      </div>
    </div>
  );
};

export default MedicationTimeSetup;
