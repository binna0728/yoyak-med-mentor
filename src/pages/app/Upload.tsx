import { useState, useCallback } from 'react';
import { Upload as UploadIcon, Image, Plus, Trash2, Check, Search, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAddMedications, useGenerateSchedules, useAddWarnings, useMfdsSearch, useSaveDrugChunks, useGenerateDurCheck, parseIntrcWarnings } from '@/hooks/useSupabase';
import { useToast } from '@/hooks/use-toast';

interface ExtractedMed {
  name: string;
  dosage: string;
  frequencyPerDay: number;
  durationDays: number;
  notes: string;
  // MFDS fields
  entpName?: string;
  efcy?: string;
  useMethod?: string;
  intrc?: string;
  se?: string;
  depositMethod?: string;
  itemSeq?: string;
  itemImage?: string;
  mfdsLoaded?: boolean;
}

const sampleExtraction: ExtractedMed[] = [
  { name: '아목시실린', dosage: '500mg', frequencyPerDay: 3, durationDays: 7, notes: '식후 30분' },
  { name: '이부프로펜', dosage: '200mg', frequencyPerDay: 2, durationDays: 5, notes: '식후 즉시' },
  { name: '오메프라졸', dosage: '20mg', frequencyPerDay: 1, durationDays: 14, notes: '아침 식전' },
];

