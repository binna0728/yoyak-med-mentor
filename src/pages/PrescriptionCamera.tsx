import { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Upload } from 'lucide-react';

const PrescriptionCamera = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(false);

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
      handleFile(new File([blob], 'prescription.jpg', { type: 'image/jpeg' }));
    }, 'image/jpeg', 0.9);
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) { toast.error('이미지 파일만 가능합니다.'); return; }
    navigate('/processing');
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
    if (f) { stopCamera(); handleFile(f); }
  };

  return (
    <div className="min-h-screen bg-foreground flex flex-col items-center justify-center safe-area-padding relative overflow-hidden">
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

      {/* Dark overlay with cutout effect */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Guide frame */}
      <div className="flex-1 w-full flex flex-col items-center justify-center z-10 px-4">
        <div className="w-[85vw] h-[60vh] border-4 border-dashed border-primary-foreground/70 rounded-3xl flex items-center justify-center relative">
          {!cameraReady && !cameraError && (
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-3 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              <p className="text-primary-foreground/80 text-sm">카메라 연결 중...</p>
            </div>
          )}
          {cameraError && (
            <p className="text-center text-primary-foreground/80 text-lg font-medium px-4">
              카메라를 사용할 수 없습니다.<br />아래 버튼으로 파일을 업로드해주세요.
            </p>
          )}
          {cameraReady && (
            <p className="text-center text-lg font-medium text-primary-foreground/90 drop-shadow-md">
              처방전/약봉투를<br />프레임 안에 맞춰주세요
            </p>
          )}
        </div>
      </div>

      {/* Bottom controls */}
      <div className="pb-12 pt-6 flex flex-col items-center gap-4 w-full px-6 z-10">
        <button
          onClick={capture}
          disabled={!cameraReady}
          className="w-20 h-20 rounded-full bg-primary-foreground flex items-center justify-center border-4 border-primary shadow-lg active:scale-90 transition-transform disabled:opacity-40"
        >
          <div className="w-16 h-16 rounded-full bg-primary-foreground border-2 border-primary/20" />
        </button>
        <button onClick={() => fileRef.current?.click()} className="flex items-center gap-2 text-primary-foreground/80 text-sm font-medium">
          <Upload className="w-4 h-4" />
          파일로 업로드
        </button>
      </div>

      <button onClick={() => { stopCamera(); navigate(-1); }} className="absolute top-4 left-4 p-2 text-primary-foreground z-10">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
      </button>
    </div>
  );
};

export default PrescriptionCamera;
