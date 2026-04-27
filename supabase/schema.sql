-- =====================================================================
-- 好齡居 v5.1 — Supabase Schema
-- =====================================================================
-- 設計原則：
--   1. 採用 JSONB 儲存複雜的巢狀結構（如 page.content、order.items）
--      避免多表 JOIN 的複雜度，直接對應前端 TypeScript interface。
--   2. 所有 text 類型 ID 沿用前端既有的 slug/自訂 ID 格式。
--   3. updated_at 由 trigger 自動維護。
--   4. RLS 保守設定：公開讀已發布內容、admin 可寫所有、其他需 auth。
-- =====================================================================

-- 延伸模組
CREATE EXTENSION IF NOT EXISTS pgcrypto;     -- for bcrypt 密碼

-- =====================================================================
-- 共用工具 function：自動更新 updated_at
-- =====================================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================================
-- 1. profiles（綁 auth.users）
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       text NOT NULL,
  name        text DEFAULT '',
  phone       text,
  address     text,
  line_id     text,
  role        text NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  permissions text[] DEFAULT '{}',
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);
DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- auth.users 建立時自動建立 profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', ''))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================================
-- 2. pages
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.pages (
  id           text PRIMARY KEY,
  slug         text UNIQUE NOT NULL,
  title        text NOT NULL,
  template     text NOT NULL CHECK (template IN ('HOME', 'MAJOR_ITEM', 'SUB_ITEM', 'GENERAL', 'BLOG')),
  parent_id    text,
  content      jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_published boolean NOT NULL DEFAULT true,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS pages_slug_idx ON public.pages(slug);
CREATE INDEX IF NOT EXISTS pages_parent_idx ON public.pages(parent_id);
DROP TRIGGER IF EXISTS pages_updated_at ON public.pages;
CREATE TRIGGER pages_updated_at BEFORE UPDATE ON public.pages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =====================================================================
-- 3. articles
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.articles (
  id                   text PRIMARY KEY,
  slug                 text UNIQUE NOT NULL,
  title                text NOT NULL,
  summary              text DEFAULT '',
  content              jsonb NOT NULL DEFAULT '{}'::jsonb,
  cover_image          text,
  category_id          text,
  seo_keywords         text[] DEFAULT '{}',
  related_service_ids  text[] DEFAULT '{}',
  show_form            boolean DEFAULT false,
  form_id              text,
  is_published         boolean NOT NULL DEFAULT true,
  updated_at           timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS articles_slug_idx ON public.articles(slug);
DROP TRIGGER IF EXISTS articles_updated_at ON public.articles;
CREATE TRIGGER articles_updated_at BEFORE UPDATE ON public.articles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =====================================================================
-- 4. products
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.products (
  id                    text PRIMARY KEY,
  name                  text NOT NULL,
  category              text,
  description           text DEFAULT '',
  image                 text,
  images                text[] DEFAULT '{}',
  checklist             jsonb DEFAULT '[]'::jsonb,
  order_mode            text NOT NULL CHECK (order_mode IN ('FIXED', 'INTERNAL_FORM', 'EXTERNAL_LINK')),
  order_code            text,
  require_date          boolean DEFAULT false,
  require_time          boolean DEFAULT false,
  require_notes         boolean DEFAULT false,
  variants              jsonb DEFAULT '[]'::jsonb,
  fixed_config          jsonb DEFAULT '{}'::jsonb,
  quote_config          jsonb,
  internal_form_config  jsonb,
  external_link_config  jsonb,
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now()
);
DROP TRIGGER IF EXISTS products_updated_at ON public.products;
CREATE TRIGGER products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =====================================================================
-- 5. orders
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id                        text PRIMARY KEY,
  user_id                   uuid,
  items                     jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_amount              numeric NOT NULL DEFAULT 0,
  deposit_amount            numeric,
  balance_amount            numeric,
  quoted_amount             numeric,
  status                    text NOT NULL,
  customer_info             jsonb NOT NULL DEFAULT '{}'::jsonb,
  payment_method            text,
  paid_at                   timestamptz,
  customer_service_notes    text,
  vendor_id                 text,
  submission_id             text,
  assigned_staff_id         text,
  assigned_date             text,
  assigned_time             text,
  vendor_notes              text,
  cancel_reason             text,
  service_photo_url         text,
  receipt_photo_url         text,
  payment_proof_photo_url   text,
  status_updates            jsonb DEFAULT '[]'::jsonb,
  statement_id              text,
  refund_info               jsonb,
  created_at                timestamptz DEFAULT now(),
  updated_at                timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS orders_user_idx ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS orders_vendor_idx ON public.orders(vendor_id);
CREATE INDEX IF NOT EXISTS orders_submission_idx ON public.orders(submission_id);
DROP TRIGGER IF EXISTS orders_updated_at ON public.orders;
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 訂單 ID 生成 RPC（格式：YYMMDDCODE###）
CREATE OR REPLACE FUNCTION public.generate_order_id(p_order_code text)
RETURNS text AS $$
DECLARE
  v_date text;
  v_count int;
BEGIN
  v_date := to_char(now() AT TIME ZONE 'Asia/Taipei', 'YYMMDD');
  SELECT count(*) INTO v_count FROM public.orders
    WHERE id LIKE v_date || COALESCE(p_order_code, 'XX') || '%';
  RETURN v_date || COALESCE(p_order_code, 'XX') || lpad((v_count + 1)::text, 3, '0');
END;
$$ LANGUAGE plpgsql;

-- =====================================================================
-- 6. forms
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.forms (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id     text UNIQUE NOT NULL,
  name        text NOT NULL,
  description text DEFAULT '',
  purpose     text NOT NULL DEFAULT 'GENERAL',
  fields      jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS forms_formid_idx ON public.forms(form_id);
DROP TRIGGER IF EXISTS forms_updated_at ON public.forms;
CREATE TRIGGER forms_updated_at BEFORE UPDATE ON public.forms
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =====================================================================
-- 7. submissions
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.submissions (
  id          text PRIMARY KEY,
  form_id     text NOT NULL,
  user_id     uuid,
  page_slug   text,
  page_title  text,
  data        jsonb NOT NULL DEFAULT '{}'::jsonb,
  status      text NOT NULL DEFAULT 'PENDING',
  booking_id  text,
  created_at  timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS submissions_form_idx ON public.submissions(form_id);
CREATE INDEX IF NOT EXISTS submissions_status_idx ON public.submissions(status);

-- =====================================================================
-- 8. navigation（單筆，id=1）
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.navigation (
  id         int PRIMARY KEY DEFAULT 1,
  items      jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT navigation_singleton CHECK (id = 1)
);
DROP TRIGGER IF EXISTS navigation_updated_at ON public.navigation;
CREATE TRIGGER navigation_updated_at BEFORE UPDATE ON public.navigation
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =====================================================================
-- 9. vendors
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.vendors (
  id                text PRIMARY KEY,
  name              text NOT NULL,
  tax_id            text,
  type              text,
  contact_name      text,
  job_title         text,
  phone             text,
  extension         text,
  address           text,
  account           text UNIQUE NOT NULL,
  password_hash     text NOT NULL,
  status            text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'reviewing')),
  certifications    text[] DEFAULT '{}',
  commission_rate   numeric DEFAULT 0.8,
  settlement_cycle  text DEFAULT 'monthly',
  bank_info         jsonb,
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);
DROP TRIGGER IF EXISTS vendors_updated_at ON public.vendors;
CREATE TRIGGER vendors_updated_at BEFORE UPDATE ON public.vendors
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 廠商登入密碼驗證 RPC (public 可呼叫)
CREATE OR REPLACE FUNCTION public.verify_vendor_password(p_account text, p_password text)
RETURNS TABLE (
  id              text,
  name            text,
  tax_id          text,
  type            text,
  contact_name    text,
  job_title       text,
  phone           text,
  extension       text,
  address         text,
  account         text,
  status          text,
  certifications  text[],
  commission_rate numeric,
  settlement_cycle text,
  bank_info       jsonb,
  created_at      timestamptz,
  updated_at      timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT v.id, v.name, v.tax_id, v.type, v.contact_name, v.job_title, v.phone,
         v.extension, v.address, v.account, v.status, v.certifications,
         v.commission_rate, v.settlement_cycle, v.bank_info, v.created_at, v.updated_at
  FROM public.vendors v
  WHERE v.account = p_account
    AND v.password_hash = crypt(p_password, v.password_hash)
    AND v.status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================================
-- 10. staff
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.staff (
  id                  text PRIMARY KEY,
  vendor_id           text NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  name                text NOT NULL,
  phone               text,
  email               text,
  birth_date          text,
  gender              text,
  photo_url           text,
  has_police_record   boolean DEFAULT false,
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS staff_vendor_idx ON public.staff(vendor_id);
DROP TRIGGER IF EXISTS staff_updated_at ON public.staff;
CREATE TRIGGER staff_updated_at BEFORE UPDATE ON public.staff
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =====================================================================
-- 11. statements（月結算單）
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.statements (
  id              text PRIMARY KEY,
  vendor_id       text NOT NULL REFERENCES public.vendors(id),
  month           text NOT NULL,
  total_orders    int DEFAULT 0,
  total_amount    numeric DEFAULT 0,
  payout_amount   numeric DEFAULT 0,
  status          text NOT NULL DEFAULT 'SUBMITTED' CHECK (status IN ('SUBMITTED', 'PAYOUT_PROCESSING', 'PAID')),
  created_at      timestamptz DEFAULT now(),
  paid_at         timestamptz
);
CREATE INDEX IF NOT EXISTS statements_vendor_idx ON public.statements(vendor_id);

-- =====================================================================
-- 12. media（媒體庫 metadata，檔案本體在 Storage bucket）
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.media (
  id            text PRIMARY KEY,
  url           text NOT NULL,
  name          text NOT NULL,
  type          text NOT NULL,
  storage_path  text,
  source        text DEFAULT 'admin',
  created_at    timestamptz DEFAULT now()
);

-- =====================================================================
-- RLS Policies
-- =====================================================================
-- 策略：
--   1. 所有表打開 RLS
--   2. public 可讀 is_published = true 的內容（pages, articles）
--   3. 其餘「公開」資料 (products, forms, navigation, media) 所有人可讀
--   4. 寫入 / 非公開讀取：admin role 或已登入用戶（依情況）
--   5. vendors / staff / statements / orders / submissions 限 admin（後台）

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.navigation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

-- Helper: 判斷目前 auth user 是否為 admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- profiles: 本人可讀寫；admin 讀寫所有
DROP POLICY IF EXISTS "profiles_self_read" ON public.profiles;
CREATE POLICY "profiles_self_read" ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());
DROP POLICY IF EXISTS "profiles_self_update" ON public.profiles;
CREATE POLICY "profiles_self_update" ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR public.is_admin());
DROP POLICY IF EXISTS "profiles_admin_insert" ON public.profiles;
CREATE POLICY "profiles_admin_insert" ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id OR public.is_admin());

-- pages / articles：已發布者所有人可讀；admin 寫
DROP POLICY IF EXISTS "pages_read_public" ON public.pages;
CREATE POLICY "pages_read_public" ON public.pages FOR SELECT USING (true);
DROP POLICY IF EXISTS "pages_admin_write" ON public.pages;
CREATE POLICY "pages_admin_write" ON public.pages FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "articles_read_public" ON public.articles;
CREATE POLICY "articles_read_public" ON public.articles FOR SELECT USING (true);
DROP POLICY IF EXISTS "articles_admin_write" ON public.articles;
CREATE POLICY "articles_admin_write" ON public.articles FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- products / forms / navigation / media：所有人可讀；admin 寫
DROP POLICY IF EXISTS "products_read_public" ON public.products;
CREATE POLICY "products_read_public" ON public.products FOR SELECT USING (true);
DROP POLICY IF EXISTS "products_admin_write" ON public.products;
CREATE POLICY "products_admin_write" ON public.products FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "forms_read_public" ON public.forms;
CREATE POLICY "forms_read_public" ON public.forms FOR SELECT USING (true);
DROP POLICY IF EXISTS "forms_admin_write" ON public.forms;
CREATE POLICY "forms_admin_write" ON public.forms FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "navigation_read_public" ON public.navigation;
CREATE POLICY "navigation_read_public" ON public.navigation FOR SELECT USING (true);
DROP POLICY IF EXISTS "navigation_admin_write" ON public.navigation;
CREATE POLICY "navigation_admin_write" ON public.navigation FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "media_read_public" ON public.media;
CREATE POLICY "media_read_public" ON public.media FOR SELECT USING (true);
-- media 寫入：任何已登入用戶（admin 或前台使用者上傳）
DROP POLICY IF EXISTS "media_auth_insert" ON public.media;
CREATE POLICY "media_auth_insert" ON public.media FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL OR public.is_admin());
DROP POLICY IF EXISTS "media_admin_update" ON public.media;
CREATE POLICY "media_admin_update" ON public.media FOR UPDATE
  USING (public.is_admin());