const UploadPage = () => {
  const [step, setStep] = useState<'upload' | 'review' | 'done'>('upload');
  const [dragOver, setDragOver] = useState(false);
  const [meds, setMeds] = useState<ExtractedMed[]>([]);
  const [saving, setSaving] = useState(false);
  const [searchingIdx, setSearchingIdx] = useState<number | null>(null);
  const [mfdsResults, setMfdsResults] = useState<Record<number, any[]>>({});
  const addMedications = useAddMedications();
  const generateSchedules = useGenerateSchedules();
  const addWarnings = useAddWarnings();
  const mfdsSearch = useMfdsSearch();
  const saveDrugChunks = useSaveDrugChunks();
  const durCheck = useGenerateDurCheck();
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

  const removeMed = (idx: number) => {
    setMeds(prev => prev.filter((_, i) => i !== idx));
    setMfdsResults(prev => { const n = { ...prev }; delete n[idx]; return n; });
  };
  const addMed = () => setMeds(prev => [...prev, { name: '', dosage: '', frequencyPerDay: 1, durationDays: 7, notes: '' }]);

  // MFDS search for a specific med
  const searchMfds = async (idx: number) => {
    const med = meds[idx];
    if (!med.name) return;
    setSearchingIdx(idx);
    try {
      const result = await mfdsSearch.mutateAsync(med.name);
      if (result.results && result.results.length > 0) {
        setMfdsResults(prev => ({ ...prev, [idx]: result.results }));
      } else {
        toast({ title: '검색 결과 없음', description: `"${med.name}"에 대한 식약처 정보를 찾지 못했습니다`, variant: 'destructive' });
      }
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'API 오류', description: err.message });
    } finally {
      setSearchingIdx(null);
    }
  };

  // Apply MFDS result to a med
  const applyMfdsResult = (idx: number, result: any) => {
    setMeds(prev => prev.map((m, i) => i === idx ? {
      ...m,
      name: result.itemName || m.name,
      entpName: result.entpName,
      efcy: result.efcyQesitm,
      useMethod: result.useMethodQesitm,
      intrc: result.intrcQesitm,
      se: result.seQesitm,
      depositMethod: result.depositMethodQesitm,
      itemSeq: result.itemSeq,
      itemImage: result.itemImage,
      mfdsLoaded: true,
    } : m));
    setMfdsResults(prev => { const n = { ...prev }; delete n[idx]; return n; });
    toast({ title: '공식 정보 적용됨', description: `${result.itemName} 정보가 입력되었습니다` });
  };

  const saveMeds = async () => {
    setSaving(true);
    try {
      const rows = meds.map(m => ({
        name: m.name,
        dosage: m.dosage,
        frequency_per_day: m.frequencyPerDay,
        duration_days: m.durationDays,
        notes: m.notes,
        entp_name: m.entpName || '',
        efcy: m.efcy || '',
        use_method: m.useMethod || '',
        intrc: m.intrc || '',
        se: m.se || '',
        deposit_method: m.depositMethod || '',
        item_seq: m.itemSeq || '',
        item_image: m.itemImage || '',
      }));
      const savedMeds = await addMedications.mutateAsync(rows);

      if (savedMeds) {
        // Generate optimized schedules (Stage 5)
        await generateSchedules.mutateAsync(
          savedMeds.map((m: any) => ({ id: m.id, frequency_per_day: m.frequency_per_day, use_method: m.use_method }))
        );

        // Save RAG chunks (Stage 3)
        for (const saved of savedMeds) {
          const sm = saved as any;
          if (sm.efcy || sm.use_method || sm.intrc || sm.se) {
            await saveDrugChunks.mutateAsync({
              medicationId: sm.id,
              sections: { efcy: sm.efcy, use_method: sm.use_method, intrc: sm.intrc, se: sm.se },
            });
          }
        }

        // Parse interaction warnings from intrc text (Stage 2)
        const allWarnings: any[] = [];
        for (const saved of savedMeds) {
          const sm = saved as any;
          const parsed = parseIntrcWarnings(sm.intrc || '', sm.name, [sm.id]);
          allWarnings.push(...parsed.map(w => ({ ...w, medication_ids: [sm.id] })));
        }
        if (allWarnings.length > 0) {
          await addWarnings.mutateAsync(allWarnings);
        }

        // DUR pairwise check (Stage 4)
        if (savedMeds.length >= 2) {
          await durCheck.mutateAsync(
            savedMeds.map((m: any) => ({ id: m.id, name: m.name, intrc: m.intrc || '' }))
          );
        }
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
        <p className="mt-1 text-xs text-muted-foreground">스케줄·경고·DUR 분석이 자동 생성되었습니다</p>
        <Button className="mt-4" onClick={() => { setStep('upload'); setMeds([]); setMfdsResults({}); }}>새 처방전 업로드</Button>
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
            <p className="text-sm text-accent-foreground">✅ OCR 추출 완료 — 약품명마다 "공식 정보 불러오기"를 눌러 식약처 데이터를 연동하세요</p>
          </div>

          {meds.map((med, idx) => (
            <div key={idx} className="rounded-xl border border-border bg-card p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">약물 #{idx + 1}</span>
                  {med.mfdsLoaded && (
                    <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">✓ 공식정보</span>
                  )}
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeMed(idx)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label>약품명</Label>
                  <div className="flex gap-2">
                    <Input value={med.name} onChange={e => updateMed(idx, 'name', e.target.value)} />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => searchMfds(idx)}
                      disabled={!med.name || searchingIdx === idx}
                      className="shrink-0 whitespace-nowrap"
                    >
                      {searchingIdx === idx ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Search className="mr-1 h-3 w-3" />}
                      공식 정보
                    </Button>
                  </div>
                </div>
                <div><Label>용량</Label><Input value={med.dosage} onChange={e => updateMed(idx, 'dosage', e.target.value)} /></div>
                <div><Label>1일 복용 횟수</Label><Input type="number" min={1} value={med.frequencyPerDay} onChange={e => updateMed(idx, 'frequencyPerDay', +e.target.value)} /></div>
                <div><Label>복용 기간(일)</Label><Input type="number" min={1} value={med.durationDays} onChange={e => updateMed(idx, 'durationDays', +e.target.value)} /></div>
                <div className="sm:col-span-2"><Label>비고</Label><Input value={med.notes} onChange={e => updateMed(idx, 'notes', e.target.value)} /></div>
              </div>

              {/* MFDS search results dropdown */}
              {mfdsResults[idx] && mfdsResults[idx].length > 0 && (
                <div className="mt-3 space-y-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
                  <p className="text-xs font-medium text-primary">식약처 검색 결과 ({mfdsResults[idx].length}건)</p>
                  {mfdsResults[idx].map((r: any, ri: number) => (
                    <button
                      key={ri}
                      onClick={() => applyMfdsResult(idx, r)}
                      className="flex w-full items-start gap-3 rounded-lg border border-border bg-card p-3 text-left transition-colors hover:border-primary/50"
                    >
                      {r.itemImage && (
                        <img src={r.itemImage} alt={r.itemName} className="h-12 w-12 rounded object-cover" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground">{r.itemName}</p>
                        <p className="text-xs text-muted-foreground">{r.entpName}</p>
                        {r.efcyQesitm && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{r.efcyQesitm.substring(0, 100)}…</p>}
                      </div>
                      <ExternalLink className="mt-1 h-3 w-3 shrink-0 text-primary" />
                    </button>
                  ))}
                </div>
              )}

              {/* MFDS loaded summary */}
              {med.mfdsLoaded && med.entpName && (
                <div className="mt-3 rounded-lg border border-success/20 bg-success/5 p-3">
                  <p className="mb-1 text-xs font-medium text-success">📋 식약처 공식 정보 적용됨</p>
                  <p className="text-xs text-muted-foreground">제조사: {med.entpName}</p>
                  {med.efcy && <p className="mt-1 line-clamp-2 text-xs text-foreground">효능: {med.efcy.substring(0, 150)}…</p>}
                </div>
              )}
            </div>
          ))}

          <Button variant="outline" onClick={addMed} className="w-full"><Plus className="mr-2 h-4 w-4" />약물 추가</Button>
          <Button onClick={saveMeds} className="w-full" disabled={meds.some(m => !m.name) || saving}>
            {saving ? '저장 중...' : '💾 저장 및 분석하기'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default UploadPage;
