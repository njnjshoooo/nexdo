-- 為好齡居諮詢表單（default-contact）加入 email 必填欄位
-- 這個表單原本只有 姓名 / 聯絡電話 / 需求說明，沒有 email
-- 加了 email 之後，客戶填完會收到 Resend 寄的「我們收到您的需求了」確認信

UPDATE public.forms
SET fields = '[
  {
    "id": "name",
    "label": "姓名",
    "type": "text",
    "required": true,
    "placeholder": "請輸入您的姓名"
  },
  {
    "id": "phone",
    "label": "聯絡電話",
    "type": "text",
    "required": true,
    "placeholder": "0912-345-678"
  },
  {
    "id": "email",
    "label": "電子郵件",
    "type": "email",
    "required": true,
    "placeholder": "example@mail.com",
    "helpText": "我們會寄送確認信到這個信箱"
  },
  {
    "id": "message",
    "label": "需求說明",
    "type": "textarea",
    "required": false,
    "placeholder": "簡短描述您想改善的地方，例如：想幫爸媽整理客廳走道"
  }
]'::jsonb,
    updated_at = now()
WHERE form_id = 'default-contact' OR id = '00000000-0000-0000-0000-000000000001';

-- 驗證結果
SELECT id, form_id, name, jsonb_pretty(fields) AS fields
FROM public.forms
WHERE form_id = 'default-contact';
