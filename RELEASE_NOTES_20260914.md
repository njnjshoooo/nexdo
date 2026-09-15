# 好齡居前台改版交付（2026-09-14）

## 完成範圍

- 依交接文件 CIS v2.0 重設首頁、前台色彩及字級；暖白／深綠為主，使用既有好好 PNG。
- 首頁依序呈現新 Hero、兩個互動工具、老前整理三阶段、既有 CMS 服務圖片／推薦服務、最新六篇已發布文章、共用好好 FAQ。保留既有諮詢表單，統一「送出需求」與失敗文案。
- 導覽列提供居住安全、居家裝潢、收納清潔、樂齡健康、老前整理、好齡居誌及安心顧問諮詢。帳戶、搜尋、購物車、字體大小集中在可捲動選單。
- 新增五個 SUB_ITEM 服務與產品：生前整理、退休整理、遺物整理、空屋整理、清運。每頁有價格範圍、內容、流程及三題 FAQ。
- 桌面／手機使用同一個服務操作規則：FIXED 保留購物車與金流前置驗證；報價型使用官方 LINE 的實際連結。
- 修正文章異步載入不更新、服務輪播遺漏報價金額、無圖片仍輸出 img、卡片固定高度截斷、切換服務暫留上一個產品資料等問題。
- 樣式限定 `.public-site`；未更動 admin UI、ECPay API、CheckoutPage、Resend 通知實作或 index.html 的 GA4。

## 資料庫已執行

已透過 owner 登入的 Supabase SQL Editor，在 `dmuqabrxzoctalflljcz` 執行 `supabase/migrations/202609140001_organizing_services.sql`，並以公開讀取權限回讀驗證：

- 5 筆 products 與 5 筆 published pages；template 全為 SUB_ITEM；productId、slug、LINE URL、價格、各 3 題 FAQ 全部正確。
- 14 筆已盤點 EXTERNAL_LINK 更新官方 URL／按鈕文字；home-reorganization 由 INTERNAL_FORM 改為 EXTERNAL_LINK 並保留原報價文字；`test` 產品未修改。
- 5 筆 FIXED 金額未變：home-clearance 2000、home-dentist 1200、medical-companion 1200、nutrition-consulting 2000、regular-cleaning 600。
- SQL 新增部分可重跑，不覆寫後續 CMS 編輯；既有報價設定更新僅限定已盤點 ID。无需再執行相同 migration。

新服務已在 production 資料庫，網站 UI 改版需合併 PR 後由 Vercel 部署。

## 驗證

- `npm run lint`（TypeScript）通過。
- `npm run build` 通過。仍有既有的大型 bundle 與動態／靜態混合 import 提醒。
- 使用線上網站的公開 Supabase client 配置在本機驗證正式資料；未使用或提交 privileged key。
- 桌面 1440×1000、手機 390×844、窄螢幕 320×740 已視覺檢查；首頁與新服務無頁面橫向溢出，320px 選單可操作。
- 五項新服務均開啟確認；報價連結為 `https://line.me/R/ti/p/@021souxl`。
- 退休整理 FAQ 展開正常；好好「什麼是老前整理？」有完整回覆；手機聊天視窗高於底部 CTA。
- 固定價定期清潔「立即下單」可加入購物車，單價／總價均 NT$ 600。未送出訂單或進行實際付款。
- CMS 首頁的三張服務圖片及四項推薦服務保留，最新文章實際顯示六篇已發布內容。

## 既有內容狀態與上線交接

- 既有報價產品多數只存「依需求報價」，沒有核定數字範圍；此次保留原文字，未自行編造價格。新增五項使用交接文件的完整數字區間。
- 原 `/health`、`/rent-and-move` 在 CMS 為未發布；新增 `/services/health`、`/services/rental` 群組入口，只列已發布服務。未擅自發布舊草稿，也未變更既有產品 URL。
- home-clearance 無公開對應頁；medical-companion、nutrition-consulting 頁未發布。這些是盤點時既有狀態，固定價格仍保留。
- 既有 CMS 文章、案例與產品描述保留原文；其中舊文案仍可能有「你／奶奶」等與新版語氣不一致的內容，需由內容管理者後續審閱。此次新文案依交接規範撰寫，未新增未授權案例或服務量數字。
- 請審查 PR、合併 main，監看 Vercel 部署後再確認正式域名圖片、工具、LINE、服務頁、諮詢表單與既有付款流程。這次未代替 owner 完成 production 部署驗收。
