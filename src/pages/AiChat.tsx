import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { useSeniorMode } from '@/contexts/SeniorModeContext';
import BottomNav from '@/components/BottomNav';
import SeniorModeToggle from '@/components/SeniorModeToggle';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const AiChat = () => {
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

  const handleSend = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || isTyping) return;

    const userMsg: ChatMessage = { role: 'user', content: msg };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Add empty assistant message for streaming
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    let assistantSoFar = '';

    try {
      const apiMessages = [...messages.filter(m => m !== messages[0]), userMsg].map(m => ({
        role: m.role,
        content: m.content,
      }));

      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        if (resp.status === 429) {
          toast.error('요청이 너무 많습니다. 잠시 후 다시 시도해주세요.');
        } else if (resp.status === 402) {
          toast.error('AI 크레딧이 부족합니다.');
        }
        throw new Error(errorData.error || 'Stream failed');
      }

      if (!resp.body) throw new Error('No response body');

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantSoFar += content;
              const current = assistantSoFar;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'assistant', content: current };
                return updated;
              });
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split('\n')) {
          if (!raw) continue;
          if (raw.endsWith('\r')) raw = raw.slice(0, -1);
          if (raw.startsWith(':') || raw.trim() === '') continue;
          if (!raw.startsWith('data: ')) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantSoFar += content;
            }
          } catch { /* ignore */ }
        }
        if (assistantSoFar) {
          const final = assistantSoFar;
          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: 'assistant', content: final };
            return updated;
          });
        }
      }

      if (!assistantSoFar) {
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', content: t('aiChat.defaultAnswer') };
          return updated;
        });
      }
    } catch {
      if (!assistantSoFar) {
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: 'assistant',
            content: '서버에 연결할 수 없어요. 잠시 후 다시 시도해 주세요.',
          };
          return updated;
        });
      }
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex justify-end px-5 pt-4">
        <SeniorModeToggle />
      </div>
      <main ref={scrollRef} className="flex-1 px-4 py-4 overflow-y-auto pb-44">
        <div className="max-w-lg mx-auto space-y-4">
          {messages.map((msg, idx) => {
            const isStreamingEmpty = isTyping && msg.role === 'assistant' && idx === messages.length - 1 && !msg.content;
            if (isStreamingEmpty) return null;

            return (
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
                  {isTyping && msg.role === 'assistant' && idx === messages.length - 1 && msg.content && (
                    <span className="inline-block w-0.5 h-4 bg-primary ml-0.5 animate-pulse align-text-bottom" />
                  )}
                </div>
              </div>
            );
          })}

          {isTyping && messages[messages.length - 1]?.content === '' && (
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
