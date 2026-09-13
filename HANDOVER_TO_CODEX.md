# 好齡居 NEXDO 網站重新設計 — 給 Codex 的交接規範

**專案：** 好齡居 (nexdo.tw) 網站全站 UI 重設計 + 加入老前整理相關服務
**GitHub：** https://github.com/njnjshoooo/nexdo
**線上：** https://www.nexdo.tw
**現況：** Vite + React 19 + TypeScript + Supabase + Vercel（既有金流 ECPay、寄信 Resend、GA4 已上）

---

## 1. 專案定位

好齡居是**退休居家生活顧問品牌**，服務對象是台灣退休人士（雙北、台中、高雄為主）與其家人。

**主要標語：** 「把家安排好，退休更自在。」
**服務入口：** 安心顧問諮詢（顧問了解需求 → 介紹合適的整理、修繕、房屋出租服務）

**目標客群心理：**
- 剛退休想重新安排家的人
- 有閒置住宅想評估出租的屋主
- 幫父母詢問的成年子女
- 面臨家庭住宅轉換者（搬遷、空屋）

---

## 2. 品牌識別 CIS（依 CIS 手冊 v2.0，2026-09-13）

### 2.1 色系（嚴格遵守）

| 角色 | HEX | 用途 | 建議面積 |
|------|-----|------|---------|
| **品牌深綠** | `#00464B` | 標題、內文、圖示、主要按鈕 | ~25% |
| **品牌橘** | `#EB5514` | Logo 愛心、IP 主色、少量重點裝飾 | ≤ 5% |
| **暖白基底** | `#FFF9EF` | 網站背景、社群、提案 | 與白合計 ~70% |
| **白色基底** | `#FFFFFF` | 卡片、表單、文件 | 視需要 |
| **錯誤紅** | `#A52A2A` | 僅限錯誤提示 |  — |

**禁止**：綠黃色、資訊藍、提醒褐、生活綠等額外色。不加濃綠濾鏡。

### 2.2 字體

**推薦：** 源泉圓體標題 + Noto Sans TC 內文

備援順序（實作用）：
- 標題：`GenSenRounded TW, Zen Maru Gothic, Noto Sans TC, PingFang TC, Microsoft JhengHei, sans-serif`
- 內文：`Noto Sans TC, PingFang TC, Microsoft JhengHei, sans-serif`

**字級（桌面）：**
| 用途 | Size / Line-height |
|------|-------------------|
| 主標 | 44–48 px / 1.3 |
| 次標 | 28–32 px / 1.4 |
| 內文 | 18–20 px / 1.7 |
| 標籤 | 14–16 px |

**字級（手機）：**
| 用途 | Size / Line-height |
|------|-------------------|
| 主標 | 32–36 px / 1.35 |
| 次標 | 24 px / 1.4 |
| 內文 | 18 px / 1.7 |

### 2.3 版面規則

- **最大內容寬**：桌面 1,200 px、12 欄、24 px 欄距
- **左右邊距**：手機至少 20 px
- **段落間距**：16–24 px
- **按鈕圓角**：12 px
- **卡片圓角**：16–20 px
- **間距基礎單位**：4 px（常用 8, 16, 24, 32, 48）
- **可點擊區**：至少 48×48 CSS px（無障礙）
- **不要**：兩端分散對齊、密表滿版、固定卡片高度截斷內容

### 2.4 語氣（依 CIS 第八章）

**用語規則：**
- 稱呼一律用「您」，不用「爺爺奶奶」「阿公阿嬤」「寶貝」
- 每段 2–4 句，一段一個主要行動呼籲
- 專業但好理解，用完整自然句子

**推薦詞彙：**
退休生活、退休整理、老前整理、日常動線、居家改善、依您的習慣、先了解、分階段、費用說明、可能的租金收入、出租條件、本人同意、安心顧問

**禁用詞彙：**
| 不要用 | 原因 |
|--------|------|
| 銀髮尊榮、尊爵 | 空泛 |
| 一站式全方位、極致 | 誇大 |
| 保證獲利、躺著賺、零風險 | 保證用語 |
| 保證不跌倒、醫療級安全 | 醫療暗示 |
| 全台唯一、免費到底 | 不實 |
| 老了就不要爬上爬下、不整理就跌倒 | 恐懼行銷 |
| 讓房子養你、月月收租保證 | 收益承諾 |

