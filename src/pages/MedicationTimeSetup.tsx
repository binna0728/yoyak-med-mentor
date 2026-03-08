import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const MedicationTimeSetup = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'morning' | 'afternoon' | 'evening'>('morning');
  const [hour, setHour] = useState(9);
  const [minute, setMinute] = useState(0);
  const [timesPerDay, setTimesPerDay] = useState(1);
  const { t } = useTranslation();

  const tabs = [
    { key: 'morning' as const, label: t('timeSetup.morning') },
    { key: 'afternoon' as const, label: t('timeSetup.afternoon') },
    { key: 'evening' as const, label: t('timeSetup.evening') },
  ];

  const handleSave = () => {
    const schedule = { tab: activeTab, hour, minute, timesPerDay };
    localStorage.setItem('medication_schedule', JSON.stringify(schedule));
    navigate('/schedule');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col safe-area-padding">
      <header className="tds-header">
        <div className="flex items-center h-14 px-4 border-b border-border">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2"><ArrowLeft className="w-6 h-6 text-foreground" /></button>
          <div className="flex-1 text-center"><span className="text-lg font-bold text-foreground">{t('timeSetup.title')}</span></div>
          <div className="w-10" />
        </div>
      </header>

      <main className="flex-1 px-5 py-6 pb-28 overflow-y-auto">
        <div className="max-w-sm mx-auto space-y-6">
          <div className="flex gap-2">
            {tabs.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`tds-chip flex-1 text-center ${activeTab === tab.key ? 'active' : ''}`}>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="tds-card space-y-4">
            <div>
              <label className="text-sm text-muted-foreground font-medium mb-2 block">{t('timeSetup.selectTime')}</label>
              <div className="flex items-center justify-center gap-4">
                <button onClick={() => setHour(h => Math.max(0, h - 1))} className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-foreground font-bold text-lg">−</button>
                <span className="text-2xl font-bold text-foreground w-20 text-center">{String(hour).padStart(2, '0')}:{String(minute).padStart(2, '0')}</span>
                <button onClick={() => setHour(h => Math.min(23, h + 1))} className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-foreground font-bold text-lg">+</button>
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground font-medium mb-2 block">{t('timeSetup.timesPerDay')}</label>
              <div className="flex items-center justify-center gap-4">
                <button onClick={() => setTimesPerDay(v => Math.max(1, v - 1))} className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-foreground font-bold text-lg">−</button>
                <span className="text-2xl font-bold text-foreground w-16 text-center">{timesPerDay}</span>
                <button onClick={() => setTimesPerDay(v => Math.min(6, v + 1))} className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-foreground font-bold text-lg">+</button>
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground font-medium mb-2 block">{t('timeSetup.dosageTime')}</label>
            <div className="flex gap-2 flex-wrap">
              {[t('timeSetup.beforeMeal'), t('timeSetup.afterMeal')].map(p => (
                <button key={p} className="tds-chip h-9 px-4 text-sm">{p}</button>
              ))}
            </div>
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 safe-area-padding">
        <div className="max-w-sm mx-auto">
          <button onClick={handleSave} className="tds-button-primary w-full">{t('timeSetup.save')}</button>
        </div>
      </div>
    </div>
  );
};

export default MedicationTimeSetup;
