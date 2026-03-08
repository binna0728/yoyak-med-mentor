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

const OcrResultEdit = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<OcrItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('ocr_result');
    if (stored) setItems(JSON.parse(stored));
  }, []);

  const updateItem = (idx: number, field: keyof OcrItem, value: string) => {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const handleSave = () => {
    localStorage.setItem('ocr_result', JSON.stringify(items));
    navigate('/setup/time');
  };

  const schedulePresets = ['식전', '식후', '취침 전', '공복'];

  return (
    <div className="min-h-screen bg-background flex flex-col safe-area-padding">
      <header className="tds-header">
        <div className="flex items-center h-14 px-4 border-b border-border">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2"><ArrowLeft className="w-6 h-6 text-foreground" /></button>
          <div className="flex-1 text-center"><span className="text-lg font-bold text-foreground">정보 수정</span></div>
          <div className="w-10" />
        </div>
      </header>

      <main className="flex-1 px-5 py-6 pb-28 overflow-y-auto">
        <div className="max-w-sm mx-auto">
          <h1 className="text-lg font-bold text-foreground mb-6">정보를 수정해주세요</h1>

          {items.map((item, idx) => (
            <div key={idx} className="tds-card space-y-3 mb-4">
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground font-medium">약 이름</label>
                <input value={item.name} onChange={e => updateItem(idx, 'name', e.target.value)} className="tds-textfield" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground font-medium">1회 복용량</label>
                <input value={item.dosage} onChange={e => updateItem(idx, 'dosage', e.target.value)} className="tds-textfield" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground font-medium">1일 횟수</label>
                <input value={item.frequency} onChange={e => updateItem(idx, 'frequency', e.target.value)} className="tds-textfield" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground font-medium">기간</label>
                <input value={item.duration} onChange={e => updateItem(idx, 'duration', e.target.value)} className="tds-textfield" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground font-medium">복용 시간</label>
                <input value={item.schedule} onChange={e => updateItem(idx, 'schedule', e.target.value)} className="tds-textfield" />
                <div className="flex gap-2 flex-wrap">
                  {schedulePresets.map(p => (
                    <button key={p} type="button" onClick={() => updateItem(idx, 'schedule', p)}
                      className={`tds-chip text-xs h-9 px-3 ${item.schedule === p ? 'active' : ''}`}>{p}</button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 safe-area-padding">
        <div className="max-w-sm mx-auto">
          <button onClick={handleSave} className="tds-button-primary w-full">확인하고 저장</button>
        </div>
      </div>
    </div>
  );
};

export default OcrResultEdit;
