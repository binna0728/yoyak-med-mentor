import { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSeniorMode } from '@/contexts/SeniorModeContext';
import { toast } from 'sonner';
import { Upload } from 'lucide-react';

const PillCamera = () => {
  const navigate = useNavigate();
  const { isSeniorMode: sr } = useSeniorMode();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [processing, setProcessing] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraReady(true);
      }
    } catch {
      setCameraError(true);
      toast.error('카메라에 접근할 수 없습니다. 권한을 확인해주세요.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const capture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      if (!blob) return;
      stopCamera();
      const file = new File([blob], 'pill.jpg', { type: 'image/jpeg' });
      handleFile(file);
    }, 'image/jpeg', 0.9);
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('이미지 파일만 가능합니다.');
      return;
    }
    setProcessing(true);
    navigate('/processing', { state: { image: file, type: 'pill' } });
  };

  const onInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { stopCamera(); handleFile(f); }
    e.target.value = '';
  };

  return (
    <div className="min-h-screen bg-foreground flex flex-col safe-area-padding relative overflow-hidden">
      <input ref={fileRef} type="file" accept="image/*" onChange={onInput} className="hidden" />
      <canvas ref={canvasRef} className="hidden" />

      {/* Live video background */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Back button */}
      <button onClick={() => { stopCamera(); navigate(-1); }} className="absolute top-5 left-4 z-10 p-2 text-primary-foreground">
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Camera viewfinder area */}
      <div className="flex-1 w-full flex flex-col items-center justify-center z-10 px-6">
        {/* Circular guide */}
        <div className="relative">
          <div className={`border-4 border-primary-foreground/60 rounded-full ${sr ? 'w-64 h-64' : 'w-52 h-52'}`} />
          {/* Corner marks */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary-foreground rounded-tl-2xl" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary-foreground rounded-tr-2xl" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary-foreground rounded-bl-2xl" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary-foreground rounded-br-2xl" />
        </div>

        {!cameraReady && !cameraError && (
          <div className="flex flex-col items-center gap-3 mt-6">
            <div className="w-8 h-8 border-3 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            <p className="text-primary-foreground/80 text-sm">카메라 연결 중...</p>
          </div>
        )}
        {cameraError && (
          <p className={`text-center text-primary-foreground/80 font-medium mt-6 ${sr ? 'text-xl' : 'text-base'}`}>
            카메라를 사용할 수 없습니다.<br />아래에서 파일을 업로드해주세요.
          </p>
        )}
        {cameraReady && (
          <>
            <p className={`text-center text-primary-foreground/90 font-medium mt-6 drop-shadow-md ${sr ? 'text-xl' : 'text-base'}`}>
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
      <div className="pb-10 pt-6 flex flex-col items-center gap-4 w-full px-6 z-10">
        <button
          onClick={capture}
          disabled={!cameraReady || processing}
          className={`rounded-full bg-primary-foreground flex items-center justify-center border-4 border-primary shadow-xl active:scale-90 transition-transform disabled:opacity-40 ${
            sr ? 'w-[72px] h-[72px]' : 'w-16 h-16'
          }`}
        >
          <div className={`rounded-full bg-primary-foreground border-2 border-primary/30 ${sr ? 'w-[60px] h-[60px]' : 'w-12 h-12'}`} />
        </button>
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
