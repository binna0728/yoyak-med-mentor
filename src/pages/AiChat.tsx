import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const AiChat = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: '안녕하세요! 약에 대해 궁금한 점을 물어보세요. 😊' },
  ]);
  const [input, setInput] = useState('');

  const quickQuestions = ['부작용이 있나요?', '카페인 드나요?', '식전에 먹어도 되나요?'];

  const handleSend = (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;

    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setInput('');

    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '약에 대한 정보를 확인하고 있어요. 정확한 복용 정보는 의사·약사와 상담해주세요. 일반적으로 해당 약은 식후에 복용하는 것이 좋으며, 부작용이 나타나면 복용을 중단하고 전문가와 상담하시길 권합니다.'
      }]);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col safe-area-padding">
      <header className="tds-header">
        <div className="flex items-center h-14 px-4 border-b border-border">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2"><ArrowLeft className="w-6 h-6 text-foreground" /></button>
          <div className="flex-1 text-center"><span className="text-lg font-bold text-foreground">AI 상담</span></div>
          <div className="w-10" />
        </div>
      </header>

      <main className="flex-1 px-4 py-4 overflow-y-auto pb-32">
        <div className="max-w-lg mx-auto space-y-3">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-md'
                  : 'bg-accent text-foreground rounded-bl-md'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}

          {/* Quick question chips */}
          {messages.length <= 1 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {quickQuestions.map(q => (
                <button key={q} onClick={() => handleSend(q)} className="tds-chip text-xs h-9 px-3">{q}</button>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Input */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-3 safe-area-padding">
        <div className="max-w-lg mx-auto flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="궁금한 점을 입력하세요"
            className="tds-textfield flex-1"
          />
          <button onClick={() => handleSend()} disabled={!input.trim()} className="w-14 h-14 rounded-xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40">
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiChat;
