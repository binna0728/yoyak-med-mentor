import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Camera, FileText, Settings, Search } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col safe-area-padding">
      {/* Header */}
      <header className="tds-header">
        <div className="flex items-center justify-between h-14 px-5 border-b border-border">
          <span className="text-lg font-bold text-foreground">요약<span className="text-muted-foreground text-xs ml-1">(要藥)</span></span>
          <Link to="/settings" className="p-2"><Settings className="w-5 h-5 text-muted-foreground" /></Link>
        </div>
      </header>

      <main className="flex-1 px-5 py-6 pb-24 overflow-y-auto max-w-3xl mx-auto w-full">
        {/* Two big action buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => navigate('/camera/pill')}
            className="tds-card flex flex-col items-center justify-center gap-3 py-8 hover:border-primary transition-colors active:scale-[0.98]"
          >
            <Camera className="w-8 h-8 text-primary" />
            <span className="font-semibold text-foreground text-sm">알약 촬영하기</span>
          </button>
          <button
            onClick={() => navigate('/camera/prescription')}
            className="tds-card flex flex-col items-center justify-center gap-3 py-8 hover:border-primary transition-colors active:scale-[0.98]"
          >
            <FileText className="w-8 h-8 text-primary" />
            <span className="font-semibold text-foreground text-sm">처방전/영수증<br />스캔</span>
          </button>
        </div>

        {/* TODAY section */}
        <div className="mb-6">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">TODAY</h2>
          <div className="space-y-2">
            <div className="tds-card flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-lg">💊</span>
                <div>
                  <p className="font-medium text-foreground text-sm">오전 9:00</p>
                  <p className="text-muted-foreground text-xs">혈압약</p>
                </div>
              </div>
              <button onClick={() => navigate('/schedule')} className="text-xs text-primary font-medium">확인 →</button>
            </div>
            <div className="tds-card flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-lg">💊</span>
                <div>
                  <p className="font-medium text-foreground text-sm">저녁 7:00</p>
                  <p className="text-muted-foreground text-xs">비타민</p>
                </div>
              </div>
              <button onClick={() => navigate('/schedule')} className="text-xs text-primary font-medium">확인 →</button>
            </div>
          </div>
        </div>

        {/* AI consultation banner */}
        <button
          onClick={() => navigate('/ai-chat')}
          className="tds-card w-full flex items-center gap-4 hover:border-primary transition-colors active:scale-[0.98]"
        >
          <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
            <Search className="w-5 h-5 text-primary" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-foreground text-sm">AI 상담</p>
            <p className="text-muted-foreground text-xs">궁금한 정보 알아보세요</p>
          </div>
        </button>
      </main>

      <BottomNav />
    </div>
  );
};

export default Home;
