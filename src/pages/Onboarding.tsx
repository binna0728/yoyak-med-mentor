import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { isInTossApp } from '@/utils/toss';
import { Loader2 } from 'lucide-react';

const Onboarding = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        navigate('/home', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    }
  }, [isLoading, isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center safe-area-padding">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 rounded-2xl bg-accent flex items-center justify-center mx-auto">
          <span className="text-4xl">💊</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground">요약</h1>
        <p className="text-muted-foreground text-sm">AI 복약 도우미</p>
        <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mt-4" />
      </div>
    </div>
  );
};

export default Onboarding;
