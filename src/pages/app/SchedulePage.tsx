import { Check, Clock, Loader2 } from 'lucide-react';
import { useSchedules, useToggleSchedule } from '@/hooks/useSupabase';

const timeSlots = ['아침', '점심', '저녁', '취침 전'];

const SchedulePage = () => {
  const { data: schedules = [], isLoading } = useSchedules();
  const toggleMutation = useToggleSchedule();

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const grouped = timeSlots.map(slot => ({
    slot,
    items: schedules.filter((s: any) => s.time_of_day === slot),
  })).filter(g => g.items.length > 0);

  const taken = schedules.filter((s: any) => s.taken_status).length;
  const total = schedules.length;

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">복용 일정</h1>
        <p className="text-muted-foreground">오늘의 골든타임 스케줄</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">오늘 복용 현황</span>
          <span className="font-semibold text-foreground">{taken}/{total}</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: total > 0 ? `${(taken / total) * 100}%` : '0%' }} />
        </div>
      </div>

      {total === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <Clock className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">오늘 예정된 복용 일정이 없습니다</p>
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map(group => (
            <div key={group.slot}>
              <div className="mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <h2 className="font-semibold text-foreground">{group.slot}</h2>
              </div>
              <div className="ml-2 space-y-2 border-l-2 border-border pl-4">
                {group.items.map((item: any) => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${
                      item.taken_status ? 'border-success/30 bg-success/5' : 'border-border bg-card'
                    }`}
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {item.medications?.name} {item.medications?.dosage}
                      </p>
                      <p className="text-xs text-muted-foreground">{item.time_hhmm}</p>
                    </div>
                    <button
                      onClick={() => toggleMutation.mutate({ id: item.id, taken: !item.taken_status })}
                      className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors ${
                        item.taken_status
                          ? 'border-success bg-success text-success-foreground'
                          : 'border-border hover:border-primary'
                      }`}
                      aria-label={item.taken_status ? '복용 취소' : '복용 완료'}
                    >
                      {item.taken_status && <Check className="h-4 w-4" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SchedulePage;
