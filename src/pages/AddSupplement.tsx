import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Plus, Pill } from 'lucide-react';
import { useSeniorMode } from '@/contexts/SeniorModeContext';
import BottomNav from '@/components/BottomNav';
import SeniorModeToggle from '@/components/SeniorModeToggle';
import { toast } from 'sonner';
import apiClient from '@/api/client';

const POPULAR_ITEMS = [
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
  { name: '타이레놀', emoji: '💊' },
  { name: '아스피린', emoji: '💊' },
  { name: '게보린', emoji: '💊' },
];

const toDateStr = (d: Date) => d.toISOString().split('T')[0];

const AddSupplement = () => {
  const navigate = useNavigate();
  const { isSeniorMode: sr } = useSeniorMode();
  const todayStr = toDateStr(new Date());

  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('1정');
  const [frequency, setFrequency] = useState('1');
  const [selectedPeriods, setSelectedPeriods] = useState<string[]>(['morning']);
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState('');
  const [aiInfo, setAiInfo] = useState<{ summary: string; dosage: string; precautions: string } | null>(null);
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

  const extractDosageAmount = (dosageText: string): string => {
    // "1회 2정", "한 번에 1캡슐", "1포" 등 추출
    const m = dosageText.match(/1회\s*(\d+(?:\.\d+)?[정캡슐포알정粒])/);
    if (m) return m[1];
    const m2 = dosageText.match(/(\d+(?:\.\d+)?[정캡슐포알정粒])/);
    if (m2) return m2[1];
    return '';
  };

  const fetchAiInfo = async (medName: string) => {
    if (!medName.trim()) return;
    setAiLoading(true);
    setAiInfo(null);
    try {
      const res = await apiClient.post('/medicines/info', { name: medName });
      const { summary, dosage: aiDosage, precautions } = res.data;
      setAiInfo({ summary, dosage: aiDosage, precautions });
      // 복용량 자동 반영
      const extracted = extractDosageAmount(aiDosage || '');
      if (extracted) setDosage(extracted);
    } catch {
      // AI 실패해도 등록 가능
    } finally {
      setAiLoading(false);
    }
  };

  const handleSave = () => {
    if (!name.trim()) { toast.error('약 이름을 입력해주세요'); return; }
    if (selectedPeriods.length === 0) { toast.error('복용 시간대를 선택해주세요'); return; }

    setSaving(true);
    try {
      const existingRaw = localStorage.getItem('saved_schedules');
      const existing = existingRaw ? JSON.parse(existingRaw) : [];

      const existingKeys = new Set(
        existing.map((e: { name: string; period: string }) => `${e.name}__${e.period}`)
      );

      const newSchedules = selectedPeriods
        .filter(periodKey => !existingKeys.has(`${name.trim()}__${periodKey}`))
        .map(periodKey => {
          const period = periodOptions.find(p => p.key === periodKey)!;
          return {
            id: `manual-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            name: name.trim(),
            dosage,
            frequency: `1일 ${selectedPeriods.length}회`,
            duration: endDate ? `${Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000) + 1}일` : '매일',
            schedule: period.label,
            time: period.time,
            period: periodKey,
            taken: false,
            startDate,
            endDate: endDate || undefined,
            createdAt: new Date().toISOString(),
          };
        });

      localStorage.setItem('saved_schedules', JSON.stringify([...existing, ...newSchedules]));
      if (newSchedules.length === 0) {
        toast.info('이미 등록된 약입니다');
        navigate('/schedule', { replace: true });
        return;
      }
      toast.success(`${name} 등록 완료!`);
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
            <span className={`font-bold text-foreground ${sr ? 'text-xl' : 'text-lg'}`}>약 추가</span>
          </div>
          <SeniorModeToggle />
        </div>
      </header>

      <main className="flex-1 px-5 py-6 pb-32 overflow-y-auto">
        <div className="max-w-lg mx-auto space-y-6">

          {/* 약 이름 */}
          <div className="space-y-2">
            <label className={`font-medium text-foreground ${sr ? 'text-lg' : 'text-sm'}`}>
              <Pill className="w-4 h-4 inline mr-1" />
              약 이름
            </label>
            <div className="flex gap-2">
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="예: 타이레놀, 비타민D, 코푸정..."
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

          {/* 자주 찾는 약 */}
          <div className="space-y-2">
            <label className={`font-medium text-muted-foreground ${sr ? 'text-base' : 'text-xs'}`}>
              자주 찾는 약
            </label>
            <div className="flex gap-2 flex-wrap">
              {POPULAR_ITEMS.map(s => (
                <button
                  key={s.name}
                  onClick={() => { setName(s.name); fetchAiInfo(s.name); }}
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
              <span className="text-muted-foreground text-sm">AI가 약품 정보를 분석하고 있어요...</span>
            </div>
          )}
          {aiInfo && (
            <div className="tds-card space-y-3 border-primary/30">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <span className={`font-bold text-primary ${sr ? 'text-lg' : 'text-sm'}`}>AI 분석 — {name}</span>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { label: '✅ 효능', value: aiInfo.summary },
                  { label: '💊 복용법', value: aiInfo.dosage },
                  { label: '⚠️ 주의사항', value: aiInfo.precautions },
                ].map(({ label, value }) => value && (
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
                    selectedPeriods.includes(p.key) ? 'border-primary bg-primary/5' : 'border-border'
                  } ${sr ? 'py-5' : 'py-3'}`}
                >
                  <span className={`block font-medium ${sr ? 'text-lg' : 'text-sm'} ${
                    selectedPeriods.includes(p.key) ? 'text-primary' : 'text-foreground'
                  }`}>{p.label}</span>
                  <span className={`text-muted-foreground ${sr ? 'text-base' : 'text-xs'}`}>{p.time}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 복약 기간 */}
          <div className="space-y-2">
            <label className={`font-medium text-foreground ${sr ? 'text-lg' : 'text-sm'}`}>복약 기간</label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">시작일</p>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="tds-textfield text-sm"
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">종료일 (선택)</p>
                <input
                  type="date"
                  value={endDate}
                  min={startDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="tds-textfield text-sm"
                />
              </div>
            </div>
            {endDate && (
              <p className="text-xs text-primary font-medium text-center">{startDate} ~ {endDate}</p>
            )}
            {!endDate && (
              <p className="text-xs text-muted-foreground text-center">종료일 미설정 시 매일 표시</p>
            )}
          </div>
        </div>
      </main>

      <div className="fixed bottom-16 left-0 right-0 bg-card border-t border-border p-4 safe-area-padding">
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

      <BottomNav />
    </div>
  );
};

export default AddSupplement;