**遇到專業問題**（醫療、法律、投資、繼承爭議）：辨認 → 轉介專業，不代替判斷。

### 2.5 CTA 統一用語

| 情境 | 用語 |
|------|------|
| 首頁主 CTA | **安心顧問諮詢** / 先聊聊您想改善的地方 |
| 服務頁付款 | 立即下單 |
| 服務頁報價 | Line 報價預約 |
| 表單 | 送出需求 |
| 錯誤提示 | 這次資料未能送出，請再試一次；若仍無法送出，可以透過官方聯絡方式告訴我們 |

---

## 3. IP 小人物「好好」

**設定：** 橘色愛心角色，深綠腿、米白方眼、單純笑臉。呼應 Logo 橘愛心。

**現有資產（不要重畫、直接使用）：**
```
public/images/mascot/
├── haohao-wave-1.png    ← 揮手（透明底）— 已用於 ChatWidget
├── haohao-wave-2.png    ← 揮手變化 2（透明底）
├── haohao-wave-3.png    ← 揮手變化 3（透明底）
├── haohao-360.png       ← 360° 站姿
├── haohao-poses.png     ← 12 姿勢貼圖組（可切片使用）
├── haohao-comic.png     ← 四格情境圖
├── haohao-web.png       ← 網頁應用示意
└── haohao-merch.png     ← 周邊商品
```

**使用場景：**
1. 首頁 Hero — 右側插圖（`haohao-360.png` 或 `haohao-wave-*.png`）
2. 服務頁 sidebar — 陪伴小卡（縮小尺寸 ~60px）
3. ChatWidget — 右下角浮動按鈕與 chat header 頭像
4. 404 / 空狀態頁 — 減輕挫折感
5. Blog 文章分類頁 — 分類 hero

**使用規則：**
- 一律用 `<img src="/images/mascot/..." />` 引用
- 保持背景透明（不要加圓形底色）
- 最小尺寸建議 48px（手機頭像）；標準 64–80px；hero 200–320px
- 不要旋轉、翻轉、變色
- 不要多次連續出現在同一畫面
- 情境使用時可標「情境示意」

---

## 4. 服務結構（CIS 第六章）

**單一主品牌** — 好齡居。**不做子品牌**。所有服務都歸在好齡居底下。

```
好齡居 NEXDO
├── 安心顧問諮詢（服務入口，所有服務先經顧問）
│
├── 老前整理（新增群組 — 這次要做的重點）
│   ├── 生前整理（趁自己能決定時，先整理物品與居住安排）
│   ├── 退休整理（退休後重新配置日常動線）
│   └── 遺物整理（家人一起整理逝者物品）
│
├── 房屋出租
│   ├── 空屋整理（新增 — 模組化：清空→修繕→清潔→拍照）
│   ├── 清運（新增 — 承接空屋整理最後段）
│   └── 代租代管（既有）
│
├── 居家改善（既有）
│   ├── 扶手安裝
│   ├── 居家修繕
│   └── 無障礙改造
│
├── 收納清潔（既有）
├── 樂齡健康（既有）
└── 居住安全（既有）
```

**兩種節奏模式**（適用老前整理三個階段）：
- **陪伴型** — 慢慢做、家人一起
- **效率型** — 客戶已決定、快速執行

---

## 5. 首頁重新設計

### 5.1 結構（由上到下）

```
1. Header 導覽（既有）
   └── 導覽列新增「老前整理」項

2. Hero
   ├── 標語：「把家安排好，退休更自在。」
   ├── 副標：從整理、居家改善到房屋出租需求…
   ├── 主 CTA：「安心顧問諮詢」
   ├── 副 CTA：「查看服務項目」
   └── 右側插圖：好好 IP + 明亮居家窗景

3. 【新增】互動工具區塊 ⭐ 重點
   ├── 標題：「動手看看，先了解您的家」
   ├── 卡片 1：一分鐘居家安全檢測 → https://www.nexdo.tw/minigame/#/safety
   ├── 卡片 2：代租代管租金試算 → https://www.nexdo.tw/minigame/#/relocation
   └── 兩張大卡並排，配好好插圖

4. 【新增】老前整理 三階段
   ├── 標題：「老前整理，從您希望的節奏開始」
   ├── 3 張卡：生前整理 / 退休整理 / 遺物整理
   └── 「先評估再報價，第一次到府免費」

5. 既有服務 grid（保留，可微調視覺）

6. 【新增】好齡居誌最新文章 3-6 篇

7. 【新增】常見問題（連到好好答的 FAQ）

8. Footer（既有）
```

