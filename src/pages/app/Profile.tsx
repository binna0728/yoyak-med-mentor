import { useState } from 'react';
import { Printer, User, Heart, AlertCircle, Phone } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { mockProfile, mockMedications } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(mockProfile);

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">프로필 & 응급 카드</h1>
        <p className="text-muted-foreground">응급 시 필요한 의료 정보를 관리하세요</p>
      </div>

      {/* Profile Info */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-4">
        <h2 className="font-semibold text-foreground flex items-center gap-2"><User className="h-4 w-4 text-primary" /> 기본 정보</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div><Label>이름</Label><Input value={user?.name || ''} readOnly /></div>
          <div><Label>이메일</Label><Input value={user?.email || ''} readOnly /></div>
          <div><Label>혈액형</Label><Input value={profile.bloodType} onChange={e => setProfile(p => ({ ...p, bloodType: e.target.value }))} /></div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 space-y-4">
        <h2 className="font-semibold text-foreground flex items-center gap-2"><Heart className="h-4 w-4 text-destructive" /> 질환 & 알레르기</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>기저질환</Label>
            <Input value={profile.conditions.join(', ')} onChange={e => setProfile(p => ({ ...p, conditions: e.target.value.split(', ') }))} />
          </div>
          <div>
            <Label>알레르기</Label>
            <Input value={profile.allergies.join(', ')} onChange={e => setProfile(p => ({ ...p, allergies: e.target.value.split(', ') }))} />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 space-y-4">
        <h2 className="font-semibold text-foreground flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> 비상연락처</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div><Label>연락처</Label><Input value={profile.emergencyContact} onChange={e => setProfile(p => ({ ...p, emergencyContact: e.target.value }))} /></div>
          <div><Label>전화번호</Label><Input value={profile.emergencyPhone} onChange={e => setProfile(p => ({ ...p, emergencyPhone: e.target.value }))} /></div>
        </div>
      </div>

      {/* Emergency Card */}
      <div className="flex justify-end">
        <Button variant="outline" onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" /> 응급 카드 인쇄
        </Button>
      </div>

      <div className="emergency-card rounded-xl border-2 border-destructive/50 bg-card p-6">
        <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
          <div>
            <h2 className="text-lg font-bold text-destructive">🚨 응급 의료 카드</h2>
            <p className="text-sm text-muted-foreground">Emergency Medical Card</p>
          </div>
          <div className="rounded bg-destructive/10 px-3 py-1 text-sm font-bold text-destructive">
            {profile.bloodType}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium text-muted-foreground">이름</p>
            <p className="font-semibold text-foreground">{user?.name}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">비상연락처</p>
            <p className="font-semibold text-foreground">{profile.emergencyContact}</p>
            <p className="text-sm text-foreground">{profile.emergencyPhone}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">기저질환</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {profile.conditions.map(c => (
                <span key={c} className="rounded bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">{c}</span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">알레르기</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {profile.allergies.map(a => (
                <span key={a} className="rounded bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">{a}</span>
              ))}
            </div>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs font-medium text-muted-foreground">현재 복용약</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {mockMedications.map(m => (
                <span key={m.id} className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{m.name} {m.dosage}</span>
              ))}
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
