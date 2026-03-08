import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { medicineApi } from '@/api/medicine';
import { Medicine } from '@/types/medicine';
import { Search } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [medicineName, setMedicineName] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<Medicine[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const data = await medicineApi.getHistory(10);
      setHistory(data.items);
    } catch {
      setHistory([
        { id: 'demo-1', name: '타이레놀 500mg', effect: '해열, 진통', dosage: '1회 1~2정', schedule: '식후 30분', warning: '간 질환자 주의', side_effect: '발진', patient_explanation: '', created_at: new Date().toISOString() },
        { id: 'demo-2', name: '아목시실린 250mg', effect: '항생제', dosage: '1회 1캡슐', schedule: '식후', warning: '페니실린 알레르기 확인', side_effect: '설사', patient_explanation: '', created_at: new Date(Date.now() - 86400000).toISOString() },
      ]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!medicineName.trim()) return;
    setLoading(true);
    try {
      const result = await medicineApi.generateGuide({ medicine_name: medicineName.trim() });
      localStorage.setItem(`guide_${result.id}`, JSON.stringify(result.medicine));
      navigate(`/guide/${result.id}`);
    } catch {
      const demoId = `demo-${Date.now()}`;
      const demoMedicine: Medicine = {
        id: demoId, name: medicineName.trim(),
        effect: 'AI가 분석한 효능/효과가 여기에 표시됩니다.',
        dosage: 'AI가 분석한 복용 방법이 여기에 표시됩니다.',
        schedule: '식후 30분',
        warning: 'AI가 분석한 주의사항이 여기에 표시됩니다.',
        side_effect: 'AI가 분석한 부작용 정보가 여기에 표시됩니다.',
        patient_explanation: '환자분께 쉽게 설명할 수 있는 내용이 AI에 의해 자동 생성됩니다.',
        created_at: new Date().toISOString(),
      };
      localStorage.setItem(`guide_${demoId}`, JSON.stringify(demoMedicine));
      navigate(`/guide/${demoId}`);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#F2F4F6] flex flex-col safe-area-padding">
      {/* Header */}
      <header className="tds-header">
        <div className="flex items-center justify-between h-14 px-5 border-b border-[#E5E8EB]">
          <div className="flex items-center gap-2">
            <span className="text-xl">💊</span>
            <span className="text-lg font-bold text-[#191F28]">요약</span>
          </div>
          <span className="text-sm text-[#6B7684]">{user?.name || '약사'}님</span>
        </div>
      </header>

      <main className="flex-1 px-5 py-6 pb-24 overflow-y-auto">
        {/* Welcome */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#191F28] mb-1">
            안녕하세요, {user?.name || '약사'}님 👋
          </h1>
          <p className="text-[#6B7684]">약 이름을 입력하면 AI가 복약지도를 생성합니다</p>
        </div>

        {/* Search */}
        <div className="tds-card mb-6">
          <h2 className="text-base font-bold text-[#191F28] mb-3 flex items-center gap-2">
            <Search className="w-5 h-5 text-[#3182F6]" />
            복약지도 생성
          </h2>
          <div className="flex gap-3">
            <input
              value={medicineName}
              onChange={(e) => setMedicineName(e.target.value)}
              placeholder="약 이름을 입력하세요 (예: 타이레놀)"
              className="tds-textfield flex-1"
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            />
            <button
              onClick={handleGenerate}
              disabled={loading || !medicineName.trim()}
              className="tds-button-primary px-6 whitespace-nowrap disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : '생성'}
            </button>
          </div>
        </div>

        {/* History */}
        <h2 className="text-base font-bold text-[#191F28] mb-3">📋 최근 복약지도</h2>

        {historyLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-3 border-[#3182F6] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : history.length === 0 ? (
          <div className="tds-card text-center py-10">
            <p className="text-4xl mb-3">💊</p>
            <p className="text-[#6B7684]">아직 생성된 복약지도가 없습니다</p>
            <p className="text-sm text-[#8B95A1] mt-1">위에서 약 이름을 검색해보세요</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item) => (
              <div
                key={item.id}
                className="tds-card cursor-pointer hover:border-[#3182F6] transition-colors active:scale-[0.98]"
                onClick={() => {
                  localStorage.setItem(`guide_${item.id}`, JSON.stringify(item));
                  navigate(`/guide/${item.id}`);
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-[#191F28]">{item.name}</p>
                    <p className="text-sm text-[#6B7684] mt-0.5">{item.effect}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[#8B95A1]">{formatDate(item.created_at)}</p>
                    <svg className="w-5 h-5 text-[#B0B8C1] ml-auto mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Bottom Nav */}
      <nav className="tds-bottom-nav">
        <Link to="/dashboard" className="tds-nav-item active">
          <span className="text-xl">🏠</span>
          <span>홈</span>
        </Link>
        <Link to="/dashboard" className="tds-nav-item">
          <span className="text-xl">📋</span>
          <span>기록</span>
        </Link>
        <Link to="/mypage" className="tds-nav-item">
          <span className="text-xl">👤</span>
          <span>마이</span>
        </Link>
      </nav>
    </div>
  );
};

export default Dashboard;
