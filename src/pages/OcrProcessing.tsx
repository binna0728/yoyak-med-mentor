import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSeniorMode } from '@/contexts/SeniorModeContext';
import { medicineApi } from '@/api/medicine';

interface ProcessingStep {
  label: string;
  status: 'pending' | 'active' | 'done';
}

const OcrProcessing = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isSeniorMode: sr } = useSeniorMode();
  const [steps, setSteps] = useState<ProcessingStep[]>([
    { label: '이미지 분석 중', status: 'active' },
    { label: '약 인식 중', status: 'pending' },
    { label: '정보 조회 중', status: 'pending' },
  ]);

  useEffect(() => {
    const state = location.state as { image?: File; type?: string } | null;

    // Simulate step progression
    const timers: ReturnType<typeof setTimeout>[] = [];

    timers.push(setTimeout(() => {
      setSteps(prev => prev.map((s, i) => ({
        ...s,
        status: i === 0 ? 'done' : i === 1 ? 'active' : 'pending',
      })));
    }, 1200));

    timers.push(setTimeout(() => {
      setSteps(prev => prev.map((s, i) => ({
        ...s,
        status: i <= 1 ? 'done' : 'active',
      })));
    }, 2400));

    // Attempt real API call or fallback
    const processImage = async () => {
      if (state?.image) {
        try {
          const result = await medicineApi.recognizePill(state.image);
          localStorage.setItem('ocr_result', JSON.stringify([{
            name: result.medicine_name,
            dosage: '1회 1정',
            frequency: '1일 2회',
            duration: '7일',
            schedule: '식후',
          }]));
        } catch {
          // Use demo data on failure
          localStorage.setItem('ocr_result', JSON.stringify([
            { name: '타이레놀 500mg', dosage: '1회 1정', frequency: '1일 3회', duration: '5일', schedule: '식후 30분' },
            { name: '아목시실린 250mg', dosage: '1회 1캡슐', frequency: '1일 3회', duration: '7일', schedule: '식후' },
          ]));
        }
      } else {
        // No image — demo data
        localStorage.setItem('ocr_result', JSON.stringify([
          { name: '아모잘탄정 5/50mg', dosage: '1회 1정', frequency: '1일 1회', duration: '30일', schedule: '아침 식후' },
          { name: '로수바스타틴 10mg', dosage: '1회 1정', frequency: '1일 1회', duration: '30일', schedule: '저녁 식후' },
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
      <h1 className={`font-bold text-foreground mb-2 ${sr ? 'text-3xl' : 'text-xl'}`}>AI가 약을 분석하고 있어요</h1>
      <p className={`text-muted-foreground mb-10 ${sr ? 'text-lg' : 'text-sm'}`}>잠시만 기다려주세요...</p>

      {/* Animated spinner */}
      <div className={`border-4 border-primary border-t-transparent rounded-full animate-spin mb-10 ${sr ? 'w-20 h-20' : 'w-14 h-14'}`} />

      {/* Step indicators */}
      <div className="w-full max-w-xs space-y-4">
        {steps.map((step, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <div className={`flex items-center justify-center rounded-full flex-shrink-0 transition-all duration-300 ${
              sr ? 'w-8 h-8' : 'w-6 h-6'
            } ${
              step.status === 'done'
                ? 'bg-primary'
                : step.status === 'active'
                ? 'bg-primary/30 animate-pulse'
                : 'bg-muted'
            }`}>
              {step.status === 'done' && (
                <span className="text-primary-foreground text-xs font-bold">✓</span>
              )}
              {step.status === 'active' && (
                <div className="w-2 h-2 bg-primary rounded-full" />
              )}
            </div>
            <span className={`font-medium transition-colors ${
              step.status === 'done'
                ? 'text-primary'
                : step.status === 'active'
                ? 'text-foreground'
                : 'text-muted-foreground'
            } ${sr ? 'text-lg' : 'text-sm'}`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>

      {/* Skeleton cards */}
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
