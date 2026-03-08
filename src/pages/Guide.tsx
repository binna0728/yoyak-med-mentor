import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { medicineApi } from '@/api/medicine';
import { Medicine } from '@/types/medicine';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import html2canvas from 'html2canvas';
import TTSPlayer from '@/components/TTSPlayer';

const Guide = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [medicine, setMedicine] = useState<Medicine | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const guideRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchGuide = async () => {
      if (!id) return;
      try {
        const cached = localStorage.getItem(`guide_${id}`);
        if (cached) {
          setMedicine(JSON.parse(cached));
        } else {
          const data = await medicineApi.getGuideById(id);
          setMedicine(data);
        }
      } catch {
        setMedicine({
          id: id || '1', name: '타이레놀 500mg',
          effect: '해열, 진통 (두통, 치통, 근육통, 허리통증, 생리통, 관절통)',
          dosage: '1회 1~2정, 1일 3~4회 (4시간 이상 간격)',
          schedule: '식후 30분',
          warning: '간 질환자 주의, 알코올과 함께 복용 금지, 하루 최대 4,000mg 초과 금지',
          side_effect: '드물게 발진, 간 기능 이상, 알레르기 반응',
          patient_explanation: '머리가 아프거나 열이 날 때 드시는 약이에요. 밥 먹고 30분 후에 한 알씩 드시면 되고, 하루에 4번까지 드실 수 있어요.',
          created_at: new Date().toISOString(),
        });
      } finally {
        setLoading(false);
      }
    };
    fetchGuide();
  }, [id]);

  const handleSaveImage = async () => {
    if (!guideRef.current) return;
    setSaving(true);
    try {
      const canvas = await html2canvas(guideRef.current, { backgroundColor: '#ffffff', scale: 2 });
      const link = document.createElement('a');
      link.download = `복약안내_${medicine?.name || 'guide'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Failed to save image:', error);
    } finally {
      setSaving(false);
    }
  };

  const buildTTSText = (m: Medicine) =>
    `${m.name}. 효능: ${m.effect}. 복용 방법: ${m.dosage}. 복용 시간: ${m.schedule}. 주의사항: ${m.warning}. 부작용: ${m.side_effect}. ${m.patient_explanation}`;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground font-medium">약 정보를 분석하고 있어요...</p>
          <p className="text-sm text-muted-foreground">잠시만 기다려주세요</p>
        </div>
      </div>
    );
  }

  if (!medicine) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center space-y-3">
            <p className="text-4xl">😥</p>
            <p className="text-foreground font-semibold">약 정보를 찾지 못했어요</p>
            <p className="text-muted-foreground text-sm">약 이름을 다시 확인해주세요.</p>
            <Button onClick={() => navigate('/dashboard')} className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground">
              다시 검색하기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background safe-area-padding pb-32">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card border-b border-border">
        <div className="flex items-center justify-between px-4 h-14 max-w-3xl mx-auto">
          <button onClick={() => navigate('/dashboard')} className="p-2 -ml-2">
            <svg className="w-6 h-6 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="font-semibold text-lg text-foreground">복약 안내</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Guide Content */}
      <div ref={guideRef} className="p-4 space-y-4 max-w-3xl mx-auto">
        <Card className="border-primary/20 bg-accent">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl text-primary flex items-center gap-2">💊 {medicine.name}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2">✨ 효능/효과</CardTitle></CardHeader>
          <CardContent><p className="text-foreground">{medicine.effect}</p></CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2">📋 복용 방법</CardTitle></CardHeader>
          <CardContent><p className="text-foreground">{medicine.dosage}</p></CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2">⏰ 복용 시간</CardTitle></CardHeader>
          <CardContent><p className="text-foreground">{medicine.schedule}</p></CardContent>
        </Card>

        <Card className="border-destructive/20 bg-destructive/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-destructive">⚠️ 주의사항</CardTitle>
          </CardHeader>
          <CardContent><p className="text-foreground">{medicine.warning}</p></CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2">💡 흔한 부작용</CardTitle></CardHeader>
          <CardContent><p className="text-foreground">{medicine.side_effect}</p></CardContent>
        </Card>

        <Card className="border-primary bg-accent">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-primary">🗣️ 쉬운 설명</CardTitle>
          </CardHeader>
          <CardContent><p className="text-foreground leading-relaxed">{medicine.patient_explanation}</p></CardContent>
        </Card>
      </div>

      {/* TTS Player */}
      <div className="px-4 mt-4 max-w-3xl mx-auto">
        <TTSPlayer guideId={id || ''} textContent={buildTTSText(medicine)} />
      </div>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 safe-area-padding">
        <div className="flex gap-3 max-w-3xl mx-auto">
          <Button onClick={() => navigate(`/guide/${id}/senior`)} className="flex-1 h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl">
            👴 시니어 모드
          </Button>
          <Button onClick={handleSaveImage} disabled={saving} variant="outline" className="h-12 px-4 rounded-xl">
            {saving ? '저장 중...' : '📸'}
          </Button>
          <Button onClick={() => navigate('/dashboard')} variant="outline" className="h-12 px-4 rounded-xl">
            🔄
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Guide;
