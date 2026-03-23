import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Volume2, VolumeX, CalendarPlus, Loader2, ChevronDown, ChevronUp, Camera, Plus } from 'lucide-react';
import { useSeniorMode } from '@/contexts/SeniorModeContext';
import { medicineApi } from '@/api/medicine';
import apiClient from '@/api/client';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import BottomNav from '@/components/BottomNav';
import SeniorModeToggle from '@/components/SeniorModeToggle';

interface GuideInfo {
  summary: string;
  dosage: string;
  precautions: string;
}

interface OcrItem {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  schedule: string;
  startDate?: string;
  endDate?: string;
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

  const freqNum = parseInt(frequency.replace(/[^0-9]/g, '')) || 1;
  const allPeriods = [
    { period: 'morning', time: '09:00' },
    { period: 'afternoon', time: '12:00' },
    { period: 'evening', time: '18:00' },
    { period: 'bedtime', time: '22:00' },
  ];

  // 키워드 매칭이 없거나 frequency보다 적으면 frequency 기준으로 채움
  if (entries.length === 0 || entries.length < freqNum) {
    return allPeriods.slice(0, Math.max(freqNum, entries.length));
  }

  return entries;
};

const OcrResultCheck = () => {
  const navigate = useNavigate();
  const { isSeniorMode: sr } = useSeniorMode();
  const [items, setItems] = useState<OcrItem[]>([]);
  const [ttsLoading, setTtsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [saving, setSaving] = useState(false);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [guideCache, setGuideCache] = useState<Record<number, GuideInfo>>({});
  const [guideLoading, setGuideLoading] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const stored = localStorage.getItem('ocr_result');
    if (!stored) return;
    const parsed: OcrItem[] = JSON.parse(stored);
    setItems(parsed);

    // 페이지 로드 시 모든 약 가이드를 병렬로 미리 로딩
    const fetchAll = async () => {
      setGuideLoading(true);
      const results = await Promise.allSettled(
        parsed.map(item => apiClient.post('/medicines/info', { name: item.name }))
      );
      const cache: Record<number, GuideInfo> = {};
      results.forEach((res, idx) => {
        if (res.status === 'fulfilled') {
          cache[idx] = res.value.data;
        } else {
          cache[idx] = {
            summary: '정보를 불러오지 못했습니다.',
            dosage: `${parsed[idx].dosage}, ${parsed[idx].frequency}`,
            precautions: '',
          };
        }
      });
      setGuideCache(cache);
      setGuideLoading(false);
    };
    fetchAll();
  }, []);

  /** OCR 결과를 복약 스케줄로 자동 등록 */
  const handleAutoRegister = () => {
    setSaving(true);
    try {
      const existingRaw = localStorage.getItem('saved_schedules');
      const existing = existingRaw ? JSON.parse(existingRaw) : [];

      // 이미 등록된 약+시간대 조합은 중복 추가 방지 (기존 + 이번 배치 내 중복 모두 방지)
      const existingKeys = new Set(
        existing.map((e: { name: string; period: string }) => `${e.name}__${e.period}`)
      );
      const addedKeys = new Set<string>();

      const newSchedules = items.flatMap(item => {
        const scheduleEntries = parseScheduleInfo(item.schedule, item.frequency);
        return scheduleEntries
          .filter(entry => {
            const key = `${item.name}__${entry.period}`;
            if (existingKeys.has(key) || addedKeys.has(key)) return false;
            addedKeys.add(key);
            return true;
          })
          .map(entry => ({
            id: `ocr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            name: item.name,
            dosage: item.dosage,
            frequency: item.frequency,
            duration: item.duration,
            schedule: item.schedule,
            time: entry.time,
            period: entry.period,
            taken: false,
            startDate: item.startDate || new Date().toISOString().split('T')[0],
            endDate: item.endDate,
            createdAt: new Date().toISOString(),
          }));
      });

      localStorage.setItem('saved_schedules', JSON.stringify([...existing, ...newSchedules]));
      if (newSchedules.length === 0) {
        toast.info('이미 등록된 스케줄입니다');
      } else {
        toast.success(`${newSchedules.length}개 복약 스케줄이 등록되었습니다`);
      }
      navigate('/schedule', { replace: true });
    } catch {
      toast.error(t('ocr.scheduleFailed') || '스케줄 등록에 실패했습니다');
    } finally {
      setSaving(false);
    }
  };

  const toggleGuide = (idx: number) => {
    setExpandedIdx(prev => (prev === idx ? null : idx));
  };

  const stopTTS = () => {
    window.speechSynthesis.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsSpeaking(false);
    setTtsLoading(false);
  };

  // 페이지 떠날 때 TTS 정지
  useEffect(() => {
    return () => { window.speechSynthesis.cancel(); };
  }, []);

  const handleTTS = async () => {
    // 재생 중이면 정지
    if (isSpeaking) {
      stopTTS();
      return;
    }

    if (items.length === 0) return;
    setTtsLoading(true);
    const text = items.map(item =>
      t('sampleMeds.ttsIntro', { name: item.name, dosage: item.dosage, frequency: item.frequency, schedule: item.schedule, duration: item.duration })
    ).join(' ');

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'ko-KR';
      utter.rate = 0.9;
      utter.onend = () => setIsSpeaking(false);
      utter.onerror = () => { setIsSpeaking(false); toast.error('TTS를 사용할 수 없습니다'); };
      window.speechSynthesis.speak(utter);
      setIsSpeaking(true);
    } else {
      toast.error('TTS를 사용할 수 없습니다');
    }
    setTtsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col safe-area-padding">
      <header className="tds-header">
        <div className="flex items-center h-14 px-4 border-b border-border">
          <button onClick={() => navigate('/home')} className="p-2 -ml-2">
            <ArrowLeft className={`text-foreground ${sr ? 'w-7 h-7' : 'w-6 h-6'}`} />
          </button>
          <div className="flex-1" />
          <SeniorModeToggle />
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
                  onClick={() => toggleGuide(idx)}
                  className={`mt-3 w-full tds-button-secondary flex items-center justify-center gap-2 ${sr ? 'text-base py-3' : 'text-sm'}`}
                >
                  {expandedIdx === idx
                    ? <><ChevronUp className="w-4 h-4" /> 복약 가이드 닫기</>
                    : <><ChevronDown className="w-4 h-4" /> 복약 가이드 보기{guideLoading ? ' (로딩 중...)' : ''}</>}
                </button>
                {expandedIdx === idx && (
                  <div className="mt-2 space-y-2 border-t border-border pt-3">
                    {guideCache[idx] ? (
                      [
                        { label: '✅ 효능·효과', value: guideCache[idx].summary },
                        { label: '💊 복용법', value: guideCache[idx].dosage },
                        { label: '⚠️ 주의사항', value: guideCache[idx].precautions },
                      ].filter(r => r.value).map(row => (
                        <div key={row.label} className="bg-muted rounded-xl p-3">
                          <p className="text-xs text-muted-foreground mb-0.5">{row.label}</p>
                          <p className={`text-foreground font-medium ${sr ? 'text-base' : 'text-sm'}`}>{row.value}</p>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center justify-center gap-2 py-4">
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">불러오는 중...</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      <div className="fixed bottom-16 left-0 right-0 bg-card border-t border-border p-4 safe-area-padding">
        <div className="max-w-lg mx-auto space-y-2">
          <button onClick={handleAutoRegister} disabled={saving || items.length === 0}
            className="tds-button-primary w-full flex items-center justify-center gap-2">
            <CalendarPlus className="w-5 h-5" />
            {saving ? '등록 중...' : (t('ocr.registerSchedule') || '복약 스케줄 등록')}
          </button>
          <div className="grid grid-cols-4 gap-2">
            <button onClick={() => navigate('/capture')}
              className="tds-button-secondary flex flex-col items-center justify-center gap-1 py-2">
              <Camera className="w-4 h-4" />
              <span className="text-xs">다시 촬영</span>
            </button>
            <button onClick={() => navigate('/result/edit')}
              className="tds-button-secondary flex flex-col items-center justify-center gap-1 py-2">
              <ChevronDown className="w-4 h-4" />
              <span className="text-xs">{t('ocr.edit')}</span>
            </button>
            <button onClick={() => navigate('/add/supplement')}
              className="tds-button-secondary flex flex-col items-center justify-center gap-1 py-2">
              <Plus className="w-4 h-4" />
              <span className="text-xs">약 추가</span>
            </button>
            <button onClick={handleTTS} disabled={ttsLoading && !isSpeaking}
              className={`flex flex-col items-center justify-center gap-1 py-2 ${
                isSpeaking ? 'tds-button-primary' : 'tds-button-secondary'
              }`}>
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span className="text-xs">{isSpeaking ? '정지' : 'TTS'}</span>
            </button>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default OcrResultCheck;
