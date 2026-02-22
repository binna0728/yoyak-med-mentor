import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pill } from 'lucide-react';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('patient');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signup(name, email, password, role);
    navigate('/app/dashboard');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm animate-fade-in space-y-6">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2">
            <Pill className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">요약</span>
          </Link>
          <p className="mt-2 text-sm text-muted-foreground">새 계정을 만드세요</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-card p-6">
          <div className="space-y-2">
            <Label htmlFor="name">이름</Label>
            <Input id="name" value={name} onChange={e => setName(e.target.value)} required placeholder="홍길동" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
          </div>
          <div className="space-y-2">
            <Label>역할</Label>
            <div className="flex gap-2">
              {(['patient', 'caregiver'] as const).map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`flex-1 rounded-lg border-2 p-3 text-center text-sm font-medium transition-colors ${
                    role === r ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/50'
                  }`}
                >
                  {r === 'patient' ? '👤 환자' : '🤝 보호자'}
                </button>
              ))}
            </div>
          </div>
          <Button type="submit" className="w-full">회원가입</Button>
          <p className="text-center text-sm text-muted-foreground">
            이미 계정이 있으신가요? <Link to="/auth/login" className="text-primary hover:underline">로그인</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;
