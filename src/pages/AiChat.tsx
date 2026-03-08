import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { useSeniorMode } from '@/contexts/SeniorModeContext';
import BottomNav from '@/components/BottomNav';
import { useTranslation } from 'react-i18next';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
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

  const handleSend = (text?: string) => {
    const msg = text || input.trim();
    if (!msg || isTyping) return;

    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const responses: Record<string, string> = {
        [t('aiChat.q1')]: t('aiChat.a1'),
        [t('aiChat.q2')]: t('aiChat.a2'),
        [t('aiChat.q3')]: t('aiChat.a3'),
        [t('aiChat.q4')]: t('aiChat.a4'),
      };
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: responses[msg] || t('aiChat.defaultAnswer')
      }]);
      setIsTyping(false);
    }, 1500);
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
