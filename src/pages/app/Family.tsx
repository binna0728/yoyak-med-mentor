import { useState } from 'react';
import { Users, Copy, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Family = () => {
  const { user } = useAuth();
  const isCaregiver = user?.role === 'caregiver';
  const [inviteCode] = useState('YOYAK-' + Math.random().toString(36).substring(2, 8).toUpperCase());
  const [copied, setCopied] = useState(false);
  const [linkedCode, setLinkedCode] = useState('');

  const copyCode = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isCaregiver) {
    // Patient view: show invite code
    return (
      <div className="animate-fade-in space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">가족 관리</h1>
          <p className="text-muted-foreground">보호자에게 초대 코드를 공유하세요</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 text-center">
          <Users className="mx-auto mb-3 h-12 w-12 text-primary" />
          <p className="mb-4 text-sm text-muted-foreground">아래 코드를 보호자에게 전달하세요</p>
          <div className="mx-auto flex max-w-xs items-center gap-2 rounded-lg bg-muted p-3">
            <code className="flex-1 text-center text-lg font-bold tracking-widest text-foreground">{inviteCode}</code>
            <Button variant="ghost" size="icon" onClick={copyCode}>
              {copied ? <CheckCircle2 className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Caregiver view
  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">가족 복약 관리</h1>
        <p className="text-muted-foreground">환자의 초대 코드로 연결하세요</p>
      </div>

      {/* Link Patient */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="mb-3 font-semibold text-foreground">환자 연결</h2>
        <div className="flex gap-2">
          <Input placeholder="초대 코드 입력" value={linkedCode} onChange={e => setLinkedCode(e.target.value)} />
          <Button onClick={() => setLinkedCode('')}>연결</Button>
        </div>
      </div>

      {/* Demo: Connected patient dashboard */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="mb-3 font-semibold text-foreground">👤 홍길동 (환자)</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-success/10 p-3 text-center">
            <CheckCircle2 className="mx-auto mb-1 h-5 w-5 text-success" />
            <p className="text-lg font-bold text-foreground">25%</p>
            <p className="text-xs text-muted-foreground">오늘 복용률</p>
          </div>
          <div className="rounded-lg bg-primary/10 p-3 text-center">
            <Clock className="mx-auto mb-1 h-5 w-5 text-primary" />
            <p className="text-lg font-bold text-foreground">8건</p>
            <p className="text-xs text-muted-foreground">오늘 예정</p>
          </div>
          <div className="rounded-lg bg-destructive/10 p-3 text-center">
            <AlertTriangle className="mx-auto mb-1 h-5 w-5 text-destructive" />
            <p className="text-lg font-bold text-foreground">1건</p>
            <p className="text-xs text-muted-foreground">주의 경고</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Family;