### 5.2 資訊密度原則

**目標：** 讓退休族群覺得「這個網站很認真、資訊很多可以慢慢看」。

- 每個服務入口至少有 2–3 句描述文（不只名稱）
- 適當使用數字：「已服務 XX 家庭」「XX 個服務項目」
- 客戶心聲區塊（有真實案例授權時）
- 每個 section 之間有明確視覺分隔（背景色切換 / 分隔線 / 空間節奏）

---

## 6. 產品內頁按鈕改造

### 6.1 定價顯示規則

**Fixed 模式（可直接下單）：**
```
NT$ 12,000
每次
[立即下單]
```

**Quote 模式（不能直接下單，需報價）：**
```
NT$ 8,000 起　或　NT$ 8,000 – 15,000
先評估再報價
[Line 報價預約]
```

### 6.2 按鈕連結

**Line 報價預約官方連結：**
```
https://line.me/R/ti/p/@021souxl
```

**實作方式：**
- 產品 `orderMode = 'EXTERNAL_LINK'` 時：
  - `externalLinkConfig.buttonText = 'Line 報價預約'`
  - `externalLinkConfig.url = 'https://line.me/R/ti/p/@021souxl'`
  - `externalLinkConfig.priceText = 'NT$ X,XXX 起'` 或區間

### 6.3 需要盤點的既有產品

進 Supabase `products` 表把 `order_mode` 分兩類：
- **FIXED** → 顯示單一價 + 立即下單（沿用金流）
- **INTERNAL_FORM / EXTERNAL_LINK** → 顯示價格區間 + Line 報價預約

## 7. 3 個新服務頁（SUB_ITEM template）

以下三個服務需要建立 SUB_ITEM 頁 + 對應 product 資料庫紀錄。

### 7.1 生前整理 `/services/life-organizing`

- **副標**：在還能自主的時候，親手選擇留下什麼
- **價格區間**：NT$ 8,000 – 30,000（依範圍）
- **可陪您做的事**：物品分「留 / 傳 / 贈 / 離」四類、重要文件整理、紀念物拍照建檔、陪伴或效率兩種節奏、整戶清空後續清運
- **流程**：評估 → 報價 → 整理 → 交付
- **FAQ**：需要家人陪同嗎？／需要多久？／物品怎麼處理？

### 7.2 退休整理 `/services/retirement-organizing`

- **副標**：退休後重新配置日常，讓每天更順
- **價格區間**：NT$ 6,000 – 25,000
- **可陪您做的事**：走道與收納重新配置、衣物與日常用品分類、書房 / 廚房 / 陽台專項、扶手與燈光改善建議、可搭配居家修繕
- **流程**：同上
- **FAQ**：可以只做一個房間嗎？／建議先做哪裡？／要不要買新家具？

### 7.3 遺物整理 `/services/estate-organizing`

- **副標**：與家人一起，慢慢整理
- **價格區間**：NT$ 15,000 – 80,000（依範圍與時程）
- **可陪您做的事**：家人共同分類、重要物尋找、紀念物挑選與建檔、專業清運、後續空間規劃
- **語氣**：更溫和，強調「陪伴」與「不急」
- **FAQ**：需要幾天？／可以家人不在時進行嗎？／貴重物品怎麼處理？

### 7.4 空屋整理 `/services/vacant-property`

- **副標**：出租前的整戶備妥，模組化選購
- **價格區間**：NT$ 20,000 – 150,000（依坪數與範圍）
- **模組**：清空 → 修繕評估 → 清潔 → 拍照 → 上架
- **搭配**：可直接接續好齡居代租代管
- **FAQ**：一定要全套嗎？／清運費用怎麼算？／可以只做拍照嗎？

