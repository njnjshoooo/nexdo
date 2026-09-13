/**
 * 好好聊天助理的 FAQ 資料庫
 * -----------------------------------------------------------
 * 客戶問題會 tokenize 後跟每個 entry 的 keywords 計分，最高分回答那則。
 * 全部答案都遵循 CIS 手冊第八章語氣（用「您」、不承諾保證、遇專業轉安心顧問）。
 *
 * 新增 FAQ 時：
 * 1. 想全面涵蓋常見講法 → 每個 entry 至少 5-10 個關鍵字，包含錯字/口語
 * 2. 答案 2-4 句、80-140 字為佳
 * 3. 每個答案盡量指向下一步（預約評估、看某頁、留電話等）
 */

export interface FAQEntry {
  id: string;
  question: string;   // 給 quick prompts 顯示用
  keywords: string[]; // 使用者輸入命中這些字就算加分
  answer: string;     // 好好的回答
  category?: string;
}

export const HAOHAO_FAQ: FAQEntry[] = [
  // ============ 老前整理 / 服務內容 ============
  {
    id: 'what-is-lao-qian',
    question: '什麼是老前整理？',
    keywords: ['老前整理', '老前', '什麼是', '介紹', '意思'],
    answer: '「老前整理」是趁自己還能自主決定的時候，把物品、文件與居住安排先梳理一遍。不是丟東西，是把重要的先留下、擺對位置，讓現在的生活更順、也讓未來家人比較好接手。您可以只從一個房間開始，不用一次做完。',
    category: '服務介紹',
  },
  {
    id: 'lao-qian-stages',
    question: '老前整理分哪些階段？',
    keywords: ['階段', '種類', '分類', '生前整理', '退休整理', '遺物整理', '差別'],
    answer: '我們把老前整理分三種節奏：\n1. 生前整理 — 自己還在的時候親手選擇留下什麼\n2. 退休整理 — 退休後重新配置日常動線\n3. 遺物整理 — 家人一起整理逝者物品\n\n三種都可以搭配「陪伴型（慢慢做）」或「效率型（客戶已決定、快速執行）」節奏。',
    category: '服務介紹',
  },
  {
    id: 'parents-refuse',
    question: '想幫爸媽整理，但他們什麼都不肯丟',
    keywords: ['爸媽', '父母', '媽媽', '爸爸', '長輩', '不肯丟', '不想丟', '捨不得', '不願意', '抗拒', '整理'],
    answer: '先聽聽爸媽最想保留的是什麼吧！可以從最常使用的空間開始，例如客廳的走道，一起看看怎麼調整讓每天更方便。不用一次全部處理，先從一個抽屜、一個房間開始，多數家人聊過後都會慢慢願意加入。',
    category: '整理過程',
  },
  {
    id: 'family-together',
    question: '整理過程需要家人陪同嗎？',
    keywords: ['家人', '陪同', '一起', '需要', '陪伴', '參與'],
    answer: '兩種都可以。「陪伴型」建議家人一起，特別是要決定哪些東西留下時；「效率型」如果您已經決定要處理哪些，安心顧問和團隊就可以直接執行。實際安排會在到府評估時和您討論。',
    category: '整理過程',
  },

  // ============ 房屋出租 / 代租代管 ============
  {
    id: 'retire-rent-house',
    question: '退休後老家想出租，會不會很麻煩？',
    keywords: ['退休', '老家', '空屋', '閒置', '出租', '租房', '麻煩', '房子'],
    answer: '先了解屋況、可能的租金收入和管理成本，再決定會比較安心。我們可以先派顧問到府盤點，幫您把費用和責任列清楚：屋況修繕、清潔費、預估租金、代租代管費用等。您看完數字再決定要不要開始，都可以。',
    category: '房屋出租',
  },
  {
    id: 'move-in-ready',
    question: '出租前需要先整理嗎？',
    keywords: ['出租前', '整理', '清運', '空屋', '打掃', '修繕'],
    answer: '有的。出租前的整戶備妥可以模組化選購：清空 → 修繕評估 → 清潔 → 拍照 → 上架 → 代租代管。您可以只做其中幾項，也可以整套委託。第一次評估免費，看完報價再決定範圍。',
    category: '房屋出租',
  },
  {
    id: 'rental-management',
    question: '代租代管服務內容是什麼？',
    keywords: ['代租', '代管', '代租代管', '房東', '租客', '管理'],
    answer: '好齡居代租代管包括：租客招募、租約簽訂、租金代收、租期中的維修協調、退租點交。詳細內容和費用您可以看 /rental-management 頁面，或請安心顧問到府談，我們會用您的房子實際情況估算。',
    category: '房屋出租',
  },

  // ============ 費用 / 報價 / 收費 ============
  {
    id: 'pricing',
    question: '費用怎麼算？',
    keywords: ['費用', '收費', '價格', '報價', '多少錢', '花多少', '多錢'],
    answer: '所有服務都是「先評估再報價」，第一次到府評估免費。實際費用依範圍、時程、物品量、人力配置而定，會用書面確認過再開始。不會有事後追加不告知的狀況。',
    category: '費用',
  },
  {
    id: 'deposit-visit',
    question: '第一次到府評估要錢嗎？',
    keywords: ['到府', '評估', '第一次', '免費', '要錢', '收費'],
    answer: '第一次到府評估是免費的。顧問會和您討論想改善的地方、看看實際物品和空間、了解您的節奏，之後才提供書面報價。您可以看完再決定要不要繼續。',
    category: '費用',
  },
  {
    id: 'payment-method',
    question: '有哪些付款方式？',
    keywords: ['付款', '支付', '刷卡', '信用卡', 'ATM', '轉帳', '超商'],
    answer: '線上下單支援信用卡、ATM 虛擬帳號、超商代碼繳費、Apple Pay。若您比較習慣現場付款，也可以請安心顧問到府時協助。',
    category: '費用',
  },

  // ============ 時間 / 服務範圍 ============
  {
    id: 'how-long',
    question: '整理大概需要多久時間？',
    keywords: ['多久', '時間', '幾天', '幾週', '完成', '長度'],
    answer: '看範圍不太一樣。多數專案在 3-14 個工作天內完成。如果家人希望慢慢進行，也可以分階段安排，不用一次做完。實際天數會在評估後告知，並和您確認可以配合的時段。',
    category: '流程',
  },
  {
    id: 'service-area',
    question: '有服務我住的區域嗎？',
    keywords: ['地區', '區域', '服務範圍', '地點', '住', '哪裡', '雙北', '台中', '高雄', '北部', '南部'],
    answer: '目前主要服務地區是雙北、台中、高雄。其他縣市可以先詢問看看，部分服務項目透過合作供應商也可以承接。方便留下您所在的縣市和大概區域嗎？我幫您查一下能安排什麼。',
    category: '流程',
  },
  {
    id: 'consultant',
    question: '什麼是安心顧問？',
    keywords: ['安心顧問', '顧問', '誰服務', '誰處理'],
    answer: '安心顧問是好齡居的服務窗口。他們會先聽您說想改善的地方，再依需求安排適合的整理、修繕或房屋出租服務，過程中做交接紀錄和費用說明。實際到府執行的可能是好齡居的直營團隊或合作供應商，顧問全程協助溝通。',
    category: '服務介紹',
  },

  // ============ 其他 ============
  {
    id: 'trash',
    question: '整理出來要處理的物品怎麼安排？',
    keywords: ['清運', '丟掉', '垃圾', '處理', '搬走', '不要的'],
    answer: '整戶清空與清運可以另委託好齡居「室內清運」統一處理，由安心顧問串接。您也可以選擇自行處理，或指定某些物品捐贈、給家人，我們都可以配合。',
    category: '流程',
  },
  {
    id: 'contact-us',
    question: '怎麼聯絡好齡居？',
    keywords: ['聯絡', '客服', '電話', 'email', '找誰', '怎麼問'],
    answer: '您可以在網站上填「預約評估」表單，安心顧問會 24 小時內和您聯繫；也可以寫信到 service@nexdo.tw。想繼續在這裡聊也可以，我先幫您整理需求，之後再由顧問聯絡。',
    category: '聯絡',
  },
  {
    id: 'safety',
    question: '你們可以裝扶手嗎？',
    keywords: ['扶手', '安全', '修繕', '無障礙', '改造', '裝潢'],
    answer: '可以，好齡居居家改善服務有扶手安裝、居家修繕等項目。實際能承接的內容依地區供應商能力而定，安心顧問到府評估時會告訴您實際可以做的範圍與費用。',
    category: '服務介紹',
  },
];

