import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { medicineApi } from '@/api/medicine';
import { toast } from 'sonner';
import { Upload } from 'lucide-react';

const PillCamera = () => {
  const navigate = useNavigate();
  const cameraRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) { toast.error('이미지 파일만 가능합니다.'); return; }
    navigate('/processing');
    try {
      const result = await medicineApi.recognizePill(file);
      // Store result and go to check
      localStorage.setItem('ocr_result', JSON.stringify([{ name: result.medicine_name, dosage: '1회 1정', frequency: '1일 2회', duration: '7일', schedule: '식후' }]));
      navigate('/result/check', { replace: true });
    } catch {
      toast.error('알약을 인식하지 못했어요.');
      navigate(-1);
    }
  };

  const onInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  // Auto-open camera on mount
  return (
    <div className="min-h-screen bg-foreground flex flex-col items-center justify-center safe-area-padding relative">
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={onInput} className="hidden" />
      <input ref={fileRef} type="file" accept="image/*" onChange={onInput} className="hidden" />

      {/* Simulated camera view */}
      <div className="flex-1 w-full flex flex-col items-center justify-center text-primary-foreground px-6">
        <div className="w-48 h-48 border-4 border-primary-foreground/50 rounded-3xl mb-6" />
        <p className="text-center text-lg font-medium">알약을 가운데에 놓고<br />촬영해주세요</p>
      </div>

      {/* Capture button */}
      <div className="pb-12 pt-6 flex flex-col items-center gap-4 w-full px-6">
        <button onClick={() => cameraRef.current?.click()} className="w-20 h-20 rounded-full bg-primary-foreground flex items-center justify-center border-4 border-primary shadow-lg active:scale-95 transition-transform">
          <div className="w-16 h-16 rounded-full bg-primary-foreground border-2 border-primary/20" />
        </button>
        <button onClick={() => fileRef.current?.click()} className="flex items-center gap-2 text-primary-foreground/80 text-sm font-medium">
          <Upload className="w-4 h-4" />
          파일로 업로드
        </button>
      </div>

      {/* Back */}
      <button onClick={() => navigate(-1)} className="absolute top-4 left-4 p-2 text-primary-foreground">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
      </button>
    </div>
  );
};

export default PillCamera;