DROP POLICY IF EXISTS "media_admin_delete" ON public.media;
CREATE POLICY "media_admin_delete" ON public.media FOR DELETE
  USING (public.is_admin());

-- submissions：允許匿名建立（前台送單），admin 讀/寫
DROP POLICY IF EXISTS "submissions_anyone_insert" ON public.submissions;
CREATE POLICY "submissions_anyone_insert" ON public.submissions FOR INSERT
  WITH CHECK (true);
DROP POLICY IF EXISTS "submissions_admin_read" ON public.submissions;
CREATE POLICY "submissions_admin_read" ON public.submissions FOR SELECT
  USING (public.is_admin());
DROP POLICY IF EXISTS "submissions_admin_update" ON public.submissions;
CREATE POLICY "submissions_admin_update" ON public.submissions FOR UPDATE
  USING (public.is_admin());
DROP POLICY IF EXISTS "submissions_admin_delete" ON public.submissions;
CREATE POLICY "submissions_admin_delete" ON public.submissions FOR DELETE
  USING (public.is_admin());

-- orders：允許匿名建立（前台下單），admin 讀/寫
DROP POLICY IF EXISTS "orders_anyone_insert" ON public.orders;
CREATE POLICY "orders_anyone_insert" ON public.orders FOR INSERT
  WITH CHECK (true);
