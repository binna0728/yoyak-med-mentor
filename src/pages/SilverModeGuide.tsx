import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { medicineApi } from '@/api/medicine';
import { Medicine } from '@/types/medicine';
import { ArrowLeft } from 'lucide-react';

const SilverModeGuide = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [medicine, setMedicine] = useState<Medicine | null>(null);
  const [loading, setLoading] = useState(true);

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
          effect: '열 내리고 통증 줄여주는 약', dosage: '1회 1~2정, 하루 2번',
          schedule: '식후 30분', warning: '간이 안 좋으신 분 주의, 술과 함께 X',
          side_effect: '드물게 발진',
          patient_explanation: '머리가 아프거나 열이 날 때 드시는 약이에요.',
          created_at: new Date().toISOString(),
        });
      } finally { setLoading(false); }
    };
    fetchGuide();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-card flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!medicine) return null;

  return (
    <div className="min-h-screen bg-card flex flex-col safe-area-padding">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2"><ArrowLeft className="w-7 h-7 text-foreground" /></button>
        <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider">SILVER</span>
        <div className="w-10" />
      </div>

      {/* Content */}
      <main className="flex-1 px-6 py-8 pb-32 overflow-y-auto">
        <div className="max-w-lg mx-auto space-y-8">
          <h1 className="font-bold text-foreground" style={{ fontSize: '32px', lineHeight: '1.4' }}>큰 글씨<br />복약 안내</h1>

          <div className="space-y-6" style={{ fontSize: '22px', lineHeight: '1.8' }}>
            <div className="tds-card border-2 border-primary/20 p-6">
              <p className="text-foreground">
                💊 이 약은 <strong className="text-primary">{medicine.effect}</strong>에 먹는 약이에요.
              </p>
            </div>

            <div className="tds-card border-2 border-border p-6">
              <p className="text-foreground">
                ⏰ <strong>하루 {medicine.dosage.includes('2') ? '2번' : '3번'}</strong> 드세요.<br />
                {medicine.schedule}에 복용하세요.
              </p>
            </div>

            <div className="tds-card border-2 p-6" style={{ borderColor: 'hsl(0 72% 51% / 0.3)', backgroundColor: 'hsl(0 72% 51% / 0.03)' }}>
              <p className="text-foreground">
                ⚠️ 어지러우면 복용을 중단하고<br />상담하세요.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-5 safe-area-padding">
        <div className="max-w-lg mx-auto space-y-3">
          <button onClick={() => navigate(`/guide/${id}/tts`)} className="tds-button-primary w-full" style={{ height: '56px', fontSize: '18px' }}>
            다음 안내
          </button>
          <button onClick={() => navigate('/ai-chat')} className="tds-button-secondary w-full" style={{ height: '56px', fontSize: '18px' }}>
            AI에게 묻기
          </button>
        </div>
      </div>
    </div>
  );
};

export default SilverModeGuide;
