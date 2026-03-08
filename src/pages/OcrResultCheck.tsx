import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface OcrItem {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  schedule: string;
}

const OcrResultCheck = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<OcrItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('ocr_result');
    if (stored) setItems(JSON.parse(stored));
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col safe-area-padding">
      <header className="tds-header">
        <div className="flex items-center h-14 px-4 border-b border-border">
          <button onClick={() => navigate('/home')} className="p-2 -ml-2"><ArrowLeft className="w-6 h-6 text-foreground" /></button>
          <div className="flex-1" />
          <div className="w-10" />
        </div>
      </header>

      <main className="flex-1 px-5 py-6 pb-28 overflow-y-auto">
        <div className="max-w-sm mx-auto">
          <h1 className="text-lg font-bold text-foreground mb-1">추출된 복용 정보를</h1>
          <p className="text-lg font-bold text-foreground mb-6">확인해주세요</p>

          <div className="space-y-3">
            {items.map((item, idx) => (
              <div key={idx} className="tds-card space-y-2">
                <p className="font-semibold text-foreground">{item.name}</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-muted-foreground">1회 복용량:</span> <span className="text-foreground">{item.dosage}</span></div>
                  <div><span className="text-muted-foreground">1일 횟수:</span> <span className="text-foreground">{item.frequency}</span></div>
                  <div><span className="text-muted-foreground">기간:</span> <span className="text-foreground">{item.duration}</span></div>
                  <div><span className="text-muted-foreground">복용 시간:</span> <span className="text-foreground">{item.schedule}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 safe-area-padding">
        <div className="max-w-sm mx-auto flex gap-3">
          <button onClick={() => navigate('/result/edit')} className="tds-button-secondary flex-1">수정</button>
          <button onClick={() => navigate('/setup/time')} className="tds-button-primary flex-1">다음</button>
        </div>
      </div>
    </div>
  );
};

export default OcrResultCheck;