### 7.5 清運 `/services/removal`

- **副標**：不用什麼的物品，我們幫您送走
- **價格區間**：NT$ 3,000 – 20,000（依車次與物品類型）
- **內容**：家電拆解與載運、大型家具、雜物清運、環保處理
- **搭配**：空屋整理、老前整理的自然延伸
- **FAQ**：大型家具可以嗎？／需要自己搬到門口嗎？／有回收價嗎？

---

## 8. 導覽列調整

**現況：**
```
好齡居 | 居住安全 | 居家裝潢 | 收納清潔 | 樂齡健康 | 好齡居誌 | 立即諮詢
```

**目標：**
```
好齡居 | 居住安全 | 居家裝潢 | 收納清潔 | 樂齡健康 | 老前整理 | 好齡居誌 | 安心顧問諮詢
```

**變更：**
1. 新增「**老前整理**」項（連 `/services/organizing` 或直接列出 3 個階段的下拉選單）
2. 主 CTA 按鈕文字改為「**安心顧問諮詢**」

---

## 9. 好好聊天助理（已完成 ✅ 不用動）

- 右下角浮動 PNG 按鈕：`public/images/mascot/haohao-wave-1.png`
- 點擊展開對話視窗
- 使用本地 FAQ 關鍵字比對（`src/data/haohaoFAQ.ts`，17 筆常見問題）
- 不需 API Key、零成本、瞬間回覆
- 對話語氣依 CIS 第八章

**如果 codex 要新增 FAQ**：直接在 `src/data/haohaoFAQ.ts` 加 entry，格式：
```ts
{
  id: 'unique-id',
  question: '顯示在建議列的問題',
  keywords: ['關鍵字1', '關鍵字2'], // 5-10 個，含口語
  answer: '2-4 句回答，遵循 CIS 語氣',
  category: '分類（可選）',
}
```

---

## 10. 檔案位置（現有專案結構）

```
nexdo-work/
├── src/
│   ├── App.tsx                      ← 路由與 layout；ChatWidget 已掛
│   ├── pages/
│   │   ├── HomePage.tsx             ← 首頁（要改）
│   │   ├── SubItemPage.tsx          ← 服務詳細頁（新服務會用這個 template）
│   │   ├── admin/                   ← 後台 CMS（不用動 UI）
│   │   └── ...
│   ├── components/
│   │   ├── Header.tsx               ← 導覽列（要改）
│   │   ├── Footer.tsx
│   │   ├── ChatWidget/              ← 好好聊天（不用動）
│   │   └── ...
│   ├── data/
│   │   ├── pages/                   ← 靜態頁面資料
│   │   └── haohaoFAQ.ts             ← 聊天 FAQ
│   └── services/
│       ├── pageService.ts           ← 頁面資料 CRUD
│       ├── productService.ts        ← 產品資料 CRUD
│       └── ...
├── public/
│   └── images/mascot/               ← 好好 PNG 資產
├── api/                             ← Serverless functions（ECPay / 郵件 / 表單）
└── supabase/                        ← DB schema 與 migrations
```

---

## 11. Supabase 新產品資料（給 codex 執行）

新增以下產品到 `products` 表（可用 admin 後台 or SQL）：

