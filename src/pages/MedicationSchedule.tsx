import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSeniorMode } from '@/contexts/SeniorModeContext';
import BottomNav from '@/components/BottomNav';
import AlarmBanner from '@/components/AlarmBanner';
import AlarmPermissionPrompt from '@/components/AlarmPermissionPrompt';
import { useMedicationAlarm } from '@/hooks/useMedicationAlarm';

interface ScheduleItem {
  time: string;
  name: string;
  taken: boolean;
  period: 'morning' | 'afternoon' | 'evening' | 'bedtime';
}

const MedicationSchedule = () => {
  const navigate = useNavigate();
  const { isSeniorMode: sr } = useSeniorMode();

  // Week calendar state
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);

  const getWeekDays = (base: Date) => {
    const start = new Date(base);
    start.setDate(start.getDate() - start.getDay() + 1); // Monday
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  };

  const weekDays = getWeekDays(selectedDate);
  const dayLabels = ['월', '화', '수', '목', '금', '토', '일'];

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  const [items, setItems] = useState<ScheduleItem[]>([
    { time: '오전 8:00', name: '혈압약 (아모잘탄)', taken: false, period: 'morning' },
    { time: '오전 9:00', name: '비타민D', taken: false, period: 'morning' },
    { time: '오후 1:00', name: '혈당약 (메트포르민)', taken: false, period: 'afternoon' },
    { time: '저녁 7:00', name: '오메가3', taken: false, period: 'evening' },
    { time: '취침 전', name: '수면보조제', taken: false, period: 'bedtime' },
  ]);

  const toggleTaken = (idx: number) => {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, taken: !item.taken } : item));
  };

  // Alarm system
  const alarmItems = items
    .filter(i => !i.taken)
    .map((item, idx) => ({
      id: `${item.period}-${idx}`,
      name: item.name,
      time: item.time,
      period: item.period,
    }));

  const { currentAlarm, dismissAlarm, permissionGranted, requestPermission } =
    useMedicationAlarm(alarmItems);

  const periods = [
    { key: 'morning', label: '🌅 아침', color: 'bg-accent' },
    { key: 'afternoon', label: '☀️ 점심', color: 'bg-accent' },
    { key: 'evening', label: '🌆 저녁', color: 'bg-accent' },
    { key: 'bedtime', label: '🌙 취침 전', color: 'bg-accent' },
  ];

  const shiftWeek = (dir: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + dir * 7);
    setSelectedDate(d);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col safe-area-padding">
      {/* Alarm banner */}
      {currentAlarm && (
        <AlarmBanner alarm={currentAlarm} onDismiss={dismissAlarm} />
      )}

      <header className="tds-header">
        <div className="flex items-center justify-between h-14 px-5 border-b border-border">
          <h1 className={`font-bold text-foreground ${sr ? 'text-xl' : 'text-lg'}`}>복약 스케줄</h1>
          <button onClick={() => navigate('/setup/time')} className="p-2">
            <Settings className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </header>

      <main className="flex-1 px-5 py-4 pb-24 overflow-y-auto max-w-3xl mx-auto w-full">
        {/* Week calendar */}
        <div className="tds-card mb-5 p-3">
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => shiftWeek(-1)} className="p-1"><ChevronLeft className="w-5 h-5 text-muted-foreground" /></button>
            <span className={`font-semibold text-foreground ${sr ? 'text-lg' : 'text-sm'}`}>
              {selectedDate.getFullYear()}년 {selectedDate.getMonth() + 1}월
            </span>
            <button onClick={() => shiftWeek(1)} className="p-1"><ChevronRight className="w-5 h-5 text-muted-foreground" /></button>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map((day, idx) => {
              const isToday = isSameDay(day, today);
              const isSelected = isSameDay(day, selectedDate);
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDate(day)}
                  className={`flex flex-col items-center py-2 rounded-xl transition-colors ${
                    isSelected ? 'bg-primary text-primary-foreground' : isToday ? 'bg-accent text-primary' : 'text-foreground'
                  }`}
                >
                  <span className={`text-xs ${isSelected ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{dayLabels[idx]}</span>
                  <span className={`font-semibold ${sr ? 'text-lg' : 'text-sm'} mt-0.5`}>{day.getDate()}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Notification permission prompt */}
        {!permissionGranted && 'Notification' in window && (
          <AlarmPermissionPrompt onRequest={requestPermission} />
        )}

        {/* Schedule by period */}
        <div className="space-y-4">
          {periods.map(period => {
            const periodItems = items.filter(i => i.period === period.key);
            if (periodItems.length === 0) return null;
            return (
              <div key={period.key}>
                <h3 className={`font-semibold text-foreground mb-2 ${sr ? 'text-lg' : 'text-sm'}`}>{period.label}</h3>
                <div className="space-y-2">
                  {periodItems.map((item) => {
                    const realIdx = items.indexOf(item);
                    return (
                      <div
                        key={realIdx}
                        className="tds-card flex items-center gap-3"
                        style={sr ? { padding: '20px' } : undefined}
                      >
                        <button
                          onClick={() => toggleTaken(realIdx)}
                          className={`rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                            item.taken ? 'bg-primary border-primary' : 'border-border hover:border-primary/50'
                          } ${sr ? 'w-8 h-8' : 'w-6 h-6'}`}
                        >
                          {item.taken && <span className="text-primary-foreground text-xs font-bold">✓</span>}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium ${item.taken ? 'text-muted-foreground line-through' : 'text-foreground'} ${sr ? 'text-lg' : 'text-sm'}`}>
                            {item.name}
                          </p>
                          <p className={`text-muted-foreground ${sr ? 'text-base' : 'text-xs'}`}>
                            {item.time} · {item.taken ? '복용 완료 ✅' : '복용 전'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <p className={`text-center text-muted-foreground mt-8 ${sr ? 'text-base' : 'text-xs'}`}>
          ※ 복약 안내는 참고용이며, 정확한 복용은 의사·약사와 상담하세요.
        </p>
      </main>

      {/* FAB add button */}
      <button
        onClick={() => navigate('/capture')}
        className={`fixed z-50 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center active:scale-90 transition-transform ${
          sr ? 'w-16 h-16 right-5 bottom-24' : 'w-14 h-14 right-5 bottom-20'
        }`}
      >
        <Plus className={sr ? 'w-8 h-8' : 'w-6 h-6'} />
      </button>

      <BottomNav />
    </div>
  );
};

export default MedicationSchedule;
