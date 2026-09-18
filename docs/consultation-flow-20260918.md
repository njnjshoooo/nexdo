# Nexdo 諮詢流程調整

## 客戶體驗

- 預設字級 16px；選單保留 20px 放大閱讀，重新設定字級偏好版本，避免舊 18px 預設覆蓋新設定。
- `/tools/home-safety`：入口直接第一題，6 題單選（有／沒有／不確定），進度、返回修改、結果建議，不以聯絡資料阻擋結果。
- `/tools/rental`：月租金 → 成本假設 → 首年收支明細。0 元預填明確標示為使用者假設而非報價；不提供未有資料支持的市場租金估價。
- 舊 `/minigame/#/safety`、`#/relocation` 網址自動導向新版，包含資料庫設定中的舊連結。
- 整理服務保留 goal/purpose 網址預選，新增姓名、電話、地區、選填 email 與說明、同意聯繫。成功後顯示編號與既有 LINE 官方帳號連結。無須複製摘要才送出。
- `/admin/bookings` 可篩選整理名單並匯出目前列表 CSV，包含中文標籤與公式注入防護。

## 部署與串接

沿用現有 Supabase `submissions` 資料表，無需新資料表；固定 form_id 為 `organizing-consultation`，後台內建顯示名稱及欄位，不依賴另建動態表單。

新增 `/api/organizing-request` 使用現有伺服器端 service role 存檔並 await Resend。環境需有 `SUPABASE_URL` 或 `VITE_SUPABASE_URL`、`SUPABASE_SERVICE_ROLE_KEY`、`RESEND_API_KEY`、`RESEND_FROM_EMAIL`、`INTERNAL_NOTIFICATION_EMAIL`。不將任何 secret 放入前端或版本庫。

成功頁代表需求已存入資料庫，不代表 email 已投遞。寄信設定缺漏或寄信失敗會記錄 server log，名單仍留在後台。此版本沒有寄信失敗自動重送佇列。上线前應在預覽環境驗證管理員收信、客戶確認信與後台實際讀取下載。

使用 UUID requestId 去重，同一次失敗重試不建立重複名單或重複寄信。POST 驗證輸入、長度與 honeypot；不讀取或回傳既有客戶資料。維持既有後台登入與權限流程，未變更資料表 RLS。

## 驗證

- `npm run lint`
- `npm run build`（既有大型 bundle 提醒仍在）
- `node --import tsx --test tests/consultation.test.ts`：8 項測試，含必填驗證、試算邊界、CSV 防護、API 儲存成功／失敗／重試。
- 本機隔離瀏覽器：安全問答結果、租金 20,000／空置 1 月／管理 10%／修繕 12,000／首年費 6,000 → 年 180,000／月 15,000；整理表單成功與 LINE 連結。
- 本機使用記憶體資料庫與通知替身，沒有寫入正式名單或寄正式信；正式服務投遞尚未驗證。

## 與 Claude Code 協作

修改分支：`codex/streamline-consultation`。原 Downloads/nexdo-work 未修改。合併前同步最新 main；後續請從已合併的 main 繼續，避免覆蓋原版整理頁與舊工具入口。
