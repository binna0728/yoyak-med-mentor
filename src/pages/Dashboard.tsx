import { useAuth } from '@/contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, User, Activity, Calendar, LogOut, Settings, ChevronRight } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F2F4F6] flex flex-col safe-area-padding">
      {/* TDS Style Header */}
      <header className="tds-header">
        <div className="flex items-center justify-between h-14 px-5 border-b border-[#E5E8EB]">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-[#3182F6]" />
            <span className="text-lg font-bold text-[#191F28]">AI 헬스케어</span>
          </div>
          <button onClick={handleLogout} className="tds-button-ghost flex items-center gap-1">
            <LogOut className="w-4 h-4" />
            <span>로그아웃</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-5 py-6 pb-24 overflow-y-auto">
        {/* Welcome Section */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#191F28] mb-1">
            안녕하세요, {user?.name}님! 👋
          </h1>
          <p className="text-[#6B7684]">
            오늘의 건강 상태를 확인해보세요.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <StatCard
            icon={<User className="w-5 h-5" />}
            label="내 프로필"
            value="정상"
            color="#10B981"
          />
          <StatCard
            icon={<Activity className="w-5 h-5" />}
            label="건강 점수"
            value="85점"
            color="#3182F6"
          />
          <StatCard
            icon={<Calendar className="w-5 h-5" />}
            label="마지막 검진"
            value="7일 전"
            color="#F59E0B"
          />
          <StatCard
            icon={<Heart className="w-5 h-5" />}
            label="관리 상태"
            value="양호"
            color="#EF4444"
          />
        </div>

        {/* User Info Card */}
        <div className="tds-card">
          <h2 className="text-lg font-bold text-[#191F28] mb-4">내 정보</h2>
          <div className="space-y-0">
            <InfoRow label="이름" value={user?.name || '-'} />
            <InfoRow label="이메일" value={user?.email || '-'} />
            <InfoRow label="성별" value={user?.gender === 'MALE' ? '남성' : user?.gender === 'FEMALE' ? '여성' : '-'} />
            <InfoRow label="생년월일" value={user?.birthday || '-'} />
            <InfoRow label="전화번호" value={formatPhone(user?.phone_number || '')} />
            <InfoRow label="가입일" value={user?.created_at ? new Date(user.created_at).toLocaleDateString('ko-KR') : '-'} />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 tds-card">
          <h2 className="text-lg font-bold text-[#191F28] mb-4">빠른 메뉴</h2>
          <Link to="/mypage" className="tds-list-item hover:bg-[#F9FAFB] rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#E8F3FF] rounded-xl flex items-center justify-center">
                <Settings className="w-5 h-5 text-[#3182F6]" />
              </div>
              <span className="font-medium text-[#191F28]">내 정보 수정</span>
            </div>
            <ChevronRight className="w-5 h-5 text-[#B0B8C1]" />
          </Link>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="tds-bottom-nav">
        <Link to="/dashboard" className="tds-nav-item active">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span>홈</span>
        </Link>
        <Link to="/mypage" className="tds-nav-item">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span>마이</span>
        </Link>
      </nav>
    </div>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}

const StatCard = ({ icon, label, value, color }: StatCardProps) => (
  <div className="tds-card">
    <div className="flex items-center gap-3">
      <div 
        className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: `${color}15`, color }}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs text-[#8B95A1]">{label}</p>
        <p className="text-base font-bold" style={{ color }}>{value}</p>
      </div>
    </div>
  </div>
);

interface InfoRowProps {
  label: string;
  value: string;
}

const InfoRow = ({ label, value }: InfoRowProps) => (
  <div className="flex justify-between items-center py-3 border-b border-[#F2F4F6] last:border-0">
    <span className="text-[#6B7684] text-sm">{label}</span>
    <span className="text-[#191F28] font-medium">{value}</span>
  </div>
);

const formatPhone = (phone: string) => {
  if (!phone || phone.length !== 11) return phone;
  return `${phone.slice(0, 3)}-${phone.slice(3, 7)}-${phone.slice(7)}`;
};

export default Dashboard;
