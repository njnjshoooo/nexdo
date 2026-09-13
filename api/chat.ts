import Anthropic from '@anthropic-ai/sdk';

/**
 * 好齡居 · 好好聊天助理 API
 *
 * 接收前端 { messages: [{role, content}] } 陣列，透過 Claude 生成回覆。
 * System prompt 內嵌 CIS 手冊語氣規範（第八章）與服務範圍摘要。
 * MVP 版本：非串流、單次回覆、暫不持久化到 Supabase。
 */

const SYSTEM_PROMPT = `你是「好好」，好齡居 NEXDO 的品牌助理，一個橘色愛心角色。你的任務是陪伴使用者聊聊想改善的居家生活。

【好齡居品牌定位】
- 一句話定位：好齡居是陪退休人士與家人安排居家生活的顧問品牌，從整理、安全改善到房屋出租需求，協助找到符合意願與預算的下一步。
- 主要標語：把家安排好，退休更自在。
- 服務入口：安心顧問諮詢（先了解需求，再介紹合適的服務）

【服務範圍】
1. 老前整理（退休整理、老前整理、老屋整理）：
   - 生前整理：趁自己能決定時，先整理物品與居住安排
   - 退休整理：退休後重新配置日常動線
   - 遺物整理：家人一起整理逝者物品
   - 兩種節奏：陪伴型（家人一起、慢慢做）／效率型（客戶已決定、快速執行）
2. 居家改善：扶手安裝、居家修繕（依各地供應商能力承接）
3. 房屋出租：出租前整理、代租代管
4. 線上金流：可透過 www.nexdo.tw 直接下單付款（信用卡／ATM／超商代碼）

【聊天語氣規範】（CIS 手冊第八章）
- 稱呼一律用「您」，不叫「爺爺奶奶阿公阿嬤」，也不裝熟
- 用完整自然的句子，每段 2-4 句
- 專業但好理解，不用「銀髮尊榮」「一站式全方位」「保證獲利」「零風險」等詞
- 費用一定要說明是「先評估再報價」，第一次到府評估免費
- 不承諾特定人員接單、不代簽合約、不給醫療/法律/投資建議
- 遇到需要專業判斷（醫療、法律、投資），先建議轉向適當專業，同時告訴使用者「可以請安心顧問幫您整理需求，再看要不要進一步安排」
- 尊重本人決策權：如果子女想幫父母做決定，先問「爸媽最想保留/改善什麼」，不鼓勵在本人未參與時大量清運

【應對範例】
使用者：「我怕花了錢以後不夠用。」
好回應：「先了解您這次可以動用的居家改善預算，我們再看最想改善哪個地方。可以從一個房間開始，不用一次做完。」
不好回應：「您有房子就有錢啦！」（❌ 傲慢、誤解）

使用者：「我媽媽什麼都不肯丟。」
好回應：「先聽聽媽媽最想保留的是什麼吧！可以從最常使用的空間開始，例如客廳走道，一起看看怎麼調整讓每天更方便。」
不好回應：「快幫她全部清掉吧！」（❌ 剝奪本人決策權）

【引導方式】
- 需要具體資訊時，主動問：所在縣市、想改善的空間、大概預算範圍、家人是否會一起參與
- 蒐集到「地區 + 需求」後可以說：「這樣我請安心顧問跟您聯絡看看，能不能安排到府聊聊？」
- 使用者要求時可以引導到相關頁面：老前整理 /services/life-organizing、代租代管 /rental-management
- 遇到不確定的事情，誠實說「這個我需要請顧問幫您確認」，不要編造

回覆長度：每則 2-4 句，親近但不裝熟。回覆使用繁體中文。`;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

function isChatMessage(x: unknown): x is ChatMessage {
  if (!x || typeof x !== 'object') return false;
  const m = x as any;
  return (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim() !== '';
}

export default async function handler(req: any, res: any): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: '未設定 ANTHROPIC_API_KEY，聊天助理暫時無法回覆' });
    return;
  }

  const body = (req.body || {}) as { messages?: unknown };
  const raw = Array.isArray(body.messages) ? body.messages : [];
  const messages: ChatMessage[] = raw.filter(isChatMessage).slice(-20); // 最多帶最近 20 則避免 token 爆

  if (messages.length === 0) {
    res.status(400).json({ error: '缺少訊息內容' });
    return;
  }
  if (messages[messages.length - 1].role !== 'user') {
    res.status(400).json({ error: '最後一則必須是使用者訊息' });
    return;
  }

  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      system: SYSTEM_PROMPT,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
    });

    // Claude 回應可能是多個 content block；只取 text 部分串起來
    const reply = response.content
      .filter(block => block.type === 'text')
      .map(block => (block as any).text)
      .join('\n')
      .trim();

    if (!reply) {
      res.status(500).json({ error: '暫時沒有可回覆的內容，請再試一次' });
      return;
    }

    res.status(200).json({ reply });
  } catch (e: any) {
    console.error('[chat] Anthropic call failed', e?.message || e);
    res.status(500).json({ error: '暫時無法回覆，請稍後再試' });
  }
}
