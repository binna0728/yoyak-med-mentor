import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { medicineApi } from '@/api/medicine';
import { Medicine } from '@/types/medicine';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import TTSPlayer from '@/components/TTSPlayer';

const SeniorMode = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [medicine, setMedicine] = useState<Medicine | null>(null);
  const [loading, setLoading] = useState(true);

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
          effect: '열 내리고 통증 줄여주는 약',
          dosage: '1회 1~2정, 1일 3~4회',
          schedule: '식후 30분',
          warning: '간이 안 좋으신 분 주의, 술과 함께 X',
          side_effect: '드물게 발진',
          patient_explanation: '머리가 아프거나 열이 날 때 드시는 약이에요.',
          created_at: new Date().toISOString(),
        });
      } finally {
        setLoading(false);
      }
    };
    fetchGuide();
  }, [id]);

  const buildTTSText = (m: Medicine) =>
    `${m.name}. 이 약은 ${m.effect}에 먹는 약이에요. ${m.dosage}만큼 드시면 됩니다. ${m.schedule}에 드세요. 주의할 점은 ${m.warning}입니다. ${m.patient_explanation}`;

  if (loading) {
    return (
      <div className="min-h-screen bg-card flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-lg">불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!medicine) {
    return (
      <div className="min-h-screen bg-card flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 text-center">
            <p className="text-muted-foreground text-xl">정보를 찾을 수 없습니다</p>
            <Button onClick={() => navigate(`/guide/${id}`)} className="mt-6 text-lg h-14 px-8">돌아가기</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-card safe-area-padding">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-primary text-primary-foreground">
        <div className="flex items-center justify-center px-6 py-6 max-w-3xl mx-auto">
          <h1 className="font-bold text-2xl">💊 {medicine.name}</h1>
        </div>
      </div>

      {/* Senior-friendly Content */}
      <div className="p-6 space-y-8 pb-44 max-w-3xl mx-auto" style={{ fontSize: '22px', lineHeight: '1.8' }}>
        {/* TTS Player - prominent in senior mode */}
        <TTSPlayer guideId={id || ''} textContent={buildTTSText(medicine)} />

        {/* 쉬운 설명 */}
        <Card className="border-2 border-primary bg-accent">
          <CardContent className="pt-6">
            <p className="font-medium" style={{ fontSize: '22px', lineHeight: '1.8' }}>
              {medicine.patient_explanation}
            </p>
          </CardContent>
        </Card>

        {/* 이 약은 어떤 약인지 */}
        <Card className="border-2 border-border">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <span className="text-4xl flex-shrink-0">💊</span>
              <div>
                <h3 className="font-bold text-primary mb-2" style={{ fontSize: '20px' }}>이 약은 이런 약이에요</h3>
                <p style={{ fontSize: '22px', lineHeight: '1.8' }}>{medicine.effect}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 복용법 */}
        <Card className="border-2 border-border">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <span className="text-4xl flex-shrink-0">📋</span>
              <div>
                <h3 className="font-bold text-primary mb-2" style={{ fontSize: '20px' }}>이렇게 드세요</h3>
                <p style={{ fontSize: '22px', lineHeight: '1.8' }}>{medicine.dosage}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 복용 시간 */}
        <Card className="border-2 border-border">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <span className="text-4xl flex-shrink-0">⏰</span>
              <div>
                <h3 className="font-bold text-primary mb-2" style={{ fontSize: '20px' }}>이 시간에 드세요</h3>
                <p style={{ fontSize: '22px', lineHeight: '1.8' }}>{medicine.schedule}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 주의사항 */}
        <Card className="border-2 border-destructive/30 bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <span className="text-4xl flex-shrink-0">⚠️</span>
              <div>
                <h3 className="font-bold text-destructive mb-2" style={{ fontSize: '20px' }}>이것을 조심하세요</h3>
                <p style={{ fontSize: '22px', lineHeight: '1.8' }}>{medicine.warning}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 부작용 */}
        <Card className="border-2 border-border">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <span className="text-4xl flex-shrink-0">💡</span>
              <div>
                <h3 className="font-bold text-primary mb-2" style={{ fontSize: '20px' }}>부작용이 있을 수 있어요</h3>
                <p style={{ fontSize: '22px', lineHeight: '1.8' }}>{medicine.side_effect}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Close Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t-2 border-border p-6 safe-area-padding">
        <Button
          onClick={() => navigate(`/guide/${id}`)}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-bold max-w-3xl mx-auto block"
          style={{ height: '56px', fontSize: '20px' }}
        >
          ✓ 확인했습니다
        </Button>
      </div>
    </div>
  );
};

export default SeniorMode;
