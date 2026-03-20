import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Image } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useSeniorMode } from '@/contexts/SeniorModeContext';

const FileUpload = () => {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();
  const { isSeniorMode: sr } = useSeniorMode();

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) { toast.error(t('camera.imageOnly')); return; }
    navigate('/processing', { state: { image: file, type: 'prescription' } });
  };

  const onInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">

      <main className="flex-1 flex flex-col items-center justify-center px-6">
        <input ref={fileRef} type="file" accept="image/*" onChange={onInput} className="hidden" />

        <div className="w-full max-w-sm">
          <div className="tds-card flex flex-col items-center justify-center py-16 mb-6">
            <div className={`rounded-2xl bg-accent flex items-center justify-center mb-4 ${sr ? 'w-28 h-28' : 'w-20 h-20'}`}>
              <Image className={`text-primary ${sr ? 'w-14 h-14' : 'w-10 h-10'}`} />
            </div>
            <p className={`text-muted-foreground ${sr ? 'text-base' : 'text-sm'}`}>{t('upload.selectFromGallery')}</p>
          </div>

          <button onClick={() => fileRef.current?.click()} className={`tds-button-primary w-full ${sr ? 'h-14 text-lg' : ''}`}>
            {t('upload.openGallery')}
          </button>

          <p className={`text-center text-muted-foreground mt-4 ${sr ? 'text-sm' : 'text-xs'}`}>{t('upload.prescriptionToo')}</p>
        </div>
      </main>
    </div>
  );
};

export default FileUpload;