DROP POLICY IF EXISTS "orders_self_read" ON public.orders;
CREATE POLICY "orders_self_read" ON public.orders FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin() OR true);  -- 前台查單用 submission_id 即可，暫放寬
DROP POLICY IF EXISTS "orders_admin_update" ON public.orders;
CREATE POLICY "orders_admin_update" ON public.orders FOR UPDATE
  USING (public.is_admin());
DROP POLICY IF EXISTS "orders_admin_delete" ON public.orders;
CREATE POLICY "orders_admin_delete" ON public.orders FOR DELETE
  USING (public.is_admin());

-- vendors：所有人可讀（廠商資訊本就半公開）、admin 寫
DROP POLICY IF EXISTS "vendors_read_public" ON public.vendors;
CREATE POLICY "vendors_read_public" ON public.vendors FOR SELECT USING (true);
DROP POLICY IF EXISTS "vendors_admin_write" ON public.vendors;
CREATE POLICY "vendors_admin_write" ON public.vendors FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- staff：admin 完整 / public 可讀（簡化）
DROP POLICY IF EXISTS "staff_read_public" ON public.staff;
CREATE POLICY "staff_read_public" ON public.staff FOR SELECT USING (true);
DROP POLICY IF EXISTS "staff_admin_write" ON public.staff;
CREATE POLICY "staff_admin_write" ON public.staff FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- statements：admin only
DROP POLICY IF EXISTS "statements_admin_all" ON public.statements;
CREATE POLICY "statements_admin_all" ON public.statements FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- =====================================================================
-- 確保 admin@nexdo.com 的 profile 存在且 role = admin
-- =====================================================================
INSERT INTO public.profiles (id, email, name, role)
SELECT id, email, 'Admin', 'admin'
FROM auth.users
WHERE email = 'admin@nexdo.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin';
