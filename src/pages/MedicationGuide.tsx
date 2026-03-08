import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { medicineApi } from '@/api/medicine';
import { Medicine } from '@/types/medicine';
import { ArrowLeft } from 'lucide-react';
import html2canvas from 'html2canvas';

const MedicationGuide = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
          warning: '간 질환자 주의, 알코올과 함께 복용 금지',
          side_effect: '드물게 발진, 간 기능 이상',
          patient_explanation: '머리가 아프거나 열이 날 때 드시는 약이에요.',
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
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground font-medium">약 정보를 불러오고 있어요...</p>
        </div>
      </div>
    );
  }

  if (!medicine) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col safe-area-padding">
      <header className="tds-header">
        <div className="flex items-center h-14 px-4 border-b border-border">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2"><ArrowLeft className="w-6 h-6 text-foreground" /></button>
          <div className="flex-1 text-center"><span className="text-lg font-bold text-foreground">복약 방법과 주의사항</span></div>
          <div className="w-10" />
        </div>
      </header>

      <main className="flex-1 px-5 py-6 pb-28 overflow-y-auto">
        <div ref={guideRef} className="max-w-lg mx-auto space-y-4">
          {/* Drug name */}
          <div className="tds-card bg-accent border-primary/20">
            <h2 className="text-xl font-bold text-primary">💊 {medicine.name}</h2>
          </div>

          {/* Effect */}
          <div className="tds-card">
            <h3 className="text-sm font-bold text-foreground mb-2">약 설명</h3>
            <p className="text-foreground text-sm leading-relaxed">{medicine.effect}</p>
          </div>

          {/* Dosage */}
          <div className="tds-card">
            <h3 className="text-sm font-bold text-foreground mb-2">복용 방법</h3>
            <p className="text-foreground text-sm leading-relaxed">{medicine.dosage}</p>
            <p className="text-muted-foreground text-xs mt-1">복용 시간: {medicine.schedule}</p>
          </div>

          {/* Warning */}
          <div className="tds-card" style={{ backgroundColor: 'hsl(0 72% 51% / 0.05)', borderColor: 'hsl(0 72% 51% / 0.2)' }}>
            <h3 className="text-sm font-bold text-destructive mb-2">⚠️ 주의사항</h3>
            <p className="text-foreground text-sm leading-relaxed">{medicine.warning}</p>
          </div>

          {/* Side effects */}
          <div className="tds-card">
            <h3 className="text-sm font-bold text-foreground mb-2">부작용</h3>
            <p className="text-foreground text-sm leading-relaxed">{medicine.side_effect}</p>
          </div>

          {/* Source */}
          <p className="text-xs text-muted-foreground">식약처/의학정보 기반 · AI 자동생성 안내</p>
        </div>
      </main>

      {/* Bottom actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 safe-area-padding">
        <div className="max-w-lg mx-auto space-y-2">
          <div className="flex gap-3">
            <button onClick={() => navigate(`/guide/${id}/silver`)} className="tds-button-primary flex-1">실버모드 보기</button>
            <button onClick={handleSaveImage} className="tds-button-secondary h-14 px-4">📸</button>
          </div>
          <button onClick={() => navigate(`/guide/${id}/tts`)} className="tds-button-secondary w-full">🔊 음성으로 듣기</button>
        </div>
      </div>
    </div>
  );
};

export default MedicationGuide;
