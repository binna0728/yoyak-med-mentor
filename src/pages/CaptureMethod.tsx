import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, FileText, Upload } from 'lucide-react';
import { useSeniorMode } from '@/contexts/SeniorModeContext';
import { useTranslation } from 'react-i18next';

const CaptureMethod = () => {
  const navigate = useNavigate();
  const { isSeniorMode: sr } = useSeniorMode();
  const { t } = useTranslation();

  const methods = [
    { icon: Camera, emoji: '📷', title: t('capture.pillPhoto'), desc: t('capture.pillPhotoDesc'), to: '/camera/pill' },
    { icon: FileText, emoji: '📄', title: t('capture.prescriptionPhoto'), desc: t('capture.prescriptionPhotoDesc'), to: '/camera/prescription' },
    { icon: Upload, emoji: '📁', title: t('capture.fileUpload'), desc: t('capture.fileUploadDesc'), to: '/upload' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col safe-area-padding">
      <header className="tds-header">
        <div className="flex items-center h-14 px-4 border-b border-border">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <div className="flex-1 text-center">
            <span className={`font-bold text-foreground ${sr ? 'text-xl' : 'text-lg'}`}>{t('capture.title')}</span>
          </div>
          <div className="w-10" />
        </div>
      </header>

      <main className="flex-1 px-5 py-6 max-w-lg mx-auto w-full flex flex-col">
        <p className={`text-muted-foreground mb-6 ${sr ? 'text-lg' : 'text-sm'}`}>{t('capture.howToRegister')}</p>

        <div className="space-y-3 flex-1">
          {methods.map(({ emoji, title, desc, to }) => (
            <button
              key={to}
              onClick={() => navigate(to)}
              className="tds-card w-full flex items-center gap-4 hover:border-primary transition-colors active:scale-[0.98]"
              style={{ minHeight: sr ? '120px' : '100px' }}
            >
              <div className={`rounded-2xl bg-accent flex items-center justify-center flex-shrink-0 ${sr ? 'w-16 h-16' : 'w-14 h-14'}`}>
                <span className={sr ? 'text-3xl' : 'text-2xl'}>{emoji}</span>
              </div>
              <div className="text-left flex-1">
                <p className={`font-semibold text-foreground ${sr ? 'text-xl' : 'text-base'}`}>{title}</p>
                <p className={`text-muted-foreground mt-0.5 ${sr ? 'text-base' : 'text-xs'}`}>{desc}</p>
              </div>
              <svg className="w-5 h-5 text-muted-foreground/50 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>

        <p className={`text-center text-muted-foreground py-6 ${sr ? 'text-base' : 'text-xs'}`}>
          {t('capture.footer')}
        </p>
      </main>
    </div>
  );
};

export default CaptureMethod;
