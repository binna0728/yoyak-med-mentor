import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronLeft, ChevronRight, Calendar, List, Trash2, Pencil, Check, X, Volume2, VolumeX } from 'lucide-react';
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
  date?: string;
  startDate?: string;
  endDate?: string;
  schedule?: string;
}

interface DayRecord {
  date: string;
  total: number;
  taken: number;
}

interface EditDraft {
  name: string;
  time: string;
  schedule: string;
}

const MEAL_OPTIONS = ['식전', '식후', '상관없음'] as const;
const toDateStr = (d: Date) => d.toISOString().split('T')[0];

const MedicationSchedule = () => {
  const navigate = useNavigate();
  const { isSeniorMode: sr } = useSeniorMode();
  const { t, i18n } = useTranslation();

  const today = new Date();
  const todayStr = toDateStr(today);
  const [selectedDate, setSelectedDate] = useState(today);
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [monthRecords, setMonthRecords] = useState<Record<string, DayRecord>>({});
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState<Set<string>>(new Set());
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<EditDraft>({ name: '', time: '', schedule: '식후' });
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    return () => { window.speechSynthesis.cancel(); };
  }, []);

  useEffect(() => {
    // 더미/샘플 기록 1회 정리
    if (!localStorage.getItem('records_cleaned_v1')) {
      localStorage.removeItem('medication_records');
      localStorage.setItem('records_cleaned_v1', '1');
    }

    let filtered: ScheduleItem[] = [];
    const raw = localStorage.getItem('saved_schedules');
    if (raw) {
      try {
        const saved = JSON.parse(raw);
        filtered = saved
          .filter((s: { id: string }) => !s.id.startsWith('sample-'))
          .map((s: {
            id: string; name: string; time: string; period: string;
            taken?: boolean; date?: string; startDate?: string; endDate?: string; schedule?: string;
          }) => ({
            id: s.id, name: s.name, time: s.time,
            period: s.period as ScheduleItem['period'],
            taken: s.taken || false,
            date: s.date, startDate: s.startDate, endDate: s.endDate, schedule: s.schedule,
          }));
        setItems(filtered);
        if (saved.some((s: { id: string }) => s.id.startsWith('sample-'))) {
          localStorage.setItem('saved_schedules', JSON.stringify(filtered));
        }
      } catch {
        setItems([]);
      }
    }

    // medication_records 로드 후 오늘 날짜 실제 taken 상태 반영
    let records: Record<string, DayRecord> = {};
    const recordsRaw = localStorage.getItem('medication_records');
    if (recordsRaw) {
      try { records = JSON.parse(recordsRaw); } catch { /* ignore */ }
    }
    if (filtered.length > 0) {
      const takenToday = filtered.filter(i => i.taken).length;
      records[todayStr] = { date: todayStr, total: filtered.length, taken: takenToday };
      localStorage.setItem('medication_records', JSON.stringify(records));
    }
    setMonthRecords(records);
  }, [t]);

  const getWeekDays = (base: Date) => {
    const start = new Date(base);
    start.setDate(start.getDate() - start.getDay() + 1);
    return Array.from({ length: 7 }, (_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return d; });
  };

  const getMonthDays = (base: Date) => {
    const year = base.getFullYear(), month = base.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startOffset = (firstDay.getDay() + 6) % 7;
    const days: (Date | null)[] = Array(startOffset).fill(null);
    for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d));
    return days;
  };

  const weekDays = getWeekDays(selectedDate);
  const monthDays = getMonthDays(selectedDate);
  const dayLabels = [t('schedule.dayMon'), t('schedule.dayTue'), t('schedule.dayWed'), t('schedule.dayThu'), t('schedule.dayFri'), t('schedule.daySat'), t('schedule.daySun')];
  const isSameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  // items 변경 시 medication_records + monthRecords 동기화
  useEffect(() => {
    if (items.length === 0) return;
    const takenCount = items.filter(i => i.taken).length;
    const recordsRaw = localStorage.getItem('medication_records');
    let records: Record<string, DayRecord> = {};
    if (recordsRaw) { try { records = JSON.parse(recordsRaw); } catch { /* ignore */ } }
    records[todayStr] = { date: todayStr, total: items.length, taken: takenCount };
    localStorage.setItem('medication_records', JSON.stringify(records));
    setMonthRecords({ ...records });
  }, [items]);

  const handleTTS = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const todayItems = items.filter(i => {
      const sel = toDateStr(selectedDate);
      return (!i.startDate || i.startDate <= sel) && (!i.endDate || i.endDate >= sel);
    });
    if (todayItems.length === 0) {
      const utter = new SpeechSynthesisUtterance('오늘은 등록된 약이 없어요.');
      utter.lang = 'ko-KR';
      window.speechSynthesis.speak(utter);
      return;
    }
    const total = todayItems.length;
    const taken = todayItems.filter(i => i.taken).length;
    const remaining = todayItems.filter(i => !i.taken);
    const periodMap: Record<string, string> = { morning: '아침', afternoon: '점심', evening: '저녁', bedtime: '자기 전' };
    const nativeNum = (n: number) => ['', '한', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉', '열'][n] || String(n);
    let text = `오늘 드실 약은 총 ${nativeNum(total)} 가지이고요, 지금까지 ${nativeNum(taken)} 가지를 드셨어요. `;
    if (remaining.length === 0) {
      text += '오늘 약은 다 드셨네요! 잘하셨어요.';
    } else {
      text += `아직 ${nativeNum(remaining.length)} 가지가 남았어요. `;
      const byPeriod: Record<string, string[]> = {};
      remaining.forEach(i => {
        if (!byPeriod[i.period]) byPeriod[i.period] = [];
        byPeriod[i.period].push(i.name);
      });
      ['morning', 'afternoon', 'evening', 'bedtime'].forEach(p => {
        if (byPeriod[p]?.length) text += `${periodMap[p]}에 ${byPeriod[p].join(', ')} 드셔야 해요. `;
      });
    }
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'ko-KR';
    utter.rate = 0.9;
    utterRef.current = utter;
    utter.onend = () => setIsSpeaking(false);
    utter.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utter);
    setIsSpeaking(true);
  };

  const toggleTaken = (id: string) => {
    const raw = localStorage.getItem('saved_schedules');
    if (raw) {
      try {
        const saved = JSON.parse(raw);
        localStorage.setItem('saved_schedules', JSON.stringify(
          saved.map((s: { id: string; taken?: boolean }) => s.id === id ? { ...s, taken: !s.taken } : s)
        ));
      } catch { /* ignore */ }
    }
    setItems(prev => prev.map(item => item.id === id ? { ...item, taken: !item.taken } : item));
  };

  const toggleSelectForDelete = (id: string) => {
    setSelectedForDelete(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
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
        localStorage.setItem('saved_schedules', JSON.stringify(
          saved.filter((s: { id: string }) => !selectedForDelete.has(s.id))
        ));
      } catch { /* ignore */ }
    }
    setSelectedForDelete(new Set());
    setDeleteMode(false);
  };

  const startEdit = (item: ScheduleItem) => {
    setEditingId(item.id);
    setEditDraft({
      name: item.name,
      time: item.time,
      schedule: item.schedule || '식후',
    });
  };

  const handleSaveEdit = (id: string) => {
    const updated = items.map(item =>
      item.id === id
        ? { ...item, name: editDraft.name, time: editDraft.time, schedule: editDraft.schedule }
        : item
    );
    setItems(updated);
    const raw = localStorage.getItem('saved_schedules');
    if (raw) {
      try {
        const saved = JSON.parse(raw);
        localStorage.setItem('saved_schedules', JSON.stringify(
          saved.map((s: { id: string }) =>
            s.id === id
              ? { ...s, name: editDraft.name, time: editDraft.time, schedule: editDraft.schedule }
              : s
          )
        ));
      } catch { /* ignore */ }
    }
    setEditingId(null);
  };

  const alarmItems = items.filter(i => !i.taken).map(item => ({ id: item.id, name: item.name, time: item.time, period: item.period }));
  const { currentAlarm, dismissAlarm, permissionGranted, requestPermission } = useMedicationAlarm(alarmItems);

  const periods = [
    { key: 'morning', label: t('schedule.morning') },
    { key: 'afternoon', label: t('schedule.afternoon') },
    { key: 'evening', label: t('schedule.evening') },
    { key: 'bedtime', label: t('schedule.bedtime') },
  ];

  const shiftPeriod = (dir: number) => {
    const d = new Date(selectedDate);
    viewMode === 'week' ? d.setDate(d.getDate() + dir * 7) : d.setMonth(d.getMonth() + dir);
    setSelectedDate(d);
  };

  const monthLabel = i18n.language === 'ko'
    ? `${selectedDate.getFullYear()}년 ${selectedDate.getMonth() + 1}월`
    : selectedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

  const takenCount = items.filter(i => i.taken).length;
  const isAnyMode = deleteMode || editMode;

  const getCompletionColor = (record: DayRecord | undefined) => {
    if (!record || record.total === 0) return 'bg-muted';
    const rate = record.taken / record.total;
    if (rate >= 1) return 'bg-primary';
    if (rate >= 0.5) return 'bg-primary/60';
    if (rate > 0) return 'bg-primary/30';
    return 'bg-destructive/30';
  };

  const monthStats = () => {
    const year = selectedDate.getFullYear(), month = selectedDate.getMonth();
    let totalDays = 0, completeDays = 0, partialDays = 0, missedDays = 0;
    Object.values(monthRecords).forEach(record => {
      const recordDate = new Date(record.date);
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
            {!isAnyMode && (
              <span className={`inline-flex items-center rounded-full text-xs font-semibold px-2.5 py-0.5 ${
                takenCount === items.length ? 'bg-primary/10 text-primary' : 'bg-accent text-accent-foreground'
              }`}>{takenCount}/{items.length}</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {isAnyMode ? (
              <button
                onClick={() => { setDeleteMode(false); setEditMode(false); setEditingId(null); setSelectedForDelete(new Set()); }}
                className={`text-muted-foreground font-medium ${sr ? 'text-base' : 'text-sm'} px-3 py-1`}
              >
                취소
              </button>
            ) : (
              <>
                <button
                  onClick={handleTTS}
                  className={`p-2 rounded-lg transition-colors ${isSpeaking ? 'text-primary' : 'text-muted-foreground'}`}
                  title="오늘 복약 읽어주기"
                >
                  {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => setViewMode(viewMode === 'week' ? 'month' : 'week')}
                  className={`p-2 rounded-lg transition-colors ${viewMode === 'month' ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
                >
                  {viewMode === 'week' ? <Calendar className="w-5 h-5" /> : <List className="w-5 h-5" />}
                </button>
                <button onClick={() => setEditMode(true)} className="p-2">
                  <Pencil className="w-5 h-5 text-muted-foreground" />
                </button>
                <button onClick={() => setDeleteMode(true)} className="p-2">
                  <Trash2 className="w-5 h-5 text-muted-foreground" />
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
            <div className="grid grid-cols-7 gap-1">
              {weekDays.map((day, idx) => {
                const isToday = isSameDay(day, today);
                const isSelected = isSameDay(day, selectedDate);
                const dateStr = toDateStr(day);
                const record = monthRecords[dateStr];
                return (
                  <button key={idx} onClick={() => setSelectedDate(day)}
                    className={`flex flex-col items-center py-2 rounded-xl transition-colors ${
                      isSelected ? 'bg-primary text-primary-foreground' : isToday ? 'bg-accent text-primary' : 'text-foreground'
                    }`}
                  >
                    <span className={`text-xs ${isSelected ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{dayLabels[idx]}</span>
                    <span className={`font-semibold ${sr ? 'text-lg' : 'text-sm'} mt-0.5`}>{day.getDate()}</span>
                    {record && !isSelected && <div className={`w-1.5 h-1.5 rounded-full mt-1 ${getCompletionColor(record)}`} />}
                  </button>
                );
              })}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayLabels.map(label => <div key={label} className="text-center text-xs text-muted-foreground py-1">{label}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {monthDays.map((day, idx) => {
                  if (!day) return <div key={`empty-${idx}`} className="aspect-square" />;
                  const isToday = isSameDay(day, today);
                  const isSelected = isSameDay(day, selectedDate);
                  const dateStr = toDateStr(day);
                  const record = monthRecords[dateStr];
                  const isPast = day < today && !isToday;
                  const isFuture = day > today;
                  return (
                    <button key={dateStr} onClick={() => setSelectedDate(day)}
                      className={`aspect-square rounded-xl flex flex-col items-center justify-center transition-colors relative ${
                        isSelected ? 'bg-primary text-primary-foreground'
                        : isToday ? 'bg-accent text-primary ring-2 ring-primary'
                        : isFuture ? 'text-muted-foreground/50'
                        : 'text-foreground hover:bg-accent'
                      }`}
                    >
                      <span className={`font-medium ${sr ? 'text-base' : 'text-xs'}`}>{day.getDate()}</span>
                      {isPast && record && <div className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full ${getCompletionColor(record)}`} />}
                      {isPast && record && record.total > 0 && (
                        <span className={`text-[10px] mt-0.5 ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                          {record.taken}/{record.total}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
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
                      <span className="font-medium text-primary">{Math.round((stats.completeDays / stats.totalDays) * 100)}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(stats.completeDays / stats.totalDays) * 100}%` }} />
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {'Notification' in window && (
          <AlarmPermissionPrompt
            granted={permissionGranted}
            onRequest={requestPermission}
            onRevoke={() => {
              // 브라우저 알림은 JS로 revoke 불가하므로 앱 내부 플래그로 관리
              localStorage.setItem('alarm_disabled', 'true');
              window.location.reload();
            }}
          />
        )}

        {!isAnyMode && items.length > 0 && takenCount < items.length && (
          <div className={`flex items-center gap-2 rounded-2xl bg-primary/10 border border-primary/20 mb-4 ${sr ? 'px-5 py-4' : 'px-4 py-3'}`}>
            <span className={sr ? 'text-2xl' : 'text-lg'}>👇</span>
            <p className={`text-primary font-medium ${sr ? 'text-base' : 'text-sm'}`}>
              복용한 약은 왼쪽 동그라미를 눌러 체크해주세요
            </p>
          </div>
        )}

        {editMode && !editingId && (
          <p className={`text-center text-primary font-medium mb-4 ${sr ? 'text-base' : 'text-sm'}`}>
            ✏️ 수정할 항목을 탭하세요
          </p>
        )}

        {items.length === 0 ? (
          <div className="text-center py-12">
            <p className={`text-muted-foreground ${sr ? 'text-lg' : 'text-sm'}`}>{t('schedule.noSchedule') || '등록된 복약 스케줄이 없습니다'}</p>
            <button onClick={() => navigate('/capture')} className="tds-button-primary mt-4">{t('schedule.addMedication') || '약 추가하기'}</button>
          </div>
        ) : (
          <div className="space-y-4">
            {periods.map(period => {
              const selectedDateStr = toDateStr(selectedDate);
              const periodItems = items.filter(i =>
                i.period === period.key &&
                (!i.startDate || i.startDate <= selectedDateStr) &&
                (!i.endDate || i.endDate >= selectedDateStr)
              );
              if (periodItems.length === 0) return null;
              return (
                <div key={period.key}>
                  <h3 className={`font-semibold text-foreground mb-2 ${sr ? 'text-lg' : 'text-sm'}`}>{period.label}</h3>
                  <div className="space-y-2">
                    {periodItems.map((item) => {
                      const isEditing = editMode && editingId === item.id;

                      if (isEditing) {
                        return (
                          <div key={item.id} className="tds-card space-y-3 border-primary/50" style={sr ? { padding: '20px' } : undefined}>
                            {/* 약 이름 */}
                            <div className="space-y-1.5">
                              <label className="text-xs text-muted-foreground font-medium">약 이름</label>
                              <input
                                value={editDraft.name}
                                onChange={e => setEditDraft(prev => ({ ...prev, name: e.target.value }))}
                                className={`tds-textfield ${sr ? 'text-lg h-12' : ''}`}
                              />
                            </div>
                            {/* 복용 시간 */}
                            <div className="space-y-1.5">
                              <label className="text-xs text-muted-foreground font-medium">복용 시간</label>
                              <input
                                type="time"
                                value={editDraft.time}
                                onChange={e => setEditDraft(prev => ({ ...prev, time: e.target.value }))}
                                className={`tds-textfield ${sr ? 'text-lg h-12' : ''}`}
                              />
                            </div>
                            {/* 식전/식후 */}
                            <div className="space-y-1.5">
                              <label className="text-xs text-muted-foreground font-medium">식전/식후</label>
                              <div className="flex gap-2">
                                {MEAL_OPTIONS.map(opt => (
                                  <button
                                    key={opt}
                                    onClick={() => setEditDraft(prev => ({ ...prev, schedule: opt }))}
                                    className={`tds-chip flex-1 h-9 text-sm ${editDraft.schedule === opt ? 'active' : ''}`}
                                  >
                                    {opt}
                                  </button>
                                ))}
                              </div>
                            </div>
                            {/* 저장/취소 버튼 */}
                            <div className="flex gap-2 pt-1">
                              <button
                                onClick={() => setEditingId(null)}
                                className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl border border-border text-muted-foreground text-sm font-medium"
                              >
                                <X className="w-4 h-4" />
                                취소
                              </button>
                              <button
                                onClick={() => handleSaveEdit(item.id)}
                                className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl bg-primary text-primary-foreground text-sm font-medium"
                              >
                                <Check className="w-4 h-4" />
                                저장
                              </button>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={item.id}
                          className={`tds-card flex items-center gap-3 ${editMode ? 'cursor-pointer active:bg-accent/50' : ''}`}
                          style={sr ? { padding: '20px' } : undefined}
                          onClick={editMode ? () => startEdit(item) : undefined}
                        >
                          {deleteMode ? (
                            <button
                              onClick={e => { e.stopPropagation(); toggleSelectForDelete(item.id); }}
                              className={`rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                                selectedForDelete.has(item.id) ? 'bg-primary border-primary' : 'border-border hover:border-primary/50'
                              } ${sr ? 'w-8 h-8' : 'w-6 h-6'}`}
                            >
                              {selectedForDelete.has(item.id) && <span className="text-white text-xs font-bold">✓</span>}
                            </button>
                          ) : editMode ? (
                            <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                              <Pencil className="w-4 h-4 text-primary/60" />
                            </div>
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
                            <p className={`font-medium ${!editMode && !deleteMode && item.taken ? 'text-muted-foreground line-through' : 'text-foreground'} ${sr ? 'text-lg' : 'text-sm'}`}>
                              {item.name}
                            </p>
                            <p className={`text-muted-foreground ${sr ? 'text-base' : 'text-xs'}`}>
                              {item.time}{item.schedule && item.schedule !== '상관없음' ? ` · ${item.schedule}` : ''}
                            </p>
                          </div>
                          {!deleteMode && !editMode && (
                            <span className={`inline-flex items-center rounded-full text-xs font-medium px-2 py-0.5 ${
                              item.taken ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                            }`}>
                              {item.taken ? t('schedule.taken') : t('schedule.notTaken')}
                            </span>
                          )}
                          {editMode && (
                            <span className="text-xs text-primary/60 shrink-0">탭하여 수정</span>
                          )}
                        </div>
                      );
                    })}
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
        <div className="fixed bottom-16 left-0 right-0 bg-card border-t border-border p-4 z-40">
          <button
            onClick={handleDelete}
            disabled={selectedForDelete.size === 0}
            className={`w-full flex items-center justify-center gap-2 rounded-2xl font-semibold py-3 transition-colors ${
              selectedForDelete.size > 0 ? 'bg-primary text-primary-foreground active:opacity-80' : 'bg-muted text-muted-foreground cursor-not-allowed'
            } ${sr ? 'text-lg' : 'text-base'}`}
          >
            <Trash2 className="w-5 h-5" />
            {selectedForDelete.size > 0 ? `${selectedForDelete.size}개 삭제` : '삭제할 항목을 선택하세요'}
          </button>
        </div>
      ) : !editMode && (
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
