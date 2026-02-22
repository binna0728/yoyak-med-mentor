import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pill } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('demo@yoyak.kr');
  const [password, setPassword] = useState('demo1234');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
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
          <p className="mt-2 text-sm text-muted-foreground">복약 가이드에 로그인하세요</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-card p-6">
          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full">로그인</Button>
          <p className="text-center text-sm text-muted-foreground">
            계정이 없으신가요? <Link to="/auth/signup" className="text-primary hover:underline">회원가입</Link>
          </p>
        </form>
        <p className="text-center text-xs text-muted-foreground">
          데모: 아무 이메일/비밀번호로 로그인 가능합니다
        </p>
      </div>
    </div>
  );
};

export default Login;
