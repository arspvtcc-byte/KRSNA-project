import { useState, useRef, useEffect } from 'react';
import type { ChangeEvent, FC } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Settings, Send, Square } from 'lucide-react';
import type { ModeId, ChatMessage } from '../types';

interface ChatViewProps {
  mode: ModeId;
  onBack: () => void;
  onOpenSettings: () => void;
}

export const ChatView: FC<ChatViewProps> = ({ mode, onBack, onOpenSettings }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem(`KRSNA_CHAT_${mode}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const longPressTimerRef = useRef<number | null>(null);

  // Auto-persist per mode session
  useEffect(() => {
    localStorage.setItem(`KRSNA_CHAT_${mode}`, JSON.stringify(messages));
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isGenerating, mode]);

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const lineHeight = 24;
      const maxHeight = lineHeight * 5;
      textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleTouchStart = (text: string, id: string) => {
    longPressTimerRef.current = window.setTimeout(() => {
      handleCopy(text, id);
    }, 550);
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);
  };

  // Sends message to Server 1 (port 3000) with token-by-token streaming
  const handleSend = async () => {
    if (!input.trim() || isGenerating) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      mode,
      timestamp: Date.now()
    };

    const aiMsgId = `ai-${Date.now()}`;
    const initialAiMsg: ChatMessage = {
      id: aiMsgId,
      role: 'assistant',
      content: '',
      mode,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg, initialAiMsg]);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    setIsGenerating(true);
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const serverHttpUrl = localStorage.getItem('KRSNA_HTTP_URL') || 'http://127.0.0.1:3000';
      const deviceId = localStorage.getItem('KRSNA_DEVICE_ID') || 'krsna-dev-local';
      const profile = localStorage.getItem('KRSNA_PROFILE') || '{}';

      const response = await fetch(`${serverHttpUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Device-Id': deviceId
        },
        body: JSON.stringify({
          mode,
          message: userMsg.content,
          history: messages.slice(-10),
          profile: JSON.parse(profile)
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No streaming body returned');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;

        setMessages(prev =>
          prev.map(m => (m.id === aiMsgId ? { ...m, content: accumulated } : m))
        );
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setMessages(prev =>
          prev.map(m =>
            m.id === aiMsgId
              ? { ...m, content: `Error: ${err.message || 'Server connection failed.'}` }
              : m
          )
        );
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[var(--bg-app)] text-[var(--text-app)]">
      {/* Slide-in Top Header without Menu button */}
      <motion.header 
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="h-16 px-4 flex items-center justify-between border-b border-[var(--border-dial)] bg-[var(--bg-app)] z-10 shrink-0"
      >
        <button 
          onClick={onBack} 
          className="p-2 rounded-lg hover:bg-[#D2B48C]/30 active:scale-95 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2">
          <span className="font-black text-xl tracking-widest text-[var(--text-app)]">KRSNA</span>
          <span className="text-xs uppercase font-mono px-2 py-0.5 rounded border border-[#8B0000] text-[#8B0000] font-bold">
            {mode}
          </span>
        </div>

        <button 
          onClick={onOpenSettings} 
          className="p-2 rounded-lg hover:bg-[#D2B48C]/30 active:scale-95 transition-all"
        >
          <Settings className="w-5 h-5" />
        </button>
      </motion.header>

      {/* Messages Scroll Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-5">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center opacity-60 text-center space-y-2">
            <p className="font-mono text-sm tracking-wider uppercase font-bold text-[#8B0000]">
              Mode: {mode} Ready
            </p>
            <p className="text-xs text-[var(--text-app)]">Send a message to begin.</p>
          </div>
        )}

        {messages.map((msg, index) => {
          const isLatestUser = msg.role === 'user' && index === messages.length - 2 && isGenerating;
          const isFadedUser = msg.role === 'user' && !isLatestUser;

          return (
            <div 
              key={msg.id} 
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} transition-opacity duration-300`}
              onTouchStart={() => handleTouchStart(msg.content, msg.id)}
              onTouchEnd={handleTouchEnd}
              onContextMenu={(e) => { e.preventDefault(); handleCopy(msg.content, msg.id); }}
            >
              {msg.role === 'user' ? (
                <div 
                  className={`max-w-[85%] sm:max-w-[70%] px-4 py-2.5 rounded-2xl border border-[var(--border-dial)] transition-all ${
                    isFadedUser ? 'opacity-40 bg-[var(--user-bubble)] text-[var(--user-bubble-text)]' : 'opacity-100 bg-[var(--user-bubble)] text-[var(--user-bubble-text)]'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
              ) : (
                <div className="max-w-[92%] sm:max-w-[80%] py-2 text-[var(--text-app)]">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap font-sans">
                    {msg.content || (isGenerating && index === messages.length - 1 ? '...' : '')}
                  </p>
                </div>
              )}

              {copiedId === msg.id && (
                <span className="text-[10px] text-[#8B0000] font-mono mt-1 font-bold">Copied</span>
              )}
            </div>
          );
        })}

        {isGenerating && messages[messages.length - 1]?.content === '' && (
          <div className="flex items-center space-x-1.5 py-2">
            <span className="w-2 h-2 rounded-full bg-[#8B0000] animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 rounded-full bg-[#8B0000] animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 rounded-full bg-[#8B0000] animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        )}
      </div>

      {/* Slide-in Expanding Composer */}
      <motion.div 
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="p-3 bg-[var(--bg-app)] border-t border-[var(--border-dial)] shrink-0"
      >
        <div className="max-w-4xl mx-auto flex items-end space-x-2 bg-[var(--input-bg)] rounded-2xl border border-[var(--border-dial)] px-3 py-1.5 focus-within:border-[#8B0000] transition-colors">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={handleInputChange}
            placeholder={`Message ${mode}...`}
            className="flex-1 max-h-[120px] bg-transparent resize-none outline-none text-sm text-[var(--text-app)] placeholder:opacity-50 leading-6 py-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />

          {isGenerating ? (
            <button
              onClick={handleStop}
              className="p-2 rounded-xl bg-[#8B0000] text-white hover:bg-[#8B0000]/80 active:scale-95 transition-all"
              title="Stop Generation"
            >
              <Square className="w-4 h-4 fill-white" />
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="p-2 rounded-xl bg-[var(--text-app)] text-[var(--bg-app)] active:scale-95 transition-all disabled:opacity-30 disabled:scale-100"
              title="Send"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
