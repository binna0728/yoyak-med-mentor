import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSeniorMode } from '@/contexts/SeniorModeContext';
import BottomNav from '@/components/BottomNav';
import {
  Brain, Moon, Heart, Flower2, Play, Pause, Repeat, Timer,
  Volume2, VolumeX, ChevronLeft, CloudRain, Wind, Waves, Music,
  Sparkles, Leaf
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Category = 'focus' | 'sleep' | 'meditation' | 'calm';

interface Track {
  id: string;
  nameKey: string;
  icon: React.ElementType;
  category: Category;
  // We use Web Audio API oscillators for generating ambient sounds
  type: 'brown' | 'pink' | 'white' | 'sine-low' | 'sine-mid' | 'rain' | 'gentle';
}

const categories: { id: Category; labelKey: string; icon: React.ElementType; color: string }[] = [
  { id: 'focus', labelKey: 'sounds.focus', icon: Brain, color: 'bg-blue-50 text-blue-600 border-blue-200' },
  { id: 'sleep', labelKey: 'sounds.sleep', icon: Moon, color: 'bg-indigo-50 text-indigo-600 border-indigo-200' },
  { id: 'meditation', labelKey: 'sounds.meditation', icon: Flower2, color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  { id: 'calm', labelKey: 'sounds.calm', icon: Heart, color: 'bg-rose-50 text-rose-600 border-rose-200' },
];

const tracks: Track[] = [
  { id: 'deep-focus', nameKey: 'sounds.deepFocus', icon: Brain, category: 'focus', type: 'brown' },
  { id: 'study-flow', nameKey: 'sounds.studyFlow', icon: Wind, category: 'focus', type: 'pink' },
  { id: 'rain-focus', nameKey: 'sounds.rainFocus', icon: CloudRain, category: 'focus', type: 'rain' },
  { id: 'deep-sleep', nameKey: 'sounds.deepSleep', icon: Moon, category: 'sleep', type: 'sine-low' },
  { id: 'night-rain', nameKey: 'sounds.nightRain', icon: CloudRain, category: 'sleep', type: 'rain' },
  { id: 'mindfulness', nameKey: 'sounds.mindfulness', icon: Leaf, category: 'meditation', type: 'sine-mid' },
  { id: 'breathing-calm', nameKey: 'sounds.breathingCalm', icon: Waves, category: 'meditation', type: 'gentle' },
  { id: 'stress-relief', nameKey: 'sounds.stressRelief', icon: Sparkles, category: 'calm', type: 'pink' },
  { id: 'gentle-comfort', nameKey: 'sounds.gentleComfort', icon: Music, category: 'calm', type: 'gentle' },
];

// Generate ambient noise using Web Audio API
function createNoiseSource(ctx: AudioContext, type: Track['type'], gainNode: GainNode) {
  if (type === 'brown' || type === 'pink' || type === 'white' || type === 'rain') {
    const bufferSize = 2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      if (type === 'brown') {
        lastOut = (lastOut + 0.02 * white) / 1.02;
        data[i] = lastOut * 3.5;
      } else if (type === 'pink' || type === 'rain') {
        // Simple pink noise approximation
        lastOut = 0.99886 * lastOut + white * 0.0555179;
        data[i] = lastOut * 0.5;
      } else {
        data[i] = white * 0.3;
      }
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    if (type === 'rain') {
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 800;
      source.connect(filter);
      filter.connect(gainNode);
    } else {
      source.connect(gainNode);
    }
    gainNode.connect(ctx.destination);
    return source;
  }

  // Oscillator-based sounds
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  if (type === 'sine-low') osc.frequency.value = 60;
  else if (type === 'sine-mid') osc.frequency.value = 174;
  else osc.frequency.value = 120; // gentle

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 300;

  osc.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(ctx.destination);
  return osc;
}

const TIMER_OPTIONS = [
  { label: '15m', value: 15 },
  { label: '30m', value: 30 },
  { label: '60m', value: 60 },
];

const Sounds = () => {
  const { t } = useTranslation();
  const { isSeniorMode } = useSeniorMode();
  const [selectedCategory, setSelectedCategory] = useState<Category>('focus');
  const [activeTrack, setActiveTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loop, setLoop] = useState(true);
  const [volume, setVolume] = useState(70);
  const [sleepTimer, setSleepTimer] = useState<number | null>(null);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopSound = useCallback(() => {
    try { sourceRef.current?.stop(); } catch {}
    sourceRef.current = null;
    if (timerRef.current) clearInterval(timerRef.current);
    if (elapsedRef.current) clearInterval(elapsedRef.current);
    setIsPlaying(false);
    setElapsed(0);
  }, []);

  const playSound = useCallback((track: Track) => {
    stopSound();
    const ctx = audioCtxRef.current || new AudioContext();
    audioCtxRef.current = ctx;
    if (ctx.state === 'suspended') ctx.resume();

    const gain = ctx.createGain();
    gain.gain.value = volume / 100;
    gainRef.current = gain;

    const source = createNoiseSource(ctx, track.type, gain);
    sourceRef.current = source;
    source.start();
    setIsPlaying(true);
    setElapsed(0);

    elapsedRef.current = setInterval(() => {
      setElapsed(prev => prev + 1);
    }, 1000);
  }, [volume, stopSound]);

  // Volume change
  useEffect(() => {
    if (gainRef.current) {
      gainRef.current.gain.value = volume / 100;
    }
  }, [volume]);

  // Sleep timer
  useEffect(() => {
    if (sleepTimer && isPlaying) {
      setRemainingTime(sleepTimer * 60);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setRemainingTime(prev => {
          if (prev && prev <= 1) {
            stopSound();
            setSleepTimer(null);
            return null;
          }
          return prev ? prev - 1 : null;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [sleepTimer, isPlaying, stopSound]);

  // Cleanup
  useEffect(() => () => stopSound(), [stopSound]);

  const handleTrackSelect = (track: Track) => {
    setActiveTrack(track);
    playSound(track);
  };

  const togglePlay = () => {
    if (!activeTrack) return;
    if (isPlaying) {
      stopSound();
    } else {
      playSound(activeTrack);
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const filteredTracks = tracks.filter(t => t.category === selectedCategory);

  // Player view
  if (activeTrack) {
    const catInfo = categories.find(c => c.id === activeTrack.category)!;
    const TrackIcon = activeTrack.icon;

    return (
      <div className="tds-page bg-background">
        <div className="tds-content px-5 pt-6 pb-28 flex flex-col items-center">
          {/* Back */}
          <button
            onClick={() => { stopSound(); setActiveTrack(null); }}
            className="self-start flex items-center gap-1 text-muted-foreground mb-6 hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className={isSeniorMode ? 'text-lg' : 'text-sm'}>{t('sounds.back')}</span>
          </button>

          {/* Visual */}
          <div className={cn(
            'w-32 h-32 rounded-full flex items-center justify-center mb-8 border-2 shadow-lg',
            catInfo.color,
            isPlaying && 'animate-pulse'
          )}>
            <TrackIcon className="w-14 h-14" />
          </div>

          <h2 className={cn('font-semibold text-foreground mb-1', isSeniorMode ? 'text-2xl' : 'text-xl')}>
            {t(activeTrack.nameKey)}
          </h2>
          <p className="text-muted-foreground text-sm mb-8">{t(catInfo.labelKey)}</p>

          {/* Elapsed */}
          <p className="text-muted-foreground text-xs mb-2 tabular-nums">{formatTime(elapsed)}</p>

          {/* Progress (visual only, ambient loops) */}
          <div className="w-full max-w-xs h-1.5 bg-muted rounded-full mb-8 overflow-hidden">
            <div
              className="h-full bg-primary/60 rounded-full transition-all"
              style={{ width: `${Math.min((elapsed % 60) / 60 * 100, 100)}%` }}
            />
          </div>

          {/* Controls */}
          <div className="flex items-center gap-6 mb-8">
            <button
              onClick={() => setLoop(!loop)}
              className={cn(
                'p-2 rounded-full transition-colors',
                loop ? 'text-primary bg-accent' : 'text-muted-foreground'
              )}
            >
              <Repeat className="w-5 h-5" />
            </button>

            <button
              onClick={togglePlay}
              className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:opacity-90 transition-opacity"
            >
              {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
            </button>

            <div className="relative">
              <button
                onClick={() => {
                  if (sleepTimer) { setSleepTimer(null); setRemainingTime(null); }
                }}
                className={cn(
                  'p-2 rounded-full transition-colors',
                  sleepTimer ? 'text-primary bg-accent' : 'text-muted-foreground'
                )}
              >
                <Timer className="w-5 h-5" />
              </button>
              {remainingTime && (
                <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-primary tabular-nums">
                  {formatTime(remainingTime)}
                </span>
              )}
            </div>
          </div>

          {/* Sleep Timer Options */}
          <div className="flex gap-2 mb-8">
            {TIMER_OPTIONS.map(opt => (
              <Button
                key={opt.value}
                variant={sleepTimer === opt.value ? 'default' : 'outline'}
                size="sm"
                className="text-xs rounded-full px-4"
                onClick={() => setSleepTimer(sleepTimer === opt.value ? null : opt.value)}
              >
                {opt.label}
              </Button>
            ))}
          </div>

          {/* Volume */}
          <div className="w-full max-w-xs flex items-center gap-3">
            {volume === 0 ? (
              <VolumeX className="w-4 h-4 text-muted-foreground shrink-0" />
            ) : (
              <Volume2 className="w-4 h-4 text-muted-foreground shrink-0" />
            )}
            <Slider
              value={[volume]}
              onValueChange={([v]) => setVolume(v)}
              max={100}
              step={1}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground w-8 text-right tabular-nums">{volume}</span>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  // Category / Track list view
  return (
    <div className="tds-page bg-background">
      <div className="tds-content px-5 pt-6 pb-28">
        <h1 className={cn('font-bold text-foreground mb-1', isSeniorMode ? 'text-2xl' : 'text-xl')}>
          {t('sounds.title')}
        </h1>
        <p className={cn('text-muted-foreground mb-6', isSeniorMode ? 'text-base' : 'text-sm')}>
          {t('sounds.subtitle')}
        </p>

        {/* Categories */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {categories.map(cat => {
            const CatIcon = cat.icon;
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  'flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border transition-all',
                  isActive
                    ? cat.color + ' border-current shadow-sm'
                    : 'bg-card border-border text-muted-foreground hover:bg-muted'
                )}
              >
                <CatIcon className={isSeniorMode ? 'w-6 h-6' : 'w-5 h-5'} />
                <span className={cn('font-medium', isSeniorMode ? 'text-sm' : 'text-xs')}>
                  {t(cat.labelKey)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Track List */}
        <div className="space-y-2">
          {filteredTracks.map(track => {
            const Icon = track.icon;
            return (
              <button
                key={track.id}
                onClick={() => handleTrackSelect(track)}
                className="w-full flex items-center gap-4 p-4 bg-card rounded-xl border border-border hover:border-primary/30 hover:shadow-sm transition-all text-left"
              >
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center shrink-0',
                  categories.find(c => c.id === track.category)?.color
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn('font-medium text-foreground', isSeniorMode ? 'text-lg' : 'text-sm')}>
                    {t(track.nameKey)}
                  </p>
                  <p className="text-xs text-muted-foreground">{t('sounds.ambient')}</p>
                </div>
                <Play className="w-4 h-4 text-muted-foreground shrink-0" />
              </button>
            );
          })}
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Sounds;
