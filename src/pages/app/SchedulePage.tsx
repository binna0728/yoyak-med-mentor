import { useState } from 'react';
import { Check, Clock } from 'lucide-react';
import { mockSchedule, Schedule } from '@/data/mockData';

const timeSlots = ['아침', '점심', '저녁', '취침 전'];

const SchedulePage = () => {
  const [schedules, setSchedules] = useState<Schedule[]>(mockSchedule);

  const toggleTaken = (id: string) => {
    setSchedules(prev => prev.map(s => s.id === id ? { ...s, takenStatus: !s.takenStatus } : s));
  };

  const grouped = timeSlots.map(slot => ({
    slot,
    items: schedules.filter(s => s.timeOfDay === slot),
  })).filter(g => g.items.length > 0);

  const taken = schedules.filter(s => s.takenStatus).length;
  const total = schedules.length;

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">복용 일정</h1>
        <p className="text-muted-foreground">오늘의 골든타임 스케줄</p>
      </div>

      {/* Progress */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">오늘 복용 현황</span>
          <span className="font-semibold text-foreground">{taken}/{total}</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(taken / total) * 100}%` }} />
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {grouped.map(group => (
          <div key={group.slot}>
            <div className="mb-2 flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <h2 className="font-semibold text-foreground">{group.slot}</h2>
            </div>
            <div className="ml-2 space-y-2 border-l-2 border-border pl-4">
              {group.items.map(item => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${
                    item.takenStatus ? 'border-success/30 bg-success/5' : 'border-border bg-card'
                  }`}
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.medicationName}</p>
                    <p className="text-xs text-muted-foreground">{item.timeHHMM}</p>
                  </div>
                  <button
                    onClick={() => toggleTaken(item.id)}
                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors ${
                      item.takenStatus
                        ? 'border-success bg-success text-success-foreground'
                        : 'border-border hover:border-primary'
                    }`}
                    aria-label={item.takenStatus ? '복용 취소' : '복용 완료'}
                  >
                    {item.takenStatus && <Check className="h-4 w-4" />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SchedulePage;
