import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Volume2, VolumeX, Pill, Clock, Calendar, FileText } from 'lucide-react';
import { useState, useRef } from 'react';
import { mockMedications } from '@/data/mockData';
import { Button } from '@/components/ui/button';

const MedicationDetail = () => {
  const { id } = useParams();
  const med = mockMedications.find(m => m.id === id);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const synthRef = useRef(window.speechSynthesis);

  if (!med) {
    return (
      <div className="py-20 text-center">
        <p className="text-muted-foreground">약물을 찾을 수 없습니다</p>
        <Button asChild className="mt-4"><Link to="/app/medications">목록으로</Link></Button>
      </div>
    );
  }

  const speak = () => {
    if (isSpeaking) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      return;
    }
    const text = `${med.name}, ${med.dosage}. ${med.description || ''}. 복용 방법: ${med.notes}. 하루 ${med.frequencyPerDay}회, ${med.durationDays}일간 복용하세요.`;
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
          <InfoCard icon={<Clock className="h-4 w-4 text-primary" />} label="복용 횟수" value={`1일 ${med.frequencyPerDay}회`} />
          <InfoCard icon={<Calendar className="h-4 w-4 text-primary" />} label="복용 기간" value={`${med.durationDays}일`} />
          <InfoCard icon={<FileText className="h-4 w-4 text-primary" />} label="복용 방법" value={med.notes} />
        </div>
      </div>

      {/* AI Guide Description */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-3 flex items-center gap-2 font-semibold text-foreground">
          🤖 AI 복약 가이드
        </h2>
        <p className="leading-relaxed text-foreground">{med.description}</p>
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
