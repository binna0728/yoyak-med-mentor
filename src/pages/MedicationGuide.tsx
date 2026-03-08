import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { medicineApi } from '@/api/medicine';
import { Medicine } from '@/types/medicine';
import { ArrowLeft, Volume2, Eye, Download } from 'lucide-react';
import { useSeniorMode } from '@/contexts/SeniorModeContext';
import html2canvas from 'html2canvas';

const MedicationGuide = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isSeniorMode: sr } = useSeniorMode();
  const [medicine, setMedicine] = useState<Medicine | null>(null);
  const [loading, setLoading] = useState(true);
  const guideRef = useRef<HTMLDivElement>(null);

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
      link.download = `복약안내_${medicine?.name || 'guide'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) { console.error(err); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground font-medium">약 정보를 불러오고 있어요...</p>
        </div>
      </div>
    );
  }

  if (!medicine) return null;

  const sections = [
    { icon: '💊', title: '약 이름', content: medicine.name, highlight: true },
    { icon: '✨', title: '효능·효과', content: medicine.effect },
    { icon: '📋', title: '복용 방법', content: `${medicine.dosage}\n복용 시간: ${medicine.schedule}` },
    { icon: '⚠️', title: '주의사항', content: medicine.warning, warning: true },
    { icon: '🔬', title: '부작용', content: medicine.side_effect },
    { icon: '💬', title: '쉬운 설명', content: medicine.patient_explanation, easy: true },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col safe-area-padding">
      {/* Header */}
      <header className="tds-header">
        <div className="flex items-center h-14 px-4 border-b border-border">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <div className="flex-1 text-center">
            <span className={`font-bold text-foreground ${sr ? 'text-xl' : 'text-lg'}`}>복약 방법과 주의사항</span>
          </div>
          <button onClick={handleSaveImage} className="p-2 -mr-2">
            <Download className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </header>

      {/* Content */}
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
              </div>
              <p className={`text-foreground leading-relaxed whitespace-pre-line ${sr ? 'text-base' : 'text-sm'}`}>
                {sec.content}
              </p>
            </div>
          ))}

          {/* Source */}
          <div className="flex items-center gap-2 px-1">
            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
            <p className={`text-muted-foreground ${sr ? 'text-sm' : 'text-xs'}`}>
              식약처/의학정보 기반 · AI 자동생성 안내
            </p>
          </div>
        </div>
      </main>

      {/* Bottom action buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 safe-area-padding">
        <div className="max-w-lg mx-auto space-y-2">
          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/guide/${id}/silver`)}
              className={`tds-button-secondary flex-1 flex items-center justify-center gap-2 ${sr ? 'text-lg' : ''}`}
            >
              <Eye className={sr ? 'w-6 h-6' : 'w-5 h-5'} />
              실버모드 보기
            </button>
            <button
              onClick={() => navigate(`/guide/${id}/tts`)}
              className={`tds-button-secondary flex items-center justify-center gap-2 ${sr ? 'px-6' : 'px-5'}`}
            >
              <Volume2 className={sr ? 'w-6 h-6' : 'w-5 h-5'} />
            </button>
          </div>
          <button
            onClick={() => navigate('/ai-chat')}
            className={`tds-button-primary w-full flex items-center justify-center gap-2 ${sr ? 'text-lg' : ''}`}
          >
            🤖 AI에게 더 물어보기
          </button>
        </div>
      </div>
    </div>
  );
};

export default MedicationGuide;
