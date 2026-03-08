import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Image } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const FileUpload = () => {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) { toast.error(t('camera.imageOnly')); return; }
    navigate('/processing');
    setTimeout(() => {
      localStorage.setItem('ocr_result', JSON.stringify([
        { name: t('sampleMeds.tylenol'), dosage: t('sampleMeds.dose1tablet'), frequency: t('sampleMeds.thrice'), duration: t('sampleMeds.days5'), schedule: t('sampleMeds.afterMeal30') },
      ]));
      navigate('/result/check', { replace: true });
    }, 2500);
  };

  const onInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col safe-area-padding">
      <header className="tds-header">
        <div className="flex items-center h-14 px-4 border-b border-border">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2"><ArrowLeft className="w-6 h-6 text-foreground" /></button>
          <div className="flex-1 text-center"><span className="text-lg font-bold text-foreground">{t('upload.title')}</span></div>
          <div className="w-10" />
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6">
        <input ref={fileRef} type="file" accept="image/*" onChange={onInput} className="hidden" />

        <div className="w-full max-w-sm">
          <div className="tds-card flex flex-col items-center justify-center py-16 mb-6">
            <div className="w-20 h-20 rounded-2xl bg-accent flex items-center justify-center mb-4">
              <Image className="w-10 h-10 text-primary" />
            </div>
            <p className="text-muted-foreground text-sm">{t('upload.selectFromGallery')}</p>
          </div>

          <button onClick={() => fileRef.current?.click()} className="tds-button-primary w-full">
            {t('upload.openGallery')}
          </button>

          <p className="text-center text-xs text-muted-foreground mt-4">{t('upload.prescriptionToo')}</p>
        </div>
      </main>
    </div>
  );
};

export default FileUpload;
