-- =====================================================================
-- 好齡居 v5.1 — Seed Data
-- 使用 ON CONFLICT DO NOTHING 讓此 script 可重複執行
-- =====================================================================

BEGIN;

-- =====================================================================
-- Navigation（預設導航結構）
-- =====================================================================
INSERT INTO public.navigation (id, items) VALUES (
  1,
  '[
    {
      "id": "nav-about",
      "label": "關於我們",
      "url": "/about",
      "openInNewWindow": false,
      "templateType": "GENERAL",
      "children": []
    },
    {
      "id": "nav-consultant",
      "label": "好齡居顧問",
      "url": "/consultant",
      "openInNewWindow": false,
      "templateType": "GENERAL",
      "children": []
    },
    {
      "id": "nav-services",
      "label": "我們的服務",
      "url": "#",
      "openInNewWindow": false,
      "templateType": "GENERAL",
      "children": []
    },
    {
      "id": "nav-blog",
      "label": "好齡居誌",
      "url": "/blog",
      "openInNewWindow": false,
      "templateType": "GENERAL",
      "children": []
    },
    {
      "id": "nav-peace",
      "label": "加入安心卡",
      "url": "/peace-of-mind",
      "openInNewWindow": false,
      "templateType": "GENERAL",
      "children": []
    }
  ]'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- =====================================================================
-- Vendors（兩個預設廠商，密碼用 bcrypt hash）
-- =====================================================================
INSERT INTO public.vendors (
  id, name, tax_id, type, contact_name, job_title, phone, extension,
  address, account, password_hash, status, certifications, commission_rate,
  settlement_cycle, created_at, updated_at
) VALUES
(
  'tidyman',
  '居家整聊室',
  '88888888',
  '居家整聊',
  '賴芝芝',
  '課程顧問',
  '02-8888-8888',
  '888',
  '台北市信義區松德路',
  'tidyman@tidyman.com',
  crypt('888888', gen_salt('bf')),
  'active',
  '{}'::text[],
  0.8,
  'monthly',
  now(),
  now()
),
(
  'hobbystudio',
  '習慣健康國際',
  '82977822',
  '樂齡健康',
  '林阿茹',
  '課程顧問',
  '02-2222-2222',
  '222',
  '台北市大同區長安西路',
  'hobbystudio@hobbystudio.com',
  crypt('222222', gen_salt('bf')),
  'active',
  '{}'::text[],
  0.7,
  'monthly',
  now(),
  now()
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================================
-- Forms（預設兩個表單：聯絡 / 整聊預約）
-- =====================================================================
INSERT INTO public.forms (id, form_id, name, description, purpose, fields)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'default-contact',
  '預設聯絡表單',
  '預設的聯絡表單',
  'CONSULTATION',
  '[
    {"id": "name", "label": "姓名", "type": "text", "required": true},
    {"id": "phone", "label": "聯絡電話", "type": "text", "required": true},
    {"id": "message", "label": "需求說明", "type": "textarea", "required": false}
  ]'::jsonb
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.forms (id, form_id, name, description, purpose, fields)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'home-organize-booking-form',
  '居家整聊預約表單',
  '居家整聊服務預約用',
  'BOOKING',
  '[
    {"id": "name", "label": "姓名", "type": "text", "required": true},
    {"id": "phone", "label": "聯絡電話", "type": "text", "required": true},
    {"id": "email", "label": "電子郵件", "type": "text", "required": true},
    {"id": "address", "label": "服務地址", "type": "text", "required": true}
  ]'::jsonb
) ON CONFLICT (id) DO NOTHING;

COMMIT;
