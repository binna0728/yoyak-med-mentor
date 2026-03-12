import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSeniorMode } from '@/contexts/SeniorModeContext';

interface OcrItem {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  schedule: string;
  startDate?: string;
  endDate?: string;
}

const toDateStr = (d: Date) => d.toISOString().split('T')[0];

const calcEndDate = (startDate: string, duration: string): string => {
  const days = parseInt(duration.replace(/[^0-9]/g, '')) || 0;
  if (!days) return startDate;
  const d = new Date(startDate);
  d.setDate(d.getDate() + days - 1);
  return toDateStr(d);
};

const OcrResultEdit = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<OcrItem[]>([]);
  const { t } = useTranslation();
  const { isSeniorMode: sr } = useSeniorMode();
  const todayStr = toDateStr(new Date());

  useEffect(() => {
    const stored = localStorage.getItem('ocr_result');
    if (stored) {
      const parsed: OcrItem[] = JSON.parse(stored);
      setItems(parsed.map(item => ({
        ...item,
        startDate: item.startDate || todayStr,
        endDate: item.endDate || calcEndDate(item.startDate || todayStr, item.duration),
      })));
    }
  }, []);

  const updateItem = (idx: number, field: keyof OcrItem, value: string) => {
    setItems(prev => prev.map((item, i) => {
      if (i !== idx) return item;
      const updated = { ...item, [field]: value };
      // 시작일 변경 시 종료일 자동 재계산
      if (field === 'startDate') {
        updated.endDate = calcEndDate(value, item.duration);
      }
      // 복용 기간 변경 시 종료일 자동 재계산
      if (field === 'duration') {
        updated.endDate = calcEndDate(item.startDate || todayStr, value);
      }
      return updated;
    }));
  };

  const handleSave = () => {
    localStorage.setItem('ocr_result', JSON.stringify(items));
    navigate('/result/check', { replace: true });
  };

  const schedulePresets = [t('ocrEdit.beforeMeal'), t('ocrEdit.afterMeal'), t('ocrEdit.beforeBed'), t('ocrEdit.emptyStomach')];

  return (
    <div className="min-h-screen bg-background flex flex-col safe-area-padding">
      <header className="tds-header">
        <div className="flex items-center h-14 px-4 border-b border-border">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2"><ArrowLeft className={`text-foreground ${sr ? 'w-7 h-7' : 'w-6 h-6'}`} /></button>
          <div className="flex-1 text-center"><span className={`font-bold text-foreground ${sr ? 'text-xl' : 'text-lg'}`}>{t('ocrEdit.title')}</span></div>
          <div className="w-10" />
        </div>
      </header>

      <main className="flex-1 px-5 py-6 pb-28 overflow-y-auto">
        <div className="max-w-sm mx-auto">
          <h1 className={`font-bold text-foreground mb-6 ${sr ? 'text-2xl' : 'text-lg'}`}>{t('ocrEdit.editInfo')}</h1>

          {items.map((item, idx) => (
            <div key={idx} className="tds-card space-y-3 mb-4">
              <div className="space-y-1.5">
                <label className={`text-muted-foreground font-medium ${sr ? 'text-sm' : 'text-xs'}`}>{t('ocrEdit.medName')}</label>
                <input value={item.name} onChange={e => updateItem(idx, 'name', e.target.value)} className={`tds-textfield ${sr ? 'text-base h-12' : ''}`} />
              </div>
              <div className="space-y-1.5">
                <label className={`text-muted-foreground font-medium ${sr ? 'text-sm' : 'text-xs'}`}>{t('ocrEdit.singleDose')}</label>
                <input value={item.dosage} onChange={e => updateItem(idx, 'dosage', e.target.value)} className={`tds-textfield ${sr ? 'text-base h-12' : ''}`} />
              </div>
              <div className="space-y-1.5">
                <label className={`text-muted-foreground font-medium ${sr ? 'text-sm' : 'text-xs'}`}>{t('ocrEdit.dailyFrequency')}</label>
                <input value={item.frequency} onChange={e => updateItem(idx, 'frequency', e.target.value)} className={`tds-textfield ${sr ? 'text-base h-12' : ''}`} />
              </div>
              <div className="space-y-1.5">
                <label className={`text-muted-foreground font-medium ${sr ? 'text-sm' : 'text-xs'}`}>{t('ocrEdit.duration')}</label>
                <input value={item.duration} onChange={e => updateItem(idx, 'duration', e.target.value)} className={`tds-textfield ${sr ? 'text-base h-12' : ''}`} />
              </div>
              <div className="space-y-1.5">
                <label className={`text-muted-foreground font-medium ${sr ? 'text-sm' : 'text-xs'}`}>{t('ocrEdit.dosageTime')}</label>
                <input value={item.schedule} onChange={e => updateItem(idx, 'schedule', e.target.value)} className={`tds-textfield ${sr ? 'text-base h-12' : ''}`} />
                <div className="flex gap-2 flex-wrap">
                  {schedulePresets.map(p => (
                    <button key={p} type="button" onClick={() => updateItem(idx, 'schedule', p)}
                      className={`tds-chip px-3 ${sr ? 'text-sm h-11' : 'text-xs h-9'} ${item.schedule === p ? 'active' : ''}`}>{p}</button>
                  ))}
                </div>
              </div>
              {/* 복약 기간 달력 */}
              <div className="border-t border-border pt-3 space-y-3">
                <p className="text-xs font-semibold text-foreground">복약 기간 설정</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground font-medium">시작일</label>
                    <input
                      type="date"
                      value={item.startDate || todayStr}
                      onChange={e => updateItem(idx, 'startDate', e.target.value)}
                      className="tds-textfield text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground font-medium">종료일</label>
                    <input
                      type="date"
                      value={item.endDate || ''}
                      min={item.startDate || todayStr}
                      onChange={e => updateItem(idx, 'endDate', e.target.value)}
                      className="tds-textfield text-sm"
                    />
                  </div>
                </div>
                {item.startDate && item.endDate && (
                  <p className="text-xs text-primary font-medium text-center">
                    {item.startDate} ~ {item.endDate}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 safe-area-padding">
        <div className="max-w-sm mx-auto">
          <button onClick={handleSave} className={`tds-button-primary w-full ${sr ? 'h-14 text-lg' : ''}`}>{t('ocrEdit.saveConfirm')}</button>
        </div>
      </div>
    </div>
  );
};

export default OcrResultEdit;
