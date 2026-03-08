import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { medicineApi } from '@/api/medicine';
import { Medicine } from '@/types/medicine';
import { ArrowLeft } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const TtsPlayer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [medicine, setMedicine] = useState<Medicine | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(1.0);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const cached = localStorage.getItem(`guide_${id}`);
    if (cached) setMedicine(JSON.parse(cached));
    return () => { window.speechSynthesis.cancel(); if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [id]);

  const buildText = (m: Medicine) =>
    `${m.name}. 이 약은 ${m.effect}에 먹는 약이에요. ${m.dosage}만큼 드시면 됩니다. ${m.schedule}에 드세요. 주의할 점은 ${m.warning}입니다.`;

  const togglePlay = async () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      if (intervalRef.current) clearInterval(intervalRef.current);
      setIsPlaying(false);
      setProgress(0);
      return;
    }

    if (!medicine) return;

    // Try API first, fallback to speech synthesis
    try {
      const result = await medicineApi.getTTS(id || '');
      const audio = new Audio(result.audio_url);
      audio.playbackRate = speed;
      audio.addEventListener('timeupdate', () => { if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100); });
      audio.addEventListener('ended', () => { setIsPlaying(false); setProgress(0); });
      await audio.play();
      setIsPlaying(true);
    } catch {
      // Fallback to Web Speech API
      const text = buildText(medicine);
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'ko-KR';
      utter.rate = speed;
      utterRef.current = utter;

      const est = text.length * 80;
      let elapsed = 0;
      intervalRef.current = setInterval(() => { elapsed += 200; setProgress(Math.min((elapsed / est) * 100, 95)); }, 200);

      utter.onend = () => { setIsPlaying(false); setProgress(100); if (intervalRef.current) clearInterval(intervalRef.current); setTimeout(() => setProgress(0), 500); };
      window.speechSynthesis.speak(utter);
      setIsPlaying(true);
    }
  };

  const speeds = [0.8, 0.9, 1.0];

  return (
    <div className="min-h-screen bg-background flex flex-col safe-area-padding">
      <header className="tds-header">
        <div className="flex items-center h-14 px-4 border-b border-border">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2"><ArrowLeft className="w-6 h-6 text-foreground" /></button>
          <div className="flex-1 text-center"><span className="text-lg font-bold text-foreground">음성 안내</span></div>
          <div className="w-10" />
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="max-w-sm w-full space-y-8">
          {/* Play button */}
          <div className="flex justify-center">
            <button
              onClick={togglePlay}
              className="w-24 h-24 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg active:scale-95 transition-transform"
            >
              <span className="text-4xl">{isPlaying ? '⏸' : '▶'}</span>
            </button>
          </div>

          {/* Progress */}
          <Progress value={progress} className="h-2 bg-muted" />

          {/* Speed selector */}
          <div className="flex items-center justify-center gap-3">
            {speeds.map(s => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`tds-chip h-10 px-5 ${speed === s ? 'active' : ''}`}
              >
                {s}
              </button>
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground">속도를 조절할 수 있어요</p>

          {/* Scrollable text */}
          {medicine && (
            <div className="tds-card max-h-48 overflow-y-auto">
              <p className="text-foreground text-sm leading-relaxed">{buildText(medicine)}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TtsPlayer;
