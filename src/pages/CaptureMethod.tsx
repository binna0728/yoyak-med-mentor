import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, FileText, Upload } from 'lucide-react';
import { useSeniorMode } from '@/contexts/SeniorModeContext';

const CaptureMethod = () => {
  const navigate = useNavigate();
  const { isSeniorMode: sr } = useSeniorMode();

  const methods = [
    {
      icon: Camera,
      emoji: '📷',
      title: '알약 직접 촬영',
      desc: '카메라로 알약을 촬영하면 AI가 인식해요',
      to: '/camera/pill',
    },
    {
      icon: FileText,
      emoji: '📄',
      title: '처방전 촬영',
      desc: '처방전이나 약봉투를 촬영해요',
      to: '/camera/prescription',
    },
    {
      icon: Upload,
      emoji: '📁',
      title: '파일 업로드',
      desc: '갤러리에서 사진을 선택해요',
      to: '/upload',
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col safe-area-padding">
      <header className="tds-header">
        <div className="flex items-center h-14 px-4 border-b border-border">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <div className="flex-1 text-center">
            <span className={`font-bold text-foreground ${sr ? 'text-xl' : 'text-lg'}`}>촬영 방법 선택</span>
          </div>
          <div className="w-10" />
        </div>
      </header>

      <main className="flex-1 px-5 py-6 max-w-lg mx-auto w-full flex flex-col">
        <p className={`text-muted-foreground mb-6 ${sr ? 'text-lg' : 'text-sm'}`}>
          약을 어떻게 등록할까요?
        </p>

        <div className="space-y-3 flex-1">
          {methods.map(({ emoji, title, desc, to }) => (
            <button
              key={to}
              onClick={() => navigate(to)}
              className="tds-card w-full flex items-center gap-4 hover:border-primary transition-colors active:scale-[0.98]"
              style={{ minHeight: sr ? '120px' : '100px' }}
            >
              <div className={`rounded-2xl bg-accent flex items-center justify-center flex-shrink-0 ${sr ? 'w-16 h-16' : 'w-14 h-14'}`}>
                <span className={sr ? 'text-3xl' : 'text-2xl'}>{emoji}</span>
              </div>
              <div className="text-left flex-1">
                <p className={`font-semibold text-foreground ${sr ? 'text-xl' : 'text-base'}`}>{title}</p>
                <p className={`text-muted-foreground mt-0.5 ${sr ? 'text-base' : 'text-xs'}`}>{desc}</p>
              </div>
              <svg className="w-5 h-5 text-muted-foreground/50 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>

        <p className={`text-center text-muted-foreground py-6 ${sr ? 'text-base' : 'text-xs'}`}>
          또 한 사람이 처음으로 약을 찾아보셨습니다 ✨
        </p>
      </main>
    </div>
  );
};

export default CaptureMethod;
