import { Link } from 'react-router-dom';
import { Pill, ChevronRight } from 'lucide-react';
import { mockMedications } from '@/data/mockData';

const Medications = () => {
  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">약물 목록</h1>
        <p className="text-muted-foreground">현재 복용 중인 약물 {mockMedications.length}종</p>
      </div>

      <div className="space-y-3">
        {mockMedications.map(med => (
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
                <p className="text-sm text-muted-foreground">{med.dosage} · 1일 {med.frequencyPerDay}회 · {med.durationDays}일</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Medications;
