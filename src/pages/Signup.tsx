import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authApi from '@/api/auth';
import type { Gender } from '@/types/user';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Signup = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    nickname: '',
    gender: '' as Gender | '',
    birthday: '',
    email_token: '',
    sms_token: '',
  });
  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleChange = (field: string, value: string) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) { toast({ title: t('auth.termsRequired'), description: t('auth.termsRequiredDesc'), variant: 'destructive' }); return; }
    setIsLoading(true);
    try {
      await authApi.signup({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        nickname: formData.nickname,
        gender: (formData.gender || 'M') as Gender,
        birthday: formData.birthday,
        email_token: formData.email_token,
        sms_token: formData.sms_token,
      });
      toast({ title: t('auth.signupSuccess'), description: t('auth.signupSuccessDesc') });
      navigate('/login');
    } catch (error: any) {
      const errData = error.response?.data;
      const fieldErrors = errData?.field_errors as Record<string, string> | undefined;
      if (fieldErrors && Object.keys(fieldErrors).length > 0) {
        const messages = Object.values(fieldErrors).join('\n');
        toast({ title: t('auth.signupFailed'), description: messages, variant: 'destructive' });
      } else {
        const detail = errData?.error_detail || errData?.detail || t('auth.signupFailedDesc');
        toast({ title: t('auth.signupFailed'), description: detail, variant: 'destructive' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-card flex flex-col safe-area-padding">
      <header className="tds-header">
        <div className="flex items-center h-14 px-4 border-b border-border">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2"><ArrowLeft className="w-6 h-6 text-foreground" /></button>
          <div className="flex-1 text-center"><span className="text-lg font-bold text-foreground">{t('auth.signup')}</span></div>
          <div className="w-10" />
        </div>
      </header>

      <main className="flex-1 px-5 py-6 overflow-y-auto">
        <div className="max-w-sm mx-auto space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">{t('auth.name')}</label>
              <input type="text" placeholder={t('auth.name')} value={formData.name} onChange={e => handleChange('name', e.target.value)} className="tds-textfield" required />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">{t('auth.nickname', '닉네임')}</label>
              <input type="text" placeholder={t('auth.nicknamePlaceholder', '2~10자')} value={formData.nickname} onChange={e => handleChange('nickname', e.target.value)} className="tds-textfield" minLength={2} maxLength={10} required />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">{t('auth.birthday')}</label>
              <input type="date" value={formData.birthday} onChange={e => handleChange('birthday', e.target.value)} className="tds-textfield" required />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">{t('auth.gender', '성별')}</label>
              <div className="flex gap-3">
                <button type="button" onClick={() => handleChange('gender', 'M')}
                  className={`flex-1 h-12 rounded-xl font-medium border transition-colors ${formData.gender === 'M' ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card text-muted-foreground'}`}>
                  {t('auth.male', '남성')}
                </button>
                <button type="button" onClick={() => handleChange('gender', 'F')}
                  className={`flex-1 h-12 rounded-xl font-medium border transition-colors ${formData.gender === 'F' ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card text-muted-foreground'}`}>
                  {t('auth.female', '여성')}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">{t('auth.email')}</label>
              <input type="email" placeholder="example@email.com" value={formData.email} onChange={e => handleChange('email', e.target.value)} className="tds-textfield" required />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">{t('auth.password')}</label>
              <input type="password" placeholder={t('auth.passwordMin')} value={formData.password} onChange={e => handleChange('password', e.target.value)} className="tds-textfield" minLength={8} maxLength={20} required />
              <p className="text-xs text-muted-foreground">{t('auth.passwordHint', '8~20자, 영문+숫자+특수문자 포함')}</p>
            </div>

            <label className="flex items-start gap-3 py-3 cursor-pointer">
              <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-0.5 w-5 h-5 rounded border-border accent-primary" />
              <span className="text-sm text-muted-foreground">{t('auth.termsAgree')}</span>
            </label>

            <button type="submit" disabled={isLoading || !agreed} className="tds-button-primary w-full">
              {isLoading ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-5 h-5 animate-spin" />{t('auth.signingUp')}</span> : t('auth.signup')}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {t('auth.hasAccount')} <Link to="/login" className="text-primary font-medium">{t('auth.login')}</Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Signup;
