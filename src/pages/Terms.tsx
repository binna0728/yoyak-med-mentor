import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';

interface Term {
  id: string;
  title: string;
  content_url: string;
  term_type: string;
  is_required: boolean;
}

const termTypeLabel: Record<string, string> = {
  service: '서비스 이용약관',
  privacy: '개인정보처리방침',
  marketing: '마케팅 동의',
  other: '기타',
};

const Terms = () => {
  const [terms, setTerms] = useState<Term[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.from('terms').select('*').eq('is_active', true).order('sort_order').then(({ data }) => {
      if (data) setTerms(data as Term[]);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-lg font-bold text-foreground">이용약관</h1>
      </div>

      <div className="p-4 space-y-3 max-w-2xl mx-auto">
        {loading ? (
          <p className="text-center text-muted-foreground py-8">불러오는 중...</p>
        ) : terms.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">등록된 약관이 없습니다</p>
        ) : (
          terms.map(term => (
            <div key={term.id} className="p-4 rounded-xl border border-border bg-card">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{term.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${term.is_required ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'}`}>
                      {term.is_required ? '필수' : '선택'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{termTypeLabel[term.term_type] || term.term_type}</p>
                </div>
                {term.content_url && (
                  <a href={term.content_url} target="_blank" rel="noopener noreferrer" className="text-primary">
                    <ExternalLink className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-4 text-center">
        <p className="text-xs text-muted-foreground">본 서비스는 의료 전문가의 상담을 대체하지 않습니다.</p>
      </div>
    </div>
  );
};

export default Terms;
