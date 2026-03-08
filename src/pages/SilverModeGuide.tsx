import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { medicineApi } from '@/api/medicine';
import { Medicine } from '@/types/medicine';
import { ArrowLeft, Volume2, ChevronRight, ChevronLeft } from 'lucide-react';

const SilverModeGuide = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [medicine, setMedicine] = useState<Medicine | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const fetchGuide = async () => {
      if (!id) return;
      try {
        const cached = localStorage.getItem(`guide_${id}`);
        if (cached) { setMedicine(JSON.parse(cached)); }
        else { const data = await medicineApi.getGuideById(id); setMedicine(data); }
      } catch {
        setMedicine({
          id: id || '1', name: '타이레놀 500mg',
          effect: '열 내리고 통증 줄여주는 약', dosage: '1회 1~2정, 하루 3번까지',
          schedule: '식후 30분', warning: '간이 안 좋으신 분은 주의하세요.\n술과 함께 드시면 안 됩니다.',
          side_effect: '드물게 발진이 생길 수 있어요.',
          patient_explanation: '머리가 아프거나 열이 날 때 드시는 약이에요.\n4시간 이상 간격을 두고 드세요.',
          created_at: new Date().toISOString(),
        });
      } finally { setLoading(false); }
    };
    fetchGuide();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-card flex items-center justify-center">
        <div className="w-14 h-14 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!medicine) return null;

  const steps = [
    {
      icon: '💊',
      title: '이 약은 무엇인가요?',
      content: `${medicine.name}\n\n${medicine.patient_explanation || medicine.effect}`,
    },
    {
      icon: '⏰',
      title: '어떻게 드시나요?',
      content: `${medicine.dosage}\n\n${medicine.schedule}에 드세요.`,
    },
    {
      icon: '⚠️',
      title: '주의할 점이에요',
      content: `${medicine.warning}\n\n${medicine.side_effect ? `부작용: ${medicine.side_effect}` : ''}`,
    },
  ];

  const currentStep = steps[step];
  const isLast = step === steps.length - 1;
  const isFirst = step === 0;

  return (
    <div className="min-h-screen bg-card flex flex-col safe-area-padding">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2">
          <ArrowLeft className="w-7 h-7 text-foreground" />
        </button>
        <span className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-bold uppercase tracking-wider">
          SILVER
        </span>
        <button onClick={() => navigate(`/guide/${id}/tts`)} className="p-2 -mr-2">
          <Volume2 className="w-6 h-6 text-primary" />
        </button>
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 pt-6 pb-2">
        {steps.map((_, idx) => (
          <div
            key={idx}
            className={`rounded-full transition-all ${
              idx === step ? 'w-8 h-2 bg-primary' : 'w-2 h-2 bg-border'
            }`}
          />
        ))}
      </div>

      {/* Content */}
      <main className="flex-1 px-6 py-6 pb-48 overflow-y-auto">
        <div className="max-w-lg mx-auto">
          {/* Big title */}
          <h1 className="font-bold text-foreground mb-6" style={{ fontSize: '32px', lineHeight: '1.4' }}>
            큰 글씨<br />복약 안내
          </h1>

          {/* Step card */}
          <div
            className={`tds-card border-2 p-8 ${
              currentStep.icon === '⚠️'
                ? 'border-destructive/30'
                : 'border-primary/20'
            }`}
            style={currentStep.icon === '⚠️' ? { backgroundColor: 'hsl(var(--destructive) / 0.03)' } : undefined}
          >
            <div className="flex items-center gap-3 mb-5">
              <span style={{ fontSize: '36px' }}>{currentStep.icon}</span>
              <h2 className="font-bold text-foreground" style={{ fontSize: '24px' }}>
                {currentStep.title}
              </h2>
            </div>
            <p
              className="text-foreground whitespace-pre-line"
              style={{ fontSize: '22px', lineHeight: '1.8' }}
            >
              {currentStep.content}
            </p>
          </div>

          {/* Step counter */}
          <p className="text-center text-muted-foreground mt-6" style={{ fontSize: '18px' }}>
            {step + 1} / {steps.length}
          </p>
        </div>
      </main>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-5 safe-area-padding">
        <div className="max-w-lg mx-auto space-y-3">
          <div className="flex gap-3">
            {!isFirst && (
              <button
                onClick={() => setStep(s => s - 1)}
                className="tds-button-secondary flex items-center justify-center gap-2 flex-1"
                style={{ height: '64px', fontSize: '20px' }}
              >
                <ChevronLeft className="w-6 h-6" />
                이전
              </button>
            )}
            <button
              onClick={() => isLast ? navigate('/ai-chat') : setStep(s => s + 1)}
              className="tds-button-primary flex items-center justify-center gap-2 flex-1"
              style={{ height: '64px', fontSize: '20px' }}
            >
              {isLast ? (
                <>🤖 AI에게 묻기</>
              ) : (
                <>다음 안내 <ChevronRight className="w-6 h-6" /></>
              )}
            </button>
          </div>
          {!isLast && (
            <button
              onClick={() => navigate(`/guide/${id}/tts`)}
              className="tds-button-secondary w-full flex items-center justify-center gap-2"
              style={{ height: '56px', fontSize: '18px' }}
            >
              <Volume2 className="w-6 h-6" />
              음성으로 듣기
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SilverModeGuide;
