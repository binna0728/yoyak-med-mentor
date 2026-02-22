import { useState } from 'react';
import { Printer, User, Heart, AlertCircle, Phone, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile, useUpdateProfile, useMedications } from '@/hooks/useSupabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const Profile = () => {
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const { data: medications = [] } = useMedications();
  const updateProfile = useUpdateProfile();
  const { toast } = useToast();

  const [conditions, setConditions] = useState('');
  const [allergies, setAllergies] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [initialized, setInitialized] = useState(false);

  // Initialize local state from profile
  if (profile && !initialized) {
    setConditions(profile.conditions || '');
    setAllergies(profile.allergies || '');
    setEmergencyContact(profile.emergency_contact || '');
    setInitialized(true);
  }

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync({ conditions, allergies, emergency_contact: emergencyContact });
      toast({ title: '저장 완료', description: '프로필이 업데이트되었습니다' });
    } catch (err: any) {
      toast({ variant: 'destructive', title: '저장 실패', description: err.message });
    }
  };

  const conditionsList = conditions.split(',').map(s => s.trim()).filter(Boolean);
  const allergiesList = allergies.split(',').map(s => s.trim()).filter(Boolean);

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">프로필 & 응급 카드</h1>
        <p className="text-muted-foreground">응급 시 필요한 의료 정보를 관리하세요</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 space-y-4">
        <h2 className="font-semibold text-foreground flex items-center gap-2"><User className="h-4 w-4 text-primary" /> 기본 정보</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div><Label>이름</Label><Input value={user?.name || ''} readOnly /></div>
          <div><Label>이메일</Label><Input value={user?.email || ''} readOnly /></div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 space-y-4">
        <h2 className="font-semibold text-foreground flex items-center gap-2"><Heart className="h-4 w-4 text-destructive" /> 질환 & 알레르기</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>기저질환 (쉼표로 구분)</Label>
            <Input value={conditions} onChange={e => setConditions(e.target.value)} placeholder="제2형 당뇨, 고혈압" />
          </div>
          <div>
            <Label>알레르기 (쉼표로 구분)</Label>
            <Input value={allergies} onChange={e => setAllergies(e.target.value)} placeholder="페니실린 계열" />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 space-y-4">
        <h2 className="font-semibold text-foreground flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> 비상연락처</h2>
        <div>
          <Label>연락처</Label>
          <Input value={emergencyContact} onChange={e => setEmergencyContact(e.target.value)} placeholder="김보호 010-1234-5678" />
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <Button onClick={handleSave} disabled={updateProfile.isPending}>
          {updateProfile.isPending ? '저장 중...' : '💾 프로필 저장'}
        </Button>
        <Button variant="outline" onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" /> 응급 카드 인쇄
        </Button>
      </div>

      {/* Emergency Card */}
      <div className="emergency-card rounded-xl border-2 border-destructive/50 bg-card p-6">
        <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
          <div>
            <h2 className="text-lg font-bold text-destructive">🚨 응급 의료 카드</h2>
            <p className="text-sm text-muted-foreground">Emergency Medical Card</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium text-muted-foreground">이름</p>
            <p className="font-semibold text-foreground">{user?.name}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">비상연락처</p>
            <p className="font-semibold text-foreground">{emergencyContact || '-'}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">기저질환</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {conditionsList.length > 0 ? conditionsList.map(c => (
                <span key={c} className="rounded bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">{c}</span>
              )) : <span className="text-xs text-muted-foreground">없음</span>}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">알레르기</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {allergiesList.length > 0 ? allergiesList.map(a => (
                <span key={a} className="rounded bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">{a}</span>
              )) : <span className="text-xs text-muted-foreground">없음</span>}
            </div>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs font-medium text-muted-foreground">현재 복용약</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {medications.length > 0 ? medications.map((m: any) => (
                <span key={m.id} className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{m.name} {m.dosage}</span>
              )) : <span className="text-xs text-muted-foreground">없음</span>}
            </div>
          </div>
        </div>

        <p className="mt-4 border-t border-border pt-3 text-center text-xs text-muted-foreground">
          요약(YoYak) · 이 카드를 지갑에 보관하세요
        </p>
      </div>
    </div>
  );
};

export default Profile;
