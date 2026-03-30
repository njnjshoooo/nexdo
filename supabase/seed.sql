-- =============================================================================
-- seed.sql - Default seed data for 好齡居官網 2.0
-- =============================================================================
-- This file populates the Supabase database with essential default data that
-- the website requires to function correctly after the initial migration.
--
-- Sections:
--   1. Navigation  - Main site navigation structure (single row, id=1)
--   2. Vendors     - Two default vendor accounts (tidyman, hobbystudio)
--   3. Forms       - Two default forms (contact + booking)
--   4. Media       - 85 default media items (Unsplash stock images)
--
-- All inserts use ON CONFLICT to make this script idempotent (safe to re-run).
-- Vendor passwords are hashed with pgcrypto (bcrypt).
-- =============================================================================

BEGIN;

-- =============================================================================
-- 1. NAVIGATION
-- =============================================================================
INSERT INTO public.navigation (id, items, updated_at) VALUES (
  1,
  '[
    {
      "id": "nav-about",
      "label": "\u95dc\u65bc\u6211\u5011",
      "url": "/about",
      "subtitle": "\u4e86\u89e3\u597d\u9f61\u5c45",
      "openInNewWindow": false,
      "templateType": "GENERAL",
      "children": []
    },
    {
      "id": "nav-consultant",
      "label": "\u597d\u9f61\u5c45\u9867\u554f",
      "url": "/consultant",
      "subtitle": "\u5c08\u5c6c\u751f\u6d3b\u9867\u554f",
      "openInNewWindow": false,
      "templateType": "GENERAL",
      "children": []
    },
    {
      "id": "nav-services",
      "label": "\u6211\u5011\u7684\u670d\u52d9",
      "url": "#",
      "subtitle": "\u5168\u65b9\u4f4d\u5b88\u8b77",
      "openInNewWindow": false,
      "templateType": "GENERAL",
      "children": [
        {
          "id": "home-safety",
          "label": "\u5c45\u4f4f\u5b89\u5168",
          "url": "/home-safety",
          "subtitle": "\u751f\u6d3b\u5b89\u5168",
          "openInNewWindow": false,
          "templateType": "MAJOR_ITEM",
          "pageSlug": "home-safety",
          "children": [
            {
              "id": "old-house-diagnosis",
              "label": "\u820a\u5c4b\u8a3a\u65b7",
              "url": "/home-safety/old-house-diagnosis",
              "openInNewWindow": false,
              "templateType": "SUB_ITEM",
              "pageSlug": "old-house-diagnosis",
              "parentId": "home-safety"
            },
            {
              "id": "safety-assessment",
              "label": "\u5b89\u5168\u8a55\u4f30",
              "url": "/home-safety/safety-assessment",
              "openInNewWindow": false,
              "templateType": "SUB_ITEM",
              "pageSlug": "safety-assessment",
              "parentId": "home-safety"
            },
            {
              "id": "bathroom-renovation",
              "label": "\u885b\u6d74\u88dd\u4fee",
              "url": "/home-safety/bathroom-renovation",
              "openInNewWindow": false,
              "templateType": "SUB_ITEM",
              "pageSlug": "bathroom-renovation",
              "parentId": "home-safety"
            }
          ]
        },
        {
          "id": "cleaning",
          "label": "\u6536\u7d0d\u6e05\u6f54",
          "url": "/cleaning",
          "subtitle": "\u751f\u6d3b\u54c1\u8cea",
          "openInNewWindow": false,
          "templateType": "MAJOR_ITEM",
          "pageSlug": "cleaning",
          "children": [
            {
              "id": "home-reorganization",
              "label": "\u5c45\u5bb6\u6574\u804a",
              "url": "/cleaning/home-reorganization",
              "openInNewWindow": false,
              "templateType": "SUB_ITEM",
              "pageSlug": "home-reorganization",
              "parentId": "cleaning"
            },
            {
              "id": "organization-planning",
              "label": "\u6536\u7d0d\u898f\u5283",
              "url": "/cleaning/organization-planning",
              "openInNewWindow": false,
              "templateType": "SUB_ITEM",
              "pageSlug": "organization-planning",
              "parentId": "cleaning"
            },
            {
              "id": "regular-cleaning",
              "label": "\u5b9a\u671f\u6e05\u6f54",
              "url": "/cleaning/regular-cleaning",
              "openInNewWindow": false,
              "templateType": "SUB_ITEM",
              "pageSlug": "regular-cleaning",
              "parentId": "cleaning"
            },
            {
              "id": "home-clearance",
              "label": "\u5ba4\u5167\u6e05\u904b",
              "url": "/cleaning/home-clearance",
              "openInNewWindow": false,
              "templateType": "SUB_ITEM",
              "pageSlug": "home-clearance",
              "parentId": "cleaning"
            }
          ]
        },
        {
          "id": "health",
          "label": "\u6a02\u9f61\u5065\u5eb7",
          "url": "/health",
          "subtitle": "\u751f\u6d3b\u6d3b\u529b",
          "openInNewWindow": false,
          "templateType": "MAJOR_ITEM",
          "pageSlug": "health",
          "children": [
            {
              "id": "health-fitness",
              "label": "\u5230\u5e9c\u9ad4\u9069\u80fd",
              "url": "/health/health-fitness",
              "openInNewWindow": false,
              "templateType": "SUB_ITEM",
              "pageSlug": "health-fitness",
              "parentId": "health"
            },
            {
              "id": "short-term-care",
              "label": "\u77ed\u671f\u7167\u8b77",
              "url": "/health/short-term-care",
              "openInNewWindow": false,
              "templateType": "SUB_ITEM",
              "pageSlug": "short-term-care",
              "parentId": "health"
            },
            {
              "id": "home-dentist",
              "label": "\u5230\u5e9c\u7259\u91ab",
              "url": "/health/home-dentist",
              "openInNewWindow": false,
              "templateType": "SUB_ITEM",
              "pageSlug": "home-dentist",
              "parentId": "health"
            },
            {
              "id": "medical-companion",
              "label": "\u91ab\u85e5\u966a\u540c",
              "url": "/health/medical-companion",
              "openInNewWindow": false,
              "templateType": "SUB_ITEM",
              "pageSlug": "medical-companion",
              "parentId": "health"
            },
            {
              "id": "nutrition-consulting",
              "label": "\u71df\u990a\u8aee\u8a62",
              "url": "/health/nutrition-consulting",
              "openInNewWindow": false,
              "templateType": "SUB_ITEM",
              "pageSlug": "nutrition-consulting",
              "parentId": "health"
            }
          ]
        },
        {
          "id": "rent-and-move",
          "label": "\u79df\u623f\u642c\u5bb6",
          "url": "/rent-and-move",
          "subtitle": "\u751f\u6d3b\u6b78\u5c6c",
          "openInNewWindow": false,
          "templateType": "MAJOR_ITEM",
          "pageSlug": "rent-and-move",
          "children": [
            {
              "id": "elderly-housing-exchange",
              "label": "\u9069\u8001\u63db\u5c4b",
              "url": "/rent-and-move/elderly-housing-exchange",
              "openInNewWindow": false,
              "templateType": "SUB_ITEM",
              "pageSlug": "elderly-housing-exchange",
              "parentId": "rent-and-move"
            },
            {
              "id": "rental-management",
              "label": "\u4ee3\u79df\u4ee3\u7ba1",
              "url": "/rent-and-move/rental-management",
              "openInNewWindow": false,
              "templateType": "SUB_ITEM",
              "pageSlug": "rental-management",
              "parentId": "rent-and-move"
            },
            {
              "id": "safe-moving",
              "label": "\u5b89\u5fc3\u79fb\u5c45",
              "url": "/rent-and-move/safe-moving",
              "openInNewWindow": false,
              "templateType": "SUB_ITEM",
              "pageSlug": "safe-moving",
              "parentId": "rent-and-move"
            },
            {
              "id": "real-estate",
              "label": "\u623f\u5c4b\u4ef2\u4ecb",
              "url": "/rent-and-move/real-estate",
              "openInNewWindow": false,
              "templateType": "SUB_ITEM",
              "pageSlug": "real-estate",
              "parentId": "rent-and-move"
            }
          ]
        },
        {
          "id": "renovation",
          "label": "\u5c45\u5bb6\u88dd\u6f62",
          "url": "/renovation",
          "subtitle": "\u751f\u6d3b\u7f8e\u5b78",
          "openInNewWindow": false,
          "templateType": "MAJOR_ITEM",
          "pageSlug": "renovation",
          "children": [
            {
              "id": "decor-design",
              "label": "\u8edf\u88dd\u8a2d\u8a08",
              "url": "/renovation/decor-design",
              "openInNewWindow": false,
              "templateType": "SUB_ITEM",
              "pageSlug": "decor-design",
              "parentId": "renovation"
            },
            {
              "id": "light-renovation",
              "label": "\u6a02\u9f61\u8f15\u88dd\u4fee",
              "url": "/renovation/light-renovation",
              "openInNewWindow": false,
              "templateType": "SUB_ITEM",
              "pageSlug": "light-renovation",
              "parentId": "renovation"
            },
            {
              "id": "rental-customization",
              "label": "\u51fa\u79df\u5c4b\u8a02\u88fd",
              "url": "/renovation/rental-customization",
              "openInNewWindow": false,
              "templateType": "SUB_ITEM",
              "pageSlug": "rental-customization",
              "parentId": "renovation"
            }
          ]
        },
        {
          "id": "finance",
          "label": "\u9ad8\u9f61\u7406\u8ca1",
          "url": "/finance",
          "subtitle": "\u751f\u6d3b\u514d\u6182",
          "openInNewWindow": false,
          "templateType": "MAJOR_ITEM",
          "pageSlug": "finance",
          "children": []
        }
      ]
    },
    {
      "id": "nav-blog",
      "label": "\u597d\u9f61\u5c45\u8a8c",
      "url": "/blog",
      "subtitle": "\u6a02\u9f61\u751f\u6d3b\u8a8c",
      "openInNewWindow": false,
      "templateType": "GENERAL",
      "children": []
    },
    {
      "id": "nav-peace",
      "label": "\u52a0\u5165\u5b89\u5fc3\u5361",
      "url": "/peace-of-mind",
      "subtitle": "\u5c08\u5c6c\u6703\u54e1\u79ae",
      "openInNewWindow": false,
      "templateType": "GENERAL",
      "pageSlug": "peace-of-mind",
      "children": []
    }
  ]'::jsonb,
  now()
) ON CONFLICT (id) DO UPDATE SET items = EXCLUDED.items;

