import { useState, useRef, useEffect } from 'react';
import { medicineApi } from '@/api/medicine';
import { Progress } from '@/components/ui/progress';
import { useSeniorMode } from '@/contexts/SeniorModeContext';

interface TTSPlayerProps {
  guideId: string;
  textContent: string; // fallback for Web Speech API
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

  useEffect(() => {
    return () => {
      stopPlayback();
    };
  }, []);

  const stopPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (usingSpeechAPI) {
      window.speechSynthesis.cancel();
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
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

    // Estimate progress
    const estimatedDuration = textContent.length * 80; // ~80ms per char for Korean
    let elapsed = 0;
    progressIntervalRef.current = setInterval(() => {
      elapsed += 200;
      setProgress(Math.min((elapsed / estimatedDuration) * 100, 95));
    }, 200);

    utterance.onend = () => {
      setIsPlaying(false);
      setProgress(100);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      setTimeout(() => setProgress(0), 500);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setError(true);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  const handlePlay = async () => {
    if (isPlaying) {
      stopPlayback();
      return;
    }

    setIsLoading(true);
    setError(false);

    try {
      const result = await medicineApi.getTTS(guideId);
      const audio = new Audio(result.audio_url);
      audioRef.current = audio;

      audio.addEventListener('timeupdate', () => {
        if (audio.duration) {
          setProgress((audio.currentTime / audio.duration) * 100);
        }
      });

      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        setProgress(0);
      });

      audio.addEventListener('error', () => {
        // Fallback to Web Speech API
        playWithSpeechAPI();
      });

      await audio.play();
      setIsPlaying(true);
    } catch {
      // Fallback to Web Speech API
      if ('speechSynthesis' in window) {
        playWithSpeechAPI();
      } else {
        setError(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const buttonSize = isSeniorMode ? 'min-h-[64px] text-xl' : 'min-h-[56px] text-base';

  return (
    <div className="space-y-2">
      <button
        onClick={handlePlay}
        disabled={isLoading}
        className={`w-full ${buttonSize} px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-3 ${
          isPlaying
            ? 'bg-primary/10 text-primary border-2 border-primary'
            : 'bg-accent text-accent-foreground border border-border hover:bg-primary/10'
        } disabled:opacity-40`}
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span>음성 준비 중...</span>
          </>
        ) : isPlaying ? (
          <>
            <span className="text-2xl">⏸️</span>
            <span>일시정지</span>
          </>
        ) : (
          <>
            <span className="text-2xl">🔊</span>
            <span>음성으로 듣기</span>
          </>
        )}
      </button>

      {isPlaying && (
        <div className="px-1">
          <Progress value={progress} className="h-2 bg-muted" />
          {usingSpeechAPI && (
            <p className="text-xs text-muted-foreground mt-1 text-center">Web Speech API로 재생 중</p>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive text-center">음성 재생에 실패했어요. 다시 시도해주세요.</p>
      )}
    </div>
  );
};

export default TTSPlayer;
