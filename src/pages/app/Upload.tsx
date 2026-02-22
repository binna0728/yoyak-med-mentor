import { useState, useCallback } from 'react';
import { Upload as UploadIcon, Image, Plus, Trash2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAddMedications, useGenerateSchedules, useAddWarnings } from '@/hooks/useSupabase';
import { useToast } from '@/hooks/use-toast';

interface ExtractedMed {
  name: string;
  dosage: string;
  frequencyPerDay: number;
  durationDays: number;
  notes: string;
}

const sampleExtraction: ExtractedMed[] = [
  { name: '아목시실린', dosage: '500mg', frequencyPerDay: 3, durationDays: 7, notes: '식후 30분' },
  { name: '이부프로펜', dosage: '200mg', frequencyPerDay: 2, durationDays: 5, notes: '식후 즉시' },
  { name: '오메프라졸', dosage: '20mg', frequencyPerDay: 1, durationDays: 14, notes: '아침 식전' },
];

// Demo interaction rules
const demoWarningRules = [
  { drugs: ['아목시실린', '메트포르민'], severity: 'high', title: '아목시실린 + 메트포르민 병용 주의', description: '아목시실린이 메트포르민의 혈당 강하 효과를 증가시킬 수 있습니다.' },
  { drugs: ['이부프로펜', '오메프라졸'], severity: 'medium', title: '이부프로펜 + 오메프라졸 식사 타이밍 충돌', description: '이부프로펜은 식후, 오메프라졸은 식전에 복용해야 합니다.' },
  { drugs: ['이부프로펜'], severity: 'low', title: '이부프로펜 위장 보호 권장', description: '이부프로펜 장기 복용 시 위점막 손상 가능성이 있습니다.' },
];

const UploadPage = () => {
  const [step, setStep] = useState<'upload' | 'review' | 'done'>('upload');
  const [dragOver, setDragOver] = useState(false);
  const [meds, setMeds] = useState<ExtractedMed[]>([]);
  const [saving, setSaving] = useState(false);
  const addMedications = useAddMedications();
  const generateSchedules = useGenerateSchedules();
  const addWarnings = useAddWarnings();
  const { toast } = useToast();

  const handleUpload = useCallback(() => {
    setTimeout(() => {
      setMeds([...sampleExtraction]);
      setStep('review');
    }, 1200);
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleUpload();
  };

  const updateMed = (idx: number, field: keyof ExtractedMed, value: string | number) => {
    setMeds(prev => prev.map((m, i) => i === idx ? { ...m, [field]: value } : m));
  };

  const removeMed = (idx: number) => setMeds(prev => prev.filter((_, i) => i !== idx));
  const addMed = () => setMeds(prev => [...prev, { name: '', dosage: '', frequencyPerDay: 1, durationDays: 7, notes: '' }]);

  const saveMeds = async () => {
    setSaving(true);
    try {
      const rows = meds.map(m => ({
        name: m.name,
        dosage: m.dosage,
        frequency_per_day: m.frequencyPerDay,
        duration_days: m.durationDays,
        notes: m.notes,
      }));
      const savedMeds = await addMedications.mutateAsync(rows);

      // Generate schedules
      if (savedMeds) {
        await generateSchedules.mutateAsync(
          savedMeds.map(m => ({ id: m.id, frequency_per_day: m.frequency_per_day }))
        );
      }

      // Check interaction warnings (demo rule engine)
      const medNames = meds.map(m => m.name);
      const warnings = demoWarningRules.filter(rule =>
        rule.drugs.every(d => medNames.some(n => n.includes(d)))
      );
      if (warnings.length > 0 && savedMeds) {
        await addWarnings.mutateAsync(
          warnings.map(w => ({
            medication_ids: savedMeds.map(m => m.id),
            severity: w.severity,
            title: w.title,
            description: w.description,
          }))
        );
      }

      toast({ title: '저장 완료', description: `${meds.length}개 약물이 등록되었습니다` });
      setStep('done');
    } catch (err: any) {
      toast({ variant: 'destructive', title: '저장 실패', description: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (step === 'done') {
    return (
      <div className="flex animate-fade-in flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
          <Check className="h-8 w-8 text-success" />
        </div>
        <h2 className="text-xl font-bold text-foreground">저장 완료!</h2>
        <p className="mt-2 text-muted-foreground">{meds.length}개 약물이 등록되었습니다</p>
        <Button className="mt-4" onClick={() => { setStep('upload'); setMeds([]); }}>새 처방전 업로드</Button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">처방전 업로드</h1>
        <p className="text-muted-foreground">처방전 사진을 업로드하면 약물 정보를 자동 추출합니다</p>
      </div>

      {step === 'upload' && (
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-colors ${
            dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
          }`}
          onClick={handleUpload}
        >
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            {dragOver ? <Image className="h-8 w-8 text-primary" /> : <UploadIcon className="h-8 w-8 text-primary" />}
          </div>
          <p className="mb-1 text-lg font-semibold text-foreground">처방전 이미지를 여기에 놓으세요</p>
          <p className="text-sm text-muted-foreground">또는 클릭하여 파일 선택</p>
          <p className="mt-3 text-xs text-muted-foreground">📋 데모: 클릭 시 샘플 처방전이 자동 추출됩니다</p>
        </div>
      )}

      {step === 'review' && (
        <div className="space-y-4">
          <div className="rounded-lg bg-accent/50 p-3">
            <p className="text-sm text-accent-foreground">✅ OCR 추출 완료 — 아래 정보를 확인하고 수정하세요</p>
          </div>

          {meds.map((med, idx) => (
            <div key={idx} className="rounded-xl border border-border bg-card p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">약물 #{idx + 1}</span>
                <Button variant="ghost" size="icon" onClick={() => removeMed(idx)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div><Label>약품명</Label><Input value={med.name} onChange={e => updateMed(idx, 'name', e.target.value)} /></div>
                <div><Label>용량</Label><Input value={med.dosage} onChange={e => updateMed(idx, 'dosage', e.target.value)} /></div>
                <div><Label>1일 복용 횟수</Label><Input type="number" min={1} value={med.frequencyPerDay} onChange={e => updateMed(idx, 'frequencyPerDay', +e.target.value)} /></div>
                <div><Label>복용 기간(일)</Label><Input type="number" min={1} value={med.durationDays} onChange={e => updateMed(idx, 'durationDays', +e.target.value)} /></div>
                <div className="sm:col-span-2"><Label>비고</Label><Input value={med.notes} onChange={e => updateMed(idx, 'notes', e.target.value)} /></div>
              </div>
            </div>
          ))}

          <Button variant="outline" onClick={addMed} className="w-full"><Plus className="mr-2 h-4 w-4" />약물 추가</Button>
          <Button onClick={saveMeds} className="w-full" disabled={meds.some(m => !m.name) || saving}>
            {saving ? '저장 중...' : '💾 저장하기'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default UploadPage;
