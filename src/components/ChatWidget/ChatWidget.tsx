import React, { useEffect, useRef, useState } from 'react';

/**
 * 好好 AI 聊天助理 — 右下角浮動視窗
 *
 * - 全站可見，掛在 App 根層
 * - 使用「好好」IP 圖檔（/images/mascot/haohao-360.png）為頭像
 * - 對話透過 POST /api/chat 送給 Claude，語氣依 CIS 手冊第八章
 * - 訊息只存在元件 state，重新整理後清除（未來可存 Supabase）
 */

type Role = 'user' | 'assistant';
interface Message {
  role: Role;
  content: string;
}

const MASCOT_URL = '/images/mascot/haohao-360.png';

const INITIAL_MESSAGES: Message[] = [
  {
    role: 'assistant',
    content: '您好，我是好齡居助理「好好」。想改善家裡的哪個地方呢？可以先跟我聊聊看。',
  },
];

const QUICK_PROMPTS = [
  '想幫爸媽整理房子',
  '退休後老家想出租',
  '什麼是老前整理？',
  '我住在雙北，你們有服務嗎？',
];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 自動捲到底
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sending]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setError(null);
    const next: Message[] = [...messages, { role: 'user', content: trimmed }];
    setMessages(next);
    setInput('');
    setSending(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next.map(m => ({ role: m.role, content: m.content })) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || '暫時無法回覆，請稍後再試');
      setMessages([...next, { role: 'assistant', content: data.reply }]);
    } catch (e: any) {
      setError(e?.message || '暫時無法回覆，請稍後再試');
    } finally {
      setSending(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
  };

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="開啟好好聊天助理"
          className="fixed bottom-6 right-6 z-40 flex items-center gap-3 group"
        >
          <span className="hidden md:inline-block bg-white text-[#00464B] text-sm font-medium px-3 py-2 rounded-2xl rounded-br shadow-lg border border-stone-200 max-w-[200px] group-hover:translate-x-[-4px] transition-transform">
            您好！想改善家裡的哪個地方呢？
          </span>
          <span
            className="w-16 h-16 rounded-full shadow-lg flex items-center justify-center relative overflow-hidden"
            style={{ backgroundColor: '#EB5514', boxShadow: '0 8px 24px rgba(235,85,20,0.35)' }}
          >
            <img
              src={MASCOT_URL}
              alt="好好"
              className="w-14 h-14 object-contain"
              draggable={false}
            />
            <span
              className="absolute top-1 right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white animate-pulse"
              aria-hidden="true"
            />
          </span>
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div
          className="fixed bottom-6 right-6 z-40 w-[min(380px,calc(100vw-32px))] h-[560px] max-h-[calc(100vh-48px)] bg-white rounded-2xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden"
          role="dialog"
          aria-label="好好聊天助理"
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 text-white" style={{ backgroundColor: '#00464B' }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#EB5514' }}>
              <img src={MASCOT_URL} alt="好好" className="w-9 h-9 object-contain" />
            </div>
            <div className="flex-1 leading-tight">
              <div className="font-bold text-[15px]">好齡居助理｜好好</div>
              <div className="text-[11px] opacity-85 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                安心顧問線上支援
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="關閉聊天視窗"
              className="text-white/70 hover:text-white text-lg leading-none px-2"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3" style={{ backgroundColor: '#FFF9EF' }}>
            {messages.map((m, i) => (
              <MessageBubble key={i} role={m.role} content={m.content} />
            ))}
            {sending && (
              <div className="flex items-end gap-2 max-w-[85%]">
                <img src={MASCOT_URL} alt="" className="w-7 h-7 rounded-full flex-shrink-0" style={{ backgroundColor: '#EB5514', padding: 2 }} />
                <div className="px-4 py-2.5 rounded-2xl rounded-bl-sm border border-stone-200 bg-white text-[#00464B] text-sm">
                  <span className="inline-flex gap-1">
                    <span className="w-1.5 h-1.5 bg-[#00464B] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-[#00464B] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-[#00464B] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                </div>
              </div>
            )}
            {error && (
              <div className="text-xs px-3 py-2 rounded-lg bg-red-50 text-red-700 border border-red-100">
                {error}
              </div>
            )}
          </div>

          {/* Quick prompts */}
          {messages.length <= 2 && !sending && (
            <div className="px-3 py-2 flex gap-1.5 overflow-x-auto border-t border-stone-100" style={{ backgroundColor: '#FFF9EF' }}>
              {QUICK_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => send(p)}
                  className="whitespace-nowrap text-[11px] px-3 py-1.5 rounded-full border font-medium text-[#00464B] bg-white border-[#00464B]/40 hover:bg-[#00464B]/5"
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form onSubmit={onSubmit} className="flex items-center gap-2 px-3 py-3 border-t border-stone-200 bg-white">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="輸入您想問的事…"
              disabled={sending}
              className="flex-1 px-3 py-2.5 rounded-full bg-[#FFF9EF] border border-stone-200 text-sm text-[#00464B] placeholder-stone-400 focus:outline-none focus:border-[#00464B]"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              aria-label="送出訊息"
              className="w-9 h-9 rounded-full text-white flex items-center justify-center flex-shrink-0 disabled:opacity-40"
              style={{ backgroundColor: '#00464B' }}
            >
              ➤
            </button>
          </form>
        </div>
      )}
    </>
  );
}

function MessageBubble({ role, content }: { role: Role; content: string }) {
  const isBot = role === 'assistant';
  return (
    <div className={`flex items-end gap-2 max-w-[85%] ${isBot ? '' : 'ml-auto flex-row-reverse'}`}>
      {isBot && (
        <img
          src={MASCOT_URL}
          alt=""
          className="w-7 h-7 rounded-full flex-shrink-0"
          style={{ backgroundColor: '#EB5514', padding: 2 }}
        />
      )}
      <div
        className={
          'px-3.5 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ' +
          (isBot
            ? 'bg-white text-[#00464B] border border-stone-200 rounded-bl-sm'
            : 'text-white rounded-br-sm')
        }
        style={!isBot ? { backgroundColor: '#EB5514' } : undefined}
      >
        {content}
      </div>
    </div>
  );
}