-- =============================================================================
-- 2. VENDORS
-- =============================================================================
INSERT INTO public.vendors (
  id, name, tax_id, type, contact_name, job_title, phone, extension,
  address, account, password_hash, status, certifications, billing_cycle,
  created_at, updated_at
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
  'monthly',
  '2026-01-01T00:00:00Z',
  '2026-01-01T00:00:00Z'
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
  'monthly',
  '2026-03-24T00:00:00Z',
  '2026-03-24T00:00:00Z'
)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 3. FORMS
-- =============================================================================
-- Form 1: Default contact form (預設聯絡表單)
INSERT INTO public.forms (id, form_id, name, description, purpose, fields, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'default-contact',
  '預設聯絡表單',
  '預設的聯絡表單',
  'CONSULTATION',
  '[
    {"id": "name",    "label": "姓名",     "type": "text",     "required": true},
    {"id": "phone",   "label": "聯絡電話", "type": "text",     "required": true},
    {"id": "message", "label": "需求說明", "type": "textarea", "required": false}
  ]'::jsonb,
  now(),
  now()
)
ON CONFLICT (id) DO NOTHING;

-- Form 2: Home-organize booking form (居家整聊預約表單)
INSERT INTO public.forms (id, form_id, name, description, purpose, fields, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'home-organize-booking-form',
  '居家整聊預約表單',
  '「居家整聊」服務預約用',
  'BOOKING',
  '[
    {"id": "name",  "label": "姓名",     "type": "text", "required": true},
    {"id": "phone", "label": "聯絡電話", "type": "text", "required": true},
    {"id": "email", "label": "電子郵件", "type": "text", "required": true},
    {"id": "address", "label": "服務地址", "type": "text", "required": true},
    {"id": "lineId",  "label": "LINE ID (選填)", "type": "text", "required": false},
    {"id": "preferredDate1", "label": "期望日期 1", "type": "date", "required": true},
    {"id": "preferredDate2", "label": "期望日期 2", "type": "date", "required": true},
    {"id": "preferredDate3", "label": "期望日期 3", "type": "date", "required": true},
    {
      "id": "preferredTimeSlot",
      "label": "期望時段",
      "type": "radio",
      "required": true,
      "options": [
        {"id": "slot-morning",   "label": "9:00~12:00",  "value": "9:00~12:00"},
        {"id": "slot-afternoon", "label": "13:00~18:00", "value": "13:00~18:00"}
      ]
    },
    {
      "id": "area",
      "label": "想要進行整聊的區域",
      "type": "checkbox",
      "required": true,
      "options": [
        {"id": "opt-living",   "label": "客廳",   "value": "客廳"},
        {"id": "opt-dining",   "label": "餐廳",   "value": "餐廳"},
        {"id": "opt-kitchen",  "label": "廚房",   "value": "廚房"},
        {"id": "opt-bedroom",  "label": "臥房",   "value": "臥房"},
        {"id": "opt-kids",     "label": "小孩房", "value": "小孩房"},
        {"id": "opt-bathroom", "label": "浴室",   "value": "浴室"},
        {"id": "opt-storage",  "label": "儲藏室", "value": "儲藏室"},
        {"id": "opt-study",    "label": "書房",   "value": "書房"},
        {"id": "opt-balcony",  "label": "陽台",   "value": "陽台"}
      ]
    },
    {"id": "photos", "label": "上傳環境照片", "type": "file", "required": false}
  ]'::jsonb,
  now(),
  now()
)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 4. MEDIA (85 default Unsplash images)
-- =============================================================================
INSERT INTO public.media (id, url, name, type, storage_path, created_at) VALUES
  ('default-1',  'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=2073&auto=format&fit=crop', '客廳空間',     'image/jpeg', NULL, '2024-01-01T00:00:00.000Z'),
  ('default-2',  'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?q=80&w=2070&auto=format&fit=crop', '樂齡照護',     'image/jpeg', NULL, '2024-01-01T00:00:01.000Z'),
  ('default-3',  'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?q=80&w=2070&auto=format&fit=crop', '浴室安全',     'image/jpeg', NULL, '2024-01-01T00:00:02.000Z'),
  ('default-4',  'https://images.unsplash.com/photo-1520121401995-928cd50d4e27?q=80&w=2070&auto=format&fit=crop', '居家整理',     'image/jpeg', NULL, '2024-01-01T00:00:03.000Z'),
  ('default-5',  'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?q=80&w=2070&auto=format&fit=crop', '健康運動',     'image/jpeg', NULL, '2024-01-01T00:00:04.000Z'),
  ('default-6',  'https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?q=80&w=2070&auto=format&fit=crop', '專業針灸',     'image/jpeg', NULL, '2024-01-01T00:00:05.000Z'),
  ('default-7',  'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2040&auto=format&fit=crop', '瑜珈練習',     'image/jpeg', NULL, '2024-01-01T00:00:06.000Z'),
  ('default-8',  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2070&auto=format&fit=crop', '核心訓練',     'image/jpeg', NULL, '2024-01-01T00:00:07.000Z'),
  ('default-9',  'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070&auto=format&fit=crop', '醫療諮詢',     'image/jpeg', NULL, '2024-01-01T00:00:08.000Z'),
  ('default-10', 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=2070&auto=format&fit=crop', '衛浴清潔',     'image/jpeg', NULL, '2024-01-01T00:00:09.000Z'),
  ('default-11', 'https://images.unsplash.com/photo-1513159446162-54eb8bdaa79b?q=80&w=2070&auto=format&fit=crop', '現代抽象',     'image/jpeg', NULL, '2024-01-01T00:00:10.000Z'),
  ('default-12', 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop', '團隊協作',     'image/jpeg', NULL, '2024-01-01T00:00:11.000Z'),
  ('default-13', 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop', '學習成長',     'image/jpeg', NULL, '2024-01-01T00:00:12.000Z'),
  ('default-14', 'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=2070&auto=format&fit=crop', '科技辦公',     'image/jpeg', NULL, '2024-01-01T00:00:13.000Z'),
  ('default-15', 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop', '會議簡報',     'image/jpeg', NULL, '2024-01-01T00:00:14.000Z'),
  ('default-16', 'https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=2074&auto=format&fit=crop', '商務空間',     'image/jpeg', NULL, '2024-01-01T00:00:15.000Z'),
  ('default-17', 'https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=2074&auto=format&fit=crop', '設計美學',     'image/jpeg', NULL, '2024-01-01T00:00:16.000Z'),
  ('default-18', 'https://images.unsplash.com/photo-1558403194-611308249627?q=80&w=2070&auto=format&fit=crop', '家庭關懷',     'image/jpeg', NULL, '2024-01-01T00:00:17.000Z'),
  ('default-19', 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?q=80&w=2070&auto=format&fit=crop', '現代室內',     'image/jpeg', NULL, '2024-01-01T00:00:18.000Z'),
  ('default-20', 'https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=2069&auto=format&fit=crop', '科技研發',     'image/jpeg', NULL, '2024-01-01T00:00:19.000Z'),
  ('default-21', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1976&auto=format&fit=crop', '專業女性',     'image/jpeg', NULL, '2024-01-01T00:00:20.000Z'),
  ('default-22', 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=1974&auto=format&fit=crop', '專業男性',     'image/jpeg', NULL, '2024-01-01T00:00:21.000Z'),
  ('default-23', 'https://images.unsplash.com/photo-1573497491208-6b1acb260507?q=80&w=2070&auto=format&fit=crop', '團隊辦公',     'image/jpeg', NULL, '2024-01-01T00:00:22.000Z'),
  ('default-24', 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070&auto=format&fit=crop', '工程技術',     'image/jpeg', NULL, '2024-01-01T00:00:23.000Z'),
  ('default-25', 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=2070&auto=format&fit=crop', '實驗科學',     'image/jpeg', NULL, '2024-01-01T00:00:24.000Z'),
  ('default-26', 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=2070&auto=format&fit=crop', '工業科技',     'image/jpeg', NULL, '2024-01-01T00:00:25.000Z'),
  ('default-27', 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=2070&auto=format&fit=crop', '自動化生產',   'image/jpeg', NULL, '2024-01-01T00:00:26.000Z'),
  ('default-28', 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=2070&auto=format&fit=crop', '團隊合作',     'image/jpeg', NULL, '2024-01-01T00:00:27.000Z'),
  ('default-29', 'https://images.unsplash.com/photo-1600880210837-0fc3fb047153?q=80&w=2070&auto=format&fit=crop', '現代辦公室',   'image/jpeg', NULL, '2024-01-01T00:00:28.000Z'),
  ('default-30', 'https://images.unsplash.com/photo-1606857521015-7f9fdf423740?q=80&w=2070&auto=format&fit=crop', '室內空間',     'image/jpeg', NULL, '2024-01-01T00:00:29.000Z'),
  ('default-31', 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=2070&auto=format&fit=crop', '居家安全',     'image/jpeg', NULL, '2024-01-01T00:00:30.000Z'),
  ('default-32', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=2116&auto=format&fit=crop', '收納整理',     'image/jpeg', NULL, '2024-01-01T00:00:31.000Z'),
  ('default-33', 'https://images.unsplash.com/photo-1594484208280-efa00f9e990c?q=80&w=2070&auto=format&fit=crop', '專業清潔',     'image/jpeg', NULL, '2024-01-01T00:00:32.000Z'),
  ('default-34', 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=2070&auto=format&fit=crop', '廚房空間',     'image/jpeg', NULL, '2024-01-01T00:00:33.000Z'),
  ('default-35', 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=2069&auto=format&fit=crop', '溫馨臥室',     'image/jpeg', NULL, '2024-01-01T00:00:34.000Z'),
  ('default-36', 'https://images.unsplash.com/photo-1556910103-1c02745a872f?q=80&w=2070&auto=format&fit=crop', '居家環境',     'image/jpeg', NULL, '2024-01-01T00:00:35.000Z'),
  ('default-37', 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?q=80&w=2070&auto=format&fit=crop', '房屋修繕',     'image/jpeg', NULL, '2024-01-01T00:00:36.000Z'),
  ('default-38', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop', '豪宅外觀',     'image/jpeg', NULL, '2024-01-01T00:00:37.000Z'),
  ('default-39', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop', '房地產',       'image/jpeg', NULL, '2024-01-01T00:00:38.000Z'),
  ('default-40', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop', '現代別墅',     'image/jpeg', NULL, '2024-01-01T00:00:39.000Z'),
  ('default-41', 'https://images.unsplash.com/photo-1574689211272-bc15e6406241?q=80&w=2070&auto=format&fit=crop', '搬家服務',     'image/jpeg', NULL, '2024-01-01T00:00:40.000Z'),
  ('default-42', 'https://images.unsplash.com/photo-1554469384-e58fac16e23a?q=80&w=2070&auto=format&fit=crop', '城市景觀',     'image/jpeg', NULL, '2024-01-01T00:00:41.000Z'),
  ('default-43', 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?q=80&w=2070&auto=format&fit=crop', '室內設計',     'image/jpeg', NULL, '2024-01-01T00:00:42.000Z'),
  ('default-44', 'https://images.unsplash.com/photo-1447703693928-9cd89c8d3ac5?q=80&w=2071&auto=format&fit=crop', '安全防護',     'image/jpeg', NULL, '2024-01-01T00:00:43.000Z'),
  ('default-45', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2128&auto=format&fit=crop', '圖書館',       'image/jpeg', NULL, '2024-01-01T00:00:44.000Z'),
  ('default-46', 'https://images.unsplash.com/photo-1581339399838-2a120c18bba3?q=80&w=2070&auto=format&fit=crop', '安心照護',     'image/jpeg', NULL, '2024-01-01T00:00:45.000Z'),
  ('default-47', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop', '商務會議',     'image/jpeg', NULL, '2024-01-01T00:00:46.000Z'),
  ('default-48', 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?q=80&w=2068&auto=format&fit=crop', '牙科診所',     'image/jpeg', NULL, '2024-01-01T00:00:47.000Z'),
  ('default-49', 'https://images.unsplash.com/photo-1556742044-3c52d6e88c62?q=80&w=2070&auto=format&fit=crop', '客戶服務',     'image/jpeg', NULL, '2024-01-01T00:00:48.000Z'),
  ('default-50', 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?q=80&w=2070&auto=format&fit=crop', '衛浴空間',     'image/jpeg', NULL, '2024-01-01T00:00:49.000Z'),
  ('default-51', 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?q=80&w=2070&auto=format&fit=crop', '現代衛浴',     'image/jpeg', NULL, '2024-01-01T00:00:50.000Z'),
  ('default-52', 'https://images.unsplash.com/photo-1564540583246-934409427776?q=80&w=2070&auto=format&fit=crop', '衛浴修繕',     'image/jpeg', NULL, '2024-01-01T00:00:51.000Z'),
  ('default-53', 'https://images.unsplash.com/photo-1542296332-2e4473faf563?q=80&w=2070&auto=format&fit=crop', '房地產諮詢',   'image/jpeg', NULL, '2024-01-01T00:00:52.000Z'),
  ('default-54', 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?q=80&w=2070&auto=format&fit=crop', '規劃整理',     'image/jpeg', NULL, '2024-01-01T00:00:53.000Z'),
  ('default-55', 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=1974&auto=format&fit=crop', '衣櫃收納',     'image/jpeg', NULL, '2024-01-01T00:00:54.000Z'),
  ('default-56', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=2070&auto=format&fit=crop', '藥品管理',     'image/jpeg', NULL, '2024-01-01T00:00:55.000Z'),
  ('default-57', 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=2070&auto=format&fit=crop', '安全評估',     'image/jpeg', NULL, '2024-01-01T00:00:56.000Z'),
  ('default-58', 'https://images.unsplash.com/photo-1585128719715-46776b56a0d1?q=80&w=1974&auto=format&fit=crop', '裝飾設計',     'image/jpeg', NULL, '2024-01-01T00:00:57.000Z'),
  ('default-59', 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=2070&auto=format&fit=crop', '室內美學',     'image/jpeg', NULL, '2024-01-01T00:00:58.000Z'),
  ('default-60', 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop', '老屋翻新',     'image/jpeg', NULL, '2024-01-01T00:00:59.000Z'),
  ('default-61', 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=2070&auto=format&fit=crop', '居家水電',     'image/jpeg', NULL, '2024-01-01T00:01:00.000Z'),
  ('default-62', 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=2070&auto=format&fit=crop', '客廳沙發',     'image/jpeg', NULL, '2024-01-01T00:01:01.000Z'),
  ('default-63', 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?q=80&w=2070&auto=format&fit=crop', '健康照護',     'image/jpeg', NULL, '2024-01-01T00:01:02.000Z'),
  ('default-64', 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=2070&auto=format&fit=crop', '營養餐點',     'image/jpeg', NULL, '2024-01-01T00:01:03.000Z'),
  ('default-65', 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=2070&auto=format&fit=crop', '住宅外觀',     'image/jpeg', NULL, '2024-01-01T00:01:04.000Z'),
  ('default-66', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=2070&auto=format&fit=crop', '閱讀空間',     'image/jpeg', NULL, '2024-01-01T00:01:05.000Z'),
  ('default-67', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=2000&auto=format&fit=crop', '專業顧問',     'image/jpeg', NULL, '2024-01-01T00:01:06.000Z'),
  ('default-68', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=2000&auto=format&fit=crop', '商務菁英',     'image/jpeg', NULL, '2024-01-01T00:01:07.000Z'),
  ('default-69', 'https://images.unsplash.com/photo-1584362917165-526a968579e8?q=80&w=2070&auto=format&fit=crop', '牙醫器材',     'image/jpeg', NULL, '2024-01-01T00:01:08.000Z'),
  ('default-70', 'https://images.unsplash.com/photo-1585421514738-01798e348b17?q=80&w=2070&auto=format&fit=crop', '居家清潔',     'image/jpeg', NULL, '2024-01-01T00:01:09.000Z'),
  ('default-71', 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=2070&auto=format&fit=crop', '廢棄物清理',   'image/jpeg', NULL, '2024-01-01T00:01:10.000Z'),
  ('default-72', 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?q=80&w=2070&auto=format&fit=crop', '環境整理',     'image/jpeg', NULL, '2024-01-01T00:01:11.000Z'),
  ('default-73', 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?q=80&w=2070&auto=format&fit=crop', '健康飲食',     'image/jpeg', NULL, '2024-01-01T00:01:12.000Z'),
  ('default-74', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2070&auto=format&fit=crop', '生鮮蔬果',     'image/jpeg', NULL, '2024-01-01T00:01:13.000Z'),
  ('default-75', 'https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=2071&auto=format&fit=crop', '烹飪教學',     'image/jpeg', NULL, '2024-01-01T00:01:14.000Z'),
  ('default-76', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop', '租屋空間',     'image/jpeg', NULL, '2024-01-01T00:01:15.000Z'),
  ('default-77', 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=2070&auto=format&fit=crop', '現代公寓',     'image/jpeg', NULL, '2024-01-01T00:01:16.000Z'),
  ('default-78', 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=2071&auto=format&fit=crop', '金融理財',     'image/jpeg', NULL, '2024-01-01T00:01:17.000Z'),
  ('default-79', 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=2070&auto=format&fit=crop', '醫療科技',     'image/jpeg', NULL, '2024-01-01T00:01:18.000Z'),
  ('default-80', 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=1200&auto=format&fit=crop', '合作夥伴',     'image/jpeg', NULL, '2024-01-01T00:01:19.000Z'),
  ('default-81', 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2070&auto=format&fit=crop', '專業服務',     'image/jpeg', NULL, '2024-01-01T00:01:20.000Z'),
  ('default-82', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop',  '團隊成員-1',   'image/jpeg', NULL, '2024-01-01T00:01:21.000Z'),
  ('default-83', 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=200&auto=format&fit=crop',  '團隊成員-2',   'image/jpeg', NULL, '2024-01-01T00:01:22.000Z'),
  ('default-84', 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?q=80&w=200&auto=format&fit=crop',  '團隊成員-3',   'image/jpeg', NULL, '2024-01-01T00:01:23.000Z'),
  ('default-85', 'https://images.unsplash.com/photo-1556912998-c57cc6b63ce7?q=80&w=2070&auto=format&fit=crop', '廚房翻新',     'image/jpeg', NULL, '2024-01-01T00:01:24.000Z')
ON CONFLICT (id) DO NOTHING;

COMMIT;
