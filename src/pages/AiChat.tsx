import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { useSeniorMode } from '@/contexts/SeniorModeContext';
import BottomNav from '@/components/BottomNav';
import { useTranslation } from 'react-i18next';
import apiClient from '@/api/client';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatSections {
  summary: string;
  dosage: string;
  precautions: string;
  tips: string;
}

interface ChatApiResponse {
  success: boolean;
  answer: string;
  sections: ChatSections;
  disclaimer: string;
}

const AiChat = () => {
  const navigate = useNavigate();
  const { isSeniorMode: sr } = useSeniorMode();
  const { t } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: t('aiChat.greeting') },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const quickQuestions = [
    t('aiChat.q1'), t('aiChat.q2'), t('aiChat.q3'), t('aiChat.q4'),
  ];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping]);

  const formatResponse = (data: ChatApiResponse): string => {
    if (!data.sections) return data.answer || t('aiChat.defaultAnswer');
    const { summary, dosage, precautions, tips } = data.sections;
    const parts: string[] = [];
    if (summary) parts.push(summary);
    if (dosage) parts.push(\`📋 \${dosage}\`);
    if (precautions) parts.push(\`⚠️ \${precautions}\`);
    if (tips) parts.push(\`💡 \${tips}\`);
    return parts.filter(Boolean).join('

') || data.answer || t('aiChat.defaultAnswer');
  };

  const handleSend = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || isTyping) return;

    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await apiClient.post<ChatApiResponse>('/chat', { question: msg });
      const data = response.data;
      const content = data.success ? formatResponse(data) : t('aiChat.defaultAnswer');
      setMessages(prev => [...prev, { role: 'assistant', content }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '서버에 연결할 수 없어요. 잠시 후 다시 시도해 주세요.',
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col safe-area-padding">
      <header className="tds-header">
        <div className="flex items-center h-14 px-4 border-b border-border">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <div className="flex-1 text-center">
            <span className={`font-bold text-foreground ${sr ? 'text-xl' : 'text-lg'}`}>{t('aiChat.title')}</span>
          </div>
          <div className="w-10" />
        </div>
      </header>

      <main ref={scrollRef} className="flex-1 px-4 py-4 overflow-y-auto pb-44">
        <div className="max-w-lg mx-auto space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mr-2 mt-1">
                  <span className="text-primary-foreground text-xs">AI</span>
                </div>
              )}
              <div className={`max-w-[78%] px-4 py-3 leading-relaxed whitespace-pre-line ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-md'
                  : 'bg-card border border-border text-foreground rounded-2xl rounded-bl-md'
              } ${sr ? 'text-base' : 'text-sm'}`}>
                {msg.content}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mr-2 mt-1">
                <span className="text-primary-foreground text-xs">AI</span>
              </div>
              <div className="bg-card border border-border rounded-2xl rounded-bl-md px-5 py-4 flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          {messages.length <= 1 && !isTyping && (
            <div className="pt-2">
              <p className={`text-muted-foreground mb-3 ${sr ? 'text-base' : 'text-xs'}`}>{t('aiChat.faq')}</p>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map(q => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className={`tds-chip ${sr ? 'text-base h-12 px-5' : 'text-xs h-9 px-3'}`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <div className="fixed bottom-16 left-0 right-0 bg-card border-t border-border p-3 safe-area-padding">
        <div className="max-w-lg mx-auto flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.nativeEvent.isComposing && handleSend()}
            placeholder={t('aiChat.placeholder')}
            className={`tds-textfield flex-1 ${sr ? 'text-lg' : ''}`}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className={`rounded-2xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 transition-all active:scale-95 ${
              sr ? 'w-16 h-16' : 'w-14 h-14'
            }`}
          >
            <Send className={sr ? 'w-6 h-6' : 'w-5 h-5'} />
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default AiChat;
