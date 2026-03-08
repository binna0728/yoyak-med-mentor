import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Upload } from 'lucide-react';

const PrescriptionCamera = () => {
  const navigate = useNavigate();
  const cameraRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) { toast.error('이미지 파일만 가능합니다.'); return; }
    // Store file reference and go to processing
    navigate('/processing');
    // Simulate OCR processing
    setTimeout(() => {
      localStorage.setItem('ocr_result', JSON.stringify([
        { name: '아모잘탄정', dosage: '1회 1정', frequency: '1일 1회', duration: '30일', schedule: '아침 식후' },
        { name: '로수바스타틴정', dosage: '1회 1정', frequency: '1일 1회', duration: '30일', schedule: '저녁 식후' },
      ]));
      navigate('/result/check', { replace: true });
    }, 2500);
  };

  const onInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  return (
    <div className="min-h-screen bg-foreground flex flex-col items-center justify-center safe-area-padding relative">
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={onInput} className="hidden" />
      <input ref={fileRef} type="file" accept="image/*" onChange={onInput} className="hidden" />

      <div className="flex-1 w-full flex flex-col items-center justify-center text-primary-foreground px-4">
        <div className="w-[85vw] h-[60vh] border-4 border-dashed border-primary-foreground/60 rounded-3xl mb-4 flex items-center justify-center">
          <p className="text-center text-lg font-medium opacity-80">처방전/약봉투를<br />프레임 안에 넣어주세요</p>
        </div>
      </div>

      <div className="pb-12 pt-6 flex flex-col items-center gap-4 w-full px-6">
        <button onClick={() => cameraRef.current?.click()} className="w-20 h-20 rounded-full bg-primary-foreground flex items-center justify-center border-4 border-primary shadow-lg active:scale-95 transition-transform">
          <div className="w-16 h-16 rounded-full bg-primary-foreground border-2 border-primary/20" />
        </button>
        <button onClick={() => fileRef.current?.click()} className="flex items-center gap-2 text-primary-foreground/80 text-sm font-medium">
          <Upload className="w-4 h-4" />
          파일로 업로드
        </button>
      </div>

      <button onClick={() => navigate(-1)} className="absolute top-4 left-4 p-2 text-primary-foreground">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
      </button>
    </div>
  );
};

export default PrescriptionCamera;
