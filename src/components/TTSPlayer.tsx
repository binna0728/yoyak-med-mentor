import { useState, useRef, useEffect } from 'react';
import { medicineApi } from '@/api/medicine';
import { Progress } from '@/components/ui/progress';
import { useSeniorMode } from '@/contexts/SeniorModeContext';
import { useTranslation } from 'react-i18next';

interface TTSPlayerProps {
  guideId: string;
  textContent: string;
}

const TTSPlayer = ({ guideId, textContent }: TTSPlayerProps) => {
  const { isSeniorMode } = useSeniorMode();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(false);
  const [usingSpeechAPI, setUsingSpeechAPI] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { t } = useTranslation();

  useEffect(() => { return () => { stopPlayback(); }; }, []);

  const stopPlayback = () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; audioRef.current = null; }
    if (usingSpeechAPI) { window.speechSynthesis.cancel(); }
    if (progressIntervalRef.current) { clearInterval(progressIntervalRef.current); }
    setIsPlaying(false);
    setProgress(0);
  };

  const playWithSpeechAPI = () => {
    setUsingSpeechAPI(true);
    const utterance = new SpeechSynthesisUtterance(textContent);
    utterance.lang = 'ko-KR';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utteranceRef.current = utterance;

    const estimatedDuration = textContent.length * 80;
    let elapsed = 0;
    progressIntervalRef.current = setInterval(() => {
      elapsed += 200;
      setProgress(Math.min((elapsed / estimatedDuration) * 100, 95));
    }, 200);

    utterance.onend = () => {
      setIsPlaying(false); setProgress(100);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      setTimeout(() => setProgress(0), 500);
    };
    utterance.onerror = () => {
      setIsPlaying(false); setError(true);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  const handlePlay = async () => {
    if (isPlaying) { stopPlayback(); return; }
    setIsLoading(true);
    setError(false);

    try {
      const result = await medicineApi.getTTS(guideId);
      const audio = new Audio(result.audio_url);
      audioRef.current = audio;
      audio.addEventListener('timeupdate', () => { if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100); });
      audio.addEventListener('ended', () => { setIsPlaying(false); setProgress(0); });
      audio.addEventListener('error', () => { playWithSpeechAPI(); });
      await audio.play();
      setIsPlaying(true);
    } catch {
      if ('speechSynthesis' in window) { playWithSpeechAPI(); } else { setError(true); }
    } finally {
      setIsLoading(false);
    }
  };

  const buttonSize = isSeniorMode ? 'min-h-[64px] text-xl' : 'min-h-[56px] text-base';

  return (
    <div className="space-y-2">
      <button onClick={handlePlay} disabled={isLoading}
        className={`w-full ${buttonSize} px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-3 ${
          isPlaying ? 'bg-primary/10 text-primary border-2 border-primary' : 'bg-accent text-accent-foreground border border-border hover:bg-primary/10'
        } disabled:opacity-40`}>
        {isLoading ? (
          <><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /><span>{t('ttsPlayer.preparing')}</span></>
        ) : isPlaying ? (
          <><span className="text-2xl">⏸️</span><span>{t('ttsPlayer.pause')}</span></>
        ) : (
          <><span className="text-2xl">🔊</span><span>{t('ttsPlayer.listen')}</span></>
        )}
      </button>

      {isPlaying && (
        <div className="px-1">
          <Progress value={progress} className="h-2 bg-muted" />
          {usingSpeechAPI && <p className="text-xs text-muted-foreground mt-1 text-center">{t('ttsPlayer.webSpeech')}</p>}
        </div>
      )}

      {error && <p className="text-sm text-destructive text-center">{t('ttsPlayer.playFailed')}</p>}
    </div>
  );
};

export default TTSPlayer;
