import { Link } from 'react-router-dom';
import { Pill, Clock, AlertTriangle, CheckCircle2, TrendingUp, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSchedules, useMedications, useWarnings } from '@/hooks/useSupabase';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const { user } = useAuth();
  const { data: schedules = [], isLoading: loadingSchedules } = useSchedules();
  const { data: medications = [], isLoading: loadingMeds } = useMedications();
  const { data: warnings = [], isLoading: loadingWarnings } = useWarnings();

  const isLoading = loadingSchedules || loadingMeds || loadingWarnings;

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const taken = schedules.filter((s: any) => s.taken_status).length;
  const total = schedules.length;
  const adherenceRate = total > 0 ? Math.round((taken / total) * 100) : 0;
  const highWarnings = warnings.filter((w: any) => w.severity === 'high').length;

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">안녕하세요, {user?.name || '사용자'}님 👋</h1>
        <p className="text-muted-foreground">오늘의 복약 현황을 확인하세요</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<CheckCircle2 className="h-5 w-5 text-success" />} label="오늘 복용률" value={`${adherenceRate}%`} sub={`${taken}/${total} 완료`} />
        <StatCard icon={<Pill className="h-5 w-5 text-primary" />} label="복용 중인 약" value={`${medications.length}종`} sub="처방약 기준" />
        <StatCard icon={<AlertTriangle className="h-5 w-5 text-warning" />} label="상호작용 경고" value={`${highWarnings}건`} sub="심각도 높음" />
        <StatCard icon={<TrendingUp className="h-5 w-5 text-primary" />} label="오늘 일정" value={`${total}건`} sub="복용 예정" />
      </div>

      {/* Today's Schedule */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-foreground">📅 오늘의 복용 일정</h2>
          <Button variant="ghost" size="sm" asChild><Link to="/app/schedule">전체 보기</Link></Button>
        </div>
        {total === 0 ? (
          <p className="text-sm text-muted-foreground">등록된 일정이 없습니다. <Link to="/app/upload" className="text-primary hover:underline">처방전을 업로드</Link>하세요.</p>
        ) : (
          <div className="space-y-2">
            {schedules.slice(0, 4).map((s: any) => (
              <div key={s.id} className={`flex items-center justify-between rounded-lg border p-3 ${s.taken_status ? 'border-success/30 bg-success/5' : 'border-border'}`}>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-muted-foreground">{s.time_hhmm}</span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{s.medications?.name} {s.medications?.dosage}</p>
                    <p className="text-xs text-muted-foreground">{s.time_of_day}</p>
                  </div>
                </div>
                {s.taken_status ? (
                  <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">복용 완료</span>
                ) : (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">미복용</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {highWarnings > 0 && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <div className="mb-2 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <h2 className="font-semibold text-foreground">주의가 필요한 경고</h2>
          </div>
          {warnings.filter((w: any) => w.severity === 'high').map((w: any) => (
            <p key={w.id} className="text-sm text-foreground">{w.title}</p>
          ))}
          <Button variant="outline" size="sm" className="mt-2" asChild>
            <Link to="/app/warnings">상세 보기</Link>
          </Button>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub: string }) => (
  <div className="rounded-xl border border-border bg-card p-4">
    <div className="mb-2 flex items-center gap-2">
      {icon}
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
    <p className="text-2xl font-bold text-foreground">{value}</p>
    <p className="text-xs text-muted-foreground">{sub}</p>
  </div>
);

export default Dashboard;
