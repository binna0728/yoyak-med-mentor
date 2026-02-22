import { Link } from 'react-router-dom';
import { Pill, ChevronRight, Loader2 } from 'lucide-react';
import { useMedications } from '@/hooks/useSupabase';

const Medications = () => {
  const { data: medications = [], isLoading } = useMedications();

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">약물 목록</h1>
        <p className="text-muted-foreground">현재 복용 중인 약물 {medications.length}종</p>
      </div>

      {medications.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <Pill className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">등록된 약물이 없습니다</p>
          <Link to="/app/upload" className="mt-2 inline-block text-sm text-primary hover:underline">처방전 업로드하기</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {medications.map(med => (
            <Link
              key={med.id}
              to={`/app/medications/${med.id}`}
              className="flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Pill className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{med.name}</p>
                  <p className="text-sm text-muted-foreground">{med.dosage} · 1일 {med.frequency_per_day}회 · {med.duration_days}일</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Medications;
