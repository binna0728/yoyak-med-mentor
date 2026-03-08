import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { medicineApi } from '@/api/medicine';
import { Medicine } from '@/types/medicine';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const PatientMode = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [medicine, setMedicine] = useState<Medicine | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGuide = async () => {
      if (!id) return;
      
      try {
        // 로컬 스토리지에서 임시 데이터 확인
        const cached = localStorage.getItem(`guide_${id}`);
        if (cached) {
          setMedicine(JSON.parse(cached));
        } else {
          const data = await medicineApi.getGuideById(id);
          setMedicine(data);
        }
      } catch (error) {
        console.error('Failed to fetch guide:', error);
        // 데모 데이터
        setMedicine({
          id: id || '1',
          name: '타이레놀 500mg',
          effect: '해열, 진통 (두통, 치통, 근육통, 허리통증, 생리통, 관절통)',
          dosage: '1회 1~2정, 1일 3~4회 (4시간 이상 간격)',
          schedule: '식후 30분',
          warning: '간 질환자 주의, 알코올과 함께 복용 금지, 하루 최대 4,000mg 초과 금지',
          side_effect: '드물게 발진, 간 기능 이상, 알레르기 반응',
          patient_explanation: '머리가 아프거나 열이 날 때 드시는 약이에요. 밥 먹고 30분 후에 한 알씩 드시면 되고, 하루에 4번까지 드실 수 있어요. 술과 함께 드시면 안 되고, 간이 안 좋으신 분은 꼭 의사 선생님께 말씀해주세요.',
          created_at: new Date().toISOString(),
        });
      } finally {
        setLoading(false);
      }
    };

    fetchGuide();
  }, [id]);

  const handleClose = () => {
    navigate(`/guide/${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-lg">불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!medicine) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 text-center">
            <p className="text-gray-500 text-xl">정보를 찾을 수 없습니다</p>
            <Button onClick={handleClose} className="mt-6 text-lg h-14 px-8">
              돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white safe-area-top safe-area-bottom">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-primary text-white">
        <div className="flex items-center justify-center px-6 py-6">
          <h1 className="font-bold text-2xl">💊 {medicine.name}</h1>
        </div>
      </div>

      {/* Patient-friendly Content */}
      <div className="p-6 space-y-6 pb-32">
        {/* 쉬운 설명 - 가장 먼저 */}
        <Card className="border-2 border-primary bg-blue-50">
          <CardContent className="pt-6">
            <p className="text-xl leading-relaxed text-gray-800 font-medium">
              {medicine.patient_explanation}
            </p>
          </CardContent>
        </Card>

        {/* 복용 방법 */}
        <Card className="border-2 border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <span className="text-4xl">💊</span>
              <div>
                <h3 className="text-lg font-bold text-gray-700 mb-2">복용법</h3>
                <p className="text-xl text-gray-800">{medicine.dosage}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 복용 시간 */}
        <Card className="border-2 border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <span className="text-4xl">⏰</span>
              <div>
                <h3 className="text-lg font-bold text-gray-700 mb-2">복용 시간</h3>
                <p className="text-xl text-gray-800">{medicine.schedule}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 주의사항 */}
        <Card className="border-2 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <span className="text-4xl">⚠️</span>
              <div>
                <h3 className="text-lg font-bold text-red-600 mb-2">주의사항</h3>
                <p className="text-xl text-gray-800">{medicine.warning}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 부작용 */}
        <Card className="border-2 border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <span className="text-4xl">💡</span>
              <div>
                <h3 className="text-lg font-bold text-gray-700 mb-2">부작용이 있을 수 있어요</h3>
                <p className="text-xl text-gray-800">{medicine.side_effect}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Close Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 p-6 safe-area-bottom">
        <Button
          onClick={handleClose}
          className="w-full h-16 text-xl font-bold bg-primary hover:bg-primary/90 text-white rounded-2xl"
        >
          ✓ 확인했습니다
        </Button>
      </div>
    </div>
  );
};

export default PatientMode;
