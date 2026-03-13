import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSeniorMode } from '@/contexts/SeniorModeContext';
import { Camera, CalendarDays, Bot, BookOpen, Sun, Volume2, VolumeX } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import BottomNav from '@/components/BottomNav';
import { useTranslation } from 'react-i18next';

interface SavedItem {
  id: string;
  name: string;
  time: string;
  period: string;
  taken?: boolean;
  startDate?: string;
  endDate?: string;
}

const toDateStr = (d: Date) => d.toISOString().split('T')[0];

const PERIOD_LABEL: Record<string, string> = {
  morning: '아침',
  afternoon: '점심',
  evening: '저녁',
  bedtime: '취침 전',
};

const Home = () => {
  const { user } = useAuth();
  const { isSeniorMode, toggleSeniorMode } = useSeniorMode();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const today = new Date();
  const todayStr = toDateStr(today);
  const dateStr = i18n.language === 'ko'
    ? `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`
    : today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const [scheduleItems, setScheduleItems] = useState<SavedItem[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  // localStorage에서 오늘 스케줄 로드
  useEffect(() => {
    const raw = localStorage.getItem('saved_schedules');
    if (!raw) return;
    try {
      const saved: SavedItem[] = JSON.parse(raw);
      const filtered = saved.filter(
        s => !s.id.startsWith('sample-') &&
          (!s.startDate || s.startDate <= todayStr) &&
          (!s.endDate || s.endDate >= todayStr)
      );
      setScheduleItems(filtered);
    } catch { /* ignore */ }
  }, []);

  // 페이지 포커스 시 재로드 (스케줄 변경 반영)
  useEffect(() => {
    const onFocus = () => {
      const raw = localStorage.getItem('saved_schedules');
      if (!raw) return;
      try {
        const saved: SavedItem[] = JSON.parse(raw);
        const filtered = saved.filter(
          s => !s.id.startsWith('sample-') &&
            (!s.startDate || s.startDate <= todayStr) &&
            (!s.endDate || s.endDate >= todayStr)
        );
        setScheduleItems(filtered);
      } catch { /* ignore */ }
    };
    window.addEventListener('focus', onFocus);
    return () => { window.removeEventListener('focus', onFocus); window.speechSynthesis.cancel(); };
  }, []);

  const totalMeds = scheduleItems.length;
  const takenMeds = scheduleItems.filter(i => i.taken).length;
  const progressValue = totalMeds > 0 ? (takenMeds / totalMeds) * 100 : 0;

  const handleTTS = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    if (totalMeds === 0) {
      const utter = new SpeechSynthesisUtterance('오늘 등록된 복약 스케줄이 없습니다.');
      utter.lang = 'ko-KR';
      window.speechSynthesis.speak(utter);
      return;
    }
    const remaining = scheduleItems.filter(i => !i.taken);
    let text = `오늘 복약 스케줄입니다. 총 ${totalMeds}가지 중 ${takenMeds}가지를 복용하셨습니다. `;
    if (remaining.length === 0) {
      text += '오늘 모든 약을 복용하셨습니다. 수고하셨습니다!';
    } else {
      const byPeriod: Record<string, string[]> = {};
      remaining.forEach(i => {
        if (!byPeriod[i.period]) byPeriod[i.period] = [];
        byPeriod[i.period].push(i.name);
      });
      ['morning', 'afternoon', 'evening', 'bedtime'].forEach(p => {
        if (byPeriod[p]?.length) text += `${PERIOD_LABEL[p]}에 ${byPeriod[p].join(', ')}. `;
      });
    }
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'ko-KR';
    utter.rate = 0.9;
    utterRef.current = utter;
    utter.onend = () => setIsSpeaking(false);
    utter.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utter);
    setIsSpeaking(true);
  };

  const quickActions = [
    { icon: Camera, label: t('home.pillScan'), desc: t('home.pillScanDesc'), to: '/capture', emoji: '📷' },
    { icon: CalendarDays, label: t('home.medSchedule'), desc: t('home.medScheduleDesc'), to: '/schedule', emoji: '📋' },
    { icon: Bot, label: t('home.aiChat'), desc: t('home.aiChatDesc'), to: '/ai-chat', emoji: '🤖' },
    { icon: BookOpen, label: '약(영양제 등) 추가', desc: 'AI로 간편 등록', to: '/add/supplement', emoji: '💊' },
  ];

  const sr = isSeniorMode;

  return (
    <div className="min-h-screen bg-background flex flex-col safe-area-padding">
      <header className="tds-header">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h1 className={`font-bold text-foreground ${sr ? 'text-2xl' : 'text-lg'}`}>
              {t('home.greeting', { name: user?.name || t('common.user') })}
            </h1>
            <p className={`text-muted-foreground ${sr ? 'text-base' : 'text-xs'} mt-0.5`}>{dateStr}</p>
          </div>
          <button
            onClick={toggleSeniorMode}
            className={`flex items-center justify-center rounded-full transition-all ${
              sr ? 'w-14 h-14 bg-primary text-primary-foreground' : 'w-10 h-10 bg-accent text-primary'
            }`}
            title={t('home.seniorMode')}
          >
            <Sun className={sr ? 'w-7 h-7' : 'w-5 h-5'} />
          </button>
        </div>
      </header>

      <main className={`flex-1 px-5 py-5 pb-24 overflow-y-auto max-w-3xl mx-auto w-full ${sr ? 'space-y-6' : 'space-y-5'}`}>
        <div className="tds-card">
          <div className="flex items-center justify-between mb-3">
            <h2 className={`font-bold text-foreground ${sr ? 'text-xl' : 'text-base'}`}>
              {t('home.todayStatus')}
            </h2>
            <span className="inline-flex items-center rounded-full bg-primary/10 text-primary text-xs font-semibold px-2.5 py-0.5">
              {takenMeds}/{totalMeds}
            </span>
          </div>
          <Progress value={progressValue} className="h-3 bg-muted" />
          <p className={`text-muted-foreground mt-2 ${sr ? 'text-base' : 'text-xs'}`}>
            {totalMeds > 0
              ? t('home.statusSummary', { total: totalMeds, taken: takenMeds })
              : '등록된 복약 스케줄이 없습니다.'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {quickActions.map(({ label, desc, to, emoji }) => (
            <button
              key={to}
              onClick={() => navigate(to)}
              className={`tds-card flex flex-col items-center justify-center gap-2 hover:border-primary transition-colors active:scale-[0.98] ${
                sr ? 'py-8' : 'py-6'
              }`}
              style={sr ? { minHeight: '140px' } : { minHeight: '100px' }}
            >
              <span className={sr ? 'text-4xl' : 'text-3xl'}>{emoji}</span>
              <span className={`font-semibold text-foreground ${sr ? 'text-lg' : 'text-sm'}`}>{label}</span>
              {!sr && <span className="text-muted-foreground text-xs">{desc}</span>}
            </button>
          ))}
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className={`font-bold text-foreground ${sr ? 'text-xl' : 'text-base'}`}>
              {t('home.todaySchedule')}
            </h2>
            <button
              onClick={handleTTS}
              className={`flex items-center justify-center rounded-full transition-colors ${
                isSpeaking ? 'bg-primary text-primary-foreground' : 'bg-accent text-primary'
              } ${sr ? 'w-10 h-10' : 'w-8 h-8'}`}
              title="오늘 복약 읽어주기"
            >
              {isSpeaking
                ? <VolumeX className={sr ? 'w-5 h-5' : 'w-4 h-4'} />
                : <Volume2 className={sr ? 'w-5 h-5' : 'w-4 h-4'} />}
            </button>
          </div>
          <div className="space-y-2">
            {scheduleItems.length === 0 ? (
              <div className="tds-card text-center py-6">
                <p className={`text-muted-foreground ${sr ? 'text-base' : 'text-sm'}`}>등록된 복약 스케줄이 없습니다</p>
                <button onClick={() => navigate('/capture')} className="tds-button-primary mt-3 text-sm">약 추가하기</button>
              </div>
            ) : (
              scheduleItems.map((item) => (
                <div key={item.id} className="tds-card flex items-center gap-3" style={sr ? { padding: '20px' } : undefined}>
                  <div className={`rounded-full flex items-center justify-center flex-shrink-0 ${
                    item.taken ? 'bg-primary' : 'bg-muted'
                  } ${sr ? 'w-8 h-8' : 'w-6 h-6'}`}>
                    {item.taken && <span className="text-primary-foreground text-xs">✓</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium ${item.taken ? 'text-muted-foreground line-through' : 'text-foreground'} ${sr ? 'text-lg' : 'text-sm'}`}>
                      {PERIOD_LABEL[item.period] || item.period}
                    </p>
                    <p className={`text-muted-foreground truncate ${sr ? 'text-base' : 'text-xs'}`}>
                      {item.name}
                    </p>
                  </div>
                  <span className={`inline-flex items-center rounded-full text-xs font-medium px-2 py-0.5 ${
                    item.taken ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                  }`}>
                    {item.taken ? t('home.done') : t('home.confirm')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Home;
