import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSeniorMode } from '@/contexts/SeniorModeContext';
import { Camera, CalendarDays, Bot, BookOpen, Sun } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import BottomNav from '@/components/BottomNav';
import { useTranslation } from 'react-i18next';


const Home = () => {
  const { user } = useAuth();
  const { isSeniorMode, toggleSeniorMode } = useSeniorMode();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const today = new Date();
  const dateStr = i18n.language === 'ko'
    ? `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`
    : today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const totalMeds = 4;
  const takenMeds = 1;
  const progressValue = (takenMeds / totalMeds) * 100;

  const quickActions = [
    { icon: Camera, label: t('home.pillScan'), desc: t('home.pillScanDesc'), to: '/capture', emoji: '📷' },
    { icon: CalendarDays, label: t('home.medSchedule'), desc: t('home.medScheduleDesc'), to: '/schedule', emoji: '📋' },
    { icon: Bot, label: t('home.aiChat'), desc: t('home.aiChatDesc'), to: '/ai-chat', emoji: '🤖' },
    { icon: BookOpen, label: t('home.medGuide'), desc: t('home.medGuideDesc'), to: '/guide/demo-1', emoji: '📖' },
  ];

  const sr = isSeniorMode;

  const scheduleItems = [
    { time: t('home.morning'), name: '혈압약 (아모잘탄)', taken: true },
    { time: t('home.afternoon'), name: '비타민D', taken: false },
    { time: t('home.evening'), name: '혈당약 (메트포르민)', taken: false },
    { time: t('home.bedtime'), name: '수면보조제', taken: false },
  ];

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
            {t('home.statusSummary', { total: totalMeds, taken: takenMeds })}
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
          <h2 className={`font-bold text-foreground mb-3 ${sr ? 'text-xl' : 'text-base'}`}>
            {t('home.todaySchedule')}
          </h2>
          <div className="space-y-2">
            {scheduleItems.map((item, idx) => (
              <div key={idx} className="tds-card flex items-center gap-3" style={sr ? { padding: '20px' } : undefined}>
                <div className={`rounded-full flex items-center justify-center flex-shrink-0 ${
                  item.taken ? 'bg-primary' : 'bg-muted'
                } ${sr ? 'w-8 h-8' : 'w-6 h-6'}`}>
                  {item.taken && <span className="text-primary-foreground text-xs">✓</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium ${item.taken ? 'text-muted-foreground line-through' : 'text-foreground'} ${sr ? 'text-lg' : 'text-sm'}`}>
                    {item.time}
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
            ))}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Home;
