import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { useSeniorMode } from '@/contexts/SeniorModeContext';
import BottomNav from '@/components/BottomNav';
import NearbyPharmacy from '@/components/NearbyPharmacy';
import {
  Brain, Moon, Flower2, Play, Pause, Repeat, Timer, SkipForward, SkipBack,
  Volume2, VolumeX, ChevronLeft, CloudRain, Wind, Music, Coffee,
  Leaf, MapPin, Newspaper, BookImage
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/* ─── 더보기 탭 정의 ─── */
type MainTab = 'sounds' | 'pharmacy' | 'blog' | 'webtoon';

const mainTabs: { id: MainTab; label: string; icon: React.ElementType; emoji: string }[] = [
  { id: 'sounds', label: '사운드', icon: Music, emoji: '🎵' },
  { id: 'pharmacy', label: '가까운 약국', icon: MapPin, emoji: '💊' },
  { id: 'blog', label: '건강 블로그', icon: Newspaper, emoji: '📰' },
  { id: 'webtoon', label: '상식 웹툰', icon: BookImage, emoji: '📚' },
];

/* ─── 사운드 카테고리 & 트랙 ─── */
type Category = 'focus' | 'sleep' | 'meditation';

interface Track {
  id: string;
  name: string;
  icon: React.ElementType;
  category: Category;
  src: string; // MP3 경로
}

const categories: { id: Category; label: string; icon: React.ElementType; color: string }[] = [
  { id: 'focus', label: '집중', icon: Brain, color: 'bg-blue-50 text-blue-600 border-blue-200' },
  { id: 'sleep', label: '수면', icon: Moon, color: 'bg-indigo-50 text-indigo-600 border-indigo-200' },
  { id: 'meditation', label: '명상', icon: Flower2, color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
];

const tracks: Track[] = [
  // ── 집중 (10곡)
  { id: 'calm-desk', name: 'Calm Desk at 4AM', icon: Coffee, category: 'focus', src: '/sounds/deep-focus/Calm Desk at 4AM.mp3' },
  { id: 'neon-city', name: 'Neon City Focus', icon: Brain, category: 'focus', src: '/sounds/deep-focus/Neon City Focus.mp3' },
  { id: 'alley-lofi', name: '골목 끝 잔향로파이', icon: Music, category: 'focus', src: '/sounds/deep-focus/골목 끝 잔향로파이.mp3' },
  { id: 'milk-tea', name: '따뜻한 밀크티', icon: Coffee, category: 'focus', src: '/sounds/deep-focus/따뜻한 밀크티.mp3' },
  { id: 'midnight-latte', name: '미드나잇 라떼', icon: Moon, category: 'focus', src: '/sounds/deep-focus/미드나잇 라떼.mp3' },
  { id: 'night-air', name: '밤공기 chillhop', icon: Wind, category: 'focus', src: '/sounds/deep-focus/밤공기 chillhop.mp3' },
  { id: 'night-walk', name: '밤산책 로파이', icon: Leaf, category: 'focus', src: '/sounds/deep-focus/밤산책 로파이.mp3' },
  { id: 'calm-forever', name: '잔잔하게, 오래도록', icon: Music, category: 'focus', src: '/sounds/deep-focus/잔잔하게, 오래도록.mp3' },
  { id: 'study-note', name: '포근한 스터디 노트', icon: Brain, category: 'focus', src: '/sounds/deep-focus/포근한 스터디 노트.mp3' },
  { id: 'plum-ride', name: '플럼 미드나잇 라이드', icon: Music, category: 'focus', src: '/sounds/deep-focus/플럼 미드나잇 라이드.mp3' },
  // ── 수면 (준비 중)
  { id: 'deep-sleep', name: '깊은 수면', icon: Moon, category: 'sleep', src: '/sounds/deep-sleep.mp3' },
  { id: 'night-rain', name: '밤비', icon: CloudRain, category: 'sleep', src: '/sounds/night-rain.mp3' },
  // ── 명상 (준비 중)
  { id: 'mindfulness', name: '마음챙김', icon: Leaf, category: 'meditation', src: '/sounds/mindfulness.mp3' },
  { id: 'breathing-calm', name: '호흡 안정', icon: Flower2, category: 'meditation', src: '/sounds/breathing-calm.mp3' },
];

const TIMER_OPTIONS = [
  { label: '15m', value: 15 },
  { label: '30m', value: 30 },
  { label: '60m', value: 60 },
];

/* ─── 메인 컴포넌트 ─── */
const Sounds = () => {
  const { t } = useTranslation();
  const { isSeniorMode } = useSeniorMode();
  const location = useLocation();
  const sr = isSeniorMode;

  const stateTab = (location.state as { tab?: MainTab } | null)?.tab;
  const [mainTab, setMainTab] = useState<MainTab>(stateTab || 'sounds');

  useEffect(() => {
    if (stateTab) setMainTab(stateTab);
  }, [stateTab]);

  const [selectedCategory, setSelectedCategory] = useState<Category>('focus');
  const [activeTrack, setActiveTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loop, setLoop] = useState(true);
  const [volume, setVolume] = useState(70);
  const [sleepTimer, setSleepTimer] = useState<number | null>(null);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Audio 초기화
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audioRef.current = audio;

    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration);
    });
    audio.addEventListener('timeupdate', () => {
      setElapsed(Math.floor(audio.currentTime));
    });
    audio.addEventListener('ended', () => {
      if (loop) {
        audio.currentTime = 0;
        audio.play();
      } else {
        setIsPlaying(false);
      }
    });

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [loop]);

  // 볼륨 반영
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume / 100;
  }, [volume]);

  // 수면 타이머
  useEffect(() => {
    if (sleepTimer && isPlaying) {
      setRemainingTime(sleepTimer * 60);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setRemainingTime(prev => {
          if (prev && prev <= 1) {
            audioRef.current?.pause();
            setIsPlaying(false);
            setSleepTimer(null);
            return null;
          }
          return prev ? prev - 1 : null;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [sleepTimer, isPlaying]);

  const stopSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setElapsed(0);
  }, []);

  const playTrack = useCallback((track: Track) => {
    const audio = audioRef.current;
    if (!audio) return;
    stopSound();
    audio.src = track.src;
    audio.volume = volume / 100;
    audio.play().then(() => {
      setIsPlaying(true);
    }).catch(() => {
      // 파일이 없거나 로드 실패 시 조용히 무시
      setIsPlaying(false);
    });
  }, [volume, stopSound]);

  const handleTrackSelect = (track: Track) => {
    setActiveTrack(track);
    playTrack(track);
  };

  const togglePlay = () => {
    if (!activeTrack || !audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const playNext = () => {
    if (!activeTrack) return;
    const catTracks = tracks.filter(t => t.category === activeTrack.category);
    const idx = catTracks.findIndex(t => t.id === activeTrack.id);
    const next = catTracks[(idx + 1) % catTracks.length];
    setActiveTrack(next);
    playTrack(next);
  };

  const playPrev = () => {
    if (!activeTrack) return;
    const catTracks = tracks.filter(t => t.category === activeTrack.category);
    const idx = catTracks.findIndex(t => t.id === activeTrack.id);
    const prev = catTracks[(idx - 1 + catTracks.length) % catTracks.length];
    setActiveTrack(prev);
    playTrack(prev);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    return `${m}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
  };

  const filteredTracks = tracks.filter(t => t.category === selectedCategory);
  const progress = duration > 0 ? (elapsed / duration) * 100 : 0;

  /* ─── 사운드 플레이어 뷰 ─── */
  if (activeTrack) {
    const catInfo = categories.find(c => c.id === activeTrack.category)!;
    const TrackIcon = activeTrack.icon;
    return (
      <div className="tds-page bg-background">
        <div className="tds-content px-5 pt-6 pb-28 flex flex-col items-center">
          <button onClick={() => { stopSound(); setActiveTrack(null); }}
            className="self-start flex items-center gap-1 text-muted-foreground mb-6 hover:text-foreground transition-colors">
            <ChevronLeft className="w-5 h-5" />
            <span className={sr ? 'text-lg' : 'text-sm'}>{t('sounds.back')}</span>
          </button>

          {/* 앨범 아트 */}
          <div className={cn('w-32 h-32 rounded-full flex items-center justify-center mb-8 border-2 shadow-lg', catInfo.color, isPlaying && 'animate-pulse')}>
            <TrackIcon className="w-14 h-14" />
          </div>

          {/* 트랙 정보 */}
          <h2 className={cn('font-semibold text-foreground mb-1', sr ? 'text-2xl' : 'text-xl')}>{activeTrack.name}</h2>
          <p className="text-muted-foreground text-sm mb-6">{catInfo.label}</p>

          {/* 프로그레스 바 */}
          <div className="w-full max-w-xs mb-2">
            <div
              className="w-full h-1.5 bg-muted rounded-full overflow-hidden cursor-pointer"
              onClick={(e) => {
                if (!audioRef.current || !duration) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const ratio = (e.clientX - rect.left) / rect.width;
                audioRef.current.currentTime = ratio * duration;
              }}
            >
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-muted-foreground tabular-nums">{formatTime(elapsed)}</span>
              <span className="text-[10px] text-muted-foreground tabular-nums">{formatTime(duration)}</span>
            </div>
          </div>

          {/* 컨트롤 */}
          <div className="flex items-center gap-5 mb-8">
            <button onClick={() => setLoop(!loop)} className={cn('p-2 rounded-full transition-colors', loop ? 'text-primary bg-accent' : 'text-muted-foreground')}>
              <Repeat className="w-5 h-5" />
            </button>
            <button onClick={playPrev} className="p-2 text-foreground hover:text-primary transition-colors">
              <SkipBack className="w-6 h-6" />
            </button>
            <button onClick={togglePlay} className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:opacity-90 transition-opacity">
              {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
            </button>
            <button onClick={playNext} className="p-2 text-foreground hover:text-primary transition-colors">
              <SkipForward className="w-6 h-6" />
            </button>
            <div className="relative">
              <button onClick={() => { if (sleepTimer) { setSleepTimer(null); setRemainingTime(null); } }}
                className={cn('p-2 rounded-full transition-colors', sleepTimer ? 'text-primary bg-accent' : 'text-muted-foreground')}>
                <Timer className="w-5 h-5" />
              </button>
              {remainingTime && <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-primary tabular-nums">{formatTime(remainingTime)}</span>}
            </div>
          </div>

          {/* 타이머 옵션 */}
          <div className="flex gap-2 mb-8">
            {TIMER_OPTIONS.map(opt => (
              <Button key={opt.value} variant={sleepTimer === opt.value ? 'default' : 'outline'} size="sm" className="text-xs rounded-full px-4"
                onClick={() => setSleepTimer(sleepTimer === opt.value ? null : opt.value)}>{opt.label}</Button>
            ))}
          </div>

          {/* 볼륨 */}
          <div className="w-full max-w-xs flex items-center gap-3">
            {volume === 0 ? <VolumeX className="w-4 h-4 text-muted-foreground shrink-0" /> : <Volume2 className="w-4 h-4 text-muted-foreground shrink-0" />}
            <Slider value={[volume]} onValueChange={([v]) => setVolume(v)} max={100} step={1} className="flex-1" />
            <span className="text-xs text-muted-foreground w-8 text-right tabular-nums">{volume}</span>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  /* ─── 메인 허브 뷰 ─── */
  return (
    <div className="tds-page bg-background">
      <div className="tds-content px-5 pt-6 pb-28">
        <h1 className={cn('font-bold text-foreground mb-1', sr ? 'text-2xl' : 'text-xl')}>
          더보기
        </h1>
        <p className={cn('text-muted-foreground mb-5', sr ? 'text-base' : 'text-sm')}>
          유용한 건강 서비스를 이용해보세요
        </p>

        {/* 메인 탭 */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-6 scrollbar-hide">
          {mainTabs.map(tab => {
            const isActive = mainTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setMainTab(tab.id)}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2 rounded-full border font-medium whitespace-nowrap transition-all',
                  sr ? 'text-base' : 'text-sm',
                  isActive
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-card border-border text-muted-foreground hover:bg-muted'
                )}
              >
                <span>{tab.emoji}</span>
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* 탭 콘텐츠 */}
        {mainTab === 'sounds' && (
          <>
            <div className="grid grid-cols-3 gap-2 mb-6">
              {categories.map(cat => {
                const CatIcon = cat.icon;
                const isActive = selectedCategory === cat.id;
                return (
                  <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
                    className={cn('flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border transition-all',
                      isActive ? cat.color + ' border-current shadow-sm' : 'bg-card border-border text-muted-foreground hover:bg-muted')}>
                    <CatIcon className={sr ? 'w-6 h-6' : 'w-5 h-5'} />
                    <span className={cn('font-medium', sr ? 'text-sm' : 'text-xs')}>{cat.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="space-y-2">
              {filteredTracks.map((track, i) => {
                const Icon = track.icon;
                return (
                  <button key={track.id} onClick={() => handleTrackSelect(track)}
                    className="w-full flex items-center gap-4 p-4 bg-card rounded-xl border border-border hover:border-primary/30 hover:shadow-sm transition-all text-left">
                    <div className={cn('w-10 h-10 rounded-full flex items-center justify-center shrink-0', categories.find(c => c.id === track.category)?.color)}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn('font-medium text-foreground', sr ? 'text-lg' : 'text-sm')}>{track.name}</p>
                      <p className="text-xs text-muted-foreground">{categories.find(c => c.id === track.category)?.label} · {i + 1}번 트랙</p>
                    </div>
                    <Play className="w-4 h-4 text-muted-foreground shrink-0" />
                  </button>
                );
              })}
            </div>
          </>
        )}

        {mainTab === 'pharmacy' && <NearbyPharmacy />}

        {mainTab === 'blog' && (
          <div className="text-center py-16">
            <span className="text-5xl mb-4 block">📰</span>
            <p className={`font-semibold text-foreground mb-2 ${sr ? 'text-xl' : 'text-lg'}`}>건강 블로그</p>
            <p className={`text-muted-foreground ${sr ? 'text-base' : 'text-sm'}`}>곧 자동 연재 건강 블로그가 시작됩니다!</p>
            <p className="text-xs text-muted-foreground mt-2">준비 중...</p>
          </div>
        )}

        {mainTab === 'webtoon' && (
          <div className="text-center py-16">
            <span className="text-5xl mb-4 block">📚</span>
            <p className={`font-semibold text-foreground mb-2 ${sr ? 'text-xl' : 'text-lg'}`}>YoYak 상식 웹툰</p>
            <p className={`text-muted-foreground ${sr ? 'text-base' : 'text-sm'}`}>건강 상식 웹툰이 곧 연재됩니다!</p>
            <p className="text-xs text-muted-foreground mt-2">준비 중...</p>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default Sounds;
