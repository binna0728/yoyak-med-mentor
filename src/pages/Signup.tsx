import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authApi from '@/api/auth';
import type { Gender } from '@/types/user';
import { useToast } from '@/hooks/use-toast';
import { Mail, Lock, User, Phone, Calendar, Loader2, ArrowLeft } from 'lucide-react';

const Signup = () => {
  const [formData, setFormData] = useState({
    email: '', password: '', confirmPassword: '', name: '',
    gender: '' as Gender | '', birthday: '', phone_number: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast({ title: '비밀번호 불일치', description: '비밀번호가 일치하지 않습니다.', variant: 'destructive' });
      return;
    }
    if (!formData.gender) {
      toast({ title: '성별 선택', description: '성별을 선택해주세요.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      await authApi.signup({
        email: formData.email, password: formData.password, name: formData.name,
        gender: formData.gender as Gender, birthday: formData.birthday,
        phone_number: formData.phone_number.replace(/-/g, ''),
      });
      toast({ title: '회원가입 성공', description: '로그인 페이지로 이동합니다.' });
      navigate('/login');
    } catch (error: any) {
      toast({ title: '회원가입 실패', description: error.response?.data?.detail || '회원가입에 실패했습니다.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-card flex flex-col safe-area-padding">
      <header className="tds-header">
        <div className="flex items-center h-14 px-4 border-b border-border">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <div className="flex-1 flex items-center justify-center">
            <span className="text-lg font-bold text-foreground">회원가입</span>
          </div>
          <div className="w-10" />
        </div>
      </header>

      <main className="flex-1 px-5 py-6 overflow-y-auto">
        <div className="max-w-sm mx-auto lg:max-w-md space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-foreground">새 계정 만들기</h1>
            <p className="text-muted-foreground text-sm">약 정보를 쉽게 확인해보세요</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">이메일</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input type="email" placeholder="example@email.com" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} className="tds-textfield pl-12" required />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">비밀번호</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input type="password" placeholder="8자 이상 입력" value={formData.password} onChange={(e) => handleChange('password', e.target.value)} className="tds-textfield pl-12" minLength={8} required />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">비밀번호 확인</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input type="password" placeholder="비밀번호 재입력" value={formData.confirmPassword} onChange={(e) => handleChange('confirmPassword', e.target.value)} className="tds-textfield pl-12" required />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">이름</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input type="text" placeholder="홍길동" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} className="tds-textfield pl-12" maxLength={20} required />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">성별</label>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => handleChange('gender', 'MALE')} className={`tds-chip ${formData.gender === 'MALE' ? 'active' : ''}`}>남성</button>
                <button type="button" onClick={() => handleChange('gender', 'FEMALE')} className={`tds-chip ${formData.gender === 'FEMALE' ? 'active' : ''}`}>여성</button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">생년월일</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input type="date" value={formData.birthday} onChange={(e) => handleChange('birthday', e.target.value)} className="tds-textfield pl-12" required />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">전화번호</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input type="tel" placeholder="01012345678" value={formData.phone_number} onChange={(e) => handleChange('phone_number', e.target.value)} className="tds-textfield pl-12" maxLength={11} required />
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="tds-button-primary w-full mt-6">
              {isLoading ? (
                <span className="flex items-center justify-center gap-2"><Loader2 className="w-5 h-5 animate-spin" />가입 중...</span>
              ) : '회원가입'}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground pb-4">
            이미 계정이 있으신가요?{' '}
            <Link to="/login" className="text-primary font-medium">로그인</Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Signup;
