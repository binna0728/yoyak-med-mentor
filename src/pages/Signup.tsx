import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authApi from '@/api/auth';
import type { Gender } from '@/types/user';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2 } from 'lucide-react';

const Signup = () => {
  const [formData, setFormData] = useState({ email: '', password: '', name: '', gender: '' as Gender | '', birthday: '', phone_number: '' });
  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChange = (field: string, value: string) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) { toast({ title: '약관 동의 필요', description: '약관에 동의해주세요.', variant: 'destructive' }); return; }
    setIsLoading(true);
    try {
      await authApi.signup({
        email: formData.email, password: formData.password, name: formData.name,
        gender: (formData.gender || 'MALE') as Gender, birthday: formData.birthday,
        phone_number: formData.phone_number.replace(/-/g, ''),
      });
      toast({ title: '회원가입 성공', description: '로그인해주세요.' });
      navigate('/login');
    } catch (error: any) {
      toast({ title: '회원가입 실패', description: error.response?.data?.detail || '다시 시도해주세요.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-card flex flex-col safe-area-padding">
      <header className="tds-header">
        <div className="flex items-center h-14 px-4 border-b border-border">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2"><ArrowLeft className="w-6 h-6 text-foreground" /></button>
          <div className="flex-1 text-center"><span className="text-lg font-bold text-foreground">회원가입</span></div>
          <div className="w-10" />
        </div>
      </header>

      <main className="flex-1 px-5 py-6 overflow-y-auto">
        <div className="max-w-sm mx-auto space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">이름</label>
              <input type="text" placeholder="이름" value={formData.name} onChange={e => handleChange('name', e.target.value)} className="tds-textfield" required />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">생년월일</label>
              <input type="date" value={formData.birthday} onChange={e => handleChange('birthday', e.target.value)} className="tds-textfield" required />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">이메일</label>
              <input type="email" placeholder="example@email.com" value={formData.email} onChange={e => handleChange('email', e.target.value)} className="tds-textfield" required />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">비밀번호</label>
              <input type="password" placeholder="8자 이상" value={formData.password} onChange={e => handleChange('password', e.target.value)} className="tds-textfield" minLength={8} required />
            </div>

            {/* Terms */}
            <label className="flex items-start gap-3 py-3 cursor-pointer">
              <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-0.5 w-5 h-5 rounded border-border accent-primary" />
              <span className="text-sm text-muted-foreground">약관 동의 및 개인정보 처리방침에 동의합니다</span>
            </label>

            <button type="submit" disabled={isLoading || !agreed} className="tds-button-primary w-full">
              {isLoading ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-5 h-5 animate-spin" />가입 중...</span> : '가입하기'}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            이미 계정이 있으신가요? <Link to="/login" className="text-primary font-medium">로그인</Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Signup;
