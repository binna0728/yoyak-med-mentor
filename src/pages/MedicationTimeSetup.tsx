import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const MedicationTimeSetup = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'morning' | 'afternoon' | 'evening'>('morning');
  const [hour, setHour] = useState(9);
  const [minute, setMinute] = useState(0);
  const [timesPerDay, setTimesPerDay] = useState(1);

  const tabs = [
    { key: 'morning' as const, label: '아침' },
    { key: 'afternoon' as const, label: '점심' },
    { key: 'evening' as const, label: '저녁' },
  ];

  const handleSave = () => {
    // Save schedule data
    const schedule = { tab: activeTab, hour, minute, timesPerDay };
    localStorage.setItem('medication_schedule', JSON.stringify(schedule));
    navigate('/schedule');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col safe-area-padding">
      <header className="tds-header">
        <div className="flex items-center h-14 px-4 border-b border-border">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2"><ArrowLeft className="w-6 h-6 text-foreground" /></button>
          <div className="flex-1 text-center"><span className="text-lg font-bold text-foreground">복용 시간 설정</span></div>
          <div className="w-10" />
        </div>
      </header>

      <main className="flex-1 px-5 py-6 pb-28 overflow-y-auto">
        <div className="max-w-sm mx-auto space-y-6">
          {/* Tabs */}
          <div className="flex gap-2">
            {tabs.map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                className={`tds-chip flex-1 text-center ${activeTab === t.key ? 'active' : ''}`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Time selector */}
          <div className="tds-card space-y-4">
            <div>
              <label className="text-sm text-muted-foreground font-medium mb-2 block">시간 선택</label>
              <div className="flex items-center justify-center gap-4">
                <button onClick={() => setHour(h => Math.max(0, h - 1))} className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-foreground font-bold text-lg">−</button>
                <span className="text-2xl font-bold text-foreground w-20 text-center">{String(hour).padStart(2, '0')}:{String(minute).padStart(2, '0')}</span>
                <button onClick={() => setHour(h => Math.min(23, h + 1))} className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-foreground font-bold text-lg">+</button>
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground font-medium mb-2 block">하루 횟수</label>
              <div className="flex items-center justify-center gap-4">
                <button onClick={() => setTimesPerDay(t => Math.max(1, t - 1))} className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-foreground font-bold text-lg">−</button>
                <span className="text-2xl font-bold text-foreground w-16 text-center">{timesPerDay}</span>
                <button onClick={() => setTimesPerDay(t => Math.min(6, t + 1))} className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-foreground font-bold text-lg">+</button>
              </div>
            </div>
          </div>

          {/* Quick input */}
          <div>
            <label className="text-sm text-muted-foreground font-medium mb-2 block">복용 시간</label>
            <div className="flex gap-2 flex-wrap">
              {['식전', '식후'].map(p => (
                <button key={p} className="tds-chip h-9 px-4 text-sm">{p}</button>
              ))}
            </div>
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 safe-area-padding">
        <div className="max-w-sm mx-auto">
          <button onClick={handleSave} className="tds-button-primary w-full">저장</button>
        </div>
      </div>
    </div>
  );
};

export default MedicationTimeSetup;
