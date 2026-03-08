import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

interface ScheduleItem {
  time: string;
  name: string;
  taken: boolean;
}

const MedicationSchedule = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<ScheduleItem[]>([
    { time: '오전 9:00', name: '혈압약', taken: false },
    { time: '저녁 7:00', name: '비타민', taken: false },
  ]);

  const toggleTaken = (idx: number) => {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, taken: !item.taken } : item));
  };

  return (
    <div className="min-h-screen bg-background flex flex-col safe-area-padding">
      <header className="tds-header">
        <div className="flex items-center justify-between h-14 px-5 border-b border-border">
          <h1 className="text-lg font-bold text-foreground">오늘 복약 리스트</h1>
          <button onClick={() => navigate('/setup/time')} className="p-2"><Settings className="w-5 h-5 text-muted-foreground" /></button>
        </div>
      </header>

      <main className="flex-1 px-5 py-6 pb-24 overflow-y-auto max-w-3xl mx-auto w-full">
        {/* Date navigation placeholder */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <span className="text-sm text-muted-foreground">◀</span>
          <span className="font-semibold text-foreground">오늘</span>
          <span className="text-sm text-muted-foreground">▶</span>
        </div>

        <div className="space-y-3 mb-8">
          {items.map((item, idx) => (
            <div key={idx} className="tds-card flex items-center gap-4">
              <button
                onClick={() => toggleTaken(idx)}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  item.taken ? 'bg-primary border-primary' : 'border-border'
                }`}
              >
                {item.taken && <span className="text-primary-foreground text-xs">✓</span>}
              </button>
              <div className="flex-1">
                <p className={`font-medium text-sm ${item.taken ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{item.time}</p>
                <p className={`text-xs ${item.taken ? 'text-muted-foreground' : 'text-muted-foreground'}`}>{item.name} · 복용 {item.taken ? '완료' : '전'}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <button onClick={() => navigate('/guide/demo-1')} className="tds-button-primary w-full">
            복약 가이드 보기
          </button>
          <button onClick={() => navigate('/guide/demo-1/silver')} className="tds-button-secondary w-full">
            실버모드 보기
          </button>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          ※ 복약 안내는 참고용이며, 정확한 복용은 의사·약사와 상담하세요.
        </p>
      </main>

      <BottomNav />
    </div>
  );
};

export default MedicationSchedule;
