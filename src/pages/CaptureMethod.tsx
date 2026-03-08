import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, FileText, Upload } from 'lucide-react';

const CaptureMethod = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col safe-area-padding">
      <header className="tds-header">
        <div className="flex items-center h-14 px-4 border-b border-border">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2"><ArrowLeft className="w-6 h-6 text-foreground" /></button>
          <div className="flex-1 text-center">
            <span className="text-lg font-bold text-foreground">요약<span className="text-muted-foreground text-xs ml-1">(要藥)</span></span>
          </div>
          <div className="w-10" />
        </div>
      </header>

      <main className="flex-1 px-5 py-6 max-w-sm mx-auto w-full flex flex-col">
        <div className="space-y-3 flex-1">
          <button
            onClick={() => navigate('/camera/pill')}
            className="tds-card w-full flex items-center gap-4 hover:border-primary transition-colors active:scale-[0.98]"
          >
            <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center flex-shrink-0">
              <Camera className="w-6 h-6 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-foreground">알약 촬영(카메라)</p>
              <p className="text-muted-foreground text-xs">카메라로 알약을 촬영해요</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/camera/prescription')}
            className="tds-card w-full flex items-center gap-4 hover:border-primary transition-colors active:scale-[0.98]"
          >
            <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-foreground">처방전/영수증 촬영(카메라)</p>
              <p className="text-muted-foreground text-xs">처방전 또는 약봉투를 촬영해요</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/upload')}
            className="tds-card w-full flex items-center gap-4 hover:border-primary transition-colors active:scale-[0.98]"
          >
            <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center flex-shrink-0">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-foreground">파일로 업로드</p>
              <p className="text-muted-foreground text-xs">갤러리에서 사진을 선택해요</p>
            </div>
          </button>
        </div>

        <p className="text-center text-xs text-muted-foreground py-6">
          또 한 사람이 처음으로 약을 찾아보셨습니다 ✨
        </p>
      </main>
    </div>
  );
};

export default CaptureMethod;
