import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSeniorMode } from '@/contexts/SeniorModeContext';
import authApi from '@/api/auth';
import type { Gender, UpdateUserRequest } from '@/types/user';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, User, Phone, Calendar, Loader2, Save } from 'lucide-react';

const MyPage = () => {
  const { user, refreshUser, logout } = useAuth();
  const { isSeniorMode, toggleSeniorMode } = useSeniorMode();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({ name: '', gender: '' as Gender | '', birthday: '', phone_number: '' });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({ name: user.name || '', gender: user.gender || '', birthday: user.birthday || '', phone_number: user.phone_number || '' });
    }
  }, [user]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const updateData: UpdateUserRequest = {};
      if (formData.name !== user?.name) updateData.name = formData.name;
      if (formData.gender !== user?.gender) updateData.gender = formData.gender as Gender;
      if (formData.birthday !== user?.birthday) updateData.birthday = formData.birthday;
      if (formData.phone_number !== user?.phone_number) updateData.phone_number = formData.phone_number.replace(/-/g, '');

      if (Object.keys(updateData).length === 0) {
        toast({ title: '변경 사항 없음', description: '수정된 내용이 없습니다.' });
        setIsLoading(false);
        return;
      }
      await authApi.updateMe(updateData);
      await refreshUser();
      toast({ title: '수정 완료', description: '회원정보가 수정되었습니다.' });
    } catch (error: any) {
      toast({ title: '수정 실패', description: error.response?.data?.detail || '정보 수정에 실패했습니다.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const guideCount = typeof window !== 'undefined' ? Object.keys(localStorage).filter(k => k.startsWith('guide_')).length : 0;

  return (
    <div className="min-h-screen bg-background flex flex-col safe-area-padding">
      <header className="tds-header">
        <div className="flex items-center h-14 px-4 border-b border-border">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <div className="flex-1 flex items-center justify-center">
            <span className="text-lg font-bold text-foreground">마이페이지</span>
          </div>
          <button onClick={handleLogout} className="text-sm text-muted-foreground font-medium">로그아웃</button>
        </div>
      </header>

      <main className="flex-1 px-5 py-6 pb-24 overflow-y-auto max-w-3xl mx-auto w-full">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center">
            <span className="text-4xl">👤</span>
          </div>
        </div>

        {/* Stats */}
        <div className="tds-card mb-4">
          <div className="flex items-center justify-between">
            <span className="text-foreground font-medium">총 조회 횟수</span>
            <span className="text-primary font-bold text-xl">{guideCount}건</span>
          </div>
        </div>

        {/* Senior Mode Toggle */}
        <div className="tds-card mb-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-foreground font-medium">시니어 모드</span>
              <p className="text-sm text-muted-foreground mt-0.5">글씨와 버튼을 크게 표시합니다</p>
            </div>
            <button
              onClick={toggleSeniorMode}
              className={`w-14 h-8 rounded-full transition-colors relative ${isSeniorMode ? 'bg-primary' : 'bg-muted'}`}
            >
              <div className={`w-6 h-6 rounded-full bg-card shadow absolute top-1 transition-transform ${isSeniorMode ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="tds-card">
            <label className="text-sm font-medium text-muted-foreground mb-2 block">이메일</label>
            <div className="h-14 px-4 bg-muted rounded-xl flex items-center text-muted-foreground">{user?.email || '-'}</div>
          </div>

          <div className="tds-card space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">이름</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input type="text" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} className="tds-textfield pl-12" maxLength={20} />
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
                <input type="date" value={formData.birthday} onChange={(e) => handleChange('birthday', e.target.value)} className="tds-textfield pl-12" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">전화번호</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input type="tel" value={formData.phone_number} onChange={(e) => handleChange('phone_number', e.target.value)} className="tds-textfield pl-12" maxLength={11} />
              </div>
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="tds-button-primary w-full">
            {isLoading ? (
              <span className="flex items-center justify-center gap-2"><Loader2 className="w-5 h-5 animate-spin" />저장 중...</span>
            ) : (
              <span className="flex items-center justify-center gap-2"><Save className="w-5 h-5" />저장하기</span>
            )}
          </button>
        </form>
      </main>

      <nav className="tds-bottom-nav lg:hidden">
        <Link to="/dashboard" className="tds-nav-item"><span className="text-xl">🏠</span><span>홈</span></Link>
        <Link to="/dashboard" className="tds-nav-item"><span className="text-xl">📋</span><span>기록</span></Link>
        <Link to="/mypage" className="tds-nav-item active"><span className="text-xl">👤</span><span>마이</span></Link>
      </nav>
    </div>
  );
};

export default MyPage;
