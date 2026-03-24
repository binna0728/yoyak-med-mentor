import { useState, useRef } from 'react';
import { medicineApi } from '@/api/medicine';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface PillRecognizerProps {
  onRecognized: (name: string) => void;
}

const PillRecognizer = ({ onRecognized }: PillRecognizerProps) => {
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error(t('pill.imageOnly'));
      return;
    }
    setIsRecognizing(true);
    setShowOptions(false);
    try {
      const result = await medicineApi.recognizePill(file);
      const drugName = result.detections?.[0]?.candidates?.[0]?.drug_name || '식별불가';
      onRecognized(drugName);
      toast.success(t('pill.recognized', { name: drugName }));
    } catch {
      toast.error(t('pill.recognizeFailed'));
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
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleInputChange} className="hidden" />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleInputChange} className="hidden" />

      <button onClick={() => setShowOptions(!showOptions)} disabled={isRecognizing}
        className="w-full h-12 rounded-xl border border-border bg-card text-foreground font-medium flex items-center justify-center gap-2 transition-all hover:border-primary hover:bg-accent active:scale-[0.98] disabled:opacity-50">
        {isRecognizing ? (
          <>
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span>{t('pill.recognizing')}</span>
          </>
        ) : (
          <>
            <span className="text-lg">📷</span>
            <span>{t('pill.recognizeBtn')}</span>
          </>
        )}
      </button>

      {showOptions && !isRecognizing && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-20">
          <button onClick={() => { cameraInputRef.current?.click(); setShowOptions(false); }}
            className="w-full px-4 py-3.5 text-left flex items-center gap-3 hover:bg-accent transition-colors">
            <span className="text-xl">📸</span>
            <span className="font-medium text-foreground">{t('pill.cameraShoot')}</span>
          </button>
          <div className="h-px bg-border" />
          <button onClick={() => { fileInputRef.current?.click(); setShowOptions(false); }}
            className="w-full px-4 py-3.5 text-left flex items-center gap-3 hover:bg-accent transition-colors">
            <span className="text-xl">🖼️</span>
            <span className="font-medium text-foreground">{t('pill.selectAlbum')}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default PillRecognizer;
