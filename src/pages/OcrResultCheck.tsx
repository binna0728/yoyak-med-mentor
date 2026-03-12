import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Volume2, CalendarPlus, Loader2 } from 'lucide-react';
import { useSeniorMode } from '@/contexts/SeniorModeContext';
import { medicineApi } from '@/api/medicine';
import apiClient from '@/api/client';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface OcrItem {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  schedule: string;
}

/** OCR 결과에서 시간대(period)와 기본 시간(HH:MM)을 추출 */
const parseScheduleInfo = (schedule: string, frequency: string) => {
  const entries: { period: string; time: string }[] = [];
  const lower = schedule.toLowerCase();

  if (lower.includes('아침') || lower.includes('morning')) {
    entries.push({ period: 'morning', time: '09:00' });
  }
  if (lower.includes('점심') || lower.includes('lunch') || lower.includes('낮')) {
    entries.push({ period: 'afternoon', time: '12:00' });
  }
  if (lower.includes('저녁') || lower.includes('evening') || lower.includes('dinner')) {
    entries.push({ period: 'evening', time: '18:00' });
  }
  if (lower.includes('취침') || lower.includes('bed') || lower.includes('자기')) {
    entries.push({ period: 'bedtime', time: '22:00' });
  }

  // frequency 기반 fallback
  if (entries.length === 0) {
    const freqNum = parseInt(frequency.replace(/[^0-9]/g, '')) || 1;
    if (freqNum >= 3) {
      entries.push({ period: 'morning', time: '09:00' }, { period: 'afternoon', time: '12:00' }, { period: 'evening', time: '18:00' });
    } else if (freqNum === 2) {
      entries.push({ period: 'morning', time: '09:00' }, { period: 'evening', time: '18:00' });
    } else {
      entries.push({ period: 'morning', time: '09:00' });
    }
  }

  return entries;
};

