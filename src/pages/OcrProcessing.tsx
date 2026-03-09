import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSeniorMode } from '@/contexts/SeniorModeContext';
import { medicineApi } from '@/api/medicine';
import { useTranslation } from 'react-i18next';

interface ProcessingStep {
  label: string;
  status: 'pending' | 'active' | 'done';
}

const OcrProcessing = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isSeniorMode: sr } = useSeniorMode();
  const { t } = useTranslation();
  const [steps, setSteps] = useState<ProcessingStep[]>([
    { label: t('ocr.step1'), status: 'active' },
    { label: t('ocr.step2'), status: 'pending' },
    { label: t('ocr.step3'), status: 'pending' },
  ]);

  useEffect(() => {
    const state = location.state as { image?: File; type?: string } | null;
    const timers: ReturnType<typeof setTimeout>[] = [];

    timers.push(setTimeout(() => {
      setSteps(prev => prev.map((s, i) => ({ ...s, status: i === 0 ? 'done' : i === 1 ? 'active' : 'pending' })));
    }, 1200));

    timers.push(setTimeout(() => {
      setSteps(prev => prev.map((s, i) => ({ ...s, status: i <= 1 ? 'done' : 'active' })));
    }, 2400));

    const processImage = async () => {
      if (state?.image) {
        try {
          if (state.type === 'prescription') {
            // 처방전 OCR (네이버 클로바 OCR)
            const result = await medicineApi.recognizePrescription(state.image);
            localStorage.setItem('ocr_result', JSON.stringify(result.items));
          } else {
            // 알약 이미지 인식
            const result = await medicineApi.recognizePill(state.image);
            localStorage.setItem('ocr_result', JSON.stringify([{
              name: result.medicine_name, dosage: t('sampleMeds.dose1tablet'), frequency: t('sampleMeds.twice'), duration: t('sampleMeds.days7'), schedule: t('sampleMeds.afterMeal'),
            }]));
          }
        } catch {
          // 백엔드 미연결 시 샘플 데이터
          localStorage.setItem('ocr_result', JSON.stringify([
            { name: t('sampleMeds.tylenol'), dosage: t('sampleMeds.dose1tablet'), frequency: t('sampleMeds.thrice'), duration: t('sampleMeds.days5'), schedule: t('sampleMeds.afterMeal30') },
            { name: t('sampleMeds.amoxicillin'), dosage: t('sampleMeds.dose1capsule'), frequency: t('sampleMeds.thrice'), duration: t('sampleMeds.days7'), schedule: t('sampleMeds.afterMeal') },
          ]));
        }
      } else {
        localStorage.setItem('ocr_result', JSON.stringify([
          { name: t('sampleMeds.amozaltan'), dosage: t('sampleMeds.dose1tablet'), frequency: t('sampleMeds.once'), duration: t('sampleMeds.days30'), schedule: t('sampleMeds.afterMealMorning') },
          { name: t('sampleMeds.rosuvastatin'), dosage: t('sampleMeds.dose1tablet'), frequency: t('sampleMeds.once'), duration: t('sampleMeds.days30'), schedule: t('sampleMeds.afterMealEvening') },
        ]));
      }
    };

    processImage();

    timers.push(setTimeout(() => {
      setSteps(prev => prev.map(s => ({ ...s, status: 'done' })));
    }, 3200));

    timers.push(setTimeout(() => {
      navigate('/result/check', { replace: true });
    }, 3800));

    return () => timers.forEach(clearTimeout);
  }, [navigate, location.state]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center safe-area-padding px-6">
      <h1 className={`font-bold text-foreground mb-2 ${sr ? 'text-3xl' : 'text-xl'}`}>{t('ocr.analyzing')}</h1>
      <p className={`text-muted-foreground mb-10 ${sr ? 'text-lg' : 'text-sm'}`}>{t('ocr.wait')}</p>

      <div className={`border-4 border-primary border-t-transparent rounded-full animate-spin mb-10 ${sr ? 'w-20 h-20' : 'w-14 h-14'}`} />

      <div className="w-full max-w-xs space-y-4">
        {steps.map((step, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <div className={`flex items-center justify-center rounded-full flex-shrink-0 transition-all duration-300 ${
              sr ? 'w-8 h-8' : 'w-6 h-6'
            } ${
              step.status === 'done' ? 'bg-primary' : step.status === 'active' ? 'bg-primary/30 animate-pulse' : 'bg-muted'
            }`}>
              {step.status === 'done' && <span className="text-primary-foreground text-xs font-bold">✓</span>}
              {step.status === 'active' && <div className="w-2 h-2 bg-primary rounded-full" />}
            </div>
            <span className={`font-medium transition-colors ${
              step.status === 'done' ? 'text-primary' : step.status === 'active' ? 'text-foreground' : 'text-muted-foreground'
            } ${sr ? 'text-lg' : 'text-sm'}`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>

      <div className="w-full max-w-xs mt-10 space-y-3">
        {[1, 2].map(i => (
          <div key={i} className="tds-card animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4 mb-2" />
            <div className="h-3 bg-muted rounded w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default OcrProcessing;