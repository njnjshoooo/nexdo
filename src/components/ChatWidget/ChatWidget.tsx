import React, { useEffect, useRef, useState } from 'react';
import { HAOHAO_FAQ, QUICK_PROMPT_IDS, findFAQ, type FAQEntry } from '../../data/haohaoFAQ';

/**
 * 好好 AI 聊天助理 — 右下角浮動視窗（本地 FAQ 版本）
 *
 * - 全站可見，掛在 App 根層
 * - 使用「好好」IP 圖檔（/images/mascot/haohao-360.png）為頭像
 * - 對話用本地 FAQ 關鍵字比對（不需 API Key、不用月費、瞬間回覆）
 * - 未來若要升級成 Claude AI 對話，把 sendMessage 換成呼叫 /api/chat 即可
 */

type Role = 'user' | 'assistant';
interface Message {
  role: Role;
  content: string;
  followUps?: FAQEntry[]; // 提供給使用者的相關建議
}

// 透明背景的好好揮手 PNG（品牌 IP 資產）
const MASCOT_URL = '/images/mascot/haohao-wave-1.png';
const MASCOT_AVATAR_URL = '/images/mascot/haohao-wave-1.png';

const GREETING: Message = {
  role: 'assistant',
  content: '您好，我是好齡居助理「好好」🧡\n想改善家裡的哪個地方，或有什麼想問的？可以先聊聊看。',
};

// 從 FAQ 找出設定為 quick prompt 的項目
const QUICK_PROMPTS: FAQEntry[] = QUICK_PROMPT_IDS
  .map(id => HAOHAO_FAQ.find(f => f.id === id))
  .filter((x): x is FAQEntry => !!x);

// 找不到適合答案時的 fallback
const FALLBACK_ANSWER =
  '這個我想再確認一下，不敢隨便回答您。您可以先看看下面的常見問題，或請安心顧問幫您處理：填「預約評估」表單、或寫信到 service@nexdo.tw，我們會盡快聯絡您。';

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sending]);

  // 直接送 FAQ entry 的答案（quick prompt 或 follow-up 被點時用）
  const askEntry = (entry: FAQEntry) => {
    setInput('');
    setSending(true);
    setMessages(prev => [
      ...prev,
      { role: 'user', content: entry.question },
    ]);
    // 模擬短暫思考感（100ms），提升「有人在回話」的體感
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: entry.answer,
          followUps: HAOHAO_FAQ.filter(f => f.id !== entry.id && f.category === entry.category).slice(0, 2),
        },
      ]);
      setSending(false);
    }, 250);
  };

  // 使用者自由輸入 → 用關鍵字比對找 FAQ
  const askFreeText = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setInput('');
    setSending(true);
    setMessages(prev => [...prev, { role: 'user', content: trimmed }]);

    setTimeout(() => {
      const { entry, alternatives } = findFAQ(trimmed);
      const reply: Message = entry
        ? {
            role: 'assistant',
            content: entry.answer,
            followUps: alternatives.slice(0, 2),
          }
        : {
            role: 'assistant',
            content: FALLBACK_ANSWER,
            followUps: alternatives.slice(0, 3),
          };
      setMessages(prev => [...prev, reply]);
      setSending(false);
    }, 250);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    askFreeText(input);
  };

  const showInitialPrompts = messages.length === 1 && !sending;

  return (
    <>
      {/* Floating button — 好好 IP 透明底 PNG，不用橘色圓底、不顯示常駐文字（避免遮擋畫面）*/}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="開啟好好聊天助理"
          className="fixed bottom-4 right-4 z-40 group focus:outline-none"
          style={{
            filter: 'drop-shadow(0 6px 16px rgba(0, 70, 75, 0.20)) drop-shadow(0 2px 4px rgba(0, 70, 75, 0.15))',
          }}
        >
          <img
            src={MASCOT_URL}
            alt="好好"
            className="w-16 h-16 md:w-20 md:h-20 object-contain transition-transform group-hover:scale-105"
            draggable={false}
          />
          {/* 綠色脈動點暗示可互動 */}
          <span
            className="absolute top-1 right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white animate-pulse"
            aria-hidden="true"
          />
          {/* 只在 hover 時顯示的提示（不會擋畫面）*/}
          <span className="pointer-events-none absolute right-full top-1/2 -translate-y-1/2 mr-2 whitespace-nowrap bg-[#00464B] text-white text-xs font-medium px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
            找好好聊聊
          </span>
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div
          className="fixed bottom-4 right-4 z-40 w-[min(380px,calc(100vw-24px))] h-[560px] max-h-[calc(100vh-32px)] bg-white rounded-2xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden"
          role="dialog"
          aria-label="好好聊天助理"
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 text-white" style={{ backgroundColor: '#00464B' }}>
            <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
              <img src={MASCOT_AVATAR_URL} alt="好好" className="w-10 h-10 object-contain" />
            </div>
            <div className="flex-1 leading-tight">
              <div className="font-bold text-[15px]">好齡居助理｜好好</div>
              <div className="text-[11px] opacity-85 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                線上支援
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
              <div key={i} className="space-y-2">
                <MessageBubble role={m.role} content={m.content} />
                {m.role === 'assistant' && m.followUps && m.followUps.length > 0 && (
                  <div className="ml-9 flex flex-col gap-1.5">
                    <div className="text-[10px] uppercase tracking-wider text-stone-400 font-medium">
                      您也可以問
                    </div>
                    {m.followUps.map(f => (
                      <button
                        key={f.id}
                        onClick={() => askEntry(f)}
                        className="text-left text-[12px] px-3 py-2 rounded-xl border border-stone-200 bg-white hover:border-[#00464B] hover:bg-[#00464B]/5 text-[#00464B] transition-colors"
                      >
                        {f.question}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {sending && (
              <div className="flex items-end gap-2 max-w-[85%]">
                <img
                  src={MASCOT_URL}
                  alt=""
                  className="w-7 h-7 rounded-full flex-shrink-0 p-0.5"
                  style={{ backgroundColor: '#EB5514' }}
                />
                <div className="px-4 py-2.5 rounded-2xl rounded-bl-sm border border-stone-200 bg-white text-[#00464B] text-sm">
                  <span className="inline-flex gap-1">
                    <span className="w-1.5 h-1.5 bg-[#00464B] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-[#00464B] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-[#00464B] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Quick prompts（開場時） */}
          {showInitialPrompts && (
            <div className="px-3 py-3 border-t border-stone-100 flex flex-col gap-1.5" style={{ backgroundColor: '#FFF9EF' }}>
              <div className="text-[10px] uppercase tracking-wider text-stone-500 font-medium px-1 mb-0.5">
                常見問題
              </div>
              {QUICK_PROMPTS.map(p => (
                <button
                  key={p.id}
                  onClick={() => askEntry(p)}
                  className="text-left text-[12.5px] px-3 py-2 rounded-xl border border-stone-200 bg-white hover:border-[#00464B] hover:bg-[#00464B]/5 text-[#00464B] transition-colors font-medium"
                >
                  {p.question}
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
          className="w-7 h-7 rounded-full flex-shrink-0 p-0.5"
          style={{ backgroundColor: '#EB5514' }}
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
