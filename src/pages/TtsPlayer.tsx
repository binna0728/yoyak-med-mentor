import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import TTSPlayer from '@/components/TTSPlayer';
import { useSeniorMode } from '@/contexts/SeniorModeContext';

const TtsPlayerPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isSeniorMode: sr } = useSeniorMode();

  if (!id) return null;

  return (
    <div className="min-h-screen bg-background safe-area-padding">
      <header className="tds-header">
        <div className="flex items-center h-14 px-4 border-b border-border">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <div className="flex-1 text-center">
            <span className={`font-bold text-foreground ${sr ? 'text-xl' : 'text-lg'}`}>음성 안내</span>
          </div>
          <div className="w-10" />
        </div>
      </header>
      <main className="p-4 max-w-lg mx-auto">
        <TTSPlayer guideId={id} textContent="" />
      </main>
    </div>
  );
};

export default TtsPlayerPage;
