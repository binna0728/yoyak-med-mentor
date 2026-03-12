import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Plus, ChevronLeft, ChevronRight, Calendar, List, Trash2 } from 'lucide-react';
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
  date?: string; // YYYY-MM-DD format for date-specific tracking
}

interface DayRecord {
  date: string;
  total: number;
  taken: number;
}

const MedicationSchedule = () => {
  const navigate = useNavigate();
  const { isSeniorMode: sr } = useSeniorMode();
  const { t, i18n } = useTranslation();

  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [monthRecords, setMonthRecords] = useState<Record<string, DayRecord>>({});
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState<Set<string>>(new Set());

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
            date?: string;
          }) => ({
            id: s.id,
            name: s.name,
            time: s.time,
            period: s.period as ScheduleItem['period'],
            taken: s.taken || false,
            date: s.date,
          }));
          setItems(mapped);
        } catch {
          setItems(getDefaultItems());
        }
      } else {
        setItems(getDefaultItems());
      }

      // 월별 복용 기록 로드
      const recordsRaw = localStorage.getItem('medication_records');
      if (recordsRaw) {
        try {
          setMonthRecords(JSON.parse(recordsRaw));
        } catch {
          setMonthRecords(generateSampleRecords());
        }
      } else {
        setMonthRecords(generateSampleRecords());
      }
    };

    loadSchedules();
  }, [t]);

  // 샘플 월별 기록 생성 (데모용)
  const generateSampleRecords = (): Record<string, DayRecord> => {
    const records: Record<string, DayRecord> = {};
    const now = new Date();
    for (let i = 30; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const total = 5;
      const taken = i === 0 ? items.filter(x => x.taken).length : Math.floor(Math.random() * (total + 1));
      records[dateStr] = { date: dateStr, total, taken };
    }
    return records;
  };

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

  const getMonthDays = (base: Date) => {
    const year = base.getFullYear();
    const month = base.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // 월요일 시작으로 맞추기
    const startOffset = (firstDay.getDay() + 6) % 7;
    const days: (Date | null)[] = [];

    // 이전 달 빈 칸
    for (let i = 0; i < startOffset; i++) {
      days.push(null);
    }

    // 현재 달 날짜
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }

    return days;
  };

  const weekDays = getWeekDays(selectedDate);
  const monthDays = getMonthDays(selectedDate);
  const dayLabels = [
    t('schedule.dayMon'), t('schedule.dayTue'), t('schedule.dayWed'),
    t('schedule.dayThu'), t('schedule.dayFri'), t('schedule.daySat'), t('schedule.daySun')
  ];

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  const toggleTaken = (id: string) => {
    setItems(prev => {
      const updated = prev.map(item => item.id === id ? { ...item, taken: !item.taken } : item);
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

      // 오늘 기록 업데이트
      const todayStr = today.toISOString().split('T')[0];
      const takenCount = updated.filter(i => i.taken).length;
      setMonthRecords(prev => {
        const newRecords = {
          ...prev,
          [todayStr]: { date: todayStr, total: updated.length, taken: takenCount }
        };
        localStorage.setItem('medication_records', JSON.stringify(newRecords));
        return newRecords;
      });

      return updated;
    });
  };

  const toggleSelectForDelete = (id: string) => {
    setSelectedForDelete(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDelete = () => {
    if (selectedForDelete.size === 0) return;
    const updated = items.filter(item => !selectedForDelete.has(item.id));
    setItems(updated);
    const raw = localStorage.getItem('saved_schedules');
    if (raw) {
      try {
        const saved = JSON.parse(raw);
        const updatedSaved = saved.filter((s: { id: string }) => !selectedForDelete.has(s.id));
        localStorage.setItem('saved_schedules', JSON.stringify(updatedSaved));
      } catch {
        // ignore
      }
    }
    setSelectedForDelete(new Set());
    setDeleteMode(false);
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

  const shiftPeriod = (dir: number) => {
    const d = new Date(selectedDate);
    if (viewMode === 'week') {
      d.setDate(d.getDate() + dir * 7);
    } else {
      d.setMonth(d.getMonth() + dir);
    }
    setSelectedDate(d);
  };

  const monthLabel = i18n.language === 'ko'
    ? `${selectedDate.getFullYear()}년 ${selectedDate.getMonth() + 1}월`
    : selectedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

  const takenCount = items.filter(i => i.taken).length;

  // 복용률에 따른 색상 계산
  const getCompletionColor = (record: DayRecord | undefined) => {
    if (!record || record.total === 0) return 'bg-muted';
    const rate = record.taken / record.total;
    if (rate >= 1) return 'bg-primary';
    if (rate >= 0.5) return 'bg-primary/60';
    if (rate > 0) return 'bg-primary/30';
    return 'bg-destructive/30';
  };

  // 월간 통계 계산
  const monthStats = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    let totalDays = 0;
    let completeDays = 0;
    let partialDays = 0;
    let missedDays = 0;

    Object.values(monthRecords).forEach(record => {
      const recordDate = new Date(record.date);
      const todayStr = today.toISOString().split('T')[0];
      if (recordDate.getFullYear() === year && recordDate.getMonth() === month && record.date <= todayStr) {
        totalDays++;
        const rate = record.total > 0 ? record.taken / record.total : 0;
        if (rate >= 1) completeDays++;
        else if (rate > 0) partialDays++;
        else missedDays++;
      }
    });

    return { totalDays, completeDays, partialDays, missedDays };
  };

  const stats = monthStats();

  return (
    <div className="min-h-screen bg-background flex flex-col safe-area-padding">
      {currentAlarm && <AlarmBanner alarm={currentAlarm} onDismiss={dismissAlarm} />}

      <header className="tds-header">
        <div className="flex items-center justify-between h-14 px-5 border-b border-border">
          <div className="flex items-center gap-2">
            <h1 className={`font-bold text-foreground ${sr ? 'text-xl' : 'text-lg'}`}>{t('schedule.title')}</h1>
            {!deleteMode && (
              <span className={`inline-flex items-center rounded-full text-xs font-semibold px-2.5 py-0.5 ${
                takenCount === items.length ? 'bg-primary/10 text-primary' : 'bg-accent text-accent-foreground'
              }`}>
                {takenCount}/{items.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {deleteMode ? (
              <button
                onClick={() => { setDeleteMode(false); setSelectedForDelete(new Set()); }}
                className={`text-muted-foreground font-medium ${sr ? 'text-base' : 'text-sm'} px-3 py-1`}
              >
                취소
              </button>
            ) : (
              <>
                <button
                  onClick={() => setViewMode(viewMode === 'week' ? 'month' : 'week')}
                  className={`p-2 rounded-lg transition-colors ${viewMode === 'month' ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
                >
                  {viewMode === 'week' ? <Calendar className="w-5 h-5" /> : <List className="w-5 h-5" />}
                </button>
                <button onClick={() => setDeleteMode(true)} className="p-2">
                  <Trash2 className="w-5 h-5 text-muted-foreground" />
                </button>
                <button onClick={() => navigate('/setup/time')} className="p-2">
                  <Settings className="w-5 h-5 text-muted-foreground" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 px-5 py-4 pb-24 overflow-y-auto max-w-3xl mx-auto w-full">
        {/* 캘린더 카드 */}
        <div className="tds-card mb-5 p-3">
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => shiftPeriod(-1)} className="p-1"><ChevronLeft className="w-5 h-5 text-muted-foreground" /></button>
            <span className={`font-semibold text-foreground ${sr ? 'text-lg' : 'text-sm'}`}>{monthLabel}</span>
            <button onClick={() => shiftPeriod(1)} className="p-1"><ChevronRight className="w-5 h-5 text-muted-foreground" /></button>
          </div>

          {viewMode === 'week' ? (
            /* 주간 뷰 */
            <div className="grid grid-cols-7 gap-1">
              {weekDays.map((day, idx) => {
                const isToday = isSameDay(day, today);
                const isSelected = isSameDay(day, selectedDate);
                const dateStr = day.toISOString().split('T')[0];
                const record = monthRecords[dateStr];

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
                    {record && !isSelected && (
                      <div className={`w-1.5 h-1.5 rounded-full mt-1 ${getCompletionColor(record)}`} />
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            /* 월간 뷰 */
            <>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayLabels.map(label => (
                  <div key={label} className="text-center text-xs text-muted-foreground py-1">{label}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {monthDays.map((day, idx) => {
                  if (!day) {
                    return <div key={`empty-${idx}`} className="aspect-square" />;
                  }
                  const isToday = isSameDay(day, today);
                  const isSelected = isSameDay(day, selectedDate);
                  const dateStr = day.toISOString().split('T')[0];
                  const record = monthRecords[dateStr];
                  const isPast = day < today && !isToday;
                  const isFuture = day > today;

                  return (
                    <button
                      key={dateStr}
                      onClick={() => setSelectedDate(day)}
                      className={`aspect-square rounded-xl flex flex-col items-center justify-center transition-colors relative ${
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : isToday
                            ? 'bg-accent text-primary ring-2 ring-primary'
                            : isFuture
                              ? 'text-muted-foreground/50'
                              : 'text-foreground hover:bg-accent'
                      }`}
                    >
                      <span className={`font-medium ${sr ? 'text-base' : 'text-xs'}`}>{day.getDate()}</span>
                      {isPast && record && (
                        <div className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full ${getCompletionColor(record)}`} />
                      )}
                      {isPast && record && record.total > 0 && (
                        <span className={`text-[10px] mt-0.5 ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                          {record.taken}/{record.total}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* 월간 통계 */}
              <div className="mt-4 pt-4 border-t border-border">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-primary/10 rounded-xl p-3">
                    <p className={`font-bold text-primary ${sr ? 'text-2xl' : 'text-xl'}`}>{stats.completeDays}</p>
                    <p className={`text-muted-foreground ${sr ? 'text-sm' : 'text-xs'}`}>{t('schedule.completeDays') || '완료'}</p>
                  </div>
                  <div className="bg-accent rounded-xl p-3">
                    <p className={`font-bold text-foreground ${sr ? 'text-2xl' : 'text-xl'}`}>{stats.partialDays}</p>
                    <p className={`text-muted-foreground ${sr ? 'text-sm' : 'text-xs'}`}>{t('schedule.partialDays') || '일부'}</p>
                  </div>
                  <div className="bg-destructive/10 rounded-xl p-3">
                    <p className={`font-bold text-destructive ${sr ? 'text-2xl' : 'text-xl'}`}>{stats.missedDays}</p>
                    <p className={`text-muted-foreground ${sr ? 'text-sm' : 'text-xs'}`}>{t('schedule.missedDays') || '미복용'}</p>
                  </div>
                </div>
                {stats.totalDays > 0 && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>{t('schedule.monthlyRate') || '이번 달 복용률'}</span>
                      <span className="font-medium text-primary">
                        {Math.round((stats.completeDays / stats.totalDays) * 100)}%
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${(stats.completeDays / stats.totalDays) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
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
                        {deleteMode ? (
                          <button
                            onClick={() => toggleSelectForDelete(item.id)}
                            className={`rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                              selectedForDelete.has(item.id) ? 'bg-destructive border-destructive' : 'border-border hover:border-destructive/50'
                            } ${sr ? 'w-8 h-8' : 'w-6 h-6'}`}
                          >
                            {selectedForDelete.has(item.id) && <span className="text-white text-xs font-bold">✓</span>}
                          </button>
                        ) : (
                          <button
                            onClick={() => toggleTaken(item.id)}
                            className={`rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                              item.taken ? 'bg-primary border-primary' : 'border-border hover:border-primary/50'
                            } ${sr ? 'w-8 h-8' : 'w-6 h-6'}`}
                          >
                            {item.taken && <span className="text-primary-foreground text-xs font-bold">✓</span>}
                          </button>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium ${!deleteMode && item.taken ? 'text-muted-foreground line-through' : 'text-foreground'} ${sr ? 'text-lg' : 'text-sm'}`}>
                            {item.name}
                          </p>
                          <p className={`text-muted-foreground ${sr ? 'text-base' : 'text-xs'}`}>
                            {item.time}
                          </p>
                        </div>
                        {!deleteMode && (
                          <span className={`inline-flex items-center rounded-full text-xs font-medium px-2 py-0.5 ${
                            item.taken ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                          }`}>
                            {item.taken ? t('schedule.taken') : t('schedule.notTaken')}
                          </span>
                        )}
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

      {deleteMode ? (
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 safe-area-padding">
          <button
            onClick={handleDelete}
            disabled={selectedForDelete.size === 0}
            className={`w-full flex items-center justify-center gap-2 rounded-2xl font-semibold py-3 transition-colors ${
              selectedForDelete.size > 0
                ? 'bg-destructive text-white active:opacity-80'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            } ${sr ? 'text-lg' : 'text-base'}`}
          >
            <Trash2 className="w-5 h-5" />
            {selectedForDelete.size > 0 ? `${selectedForDelete.size}개 삭제` : '삭제할 항목을 선택하세요'}
          </button>
        </div>
      ) : (
        <button
          onClick={() => navigate('/capture')}
          className={`fixed z-50 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center active:scale-90 transition-transform ${
            sr ? 'w-16 h-16 right-5 bottom-24' : 'w-14 h-14 right-5 bottom-20'
          }`}
        >
          <Plus className={sr ? 'w-8 h-8' : 'w-6 h-6'} />
        </button>
      )}

      <BottomNav />
    </div>
  );
};

export default MedicationSchedule;