// 建議的 quick prompts（在對話開頭顯示的按鈕）
export const QUICK_PROMPT_IDS = [
  'parents-refuse',
  'retire-rent-house',
  'what-is-lao-qian',
  'service-area',
];

// tokenize：目前用最簡單的方式，把中文按字分開、英數按空白/標點切
function tokenize(text: string): string[] {
  const cleaned = text.replace(/[，。！？、,.!?\s]+/g, '');
  return cleaned.split('');
}

// 對 keyword 分詞（keyword 可能是「爸媽」「不想丟」這種多字詞）
function keywordMatches(text: string, keyword: string): boolean {
  return text.includes(keyword);
}

/**
 * 依使用者輸入找出最相符的 FAQ。
 * 回傳 { entry, score, alternatives }：
 * - entry：命中的 FAQ；null 表示沒命中
 * - score：分數（0-1），> 0.3 才視為有效命中
 * - alternatives：分數前 3 名的其他候選（給「您是不是想問…」用）
 */
export function findFAQ(userInput: string): {
  entry: FAQEntry | null;
  score: number;
  alternatives: FAQEntry[];
} {
  const text = userInput.trim();
  if (!text) return { entry: null, score: 0, alternatives: [] };

  const scored = HAOHAO_FAQ.map(entry => {
    let hits = 0;
    for (const kw of entry.keywords) {
      if (keywordMatches(text, kw)) hits += 1;
    }
    // 分數 = 命中的關鍵字數 / 該 entry 總關鍵字數
    const score = hits / entry.keywords.length;
    return { entry, score };
  }).sort((a, b) => b.score - a.score);

  const top = scored[0];
  if (!top || top.score < 0.15) {
    // 命中率太低 → 回傳前 3 個 FAQ 當建議
    return {
      entry: null,
      score: 0,
      alternatives: HAOHAO_FAQ.slice(0, 3),
    };
  }

  return {
    entry: top.entry,
    score: top.score,
    alternatives: scored.slice(1, 4).map(s => s.entry),
  };
}
