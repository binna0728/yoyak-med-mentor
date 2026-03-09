import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Plus, Pill } from 'lucide-react';
import { useSeniorMode } from '@/contexts/SeniorModeContext';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';

const POPULAR_SUPPLEMENTS = [
  { name: '비타민D', emoji: '☀️' },
  { name: '오메가3', emoji: '🐟' },
  { name: '비타민C', emoji: '🍊' },
  { name: '마그네슘', emoji: '💎' },
  { name: '유산균(프로바이오틱스)', emoji: '🦠' },
  { name: '철분', emoji: '💪' },
  { name: '칼슘', emoji: '🦴' },
  { name: '아연', emoji: '🔬' },
  { name: '비타민B군', emoji: '⚡' },
  { name: '루테인', emoji: '👁️' },
  { name: '코엔자임Q10', emoji: '❤️' },
  { name: '밀크씨슬', emoji: '🌿' },
];

interface AiInfo {
  효능: string;
  권장복용량: string;
  복용시간: string;
  주의사항: string;
}

const AddSupplement = () => {
  const navigate = useNavigate();
  const { isSeniorMode: sr } = useSeniorMode();
  const { t } = useTranslation();

  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('1정');
  const [selectedPeriods, setSelectedPeriods] = useState<string[]>(['morning']);
  const [aiInfo, setAiInfo] = useState<AiInfo | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const periodOptions = [
    { key: 'morning', label: '🌅 아침', time: '09:00' },
    { key: 'afternoon', label: '☀️ 점심', time: '12:00' },
    { key: 'evening', label: '🌆 저녁', time: '18:00' },
    { key: 'bedtime', label: '🌙 취침 전', time: '22:00' },
  ];

  const togglePeriod = (key: string) => {
    setSelectedPeriods(prev =>
      prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key]
    );
  };

  const handleSelectPopular = (supplement: string) => {
    setName(supplement);
    fetchAiInfo(supplement);
  };

  const fetchAiInfo = async (supplementName: string) => {
    if (!supplementName.trim()) return;
    setAiLoading(true);
    setAiInfo(null);
    try {
      const { data, error } = await supabase.functions.invoke('supplement-info', {
        body: { name: supplementName },
      });

      if (error) throw error;
      if (data?.info) {
        setAiInfo(data.info);
        // AI 추천 복용시간 자동 반영
        if (data.info.복용시간) {
          const timeStr = data.info.복용시간;
          const autoPeriods: string[] = [];
          if (timeStr.includes('아침') || timeStr.includes('오전')) autoPeriods.push('morning');
          if (timeStr.includes('점심')) autoPeriods.push('afternoon');
          if (timeStr.includes('저녁')) autoPeriods.push('evening');
          if (timeStr.includes('취침') || timeStr.includes('자기')) autoPeriods.push('bedtime');
          if (autoPeriods.length > 0) setSelectedPeriods(autoPeriods);
        }
        if (data.info.권장복용량) setDosage(data.info.권장복용량);
      }
    } catch (err) {
      console.error('AI info error:', err);
      // AI 실패해도 등록은 가능
    } finally {
      setAiLoading(false);
    }
  };

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('영양제 이름을 입력해주세요');
      return;
    }
    if (selectedPeriods.length === 0) {
      toast.error('복용 시간대를 선택해주세요');
      return;
    }

    setSaving(true);
    try {
      const existingRaw = localStorage.getItem('saved_schedules');
      const existing = existingRaw ? JSON.parse(existingRaw) : [];

      const newSchedules = selectedPeriods.map(periodKey => {
        const period = periodOptions.find(p => p.key === periodKey)!;
        return {
          id: `supplement-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          name: `💊 ${name.trim()}`,
          dosage,
          frequency: `1일 ${selectedPeriods.length}회`,
          duration: '매일',
          schedule: period.label,
          time: period.time,
          period: periodKey,
          taken: false,
          type: 'supplement',
          createdAt: new Date().toISOString(),
        };
      });

      localStorage.setItem('saved_schedules', JSON.stringify([...existing, ...newSchedules]));
      toast.success(`${name} 등록 완료! (${newSchedules.length}개 시간대)`);
      navigate('/schedule', { replace: true });
    } catch {
      toast.error('등록에 실패했습니다');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col safe-area-padding">
      <header className="tds-header">
        <div className="flex items-center h-14 px-4 border-b border-border">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft className={`text-foreground ${sr ? 'w-7 h-7' : 'w-6 h-6'}`} />
          </button>
          <div className="flex-1 text-center">
            <span className={`font-bold text-foreground ${sr ? 'text-xl' : 'text-lg'}`}>영양제 추가</span>
          </div>
          <div className="w-10" />
        </div>
      </header>

      <main className="flex-1 px-5 py-6 pb-32 overflow-y-auto">
        <div className="max-w-lg mx-auto space-y-6">
          {/* 영양제 이름 입력 */}
          <div className="space-y-2">
            <label className={`font-medium text-foreground ${sr ? 'text-lg' : 'text-sm'}`}>
              <Pill className="w-4 h-4 inline mr-1" />
              영양제 이름
            </label>
            <div className="flex gap-2">
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="예: 비타민D, 오메가3..."
                className={`tds-textfield flex-1 ${sr ? 'text-lg h-14' : ''}`}
              />
              <button
                onClick={() => fetchAiInfo(name)}
                disabled={!name.trim() || aiLoading}
                className="tds-button-primary px-4 flex items-center gap-1 shrink-0"
              >
                <Sparkles className="w-4 h-4" />
                {sr ? 'AI' : 'AI 조회'}
              </button>
            </div>
          </div>

          {/* 인기 영양제 */}
          <div className="space-y-2">
            <label className={`font-medium text-muted-foreground ${sr ? 'text-base' : 'text-xs'}`}>
              자주 찾는 영양제
            </label>
            <div className="flex gap-2 flex-wrap">
              {POPULAR_SUPPLEMENTS.map(s => (
                <button
                  key={s.name}
                  onClick={() => handleSelectPopular(s.name)}
                  className={`tds-chip ${name === s.name ? 'active' : ''} ${sr ? 'text-base h-11 px-4' : 'text-xs h-9 px-3'}`}
                >
                  {s.emoji} {s.name}
                </button>
              ))}
            </div>
          </div>

          {/* AI 정보 카드 */}
          {aiLoading && (
            <div className="tds-card flex items-center gap-3 animate-pulse">
              <Sparkles className="w-5 h-5 text-primary animate-spin" />
              <span className="text-muted-foreground">AI가 영양제 정보를 분석하고 있어요...</span>
            </div>
          )}

          {aiInfo && (
            <div className="tds-card space-y-3 border-primary/30">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className={`font-bold text-primary ${sr ? 'text-lg' : 'text-sm'}`}>AI 분석 결과</span>
              </div>
              <div className="space-y-2">
                {[
                  { label: '✅ 효능', value: aiInfo.효능 },
                  { label: '💊 권장 복용량', value: aiInfo.권장복용량 },
                  { label: '⏰ 추천 복용 시간', value: aiInfo.복용시간 },
                  { label: '⚠️ 주의사항', value: aiInfo.주의사항 },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-muted rounded-xl p-3">
                    <p className={`text-muted-foreground ${sr ? 'text-sm' : 'text-xs'} mb-0.5`}>{label}</p>
                    <p className={`text-foreground font-medium ${sr ? 'text-base' : 'text-sm'}`}>{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 복용량 */}
          <div className="space-y-2">
            <label className={`font-medium text-foreground ${sr ? 'text-lg' : 'text-sm'}`}>1회 복용량</label>
            <input
              value={dosage}
              onChange={e => setDosage(e.target.value)}
              placeholder="예: 1정, 2캡슐, 1포..."
              className={`tds-textfield ${sr ? 'text-lg h-14' : ''}`}
            />
          </div>

          {/* 복용 시간대 */}
          <div className="space-y-2">
            <label className={`font-medium text-foreground ${sr ? 'text-lg' : 'text-sm'}`}>복용 시간대</label>
            <div className="grid grid-cols-2 gap-2">
              {periodOptions.map(p => (
                <button
                  key={p.key}
                  onClick={() => togglePeriod(p.key)}
                  className={`tds-card text-center transition-all ${
                    selectedPeriods.includes(p.key)
                      ? 'border-primary bg-primary/5'
                      : 'border-border'
                  } ${sr ? 'py-5' : 'py-3'}`}
                >
                  <span className={`block font-medium ${sr ? 'text-lg' : 'text-sm'} ${
                    selectedPeriods.includes(p.key) ? 'text-primary' : 'text-foreground'
                  }`}>
                    {p.label}
                  </span>
                  <span className={`text-muted-foreground ${sr ? 'text-base' : 'text-xs'}`}>{p.time}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* 저장 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 safe-area-padding">
        <div className="max-w-lg mx-auto">
          <button
            onClick={handleSave}
            disabled={saving || !name.trim() || selectedPeriods.length === 0}
            className={`tds-button-primary w-full flex items-center justify-center gap-2 ${sr ? 'h-14 text-lg' : ''}`}
          >
            <Plus className="w-5 h-5" />
            {saving ? '등록 중...' : '스케줄에 추가'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddSupplement;