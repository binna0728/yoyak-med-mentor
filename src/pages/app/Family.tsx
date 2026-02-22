import { useState } from 'react';
import { Users, Copy, CheckCircle2, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePatientLinks, useSchedules, useMedications } from '@/hooks/useSupabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Family = () => {
  const { user } = useAuth();
  const isCaregiver = user?.role === 'caregiver';
  const [inviteCode, setInviteCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [linkedCode, setLinkedCode] = useState('');
  const { toast } = useToast();

  // For patients: create/get invite code
  const [patientCode, setPatientCode] = useState<string | null>(null);
  const [loadingCode, setLoadingCode] = useState(false);

  const createInviteCode = async () => {
    if (!user) return;
    setLoadingCode(true);
    try {
      // Check if patient already has a link entry
      const { data: existing } = await supabase
        .from('patient_links')
        .select('invite_code')
        .eq('patient_id', user.id)
        .maybeSingle();

      if (existing) {
        setPatientCode(existing.invite_code);
      } else {
        // Create a self-referencing link (caregiver_id will be updated when connected)
        const { data, error } = await supabase
          .from('patient_links')
          .insert({ caregiver_id: user.id, patient_id: user.id })
          .select('invite_code')
          .single();
        if (error) throw error;
        setPatientCode(data.invite_code);
      }
    } catch (err: any) {
      toast({ variant: 'destructive', title: '오류', description: err.message });
    } finally {
      setLoadingCode(false);
    }
  };

  const copyCode = () => {
    if (patientCode) {
      navigator.clipboard.writeText(patientCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Caregiver: linked patients
  const { data: links = [], isLoading: loadingLinks } = usePatientLinks();

  const linkPatient = async () => {
    if (!user || !linkedCode) return;
    try {
      const { error } = await supabase
        .from('patient_links')
        .update({ caregiver_id: user.id })
        .eq('invite_code', linkedCode);
      if (error) throw error;
      toast({ title: '연결 완료', description: '환자와 연결되었습니다' });
      setLinkedCode('');
    } catch (err: any) {
      toast({ variant: 'destructive', title: '연결 실패', description: err.message });
    }
  };

  if (!isCaregiver) {
    return (
      <div className="animate-fade-in space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">가족 관리</h1>
          <p className="text-muted-foreground">보호자에게 초대 코드를 공유하세요</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 text-center">
          <Users className="mx-auto mb-3 h-12 w-12 text-primary" />
          {patientCode ? (
            <>
              <p className="mb-4 text-sm text-muted-foreground">아래 코드를 보호자에게 전달하세요</p>
              <div className="mx-auto flex max-w-xs items-center gap-2 rounded-lg bg-muted p-3">
                <code className="flex-1 text-center text-lg font-bold tracking-widest text-foreground">{patientCode}</code>
                <Button variant="ghost" size="icon" onClick={copyCode}>
                  {copied ? <CheckCircle2 className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </>
          ) : (
            <Button onClick={createInviteCode} disabled={loadingCode}>
              {loadingCode ? '생성 중...' : '초대 코드 생성'}
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">가족 복약 관리</h1>
        <p className="text-muted-foreground">환자의 초대 코드로 연결하세요</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="mb-3 font-semibold text-foreground">환자 연결</h2>
        <div className="flex gap-2">
          <Input placeholder="초대 코드 입력" value={linkedCode} onChange={e => setLinkedCode(e.target.value)} />
          <Button onClick={linkPatient} disabled={!linkedCode}>연결</Button>
        </div>
      </div>

      {loadingLinks ? (
        <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : links.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <Users className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">연결된 환자가 없습니다</p>
        </div>
      ) : (
        links.map((link: any) => (
          <div key={link.id} className="rounded-xl border border-border bg-card p-4">
            <h2 className="mb-3 font-semibold text-foreground">👤 {link.profiles?.name || '환자'}</h2>
            <p className="text-sm text-muted-foreground">환자의 복약 현황을 대시보드에서 확인하세요</p>
          </div>
        ))
      )}
    </div>
  );
};

export default Family;
