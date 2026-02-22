import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Volume2, VolumeX, Pill, Clock, Calendar, FileText, Loader2, Building2, ShieldCheck, BookOpen } from 'lucide-react';
import { useState, useRef } from 'react';
import { useMedications, useGuideBundle } from '@/hooks/useSupabase';
import { Button } from '@/components/ui/button';

const MedicationDetail = () => {
  const { id } = useParams();
  const { data: medications = [], isLoading } = useMedications();
  const { data: guide, isLoading: loadingGuide } = useGuideBundle(id);
  const med = medications.find((m: any) => m.id === id);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const synthRef = useRef(window.speechSynthesis);

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!med) {
    return (
      <div className="py-20 text-center">
        <p className="text-muted-foreground">약물을 찾을 수 없습니다</p>
        <Button asChild className="mt-4"><Link to="/app/medications">목록으로</Link></Button>
      </div>
    );
  }

  const m = med as any;
  const hasMfds = !!(m.efcy || m.use_method || m.intrc || m.se);

  const speak = () => {
    if (isSpeaking) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      return;
    }
    const sections = guide?.summary || `${m.name}은(는) 처방된 약물입니다. 의사의 지시에 따라 복용하세요.`;
    const text = `${m.name}, ${m.dosage}. ${sections}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    utterance.rate = 0.9;
    utterance.onend = () => setIsSpeaking(false);
    synthRef.current.speak(utterance);
    setIsSpeaking(true);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <Link to="/app/medications" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> 약물 목록
      </Link>

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            {m.item_image ? (
              <img src={m.item_image} alt={m.name} className="h-12 w-12 rounded-xl object-cover" />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Pill className="h-6 w-6 text-primary" />
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-foreground">{m.name}</h1>
              <p className="text-muted-foreground">{m.dosage}</p>
              {m.entp_name && (
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Building2 className="h-3 w-3" /> {m.entp_name}
                </p>
              )}
            </div>
          </div>
          <Button variant={isSpeaking ? 'default' : 'outline'} size="sm" onClick={speak}>
            {isSpeaking ? <VolumeX className="mr-1 h-4 w-4" /> : <Volume2 className="mr-1 h-4 w-4" />}
            {isSpeaking ? '중지' : 'TTS'}
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <InfoCard icon={<Clock className="h-4 w-4 text-primary" />} label="복용 횟수" value={`1일 ${m.frequency_per_day}회`} />
          <InfoCard icon={<Calendar className="h-4 w-4 text-primary" />} label="복용 기간" value={`${m.duration_days}일`} />
          <InfoCard icon={<FileText className="h-4 w-4 text-primary" />} label="복용 방법" value={m.notes || '-'} />
        </div>
      </div>

      {/* AI Summary / Guide (Stage 3) */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-3 flex items-center gap-2 font-semibold text-foreground">
          <BookOpen className="h-5 w-5 text-primary" />
          AI 복약 가이드 {hasMfds && <span className="text-xs font-normal text-success">(식약처 기반)</span>}
        </h2>
        {loadingGuide ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> 가이드 로딩 중...
          </div>
        ) : guide?.summary ? (
          <div className="space-y-3">
            {guide.summary.split('\n\n').map((section: string, i: number) => (
              <p key={i} className="text-sm leading-relaxed text-foreground">{section}</p>
            ))}
            <p className="mt-2 text-xs text-muted-foreground">📋 출처: {guide.source}</p>
          </div>
        ) : (
          <p className="text-sm leading-relaxed text-foreground">
            {m.name}은(는) 처방된 약물입니다. 의사의 지시에 따라 복용하세요.
          </p>
        )}
      </div>

      {/* MFDS Detail Sections */}
      {hasMfds && (
        <div className="space-y-4">
          {m.efcy && <MfdsSection title="효능·효과" content={m.efcy} icon="💊" />}
          {m.use_method && <MfdsSection title="용법·용량" content={m.use_method} icon="📋" />}
          {m.intrc && <MfdsSection title="주의사항 / 상호작용" content={m.intrc} icon="⚠️" />}
          {m.se && <MfdsSection title="부작용" content={m.se} icon="🩺" />}
          {m.deposit_method && <MfdsSection title="보관 방법" content={m.deposit_method} icon="🏠" />}
        </div>
      )}

      {m.item_seq && (
        <div className="flex items-center gap-2 rounded-lg bg-muted p-3">
          <ShieldCheck className="h-4 w-4 text-success" />
          <p className="text-xs text-muted-foreground">식약처 e약은요 인증 정보 · 품목코드: {m.item_seq}</p>
        </div>
      )}
    </div>
  );
};

const InfoCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="rounded-lg bg-muted p-3">
    <div className="mb-1 flex items-center gap-1.5">
      {icon}
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
    <p className="text-sm font-medium text-foreground">{value}</p>
  </div>
);

const MfdsSection = ({ title, content, icon }: { title: string; content: string; icon: string }) => (
  <div className="rounded-xl border border-border bg-card p-4">
    <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">{icon} {title}</h3>
    <div className="space-y-1">
      {content.split('\n').filter(l => l.trim()).map((line, i) => (
        <p key={i} className="text-sm leading-relaxed text-foreground">{line}</p>
      ))}
    </div>
  </div>
);

export default MedicationDetail;
