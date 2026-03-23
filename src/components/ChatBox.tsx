import { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '@/data/mockData';
import { Send } from 'lucide-react';

interface ChatBoxProps {
  messages: ChatMessage[];
  onSend: (text: string) => void;
}

export default function ChatBox({ messages, onSend }: ChatBoxProps) {
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input.trim());
    setInput('');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-4 border-b border-border">
        <h2 className="font-semibold text-foreground text-lg">Group Chat</h2>
        <div className="flex gap-1 mt-2">
          <button className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium">Messages</button>
          <button className="px-3 py-1.5 rounded-lg text-muted-foreground text-xs font-medium hover:bg-muted transition-colors">Participants</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`animate-fade-in ${msg.isOwn ? 'flex flex-col items-end' : ''}`}>
            {!msg.isOwn && (
              <p className="text-xs text-muted-foreground mb-1 font-medium">{msg.senderName}</p>
            )}
            <div className={`max-w-[85%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed ${
              msg.isOwn
                ? 'bg-primary/10 text-foreground rounded-br-md'
                : 'bg-muted text-foreground rounded-bl-md'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="px-4 py-3 border-t border-border">
        <div className="flex items-center gap-2 bg-muted rounded-xl px-3 py-1.5">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Write your message..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground py-1"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="control-btn-primary w-8 h-8 rounded-lg disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
