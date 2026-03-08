import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { medicineApi } from '@/api/medicine';
import { Medicine } from '@/types/medicine';
import { ArrowLeft, Volume2, Eye, Download } from 'lucide-react';
import { useSeniorMode } from '@/contexts/SeniorModeContext';
import html2canvas from 'html2canvas';
import { useTranslation } from 'react-i18next';
import { Badge, FixedBottomCTA, CTAButton } from '@toss/tds-mobile';

const MedicationGuide = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isSeniorMode: sr } = useSeniorMode();
  const [medicine, setMedicine] = useState<Medicine | null>(null);
  const [loading, setLoading] = useState(true);
  const guideRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

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
          effect: '해열, 진통 (두통, 치통, 근육통, 허리통증, 생리통, 관절통)',
          dosage: '1회 1~2정, 1일 3~4회 (4시간 이상 간격)',
          schedule: '식후 30분',
          warning: '간 질환자 주의, 알코올과 함께 복용 금지\n1일 최대 4g 초과 금지',
          side_effect: '드물게 발진, 두드러기, 간 기능 이상',
          patient_explanation: '머리가 아프거나 열이 날 때 드시는 약이에요.\n하루 3번까지 드실 수 있고, 4시간 이상 간격을 두세요.',
          created_at: new Date().toISOString(),
        });
      } finally { setLoading(false); }
    };
    fetchGuide();
  }, [id]);

  const handleSaveImage = async () => {
    if (!guideRef.current) return;
    try {
      const canvas = await html2canvas(guideRef.current, { backgroundColor: '#ffffff', scale: 2 });
      const link = document.createElement('a');
      link.download = `guide_${medicine?.name || 'guide'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) { console.error(err); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground font-medium">{t('guide.loading')}</p>
        </div>
      </div>
    );
  }

  if (!medicine) return null;

  const sections = [
    { icon: '💊', title: t('guide.medName'), content: medicine.name, highlight: true },
    { icon: '✨', title: t('guide.efficacy'), content: medicine.effect },
    { icon: '📋', title: t('guide.dosage'), content: `${medicine.dosage}\n${t('guide.dosageTime', { time: medicine.schedule })}` },
    { icon: '⚠️', title: t('guide.warning'), content: medicine.warning, warning: true },
    { icon: '🔬', title: t('guide.sideEffect'), content: medicine.side_effect },
    { icon: '💬', title: t('guide.easyExplanation'), content: medicine.patient_explanation, easy: true },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col safe-area-padding">
      <header className="tds-header">
        <div className="flex items-center h-14 px-4 border-b border-border">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <div className="flex-1 text-center">
            <span className={`font-bold text-foreground ${sr ? 'text-xl' : 'text-lg'}`}>{t('guide.title')}</span>
          </div>
          <button onClick={handleSaveImage} className="p-2 -mr-2">
            <Download className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </header>

      <main className="flex-1 px-5 py-5 pb-48 overflow-y-auto">
        <div ref={guideRef} className="max-w-lg mx-auto space-y-4">
          {sections.map((sec, idx) => (
            <div
              key={idx}
              className={`tds-card ${
                sec.highlight ? 'bg-accent border-primary/30' :
                sec.warning ? 'border-destructive/20' :
                sec.easy ? 'bg-accent border-primary/20' : ''
              }`}
              style={sec.warning ? { backgroundColor: 'hsl(var(--destructive) / 0.04)' } : undefined}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={sr ? 'text-xl' : 'text-base'}>{sec.icon}</span>
                <h3 className={`font-bold ${
                  sec.warning ? 'text-destructive' : sec.highlight ? 'text-primary' : 'text-foreground'
                } ${sr ? 'text-lg' : 'text-sm'}`}>
                  {sec.title}
                </h3>
                {sec.warning && (
                  <Badge size="xsmall" color="red" variant="fill">
                    {t('guide.warning')}
                  </Badge>
                )}
              </div>
              <p className={`text-foreground leading-relaxed whitespace-pre-line ${sr ? 'text-base' : 'text-sm'}`}>
                {sec.content}
              </p>
            </div>
          ))}

          <div className="flex items-center gap-2 px-1">
            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
            <p className={`text-muted-foreground ${sr ? 'text-sm' : 'text-xs'}`}>{t('guide.source')}</p>
          </div>
        </div>
      </main>

      <FixedBottomCTA.Double
        leftButton={
          <CTAButton color="dark" variant="weak" onClick={() => navigate(`/guide/${id}/silver`)}>
            <span className="flex items-center justify-center gap-2">
              <Eye className={sr ? 'w-5 h-5' : 'w-4 h-4'} />
              {t('guide.silverView')}
            </span>
          </CTAButton>
        }
        rightButton={
          <CTAButton onClick={() => navigate('/ai-chat')}>
            {t('guide.askAI')}
          </CTAButton>
        }
        topAccessory={
          <div className="flex justify-center pb-2">
            <button
              onClick={() => navigate(`/guide/${id}/tts`)}
              className="flex items-center gap-2 text-muted-foreground text-sm"
            >
              <Volume2 className="w-4 h-4" />
              TTS
            </button>
          </div>
        }
      />
    </div>
  );
};

export default MedicationGuide;
