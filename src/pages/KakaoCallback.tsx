import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/api/client';

const KakaoCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshUser } = useAuth();

  useEffect(() => {
    const code = searchParams.get('code');
    if (!code) {
      navigate('/login');
      return;
    }

    apiClient
      .get(`/auth/kakao/callback?code=${encodeURIComponent(code)}`)
      .then(async (res) => {
        localStorage.setItem('access_token', res.data.access_token);
        await refreshUser();
        navigate('/home', { replace: true });
      })
      .catch(() => navigate('/login'));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <p className="text-muted-foreground text-sm">카카오 로그인 처리 중...</p>
    </div>
  );
};

export default KakaoCallback;
