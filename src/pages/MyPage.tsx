import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import authApi from '@/api/auth';
import type { Gender, UpdateUserRequest } from '@/types/user';
import { useToast } from '@/hooks/use-toast';
import { Heart, ArrowLeft, User, Phone, Calendar, Loader2, Save } from 'lucide-react';

const MyPage = () => {
  const { user, refreshUser, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    gender: '' as Gender | '',
    birthday: '',
    phone_number: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        gender: user.gender || '',
        birthday: user.birthday || '',
        phone_number: user.phone_number || '',
      });
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
      if (formData.phone_number !== user?.phone_number) {
        updateData.phone_number = formData.phone_number.replace(/-/g, '');
      }

      if (Object.keys(updateData).length === 0) {
        toast({
          title: '변경 사항 없음',
          description: '수정된 내용이 없습니다.',
        });
        setIsLoading(false);
        return;
      }

      await authApi.updateMe(updateData);
      await refreshUser();

      toast({
        title: '수정 완료',
        description: '회원정보가 수정되었습니다.',
      });
    } catch (error: any) {
      toast({
        title: '수정 실패',
        description: error.response?.data?.detail || '정보 수정에 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F2F4F6] flex flex-col safe-area-padding">
      {/* TDS Style Header */}
      <header className="tds-header">
        <div className="flex items-center h-14 px-4 border-b border-[#E5E8EB]">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6 text-[#191F28]" />
          </button>
          <div className="flex-1 flex items-center justify-center">
            <span className="text-lg font-bold text-[#191F28]">마이페이지</span>
          </div>
          <button onClick={handleLogout} className="text-sm text-[#6B7684] font-medium">
            로그아웃
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-5 py-6 pb-24 overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Image Placeholder */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-[#E8F3FF] rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-[#3182F6]" />
            </div>
          </div>

          {/* Email (Read-only) */}
          <div className="tds-card">
            <label className="text-sm font-medium text-[#6B7684] mb-2 block">이메일</label>
            <div className="h-14 px-4 bg-[#F2F4F6] rounded-xl flex items-center text-[#8B95A1]">
              {user?.email || '-'}
            </div>
          </div>

          {/* Editable Fields */}
          <div className="tds-card space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#6B7684]">이름</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8B95A1]" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="tds-textfield pl-12"
                  maxLength={20}
                />
              </div>
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#6B7684]">성별</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleChange('gender', 'MALE')}
                  className={`tds-chip ${formData.gender === 'MALE' ? 'active' : ''}`}
                >
                  남성
                </button>
                <button
                  type="button"
                  onClick={() => handleChange('gender', 'FEMALE')}
                  className={`tds-chip ${formData.gender === 'FEMALE' ? 'active' : ''}`}
                >
                  여성
                </button>
              </div>
            </div>

            {/* Birthday */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#6B7684]">생년월일</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8B95A1]" />
                <input
                  type="date"
                  value={formData.birthday}
                  onChange={(e) => handleChange('birthday', e.target.value)}
                  className="tds-textfield pl-12"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#6B7684]">전화번호</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8B95A1]" />
                <input
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) => handleChange('phone_number', e.target.value)}
                  className="tds-textfield pl-12"
                  maxLength={11}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="tds-button-primary w-full"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                저장 중...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Save className="w-5 h-5" />
                저장하기
              </span>
            )}
          </button>
        </form>
      </main>

      {/* Bottom Navigation */}
      <nav className="tds-bottom-nav">
        <Link to="/dashboard" className="tds-nav-item">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span>홈</span>
        </Link>
        <Link to="/mypage" className="tds-nav-item active">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span>마이</span>
        </Link>
      </nav>
    </div>
  );
};

export default MyPage;