```sql
INSERT INTO products (id, name, category, description, order_mode, order_code, fixed_config, external_link_config) VALUES
('life-organizing', '生前整理', '老前整理', '在還能自主的時候，親手選擇留下什麼', 'EXTERNAL_LINK', 'LIFE',
 '{"price": 0, "unit": "次", "buttonText": ""}',
 '{"priceText": "NT$ 8,000 – 30,000（依範圍）", "buttonText": "Line 報價預約", "url": "https://line.me/R/ti/p/@021souxl"}'),

('retirement-organizing', '退休整理', '老前整理', '退休後重新配置日常動線', 'EXTERNAL_LINK', 'RETI',
 '{"price": 0, "unit": "次", "buttonText": ""}',
 '{"priceText": "NT$ 6,000 – 25,000（依範圍）", "buttonText": "Line 報價預約", "url": "https://line.me/R/ti/p/@021souxl"}'),

('estate-organizing', '遺物整理', '老前整理', '與家人一起，慢慢整理', 'EXTERNAL_LINK', 'ESTA',
 '{"price": 0, "unit": "次", "buttonText": ""}',
 '{"priceText": "NT$ 15,000 – 80,000（依範圍）", "buttonText": "Line 報價預約", "url": "https://line.me/R/ti/p/@021souxl"}'),

('vacant-property', '空屋整理', '房屋出租', '出租前的整戶備妥，模組化選購', 'EXTERNAL_LINK', 'VACP',
 '{"price": 0, "unit": "案", "buttonText": ""}',
 '{"priceText": "NT$ 20,000 – 150,000（依範圍）", "buttonText": "Line 報價預約", "url": "https://line.me/R/ti/p/@021souxl"}'),

('removal', '清運', '房屋出租', '不用的物品，我們幫您送走', 'EXTERNAL_LINK', 'REMV',
 '{"price": 0, "unit": "車", "buttonText": ""}',
 '{"priceText": "NT$ 3,000 – 20,000（依車次與物品）", "buttonText": "Line 報價預約", "url": "https://line.me/R/ti/p/@021souxl"}');
```

同時需要 5 個對應的 pages entry（SUB_ITEM template）。

---

## 12. 外部連結 / 資源

| 用途 | URL |
|------|-----|
| GitHub Repo | https://github.com/njnjshoooo/nexdo |
| 線上網站 | https://www.nexdo.tw |
| LINE 官方帳號 | https://line.me/R/ti/p/@021souxl |
| 一分鐘居家安全檢測（既有）| https://www.nexdo.tw/minigame/#/safety |
| 代租代管租金試算（既有）| https://www.nexdo.tw/minigame/#/relocation |
| Vercel Dashboard | （需 owner 帳號登入）|
| Supabase Dashboard | Project ref: `dmuqabrxzoctalflljcz` |

---

## 13. 上線 checklist（給 codex 完成後回頭跑）

- [ ] `npm run lint` 通過
- [ ] `npm run build` 或 `npx vite build` 通過
- [ ] 首頁三個新區塊（互動工具、老前整理、文章）都顯示
- [ ] 導覽列有「老前整理」與「安心顧問諮詢」
- [ ] 5 個新產品在 Supabase 建好、對應的 SUB_ITEM 頁能開啟
- [ ] 產品內頁按鈕「Line 報價預約」連到 `https://line.me/R/ti/p/@021souxl`
- [ ] 手機版顯示正常
- [ ] 好好右下角浮動按鈕不擋內容
- [ ] Chat 展開後 FAQ 問答正常
- [ ] 全站顏色遵守 CIS（沒有其他綠 / 米黃 / 銅褐等雜色）

---

## 14. 對 codex 的重要提醒

1. **不要**引入子品牌命名（例如「留序」「LIVING ORDER」）— CIS 明確單一主品牌
2. **不要**寫「保證獲利」「一站式全方位」「銀髮尊榮」等 CIS 禁用詞
3. **不要**在既有 21 個產品的 URL 上做破壞性變更（現有訂單、SEO 都會壞）
4. **不要**動 ECPay 金流相關（`api/ecpay/*`, CheckoutPage 已上線並實際收款過）
5. **不要**動 Resend 通知信（`api/_lib/email.ts` 已運作）
6. **不要**動 GA4 追蹤（`index.html` 已裝 G-Q44KTF3S0S）
7. **不要**改 admin 後台 UI（有既有內容管理流程）
8. **可以**改前台 UI、加新頁面、加新 CMS 資料

---

## 15. 完成後如何交還給我上線

codex 做完後：
1. 把 changes push 到 https://github.com/njnjshoooo/nexdo 的 main branch，或開 PR
2. 告訴我 commit hash 或 PR 連結
3. 我來：
   - 檢查程式碼與 CIS 一致性
   - 跑本機 build 驗證
   - 監看 Vercel 部署
   - 確認上線後外部連結、按鈕、圖片、金流都沒壞
   - 若有問題會請 codex 修，或我直接改

有任何問題請 codex 直接告訴我，我可以在這裡回答。

---

**Version：** v1.0 · 2026-09-14
**維護人：** njnjshoooo (Nexdo)
