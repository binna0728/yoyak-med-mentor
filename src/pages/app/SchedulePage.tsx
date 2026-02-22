import { useState } from 'react';
import { Check, Clock, Loader2, Zap, AlertCircle } from 'lucide-react';
import { useSchedules, useToggleSchedule, useOptimizeSchedules } from '@/hooks/useSupabase';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const timeSlots = ['아침', '점심', '저녁', '취침 전'];

const SchedulePage = () => {
  const { data: schedules = [], isLoading } = useSchedules();
  const toggleMutation = useToggleSchedule();
  const optimizeMutation = useOptimizeSchedules();
  const { toast } = useToast();
  const [optimizeResult, setOptimizeResult] = useState<any>(null);

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const grouped = timeSlots.map(slot => ({
    slot,
    items: schedules.filter((s: any) => s.time_of_day === slot),
  })).filter(g => g.items.length > 0);

  const taken = schedules.filter((s: any) => s.taken_status).length;
  const total = schedules.length;

  const handleOptimize = async () => {
    try {
      const result = await optimizeMutation.mutateAsync();
      setOptimizeResult(result);
      if (result.optimized) {
        toast({ title: '스케줄 최적화 완료', description: `${result.conflicts.length}건의 충돌이 조정되었습니다` });
      } else {
        toast({ title: '충돌 없음', description: '현재 스케줄에 시간 충돌이 없습니다' });
      }
    } catch (err: any) {
      toast({ variant: 'destructive', title: '최적화 실패', description: err.message });
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">복용 일정</h1>
          <p className="text-muted-foreground">오늘의 골든타임 스케줄</p>
        </div>
        {total > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleOptimize}
            disabled={optimizeMutation.isPending}
          >
            {optimizeMutation.isPending ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Zap className="mr-1 h-3 w-3" />}
            스케줄 최적화
          </Button>
        )}
      </div>

      {/* Progress bar */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">오늘 복용 현황</span>
          <span className="font-semibold text-foreground">{taken}/{total}</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: total > 0 ? `${(taken / total) * 100}%` : '0%' }} />
        </div>
      </div>

      {/* Optimization result */}
      {optimizeResult?.conflicts?.length > 0 && (
        <div className="rounded-xl border border-warning/30 bg-warning/5 p-4">
          <div className="mb-2 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-warning" />
            <h3 className="text-sm font-semibold text-foreground">충돌 조정 내역</h3>
          </div>
          {optimizeResult.conflicts.map((c: any, i: number) => (
            <p key={i} className="text-sm text-foreground">
              {c.drugA} ↔ {c.drugB} ({c.time}) → {c.suggestion}
            </p>
          ))}
        </div>
      )}

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
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {item.medications?.name} {item.medications?.dosage}
                      </p>
                      <p className="text-xs text-muted-foreground">{item.time_hhmm}</p>
                    </div>
                    <button
                      onClick={() => toggleMutation.mutate({ id: item.id, taken: !item.taken_status })}
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                        item.taken_status
                          ? 'border-success bg-success text-success-foreground'
                          : 'border-border hover:border-primary'
                      }`}
                      aria-label={item.taken_status ? '복용 취소' : '복용 완료'}
                    >
                      {item.taken_status && <Check className="h-5 w-5" />}
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
