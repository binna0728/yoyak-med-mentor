import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Volume2, VolumeX, Pill, Clock, Calendar, FileText, Loader2 } from 'lucide-react';
import { useState, useRef } from 'react';
import { useMedications } from '@/hooks/useSupabase';
import { Button } from '@/components/ui/button';

// Template-based AI descriptions for demo
const descriptions: Record<string, string> = {
  '아목시실린': '아목시실린은 세균 감염을 치료하는 항생제입니다. 반드시 처방된 기간 동안 꾸준히 복용하세요. 중간에 멈추면 내성균이 생길 수 있습니다.',
  '이부프로펜': '이부프로펜은 통증과 염증을 줄여주는 소염진통제입니다. 빈속에 먹으면 위장이 아플 수 있으니 반드시 식후에 드세요.',
  '오메프라졸': '오메프라졸은 위산 분비를 억제하여 위염, 역류성 식도염을 치료합니다. 아침 식사 30분 전에 복용하세요.',
  '메트포르민': '메트포르민은 혈당을 낮추는 당뇨병 치료제입니다. 식사와 함께 복용하면 위장 부작용을 줄일 수 있습니다.',
};

const MedicationDetail = () => {
  const { id } = useParams();
  const { data: medications = [], isLoading } = useMedications();
  const med = medications.find(m => m.id === id);
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

  const description = descriptions[med.name] || `${med.name}은(는) 처방된 약물입니다. 의사의 지시에 따라 복용하세요.`;

  const speak = () => {
    if (isSpeaking) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      return;
    }
    const text = `${med.name}, ${med.dosage}. ${description}. 복용 방법: ${med.notes}. 하루 ${med.frequency_per_day}회, ${med.duration_days}일간 복용하세요.`;
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
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Pill className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{med.name}</h1>
              <p className="text-muted-foreground">{med.dosage}</p>
            </div>
          </div>
          <Button variant={isSpeaking ? 'default' : 'outline'} size="sm" onClick={speak}>
            {isSpeaking ? <VolumeX className="mr-1 h-4 w-4" /> : <Volume2 className="mr-1 h-4 w-4" />}
            {isSpeaking ? '중지' : 'TTS 듣기'}
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <InfoCard icon={<Clock className="h-4 w-4 text-primary" />} label="복용 횟수" value={`1일 ${med.frequency_per_day}회`} />
          <InfoCard icon={<Calendar className="h-4 w-4 text-primary" />} label="복용 기간" value={`${med.duration_days}일`} />
          <InfoCard icon={<FileText className="h-4 w-4 text-primary" />} label="복용 방법" value={med.notes || '-'} />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-3 flex items-center gap-2 font-semibold text-foreground">🤖 AI 복약 가이드</h2>
        <p className="leading-relaxed text-foreground">{description}</p>
      </div>
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

export default MedicationDetail;
