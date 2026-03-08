import { useAuth } from '@/contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, User, Activity, Calendar, LogOut, Settings } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10">
      {/* Navigation */}
      <nav className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xl font-bold text-foreground">AI HealthCare</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/mypage">
              <Button variant="ghost" size="sm" className="gap-2">
                <Settings className="w-4 h-4" />
                마이페이지
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="w-4 h-4" />
              로그아웃
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            안녕하세요, {user?.name}님! 👋
          </h1>
          <p className="text-muted-foreground">
            오늘의 건강 상태를 확인해보세요.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<User className="w-6 h-6" />}
            label="내 프로필"
            value="정상"
            color="text-emerald-500"
          />
          <StatCard
            icon={<Activity className="w-6 h-6" />}
            label="건강 점수"
            value="85점"
            color="text-primary"
          />
          <StatCard
            icon={<Calendar className="w-6 h-6" />}
            label="마지막 검진"
            value="7일 전"
            color="text-amber-500"
          />
          <StatCard
            icon={<Heart className="w-6 h-6" />}
            label="관리 상태"
            value="양호"
            color="text-rose-500"
          />
        </div>

        {/* User Info Card */}
        <Card className="bg-card/80 backdrop-blur-sm border-border">
          <CardHeader>
            <CardTitle className="text-foreground">내 정보</CardTitle>
            <CardDescription>가입된 회원 정보입니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <InfoRow label="이름" value={user?.name || '-'} />
              <InfoRow label="이메일" value={user?.email || '-'} />
              <InfoRow label="성별" value={user?.gender === 'MALE' ? '남성' : user?.gender === 'FEMALE' ? '여성' : '-'} />
              <InfoRow label="생년월일" value={user?.birthday || '-'} />
              <InfoRow label="전화번호" value={formatPhone(user?.phone_number || '')} />
              <InfoRow label="가입일" value={user?.created_at ? new Date(user.created_at).toLocaleDateString('ko-KR') : '-'} />
            </div>
          </CardContent>
        </Card>
      </main>
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
  <Card className="bg-card/80 backdrop-blur-sm border-border">
    <CardContent className="p-6">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className={`text-xl font-bold ${color}`}>{value}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

interface InfoRowProps {
  label: string;
  value: string;
}

const InfoRow = ({ label, value }: InfoRowProps) => (
  <div className="flex justify-between items-center py-2 border-b border-border last:border-0">
    <span className="text-muted-foreground">{label}</span>
    <span className="text-foreground font-medium">{value}</span>
  </div>
);

const formatPhone = (phone: string) => {
  if (!phone || phone.length !== 11) return phone;
  return `${phone.slice(0, 3)}-${phone.slice(3, 7)}-${phone.slice(7)}`;
};

export default Dashboard;
