import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSeniorMode } from '@/contexts/SeniorModeContext';
import { medicineApi } from '@/api/medicine';
import { toast } from 'sonner';
import { Upload } from 'lucide-react';

const PillCamera = () => {
  const navigate = useNavigate();
  const { isSeniorMode: sr } = useSeniorMode();
  const cameraRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [captured, setCaptured] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('이미지 파일만 가능합니다.');
      return;
    }

    // Show preview
    const url = URL.createObjectURL(file);
    setCaptured(url);
    setProcessing(true);

    // Navigate to processing with state
    navigate('/processing', { state: { image: file, type: 'pill' } });
  };

  const onInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
    e.target.value = '';
  };

  return (
    <div className="min-h-screen bg-foreground flex flex-col safe-area-padding relative">
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={onInput} className="hidden" />
      <input ref={fileRef} type="file" accept="image/*" onChange={onInput} className="hidden" />

      {/* Back button */}
      <button onClick={() => navigate(-1)} className="absolute top-5 left-4 z-10 p-2 text-primary-foreground">
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Camera viewfinder area */}
      <div className="flex-1 w-full flex flex-col items-center justify-center text-primary-foreground px-6">
        {captured ? (
          <img src={captured} alt="촬영된 이미지" className="w-56 h-56 object-cover rounded-3xl border-4 border-primary/50" />
        ) : (
          <>
            {/* Circular guide overlay */}
            <div className="relative">
              <div className={`border-4 border-primary-foreground/40 rounded-full ${sr ? 'w-64 h-64' : 'w-52 h-52'}`} />
              {/* Corner marks */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary-foreground rounded-tl-2xl" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary-foreground rounded-tr-2xl" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary-foreground rounded-bl-2xl" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary-foreground rounded-br-2xl" />
            </div>
            <p className={`text-center text-primary-foreground/90 font-medium mt-6 ${sr ? 'text-xl' : 'text-base'}`}>
              알약을 원 안에 놓아주세요
            </p>
            {sr && (
              <p className="text-center text-primary-foreground/60 text-base mt-2">
                아래 버튼을 눌러 촬영하세요
              </p>
            )}
          </>
        )}
      </div>

      {/* Bottom controls */}
      <div className="pb-10 pt-6 flex flex-col items-center gap-4 w-full px-6">
        {/* Capture button */}
        <button
          onClick={() => cameraRef.current?.click()}
          disabled={processing}
          className={`rounded-full bg-primary-foreground flex items-center justify-center border-4 border-primary shadow-xl active:scale-90 transition-transform ${
            sr ? 'w-[72px] h-[72px]' : 'w-16 h-16'
          }`}
        >
          <div className={`rounded-full bg-primary-foreground border-2 border-primary/30 ${sr ? 'w-[60px] h-[60px]' : 'w-12 h-12'}`} />
        </button>

        {/* File upload fallback */}
        <button
          onClick={() => fileRef.current?.click()}
          className={`flex items-center gap-2 text-primary-foreground/70 font-medium ${sr ? 'text-lg' : 'text-sm'}`}
        >
          <Upload className={sr ? 'w-6 h-6' : 'w-4 h-4'} />
          파일로 업로드
        </button>
      </div>
    </div>
  );
};

export default PillCamera;
