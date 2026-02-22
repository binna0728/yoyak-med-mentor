import { Link } from 'react-router-dom';
import { Pill, Clock, AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { mockSchedule, mockMedications, mockWarnings, weeklyAdherence } from '@/data/mockData';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const { user } = useAuth();
  const todaySchedule = mockSchedule;
  const taken = todaySchedule.filter(s => s.takenStatus).length;
  const total = todaySchedule.length;
  const adherenceRate = total > 0 ? Math.round((taken / total) * 100) : 0;
  const highWarnings = mockWarnings.filter(w => w.severity === 'high').length;

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">안녕하세요, {user?.name}님 👋</h1>
        <p className="text-muted-foreground">오늘의 복약 현황을 확인하세요</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<CheckCircle2 className="h-5 w-5 text-success" />} label="오늘 복용률" value={`${adherenceRate}%`} sub={`${taken}/${total} 완료`} />
        <StatCard icon={<Pill className="h-5 w-5 text-primary" />} label="복용 중인 약" value={`${mockMedications.length}종`} sub="처방약 기준" />
        <StatCard icon={<AlertTriangle className="h-5 w-5 text-warning" />} label="상호작용 경고" value={`${highWarnings}건`} sub="심각도 높음" />
        <StatCard icon={<TrendingUp className="h-5 w-5 text-primary" />} label="주간 평균 순응도" value={`${Math.round(weeklyAdherence.reduce((a, b) => a + b.rate, 0) / 7)}%`} sub="이번 주" />
      </div>

      {/* Today's Schedule */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-foreground">📅 오늘의 복용 일정</h2>
          <Button variant="ghost" size="sm" asChild><Link to="/app/schedule">전체 보기</Link></Button>
        </div>
        <div className="space-y-2">
          {todaySchedule.slice(0, 4).map(s => (
            <div key={s.id} className={`flex items-center justify-between rounded-lg border p-3 ${s.takenStatus ? 'border-success/30 bg-success/5' : 'border-border'}`}>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-muted-foreground">{s.timeHHMM}</span>
                <div>
                  <p className="text-sm font-medium text-foreground">{s.medicationName}</p>
                  <p className="text-xs text-muted-foreground">{s.timeOfDay}</p>
                </div>
              </div>
              {s.takenStatus ? (
                <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">복용 완료</span>
              ) : (
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">미복용</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Chart */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="mb-3 font-semibold text-foreground">📊 주간 복용 순응도</h2>
        <div className="flex items-end gap-2">
          {weeklyAdherence.map(d => (
            <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-xs font-medium text-foreground">{d.rate}%</span>
              <div className="w-full rounded-t bg-primary/20" style={{ height: '80px' }}>
                <div className="rounded-t bg-primary transition-all" style={{ height: `${d.rate * 0.8}px`, marginTop: `${80 - d.rate * 0.8}px` }} />
              </div>
              <span className="text-xs text-muted-foreground">{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Warnings Preview */}
      {highWarnings > 0 && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <div className="mb-2 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <h2 className="font-semibold text-foreground">주의가 필요한 경고</h2>
          </div>
          {mockWarnings.filter(w => w.severity === 'high').map(w => (
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