const OcrResultCheck = () => {
  const navigate = useNavigate();
  const { isSeniorMode: sr } = useSeniorMode();
  const [items, setItems] = useState<OcrItem[]>([]);
  const [ttsLoading, setTtsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [guideLoadingIdx, setGuideLoadingIdx] = useState<number | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const stored = localStorage.getItem('ocr_result');
    if (stored) setItems(JSON.parse(stored));
  }, []);

  /** OCR 결과를 복약 스케줄로 자동 등록 */
  const handleAutoRegister = () => {
    setSaving(true);
    try {
      const existingRaw = localStorage.getItem('saved_schedules');
      const existing = existingRaw ? JSON.parse(existingRaw) : [];

      const newSchedules = items.flatMap(item => {
        const scheduleEntries = parseScheduleInfo(item.schedule, item.frequency);
        return scheduleEntries.map(entry => ({
          id: `ocr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          name: item.name,
          dosage: item.dosage,
          frequency: item.frequency,
          duration: item.duration,
          schedule: item.schedule,
          time: entry.time,
          period: entry.period,
          taken: false,
          createdAt: new Date().toISOString(),
        }));
      });

      localStorage.setItem('saved_schedules', JSON.stringify([...existing, ...newSchedules]));
      toast.success(t('ocr.scheduleRegistered', { count: newSchedules.length }) || `${newSchedules.length}개 복약 스케줄이 등록되었습니다`);
      navigate('/schedule', { replace: true });
    } catch {
      toast.error(t('ocr.scheduleFailed') || '스케줄 등록에 실패했습니다');
    } finally {
      setSaving(false);
    }
  };

  const handleGuide = async (item: OcrItem, idx: number) => {
    const demoId = `ocr-${Date.now()}`;
    setGuideLoadingIdx(idx);
    try {
      const res = await apiClient.post('/chat', {
        question: `${item.name}의 효능, 복용법, 주의사항, 부작용을 알려줘`,
      });
      const { sections, answer } = res.data;
      localStorage.setItem(`guide_${demoId}`, JSON.stringify({
        id: demoId,
        name: item.name,
        effect: sections?.summary || '',
        dosage: `${item.dosage}, ${item.frequency}`,
        schedule: item.schedule,
        warning: sections?.precautions || '',
        side_effect: sections?.tips || '',
        patient_explanation: answer || '',
        created_at: new Date().toISOString(),
      }));
    } catch {
      // API 실패 시 기본 안내 텍스트
      localStorage.setItem(`guide_${demoId}`, JSON.stringify({
        id: demoId,
        name: item.name,
        effect: t('ocr.aiAnalyzedEffect'),
        dosage: `${item.dosage}, ${item.frequency}`,
        schedule: item.schedule,
        warning: t('ocr.aiAnalyzedWarning'),
        side_effect: t('ocr.aiAnalyzedSideEffect'),
        patient_explanation: t('ocr.aiPatientExplanation', { name: item.name, schedule: item.schedule, dosage: item.dosage }),
        created_at: new Date().toISOString(),
      }));
    } finally {
      setGuideLoadingIdx(null);
    }
    navigate(`/guide/${demoId}`);
  };

  const handleTTS = async () => {
    if (items.length === 0) return;
    setTtsLoading(true);
    const text = items.map(item =>
      t('sampleMeds.ttsIntro', { name: item.name, dosage: item.dosage, frequency: item.frequency, schedule: item.schedule, duration: item.duration })
    ).join(' ');

    try {
      const result = await medicineApi.getTTS('ocr-result', text);
      const audio = new Audio(result.audio_url);
      await audio.play();
    } catch {
      if ('speechSynthesis' in window) {
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = 'ko-KR';
        utter.rate = 0.9;
        utter.onend = () => setTtsLoading(false);
        window.speechSynthesis.speak(utter);
      } else {
        toast.error(t('ttsPlayer.notSupported'));
      }
    } finally {
      setTtsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col safe-area-padding">
      <header className="tds-header">
        <div className="flex items-center h-14 px-4 border-b border-border">
          <button onClick={() => navigate('/home')} className="p-2 -ml-2">
            <ArrowLeft className={`text-foreground ${sr ? 'w-7 h-7' : 'w-6 h-6'}`} />
          </button>
          <div className="flex-1" />
          <div className="w-10" />
        </div>
      </header>

      <main className="flex-1 px-5 py-6 pb-44 overflow-y-auto">
        <div className="max-w-lg mx-auto">
          <h1 className={`font-bold text-foreground ${sr ? 'text-2xl mb-2' : 'text-lg mb-1'}`}>
            {t('ocr.extractedInfo')}
          </h1>
          <p className={`font-bold text-foreground ${sr ? 'text-2xl mb-8' : 'text-lg mb-6'}`}>
            {t('ocr.pleaseCheck')}
          </p>

          <div className="space-y-3">
            {items.map((item, idx) => (
              <div key={idx} className="tds-card" style={sr ? { padding: '24px' } : undefined}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={sr ? 'text-2xl' : 'text-lg'}>💊</span>
                  <p className={`font-bold text-foreground ${sr ? 'text-xl' : 'text-base'}`}>{item.name}</p>
                </div>
                <div className={`grid grid-cols-2 gap-3 ${sr ? 'text-base' : 'text-sm'}`}>
                  <div className="bg-muted rounded-xl p-3">
                    <p className="text-muted-foreground text-xs mb-0.5">{t('ocr.singleDose')}</p>
                    <p className="text-foreground font-medium">{item.dosage}</p>
                  </div>
                  <div className="bg-muted rounded-xl p-3">
                    <p className="text-muted-foreground text-xs mb-0.5">{t('ocr.dailyFrequency')}</p>
                    <p className="text-foreground font-medium">{item.frequency}</p>
                  </div>
                  <div className="bg-muted rounded-xl p-3">
                    <p className="text-muted-foreground text-xs mb-0.5">{t('ocr.duration')}</p>
                    <p className="text-foreground font-medium">{item.duration}</p>
                  </div>
                  <div className="bg-muted rounded-xl p-3">
                    <p className="text-muted-foreground text-xs mb-0.5">{t('ocr.dosageTime')}</p>
                    <p className="text-foreground font-medium">{item.schedule}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleGuide(item, idx)}
                  disabled={guideLoadingIdx === idx}
                  className={`mt-3 w-full tds-button-secondary flex items-center justify-center gap-2 ${sr ? 'text-base py-3' : 'text-sm'}`}
                >
                  {guideLoadingIdx === idx
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> 분석 중...</>
                    : t('ocr.viewGuide')}
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 safe-area-padding">
        <div className="max-w-lg mx-auto space-y-2">
          <button onClick={handleAutoRegister} disabled={saving || items.length === 0}
            className="tds-button-primary w-full flex items-center justify-center gap-2">
            <CalendarPlus className="w-5 h-5" />
            {saving ? '등록 중...' : (t('ocr.registerSchedule') || '복약 스케줄 등록')}
          </button>
          <div className="flex gap-3">
            <button onClick={() => navigate('/result/edit')} className="tds-button-secondary flex-1">
              {t('ocr.edit')}
            </button>
            <button onClick={handleTTS} disabled={ttsLoading} className="tds-button-secondary flex-1 flex items-center justify-center gap-2">
              <Volume2 className="w-5 h-5" />
              {ttsLoading ? t('ocr.ttsLoading') : t('ocr.listenTTS')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OcrResultCheck;
