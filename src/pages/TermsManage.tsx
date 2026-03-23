import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

interface Term {
  id: string;
  title: string;
  content_url: string;
  term_type: string;
  is_required: boolean;
  is_active: boolean;
  sort_order: number;
}

const TermsManage = () => {
  const [terms, setTerms] = useState<Term[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', content_url: '', term_type: 'service', is_required: true });
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchTerms = async () => {
    const { data } = await supabase.from('terms').select('*').order('sort_order');
    if (data) setTerms(data as Term[]);
    setLoading(false);
  };

  useEffect(() => { fetchTerms(); }, []);

  const handleAdd = async () => {
    if (!form.title.trim()) return;
    const { error } = await supabase.from('terms').insert({
      title: form.title,
      content_url: form.content_url,
      term_type: form.term_type,
      is_required: form.is_required,
      sort_order: terms.length,
    });
    if (error) {
      toast({ title: '추가 실패', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: '약관이 추가되었습니다' });
      setForm({ title: '', content_url: '', term_type: 'service', is_required: true });
      setShowAdd(false);
      fetchTerms();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('terms').delete().eq('id', id);
    if (!error) {
      toast({ title: '삭제되었습니다' });
      fetchTerms();
    }
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    await supabase.from('terms').update({ is_active: !current }).eq('id', id);
    fetchTerms();
  };

  const handleUpdate = async (term: Term) => {
    await supabase.from('terms').update({
      title: term.title,
      content_url: term.content_url,
      term_type: term.term_type,
      is_required: term.is_required,
    }).eq('id', term.id);
    setEditingId(null);
    toast({ title: '수정되었습니다' });
    fetchTerms();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-lg font-bold text-foreground">약관 관리</h1>
        <div className="flex-1" />
        <Button size="sm" onClick={() => setShowAdd(!showAdd)} variant={showAdd ? 'outline' : 'default'}>
          {showAdd ? <X className="w-4 h-4 mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
          {showAdd ? '취소' : '추가'}
        </Button>
      </div>

      <div className="p-4 space-y-4 max-w-2xl mx-auto">
        {/* Add form */}
        {showAdd && (
          <div className="p-4 rounded-xl border border-border bg-card space-y-3">
            <h3 className="font-semibold text-foreground">새 약관 추가</h3>
            <Input placeholder="약관 제목" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            <Input placeholder="약관 URL (선택)" value={form.content_url} onChange={e => setForm(f => ({ ...f, content_url: e.target.value }))} />
            <div className="flex gap-3">
              <select
                className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm"
                value={form.term_type}
                onChange={e => setForm(f => ({ ...f, term_type: e.target.value }))}
              >
                <option value="service">서비스 이용약관</option>
                <option value="privacy">개인정보처리방침</option>
                <option value="marketing">마케팅 동의</option>
                <option value="other">기타</option>
              </select>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_required} onCheckedChange={v => setForm(f => ({ ...f, is_required: v }))} />
                <Label className="text-sm">{form.is_required ? '필수' : '선택'}</Label>
              </div>
            </div>
            <Button onClick={handleAdd} className="w-full">추가하기</Button>
          </div>
        )}

        {/* Terms list */}
        {loading ? (
          <p className="text-center text-muted-foreground py-8">불러오는 중...</p>
        ) : terms.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">등록된 약관이 없습니다</p>
        ) : (
          terms.map(term => (
            <div key={term.id} className="p-4 rounded-xl border border-border bg-card space-y-2">
              {editingId === term.id ? (
                <EditTermForm term={term} onSave={handleUpdate} onCancel={() => setEditingId(null)} />
              ) : (
                <>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{term.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${term.is_required ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'}`}>
                          {term.is_required ? '필수' : '선택'}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {term.term_type === 'service' ? '서비스 이용약관' : term.term_type === 'privacy' ? '개인정보처리방침' : term.term_type === 'marketing' ? '마케팅 동의' : '기타'}
                      </p>
                      {term.content_url && (
                        <a href={term.content_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline mt-1 block">
                          {term.content_url}
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={term.is_active} onCheckedChange={() => handleToggleActive(term.id, term.is_active)} />
                      <button onClick={() => setEditingId(term.id)}>
                        <Edit2 className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button onClick={() => handleDelete(term.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const EditTermForm = ({ term, onSave, onCancel }: { term: Term; onSave: (t: Term) => void; onCancel: () => void }) => {
  const [t, setT] = useState(term);
  return (
    <div className="space-y-3">
      <Input value={t.title} onChange={e => setT(v => ({ ...v, title: e.target.value }))} />
      <Input value={t.content_url} onChange={e => setT(v => ({ ...v, content_url: e.target.value }))} placeholder="URL" />
      <div className="flex gap-3">
        <select className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm" value={t.term_type} onChange={e => setT(v => ({ ...v, term_type: e.target.value }))}>
          <option value="service">서비스 이용약관</option>
          <option value="privacy">개인정보처리방침</option>
          <option value="marketing">마케팅 동의</option>
          <option value="other">기타</option>
        </select>
        <div className="flex items-center gap-2">
          <Switch checked={t.is_required} onCheckedChange={v => setT(x => ({ ...x, is_required: v }))} />
          <Label className="text-sm">{t.is_required ? '필수' : '선택'}</Label>
        </div>
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={() => onSave(t)}><Save className="w-4 h-4 mr-1" />저장</Button>
        <Button size="sm" variant="outline" onClick={onCancel}>취소</Button>
      </div>
    </div>
  );
};

export default TermsManage;
