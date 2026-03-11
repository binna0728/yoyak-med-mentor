import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { medicineApi } from '@/api/medicine';
import { Medicine } from '@/types/medicine';
import { ArrowLeft, Play, Pause, RotateCcw } from 'lucide-react';
import { useSeniorMode } from '@/contexts/SeniorModeContext';
import { Progress } from '@/components/ui/progress';
import { useTranslation } from 'react-i18next';

const TtsPlayer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isSeniorMode: sr } = useSeniorMode();
  const [medicine, setMedicine] = useState<Medicine | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(1.0);
  const [currentLine, setCurrentLine] = useState(0);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const cached = localStorage.getItem(`guide_${id}`);
    if (cached) {
      setMedicine(JSON.parse(cached));
    } else {
      setMedicine({
        id: id || '1', name: t('sampleMeds.tylenol'),
        effect: t('sampleMeds.tylenolEffectSimple'),
        dosage: t('sampleMeds.tylenolDosageTts'),
        schedule: t('sampleMeds.tylenolSchedule'),
        warning: t('sampleMeds.tylenolWarnTts'),
        side_effect: t('sampleMeds.tylenolSideEffectTts'),
        patient_explanation: t('sampleMeds.tylenolExplanationSimple'),
        created_at: new Date().toISOString(),
      });
    }
    return () => {
      window.speechSynthesis.cancel();
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    };
  }, [id]);

  const buildLines = (m: Medicine) => [
    `${m.name}`,
    t('tts.thisIsFor', { effect: m.effect }),
    t('tts.takeDosage', { dosage: m.dosage }),
    t('tts.takeAt', { schedule: m.schedule }),
    t('tts.cautionIs', { warning: m.warning }),
    m.side_effect ? t('tts.sideEffectMay', { effect: m.side_effect }) : '',
  ].filter(Boolean);

  const buildText = (m: Medicine) => buildLines(m).join(' ');

  const stop = () => {
    window.speechSynthesis.cancel();
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    setIsPlaying(false);
    setProgress(0);
    setCurrentLine(0);
  };

  const togglePlay = async () => {
    if (isPlaying) { stop(); return; }
    if (!medicine) return;

    try {
      const result = await medicineApi.getTTS(id || '', buildText(medicine));
      const audio = new Audio(result.audio_url);
      audio.playbackRate = speed;
      audioRef.current = audio;
      audio.addEventListener('timeupdate', () => {
        if (audio.duration) {
          const pct = (audio.currentTime / audio.duration) * 100;
          setProgress(pct);
          const lines = buildLines(medicine);
          setCurrentLine(Math.min(Math.floor(pct / (100 / lines.length)), lines.length - 1));
        }
      });
      audio.addEventListener('ended', () => { setIsPlaying(false); setProgress(100); });
      await audio.play();
      setIsPlaying(true);
    } catch {
      const text = buildText(medicine);
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'ko-KR';
      utter.rate = speed;
      utterRef.current = utter;

      const lines = buildLines(medicine);
      const est = text.length * 80;
      let elapsed = 0;
      intervalRef.current = setInterval(() => {
        elapsed += 200;
        const pct = Math.min((elapsed / est) * 100, 95);
        setProgress(pct);
        setCurrentLine(Math.min(Math.floor(pct / (100 / lines.length)), lines.length - 1));
      }, 200);

      utter.onend = () => {
        setIsPlaying(false);
        setProgress(100);
        setCurrentLine(lines.length - 1);
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
      window.speechSynthesis.speak(utter);
      setIsPlaying(true);
    }
  };

  const speeds = [0.8, 0.9, 1.0];
  const lines = medicine ? buildLines(medicine) : [];

  return (
    <div className="min-h-screen bg-background flex flex-col safe-area-padding">
      <header className="tds-header">
        <div className="flex items-center h-14 px-4 border-b border-border">
          <button onClick={() => { stop(); navigate(-1); }} className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <div className="flex-1 text-center">
            <span className={`font-bold text-foreground ${sr ? 'text-xl' : 'text-lg'}`}>{t('tts.title')}</span>
          </div>
          <div className="w-10" />
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center px-6 pt-8">
        <div className="max-w-sm w-full space-y-6">
          {medicine && (
            <div className="text-center">
              <p className={`text-primary font-bold ${sr ? 'text-2xl' : 'text-lg'}`}>💊 {medicine.name}</p>
            </div>
          )}

          <div className="flex justify-center py-4">
            <button onClick={togglePlay}
              className={`rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg active:scale-95 transition-transform ${
                sr ? 'w-28 h-28' : 'w-24 h-24'
              }`}>
              {isPlaying ? <Pause className={sr ? 'w-12 h-12' : 'w-10 h-10'} /> : <Play className={sr ? 'w-12 h-12 ml-1' : 'w-10 h-10 ml-1'} />}
            </button>
          </div>

          <div className="space-y-2">
            <Progress value={progress} className="h-2 bg-muted" />
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
              <button onClick={stop} className="flex items-center gap-1 text-xs text-muted-foreground">
                <RotateCcw className="w-3 h-3" />
                {t('tts.fromStart')}
              </button>
            </div>
          </div>

          <div>
            <p className={`text-center text-muted-foreground mb-3 ${sr ? 'text-base' : 'text-xs'}`}>{t('tts.speedControl')}</p>
            <div className="flex items-center justify-center gap-3">
              {speeds.map(s => (
                <button key={s} onClick={() => setSpeed(s)}
                  className={`tds-chip ${sr ? 'h-12 px-6 text-lg' : 'h-10 px-5 text-sm'} ${speed === s ? 'active' : ''}`}>
                  {s}x
                </button>
              ))}
            </div>
          </div>

          {medicine && (
            <div className="tds-card max-h-60 overflow-y-auto">
              <div className="space-y-3">
                {lines.map((line, idx) => (
                  <p key={idx}
                    className={`leading-relaxed transition-colors duration-300 ${
                      idx === currentLine && isPlaying ? 'text-primary font-semibold' :
                      idx < currentLine && isPlaying ? 'text-muted-foreground' : 'text-foreground'
                    } ${sr ? 'text-lg' : 'text-sm'}`}>
                    {line}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TtsPlayer;
