import { useState, useRef } from 'react';
import { medicineApi } from '@/api/medicine';
import { toast } from 'sonner';

interface PillRecognizerProps {
  onRecognized: (name: string) => void;
}

const PillRecognizer = ({ onRecognized }: PillRecognizerProps) => {
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('이미지 파일만 업로드할 수 있어요.');
      return;
    }

    setIsRecognizing(true);
    setShowOptions(false);

    try {
      const result = await medicineApi.recognizePill(file);
      onRecognized(result.medicine_name);
      toast.success(`"${result.medicine_name}" 인식 완료!`);
    } catch {
      toast.error('알약을 인식하지 못했어요. 약 이름을 직접 입력해주세요.');
    } finally {
      setIsRecognizing(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  return (
    <div className="relative">
      {/* Hidden inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Trigger button */}
      <button
        onClick={() => setShowOptions(!showOptions)}
        disabled={isRecognizing}
        className="w-full h-12 rounded-xl border border-border bg-card text-foreground font-medium flex items-center justify-center gap-2 transition-all hover:border-primary hover:bg-accent active:scale-[0.98] disabled:opacity-50"
      >
        {isRecognizing ? (
          <>
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span>알약을 분석하고 있어요...</span>
          </>
        ) : (
          <>
            <span className="text-lg">📷</span>
            <span>알약 사진으로 인식하기</span>
          </>
        )}
      </button>

      {/* Options dropdown */}
      {showOptions && !isRecognizing && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-20">
          <button
            onClick={() => {
              cameraInputRef.current?.click();
              setShowOptions(false);
            }}
            className="w-full px-4 py-3.5 text-left flex items-center gap-3 hover:bg-accent transition-colors"
          >
            <span className="text-xl">📸</span>
            <span className="font-medium text-foreground">카메라로 촬영</span>
          </button>
          <div className="h-px bg-border" />
          <button
            onClick={() => {
              fileInputRef.current?.click();
              setShowOptions(false);
            }}
            className="w-full px-4 py-3.5 text-left flex items-center gap-3 hover:bg-accent transition-colors"
          >
            <span className="text-xl">🖼️</span>
            <span className="font-medium text-foreground">앨범에서 선택</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default PillRecognizer;
