import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { useSeniorMode } from '@/contexts/SeniorModeContext';
import BottomNav from '@/components/BottomNav';
import NearbyPharmacy from '@/components/NearbyPharmacy';
import HealthBlog from '@/components/HealthBlog';
import {
  Brain, Moon, Flower2, Play, Pause, Repeat, Repeat1, Timer, SkipForward, SkipBack,
  Volume2, VolumeX, ChevronLeft, CloudRain, Wind, Music, Coffee, Shuffle,
  Leaf, MapPin, Newspaper, BookImage, GripVertical, ListMusic, Heart
} from 'lucide-react';
import SeniorModeToggle from '@/components/SeniorModeToggle';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/* ─── 더보기 탭 정의 (v1: 사운드만 표시) ─── */
type MainTab = 'sounds';

const mainTabs: { id: MainTab; label: string; icon: React.ElementType; emoji: string }[] = [
  { id: 'sounds', label: '힐링 사운드', icon: Music, emoji: '🎵' },
];

/* ─── 사운드 카테고리 & 트랙 ─── */
type Category = 'focus' | 'sleep' | 'meditation' | 'comfort';

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
  { id: 'comfort', label: '위로', icon: Heart, color: 'bg-rose-50 text-rose-600 border-rose-200' },
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
  // ── 수면 (6곡)
  { id: 'deep-night', name: '깊은 밤', icon: Moon, category: 'sleep', src: '/sounds/sleep/깊은 밤.mp3' },
  { id: 'moon-night', name: '달 밤', icon: Moon, category: 'sleep', src: '/sounds/sleep/달 밤.mp3' },
  { id: 'warm-night', name: '따뜻한 밤', icon: Coffee, category: 'sleep', src: '/sounds/sleep/따뜻한 밤.mp3' },
  { id: 'rainy-night', name: '비 오는 밤', icon: CloudRain, category: 'sleep', src: '/sounds/sleep/비 오는 밤.mp3' },
  { id: 'calm-night', name: '차분한 밤', icon: Wind, category: 'sleep', src: '/sounds/sleep/차분한 밤.mp3' },
  { id: 'cozy-night', name: '편안한 밤', icon: Leaf, category: 'sleep', src: '/sounds/sleep/편안한 밤.mp3' },
  // ── 명상 (4곡)
  { id: 'kind-heart', name: '다정한 마음', icon: Flower2, category: 'meditation', src: '/sounds/meditation/다정한 마음.mp3' },
  { id: 'mindfulness', name: '마음챙김', icon: Leaf, category: 'meditation', src: '/sounds/meditation/마음챙김.mp3' },
  { id: 'good-day', name: '좋은 하루', icon: Coffee, category: 'meditation', src: '/sounds/meditation/좋은 하루.mp3' },
  { id: 'calm-mind', name: '차분한 마음', icon: Wind, category: 'meditation', src: '/sounds/meditation/차분한 마음.mp3' },
  // ── 위로 (4곡)
  { id: 'let-go', name: '내려놓기', icon: Leaf, category: 'comfort', src: '/sounds/comfort/내려놓기.mp3' },
  { id: 'behind', name: '뒤쳐진 느낌', icon: Heart, category: 'comfort', src: '/sounds/comfort/뒤쳐진 느낌.mp3' },
  { id: 'anxiety', name: '불안, 후회', icon: CloudRain, category: 'comfort', src: '/sounds/comfort/불안, 후회.mp3' },
  
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
  const [repeatMode, setRepeatMode] = useState<'all' | 'one' | 'none'>('all');
  const [shuffle, setShuffle] = useState(false);
  const [volume, setVolume] = useState(70);
  const [sleepTimer, setSleepTimer] = useState<number | null>(null);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [trackOrder, setTrackOrder] = useState<Record<Category, string[]>>({
    focus: tracks.filter(t => t.category === 'focus').map(t => t.id),
    sleep: tracks.filter(t => t.category === 'sleep').map(t => t.id),
    meditation: tracks.filter(t => t.category === 'meditation').map(t => t.id),
    comfort: tracks.filter(t => t.category === 'comfort').map(t => t.id),
  });
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [showQueue, setShowQueue] = useState(false);
  const [viewingWebtoon, setViewingWebtoon] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const repeatModeRef = useRef(repeatMode);
  const activeTrackRef = useRef(activeTrack);
  const shuffleRef = useRef(shuffle);
  const trackOrderRef = useRef(trackOrder);
  const volumeRef = useRef(volume);
  repeatModeRef.current = repeatMode;
  activeTrackRef.current = activeTrack;
  shuffleRef.current = shuffle;
  trackOrderRef.current = trackOrder;
  volumeRef.current = volume;

  // 카테고리별 정렬된 트랙 가져오기
  const getOrderedTracks = useCallback((category: Category) => {
    const order = trackOrderRef.current[category];
    return order.map(id => tracks.find(t => t.id === id)!).filter(Boolean);
  }, []);

  // 자동 다음곡 재생
  const autoPlayNext = useCallback(() => {
    const current = activeTrackRef.current;
    if (!current) return;
    const catTracks = getOrderedTracks(current.category);
    const idx = catTracks.findIndex(t => t.id === current.id);
    const isLast = idx >= catTracks.length - 1;

    if (repeatModeRef.current === 'one') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
      return;
    }

    let next: Track | undefined;
    if (shuffleRef.current) {
      // 셔플: 현재곡 제외 랜덤
      const others = catTracks.filter(t => t.id !== current.id);
      next = others.length > 0 ? others[Math.floor(Math.random() * others.length)] : current;
    } else if (repeatModeRef.current === 'all') {
      next = catTracks[(idx + 1) % catTracks.length];
    } else {
      // none: 마지막이면 정지
      if (isLast) { setIsPlaying(false); return; }
      next = catTracks[idx + 1];
    }

    if (next) {
      setActiveTrack(next);
      const audio = audioRef.current;
      if (audio) {
        audio.src = next.src;
        audio.volume = volumeRef.current / 100;
        audio.play().catch(() => setIsPlaying(false));
      }
    }
  }, [getOrderedTracks]);

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
      autoPlayNext();
    });

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [autoPlayNext]);

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
    audio.src = encodeURI(track.src);
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
    const catTracks = getOrderedTracks(activeTrack.category);
    if (shuffle) {
      const others = catTracks.filter(t => t.id !== activeTrack.id);
      const next = others.length > 0 ? others[Math.floor(Math.random() * others.length)] : activeTrack;
      setActiveTrack(next);
      playTrack(next);
    } else {
      const idx = catTracks.findIndex(t => t.id === activeTrack.id);
      const next = catTracks[(idx + 1) % catTracks.length];
      setActiveTrack(next);
      playTrack(next);
    }
  };

  const playPrev = () => {
    if (!activeTrack) return;
    // 3초 이상 재생했으면 처음으로 되감기
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }
    const catTracks = getOrderedTracks(activeTrack.category);
    const idx = catTracks.findIndex(t => t.id === activeTrack.id);
    const prev = catTracks[(idx - 1 + catTracks.length) % catTracks.length];
    setActiveTrack(prev);
    playTrack(prev);
  };

  const cycleRepeatMode = () => {
    setRepeatMode(prev => prev === 'all' ? 'one' : prev === 'one' ? 'none' : 'all');
  };

  // 드래그 순서 변경
  const handleDragStart = (trackId: string) => setDraggingId(trackId);
  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggingId || draggingId === targetId) return;
    setTrackOrder(prev => {
      const cat = selectedCategory;
      const order = [...prev[cat]];
      const fromIdx = order.indexOf(draggingId);
      const toIdx = order.indexOf(targetId);
      if (fromIdx === -1 || toIdx === -1) return prev;
      order.splice(fromIdx, 1);
      order.splice(toIdx, 0, draggingId);
      return { ...prev, [cat]: order };
    });
  };
  const handleDragEnd = () => setDraggingId(null);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    return `${m}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
  };

  const filteredTracks = getOrderedTracks(selectedCategory);
  const progress = duration > 0 ? (elapsed / duration) * 100 : 0;
  const currentQueue = activeTrack ? getOrderedTracks(activeTrack.category) : [];

  /* ─── 사운드 플레이어 뷰 ─── */
  if (activeTrack) {
    const catInfo = categories.find(c => c.id === activeTrack.category)!;
    const TrackIcon = activeTrack.icon;
    return (
      <div className="tds-page bg-background">
        {/* 고정 헤더 — 뒤로가기 */}
        <header className="sticky top-0 z-20 bg-background border-b border-border">
          <div className="flex items-center h-14 px-4">
            <button onClick={() => { stopSound(); setActiveTrack(null); }}
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
              <ChevronLeft className="w-6 h-6" />
              <span className={sr ? 'text-lg' : 'text-sm'}>목록</span>
            </button>
            <div className="flex-1 text-center">
              <span className={cn('font-semibold text-foreground', sr ? 'text-lg' : 'text-base')}>{activeTrack.name}</span>
            </div>
            <div className="w-14" />
          </div>
        </header>

        <div className="tds-content px-5 pt-6 pb-28 flex flex-col items-center">

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
          <div className="flex items-center gap-4 mb-6">
            <button onClick={() => setShuffle(!shuffle)} className={cn('p-2 rounded-full transition-colors', shuffle ? 'text-primary bg-accent' : 'text-muted-foreground')}>
              <Shuffle className="w-5 h-5" />
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
            <button onClick={cycleRepeatMode} className={cn('p-2 rounded-full transition-colors relative', repeatMode !== 'none' ? 'text-primary bg-accent' : 'text-muted-foreground')}>
              {repeatMode === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
              {repeatMode === 'none' && <span className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />}
            </button>
          </div>

          {/* 타이머 + 큐 */}
          <div className="flex items-center gap-2 mb-6">
            {TIMER_OPTIONS.map(opt => (
              <Button key={opt.value} variant={sleepTimer === opt.value ? 'default' : 'outline'} size="sm" className="text-xs rounded-full px-4"
                onClick={() => setSleepTimer(sleepTimer === opt.value ? null : opt.value)}>{opt.label}</Button>
            ))}
            <div className="relative ml-auto">
              {sleepTimer && remainingTime && <span className="text-[10px] text-primary tabular-nums mr-2">{formatTime(remainingTime)}</span>}
              <button onClick={() => setShowQueue(!showQueue)} className={cn('p-2 rounded-full transition-colors', showQueue ? 'text-primary bg-accent' : 'text-muted-foreground')}>
                <ListMusic className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 볼륨 */}
          <div className="w-full max-w-xs flex items-center gap-3 mb-6">
            {volume === 0 ? <VolumeX className="w-4 h-4 text-muted-foreground shrink-0" /> : <Volume2 className="w-4 h-4 text-muted-foreground shrink-0" />}
            <Slider value={[volume]} onValueChange={([v]) => setVolume(v)} max={100} step={1} className="flex-1" />
            <span className="text-xs text-muted-foreground w-8 text-right tabular-nums">{volume}</span>
          </div>

          {/* 재생 대기열 (드래그로 순서 변경) */}
          {showQueue && (
            <div className="w-full max-w-xs">
              <p className={cn('font-medium text-foreground mb-2', sr ? 'text-base' : 'text-sm')}>재생 대기열 <span className="text-muted-foreground font-normal text-xs">(드래그로 순서 변경)</span></p>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {currentQueue.map((track, i) => {
                  const Icon = track.icon;
                  const isCurrent = track.id === activeTrack?.id;
                  return (
                    <div
                      key={track.id}
                      draggable
                      onDragStart={() => handleDragStart(track.id)}
                      onDragOver={(e) => handleDragOver(e, track.id)}
                      onDragEnd={handleDragEnd}
                      onClick={() => { setActiveTrack(track); playTrack(track); }}
                      className={cn(
                        'flex items-center gap-2 p-2 rounded-lg cursor-grab active:cursor-grabbing transition-all',
                        isCurrent ? 'bg-primary/10 border border-primary/30' : 'bg-card border border-transparent hover:bg-muted',
                        draggingId === track.id && 'opacity-50'
                      )}
                    >
                      <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className={cn('text-xs truncate flex-1', isCurrent && 'font-semibold text-primary')}>{track.name}</span>
                      {isCurrent && isPlaying && <span className="text-xs text-primary">♫</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        <BottomNav />
      </div>
    );
  }

  /* ─── 메인 허브 뷰 ─── */
  return (
    <div className="tds-page bg-background">
      <div className="tds-content px-5 pt-6 pb-28">
        <div className="flex items-center justify-between mb-1">
          <h1 className={cn('font-bold text-foreground', sr ? 'text-2xl' : 'text-xl')}>
            힐링 사운드
          </h1>
          <SeniorModeToggle />
        </div>
        <p className={cn('text-muted-foreground mb-5', sr ? 'text-base' : 'text-sm')}>
          마음을 편안하게 해주는 배경음을 들어보세요
        </p>

        {/* v1: 탭 1개뿐이므로 탭 바 숨김 */}

        {/* 탭 콘텐츠 */}
        {mainTab === 'sounds' && (
          <>
            <div className="grid grid-cols-4 gap-2 mb-6">
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
                  <div
                    key={track.id}
                    draggable
                    onDragStart={() => handleDragStart(track.id)}
                    onDragOver={(e) => handleDragOver(e, track.id)}
                    onDragEnd={handleDragEnd}
                    className={cn('transition-all', draggingId === track.id && 'opacity-50')}
                  >
                    <button onClick={() => handleTrackSelect(track)}
                      className="w-full flex items-center gap-4 p-4 bg-card rounded-xl border border-border hover:border-primary/30 hover:shadow-sm transition-all text-left">
                      <GripVertical className="w-4 h-4 text-muted-foreground shrink-0 cursor-grab" />
                      <div className={cn('w-10 h-10 rounded-full flex items-center justify-center shrink-0', categories.find(c => c.id === track.category)?.color)}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn('font-medium text-foreground', sr ? 'text-lg' : 'text-sm')}>{track.name}</p>
                        <p className="text-xs text-muted-foreground">{categories.find(c => c.id === track.category)?.label} · {i + 1}번 트랙</p>
                      </div>
                      <Play className="w-4 h-4 text-muted-foreground shrink-0" />
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}
        {/* v1: pharmacy, blog, webtoon 탭 숨김 */}
        {false && (
          <div>
            {viewingWebtoon ? (
              <div>
                <button onClick={() => setViewingWebtoon(null)}
                  className="flex items-center gap-1 text-muted-foreground mb-4 hover:text-foreground transition-colors">
                  <ChevronLeft className="w-5 h-5" />
                  <span className={sr ? 'text-lg' : 'text-sm'}>목록으로</span>
                </button>
                <h2 className={cn('font-semibold text-foreground mb-3', sr ? 'text-xl' : 'text-lg')}>약호랑 토복이의 하루</h2>
                <div className={cn('rounded-2xl border border-border overflow-hidden shadow-sm', sr && '-mx-5')}>
                  <img src={viewingWebtoon} alt="약호랑 토복이의 하루" className={sr ? 'w-[120%] max-w-none -ml-[10%] h-auto' : 'w-full h-auto'} />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {[{ id: 'ep01', title: '약호랑 토복이의 하루', src: '/webtoon/yaktoon.jpeg' }].map(ep => (
                  <div key={ep.id} onClick={() => setViewingWebtoon(ep.src)}
                    className="cursor-pointer rounded-2xl border border-border shadow-sm hover:shadow-md transition-all overflow-hidden">
                    <div className="px-4 py-3 bg-card border-b border-border">
                      <p className={cn('font-semibold text-foreground', sr ? 'text-lg' : 'text-base')}>{ep.title}</p>
                      <p className="text-xs text-muted-foreground">터치하면 전체화면으로 볼 수 있어요</p>
                    </div>
                    <div className={cn('overflow-y-auto', sr ? 'max-h-[60vh]' : 'max-h-[50vh]')}>
                      <img src={ep.src} alt={ep.title} className={sr ? 'w-[120%] max-w-none -ml-[10%] h-auto' : 'w-full h-auto'} />
                    </div>
                  </div>
                ))}
                <p className="text-center text-xs text-muted-foreground mt-2">더 많은 웹툰이 곧 연재됩니다!</p>
              </div>
            )}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default Sounds;
