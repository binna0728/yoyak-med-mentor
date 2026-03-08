import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Volume2 } from 'lucide-react';
import { useSeniorMode } from '@/contexts/SeniorModeContext';
import { medicineApi } from '@/api/medicine';
import { toast } from 'sonner';

interface OcrItem {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  schedule: string;
}

const OcrResultCheck = () => {
  const navigate = useNavigate();
  const { isSeniorMode: sr } = useSeniorMode();
  const [items, setItems] = useState<OcrItem[]>([]);
  const [ttsLoading, setTtsLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('ocr_result');
    if (stored) setItems(JSON.parse(stored));
  }, []);

  const handleGuide = (item: OcrItem) => {
    // Create a demo guide and navigate
    const demoId = `ocr-${Date.now()}`;
    localStorage.setItem(`guide_${demoId}`, JSON.stringify({
      id: demoId,
      name: item.name,
      effect: 'AI가 분석한 효능 정보',
      dosage: `${item.dosage}, ${item.frequency}`,
      schedule: item.schedule,
      warning: 'AI가 분석한 주의사항',
      side_effect: 'AI가 분석한 부작용 정보',
      patient_explanation: `${item.name}은 ${item.schedule}에 ${item.dosage}씩 드시면 됩니다.`,
      created_at: new Date().toISOString(),
    }));
    navigate(`/guide/${demoId}`);
  };

  const handleTTS = async () => {
    if (items.length === 0) return;
    setTtsLoading(true);

    const text = items.map(item =>
      `${item.name}. ${item.dosage}, ${item.frequency}, ${item.schedule}에 복용하세요. 기간은 ${item.duration}입니다.`
    ).join(' ');

    // Try API first, fallback to Web Speech
    try {
      const result = await medicineApi.getTTS('ocr-result');
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
        toast.error('음성 재생을 지원하지 않는 환경입니다.');
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
            추출된 복용 정보를
          </h1>
          <p className={`font-bold text-foreground ${sr ? 'text-2xl mb-8' : 'text-lg mb-6'}`}>
            확인해주세요
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
                    <p className="text-muted-foreground text-xs mb-0.5">1회 복용량</p>
                    <p className="text-foreground font-medium">{item.dosage}</p>
                  </div>
                  <div className="bg-muted rounded-xl p-3">
                    <p className="text-muted-foreground text-xs mb-0.5">1일 횟수</p>
                    <p className="text-foreground font-medium">{item.frequency}</p>
                  </div>
                  <div className="bg-muted rounded-xl p-3">
                    <p className="text-muted-foreground text-xs mb-0.5">기간</p>
                    <p className="text-foreground font-medium">{item.duration}</p>
                  </div>
                  <div className="bg-muted rounded-xl p-3">
                    <p className="text-muted-foreground text-xs mb-0.5">복용 시간</p>
                    <p className="text-foreground font-medium">{item.schedule}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Bottom actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 safe-area-padding">
        <div className="max-w-lg mx-auto space-y-2">
          <div className="flex gap-3">
            <button onClick={() => navigate('/result/edit')} className="tds-button-secondary flex-1">
              수정
            </button>
            <button
              onClick={() => items[0] && handleGuide(items[0])}
              className="tds-button-primary flex-1"
            >
              복약 가이드 보기
            </button>
          </div>
          <button
            onClick={handleTTS}
            disabled={ttsLoading}
            className="tds-button-secondary w-full flex items-center justify-center gap-2"
          >
            <Volume2 className="w-5 h-5" />
            {ttsLoading ? 'TTS 준비 중...' : 'TTS로 듣기'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OcrResultCheck;
