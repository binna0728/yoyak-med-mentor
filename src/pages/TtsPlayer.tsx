import { useParams } from 'react-router-dom';
import TTSPlayer from '@/components/TTSPlayer';
import SeniorModeToggle from '@/components/SeniorModeToggle';

const TtsPlayerPage = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="flex justify-end px-5 pt-4">
        <SeniorModeToggle />
      </div>
      <main className="p-4 max-w-lg mx-auto">
        <TTSPlayer guideId={id} textContent="" />
      </main>
    </div>
  );
};

export default TtsPlayerPage;
