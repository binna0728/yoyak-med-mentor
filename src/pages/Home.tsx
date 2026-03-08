import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSeniorMode } from '@/contexts/SeniorModeContext';
import { Camera, CalendarDays, Bot, BookOpen, Sun } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import BottomNav from '@/components/BottomNav';

const Home = () => {
  const { user } = useAuth();
  const { isSeniorMode, toggleSeniorMode } = useSeniorMode();
  const navigate = useNavigate();

  const today = new Date();
  const dateStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;

  // Demo schedule data
  const totalMeds = 4;
  const takenMeds = 1;
  const progressValue = (takenMeds / totalMeds) * 100;

  const quickActions = [
    { icon: Camera, label: '약 촬영 인식', desc: '카메라로 약 확인', to: '/capture', emoji: '📷' },
    { icon: CalendarDays, label: '복약 스케줄', desc: '오늘 복용 확인', to: '/schedule', emoji: '📋' },
    { icon: Bot, label: 'AI 상담', desc: '궁금한 점 질문', to: '/ai-chat', emoji: '🤖' },
    { icon: BookOpen, label: '복약 가이드', desc: '최근 약 정보', to: '/guide/demo-1', emoji: '📖' },
  ];

  const sr = isSeniorMode;

  return (
    <div className="min-h-screen bg-background flex flex-col safe-area-padding">
      {/* Header */}
      <header className="tds-header">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h1 className={`font-bold text-foreground ${sr ? 'text-2xl' : 'text-lg'}`}>
              {user?.name || '사용자'}님 안녕하세요 👋
            </h1>
            <p className={`text-muted-foreground ${sr ? 'text-base' : 'text-xs'} mt-0.5`}>{dateStr}</p>
          </div>
          <button
            onClick={toggleSeniorMode}
            className={`flex items-center justify-center rounded-full transition-all ${
              sr
                ? 'w-14 h-14 bg-primary text-primary-foreground'
                : 'w-10 h-10 bg-accent text-primary'
            }`}
            title="시니어모드"
          >
            <Sun className={sr ? 'w-7 h-7' : 'w-5 h-5'} />
          </button>
        </div>
      </header>

      <main className={`flex-1 px-5 py-5 pb-24 overflow-y-auto max-w-3xl mx-auto w-full ${sr ? 'space-y-6' : 'space-y-5'}`}>
        {/* Today's medication status card */}
        <div className="tds-card">
          <div className="flex items-center justify-between mb-3">
            <h2 className={`font-bold text-foreground ${sr ? 'text-xl' : 'text-base'}`}>
              오늘 복약 현황
            </h2>
            <span className={`font-bold text-primary ${sr ? 'text-xl' : 'text-sm'}`}>
              {takenMeds}/{totalMeds}
            </span>
          </div>
          <Progress value={progressValue} className="h-3 bg-muted" />
          <p className={`text-muted-foreground mt-2 ${sr ? 'text-base' : 'text-xs'}`}>
            총 {totalMeds}개 중 {takenMeds}개 복용 완료
          </p>
        </div>

        {/* Quick action grid 2x2 */}
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

        {/* Today's schedule preview */}
        <div>
          <h2 className={`font-bold text-foreground mb-3 ${sr ? 'text-xl' : 'text-base'}`}>
            오늘 복약 일정
          </h2>
          <div className="space-y-2">
            {[
              { time: '오전 9:00', name: '혈압약 (아모잘탄)', taken: true },
              { time: '오후 1:00', name: '비타민D', taken: false },
              { time: '저녁 7:00', name: '혈당약 (메트포르민)', taken: false },
              { time: '취침 전', name: '수면보조제', taken: false },
            ].map((item, idx) => (
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
                <button
                  onClick={() => navigate('/schedule')}
                  className={`text-primary font-medium flex-shrink-0 ${sr ? 'text-base' : 'text-xs'}`}
                >
                  {item.taken ? '완료' : '확인 →'}
                </button>
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
