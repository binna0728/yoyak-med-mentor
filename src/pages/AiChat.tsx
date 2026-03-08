import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { useSeniorMode } from '@/contexts/SeniorModeContext';
import BottomNav from '@/components/BottomNav';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const AiChat = () => {
  const navigate = useNavigate();
  const { isSeniorMode: sr } = useSeniorMode();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: '안녕하세요! 😊\n약에 대해 궁금한 점을 물어보세요.\n복용법, 부작용, 주의사항 등 무엇이든 도와드릴게요.' },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const quickQuestions = [
    '부작용이 있나요?',
    '카페인 드나요?',
    '식전에 먹어도 되나요?',
    '다른 약과 같이 먹어도 되나요?',
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

    // Simulate AI response
    setTimeout(() => {
      const responses: Record<string, string> = {
        '부작용이 있나요?': '대부분의 약은 부작용이 있을 수 있어요. 흔한 부작용으로는 위장장애, 두통, 어지러움 등이 있습니다.\n\n심각한 증상이 나타나면 즉시 복용을 중단하고 의사와 상담하세요.',
        '카페인 드나요?': '일부 진통제나 감기약에는 카페인이 포함되어 있을 수 있어요.\n\n정확한 성분은 약 포장지의 성분표를 확인하시거나, 약사에게 문의해주세요.',
        '식전에 먹어도 되나요?': '약마다 복용 시점이 달라요.\n\n• 식전 복용: 공복에 흡수가 잘 되는 약\n• 식후 복용: 위장 자극을 줄이기 위한 약\n\n처방전이나 약 봉투의 안내를 따라주세요.',
        '다른 약과 같이 먹어도 되나요?': '약물 상호작용이 있을 수 있어요.\n\n현재 복용 중인 약이 있다면, 반드시 의사나 약사에게 알려주세요. 특히 혈압약, 당뇨약, 혈액응고 관련 약물은 주의가 필요합니다.',
      };
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: responses[msg] || '약에 대한 정보를 확인하고 있어요.\n\n정확한 복용 정보는 의사·약사와 상담해주세요. 일반적으로 해당 약은 식후에 복용하는 것이 좋으며, 부작용이 나타나면 복용을 중단하고 전문가와 상담하시길 권합니다.'
      }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col safe-area-padding">
      {/* Header */}
      <header className="tds-header">
        <div className="flex items-center h-14 px-4 border-b border-border">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <div className="flex-1 text-center">
            <span className={`font-bold text-foreground ${sr ? 'text-xl' : 'text-lg'}`}>🤖 AI 상담</span>
          </div>
          <div className="w-10" />
        </div>
      </header>

      {/* Messages */}
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

          {/* Typing indicator */}
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

          {/* Quick question chips */}
          {messages.length <= 1 && !isTyping && (
            <div className="pt-2">
              <p className={`text-muted-foreground mb-3 ${sr ? 'text-base' : 'text-xs'}`}>자주 묻는 질문</p>
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

      {/* Input area */}
      <div className="fixed bottom-16 left-0 right-0 bg-card border-t border-border p-3 safe-area-padding">
        <div className="max-w-lg mx-auto flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.nativeEvent.isComposing && handleSend()}
            placeholder="궁금한 점을 입력하세요"
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
