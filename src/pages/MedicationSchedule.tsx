import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSeniorMode } from '@/contexts/SeniorModeContext';
import BottomNav from '@/components/BottomNav';
import AlarmBanner from '@/components/AlarmBanner';
import AlarmPermissionPrompt from '@/components/AlarmPermissionPrompt';
import { useMedicationAlarm } from '@/hooks/useMedicationAlarm';
import { useTranslation } from 'react-i18next';

interface ScheduleItem {
  id: string;
  time: string;
  name: string;
  taken: boolean;
  period: 'morning' | 'afternoon' | 'evening' | 'bedtime';
}

const MedicationSchedule = () => {
  const navigate = useNavigate();
  const { isSeniorMode: sr } = useSeniorMode();
  const { t, i18n } = useTranslation();

  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [items, setItems] = useState<ScheduleItem[]>([]);

  // localStorage에서 저장된 스케줄 로드
  useEffect(() => {
    const loadSchedules = () => {
      const raw = localStorage.getItem('saved_schedules');
      if (raw) {
        try {
          const saved = JSON.parse(raw);
          const mapped: ScheduleItem[] = saved.map((s: {
            id: string;
            name: string;
            time: string;
            period: string;
            taken?: boolean;
          }) => ({
            id: s.id,
            name: s.name,
            time: s.time,
            period: s.period as ScheduleItem['period'],
            taken: s.taken || false,
          }));
          setItems(mapped);
        } catch {
          // 파싱 실패 시 샘플 데이터
          setItems(getDefaultItems());
        }
      } else {
        // 저장된 데이터 없으면 샘플 데이터
        setItems(getDefaultItems());
      }
    };

    loadSchedules();
  }, [t]);

  const getDefaultItems = (): ScheduleItem[] => [
    { id: 'sample-1', time: t('sampleMeds.time0800'), name: t('sampleMeds.bloodPressure'), taken: false, period: 'morning' },
    { id: 'sample-2', time: t('sampleMeds.time0900'), name: t('sampleMeds.vitaminD'), taken: false, period: 'morning' },
    { id: 'sample-3', time: t('sampleMeds.time1300'), name: t('sampleMeds.diabetesMed'), taken: false, period: 'afternoon' },
    { id: 'sample-4', time: t('sampleMeds.time1900'), name: t('sampleMeds.omega3'), taken: false, period: 'evening' },
    { id: 'sample-5', time: t('sampleMeds.beforeBed'), name: t('sampleMeds.sleepAid'), taken: false, period: 'bedtime' },
  ];

  const getWeekDays = (base: Date) => {
    const start = new Date(base);
    start.setDate(start.getDate() - start.getDay() + 1);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  };

  const weekDays = getWeekDays(selectedDate);
  const dayLabels = [
    t('schedule.dayMon'), t('schedule.dayTue'), t('schedule.dayWed'),
    t('schedule.dayThu'), t('schedule.dayFri'), t('schedule.daySat'), t('schedule.daySun')
  ];

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  const toggleTaken = (id: string) => {
    setItems(prev => {
      const updated = prev.map(item => item.id === id ? { ...item, taken: !item.taken } : item);
      // localStorage에도 반영
      const raw = localStorage.getItem('saved_schedules');
      if (raw) {
        try {
          const saved = JSON.parse(raw);
          const updatedSaved = saved.map((s: { id: string; taken?: boolean }) => 
            s.id === id ? { ...s, taken: !s.taken } : s
          );
          localStorage.setItem('saved_schedules', JSON.stringify(updatedSaved));
        } catch {
          // ignore
        }
      }
      return updated;
    });
  };

  const alarmItems = items
    .filter(i => !i.taken)
    .map((item) => ({
      id: item.id,
      name: item.name,
      time: item.time,
      period: item.period,
    }));

  const { currentAlarm, dismissAlarm, permissionGranted, requestPermission } =
    useMedicationAlarm(alarmItems);

  const periods = [
    { key: 'morning', label: t('schedule.morning'), color: 'bg-accent' },
    { key: 'afternoon', label: t('schedule.afternoon'), color: 'bg-accent' },
    { key: 'evening', label: t('schedule.evening'), color: 'bg-accent' },
    { key: 'bedtime', label: t('schedule.bedtime'), color: 'bg-accent' },
  ];

  const shiftWeek = (dir: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + dir * 7);
    setSelectedDate(d);
  };

  const monthLabel = i18n.language === 'ko'
    ? `${selectedDate.getFullYear()}년 ${selectedDate.getMonth() + 1}월`
    : selectedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

  const takenCount = items.filter(i => i.taken).length;

  return (
    <div className="min-h-screen bg-background flex flex-col safe-area-padding">
      {currentAlarm && <AlarmBanner alarm={currentAlarm} onDismiss={dismissAlarm} />}

      <header className="tds-header">
        <div className="flex items-center justify-between h-14 px-5 border-b border-border">
          <div className="flex items-center gap-2">
            <h1 className={`font-bold text-foreground ${sr ? 'text-xl' : 'text-lg'}`}>{t('schedule.title')}</h1>
            <span className={`inline-flex items-center rounded-full text-xs font-semibold px-2.5 py-0.5 ${
              takenCount === items.length ? 'bg-primary/10 text-primary' : 'bg-accent text-accent-foreground'
            }`}>
              {takenCount}/{items.length}
            </span>
          </div>
          <button onClick={() => navigate('/setup/time')} className="p-2">
            <Settings className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </header>

      <main className="flex-1 px-5 py-4 pb-24 overflow-y-auto max-w-3xl mx-auto w-full">
        <div className="tds-card mb-5 p-3">
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => shiftWeek(-1)} className="p-1"><ChevronLeft className="w-5 h-5 text-muted-foreground" /></button>
            <span className={`font-semibold text-foreground ${sr ? 'text-lg' : 'text-sm'}`}>{monthLabel}</span>
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

        {!permissionGranted && 'Notification' in window && (
          <AlarmPermissionPrompt onRequest={requestPermission} />
        )}

        {items.length === 0 ? (
          <div className="text-center py-12">
            <p className={`text-muted-foreground ${sr ? 'text-lg' : 'text-sm'}`}>
              {t('schedule.noSchedule') || '등록된 복약 스케줄이 없습니다'}
            </p>
            <button onClick={() => navigate('/capture')} className="tds-button-primary mt-4">
              {t('schedule.addMedication') || '약 추가하기'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {periods.map(period => {
              const periodItems = items.filter(i => i.period === period.key);
              if (periodItems.length === 0) return null;
              return (
                <div key={period.key}>
                  <h3 className={`font-semibold text-foreground mb-2 ${sr ? 'text-lg' : 'text-sm'}`}>{period.label}</h3>
                  <div className="space-y-2">
                    {periodItems.map((item) => (
                      <div key={item.id} className="tds-card flex items-center gap-3" style={sr ? { padding: '20px' } : undefined}>
                        <button
                          onClick={() => toggleTaken(item.id)}
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
                            {item.time}
                          </p>
                        </div>
                        <span className={`inline-flex items-center rounded-full text-xs font-medium px-2 py-0.5 ${
                          item.taken ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                        }`}>
                          {item.taken ? t('schedule.taken') : t('schedule.notTaken')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <p className={`text-center text-muted-foreground mt-8 ${sr ? 'text-base' : 'text-xs'}`}>
          {t('schedule.disclaimer')}
        </p>
      </main>

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