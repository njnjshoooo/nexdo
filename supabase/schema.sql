-- ============================================================
-- 好齡居 nexdo — Supabase Schema
-- 11 tables + triggers + functions + storage
-- ============================================================

-- 0. Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. profiles — 使用者擴充資料 (綁定 auth.users)
-- ============================================================
CREATE TABLE public.profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text NOT NULL DEFAULT '',
  title       text,
  nickname    text,
  email       text NOT NULL DEFAULT '',
  phone       text,
  address     text,
  line_id     text,
  emergency_contact_name  text,
  emergency_contact_phone text,
  special_requirements    text,
  role        text NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  permissions text[] DEFAULT '{}',
  created_at  timestamptz DEFAULT now()
);

-- Trigger: 新使用者註冊時自動建立 profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 2. articles — 文章 / 部落格
-- ============================================================
CREATE TABLE public.articles (
  id                  text PRIMARY KEY,
  title               text NOT NULL,
  slug                text UNIQUE NOT NULL,
  summary             text,
  content             text NOT NULL DEFAULT '',
  cover_image         text NOT NULL DEFAULT '',
  category_id         text NOT NULL DEFAULT '',
  seo_keywords        text[] DEFAULT '{}',
  related_service_ids text[] DEFAULT '{}',
  show_form           boolean DEFAULT false,
  form_id             text,
  is_published        boolean DEFAULT false,
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);

-- ============================================================
-- 3. pages — CMS 頁面
-- ============================================================
CREATE TABLE public.pages (
  id           text PRIMARY KEY,
  slug         text UNIQUE NOT NULL,
  title        text NOT NULL,
  template     text NOT NULL CHECK (template IN ('HOME', 'MAJOR_ITEM', 'SUB_ITEM', 'GENERAL', 'BLOG')),
  parent_id    text,
  content      jsonb NOT NULL DEFAULT '{}',
  is_published boolean DEFAULT false,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

-- ============================================================
-- 4. products — 商品
-- ============================================================
CREATE TABLE public.products (
  id                    text PRIMARY KEY,
  name                  text NOT NULL,
  category              text,
  description           text NOT NULL DEFAULT '',
  image                 text,
  checklist             jsonb DEFAULT '[]',
  order_mode            text NOT NULL DEFAULT 'EXTERNAL_LINK'
                        CHECK (order_mode IN ('FIXED', 'INTERNAL_FORM', 'EXTERNAL_LINK')),
  order_code            text,
  require_date          boolean DEFAULT false,
  require_time          boolean DEFAULT false,
  require_notes         boolean DEFAULT false,
  variants              jsonb DEFAULT '[]',
  fixed_config          jsonb DEFAULT '{"price":0,"unit":"次","buttonText":"立即下單"}',
  quote_config          jsonb,
  internal_form_config  jsonb,
  external_link_config  jsonb,
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now()
);

-- ============================================================
-- 5. orders — 訂單
-- ============================================================
CREATE TABLE public.orders (
  id                     text PRIMARY KEY,
  user_id                text,
  items                  jsonb NOT NULL DEFAULT '[]',
  total_amount           numeric NOT NULL DEFAULT 0,
  quoted_amount          numeric,
  status                 text NOT NULL DEFAULT 'PENDING'
                         CHECK (status IN (
                           'UNPAID','PENDING','ACTIVE','COMPLETED',
                           'PENDING_PAYMENT','PAID','CANCELLED','CANCELING',
                           'QUOTE_PENDING','QUOTED','PROCESSED'
                         )),
  customer_info          jsonb NOT NULL DEFAULT '{}',
  payment_method         text NOT NULL DEFAULT '',
  paid_at                timestamptz,
  customer_service_notes text,
  vendor_id              text,
  submission_id          text,
  assigned_staff_id      text,
  assigned_date          text,
  assigned_time          text,
  vendor_notes           text,
  cancel_reason          text,
  service_photo_url      text,
  status_updates         jsonb DEFAULT '[]',
  created_at             timestamptz DEFAULT now()
);

-- Function: 生成訂單 ID (YYMMDDCODE###)
CREATE OR REPLACE FUNCTION public.generate_order_id(p_order_code text)
RETURNS text AS $$
DECLARE
  v_date_prefix text;
  v_month_prefix text;
  v_max_seq int;
  v_new_id text;
BEGIN
  v_date_prefix := to_char(now(), 'YYMMDD');
  v_month_prefix := to_char(now(), 'YYMM');

  SELECT COALESCE(MAX(
    CAST(RIGHT(id, 3) AS int)
  ), 0)
  INTO v_max_seq
  FROM public.orders
  WHERE id LIKE v_month_prefix || '%' || p_order_code || '___'
    AND RIGHT(id, 3) ~ '^\d{3}$'
    AND SUBSTRING(id FROM 7 FOR LENGTH(p_order_code)) = p_order_code;

  v_new_id := v_date_prefix || p_order_code || LPAD((v_max_seq + 1)::text, 3, '0');
  RETURN v_new_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 6. forms — 表單定義
-- ============================================================
CREATE TABLE public.forms (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id     text UNIQUE NOT NULL,
  name        text NOT NULL,
  description text NOT NULL DEFAULT '',
  purpose     text CHECK (purpose IN ('CONSULTATION', 'BOOKING')),
  fields      jsonb NOT NULL DEFAULT '[]',
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

-- ============================================================
-- 7. submissions — 表單提交
-- ============================================================
CREATE TABLE public.submissions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id     text NOT NULL,
  user_id     uuid REFERENCES auth.users(id),
  page_slug   text NOT NULL DEFAULT '',
  page_title  text NOT NULL DEFAULT '',
  data        jsonb NOT NULL DEFAULT '{}',
  status      text DEFAULT 'PENDING'
              CHECK (status IN ('PENDING','ASSIGNED','QUOTED','PROCESSED','ACTIVE')),
  created_at  timestamptz DEFAULT now()
);

-- ============================================================
-- 8. vendors — 廠商
-- ============================================================
CREATE TABLE public.vendors (
  id              text PRIMARY KEY,
  name            text NOT NULL,
  tax_id          text NOT NULL DEFAULT '',
  type            text NOT NULL DEFAULT '',
  contact_name    text NOT NULL DEFAULT '',
  job_title       text NOT NULL DEFAULT '',
  phone           text NOT NULL DEFAULT '',
  extension       text,
  address         text NOT NULL DEFAULT '',
  account         text UNIQUE NOT NULL,
  password_hash   text NOT NULL,
  status          text NOT NULL DEFAULT 'reviewing'
                  CHECK (status IN ('active', 'suspended', 'reviewing')),
  certifications  text[] DEFAULT '{}',
  billing_cycle   text NOT NULL DEFAULT 'monthly'
                  CHECK (billing_cycle IN ('monthly', 'cash')),
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- RPC: 廠商密碼驗證
CREATE OR REPLACE FUNCTION public.verify_vendor_password(
  p_account text,
  p_password text
)
RETURNS jsonb AS $$
DECLARE
  v_vendor record;
BEGIN
  SELECT * INTO v_vendor
  FROM public.vendors
  WHERE account = p_account AND status = 'active';

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Account not found or suspended');
  END IF;

  IF v_vendor.password_hash = crypt(p_password, v_vendor.password_hash) THEN
    RETURN jsonb_build_object(
      'success', true,
      'vendor', jsonb_build_object(
        'id', v_vendor.id,
        'name', v_vendor.name,
        'account', v_vendor.account,
        'status', v_vendor.status
      )
    );
  ELSE
    RETURN jsonb_build_object('success', false, 'error', 'Invalid password');
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 9. staff — 廠商人員
-- ============================================================
CREATE TABLE public.staff (
  id                text PRIMARY KEY,
  vendor_id         text NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  name              text NOT NULL,
  phone             text NOT NULL DEFAULT '',
  email             text NOT NULL DEFAULT '',
  birth_date        date,
  gender            text NOT NULL DEFAULT 'OTHER'
                    CHECK (gender IN ('MALE', 'FEMALE', 'OTHER')),
  photo_url         text,
  has_police_record boolean DEFAULT false,
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);

-- ============================================================
-- 10. navigation — 導航結構 (單筆)
-- ============================================================
CREATE TABLE public.navigation (
  id         integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  items      jsonb NOT NULL DEFAULT '[]',
  updated_at timestamptz DEFAULT now()
);

-- 預先插入一筆空的 navigation
INSERT INTO public.navigation (id, items) VALUES (1, '[]');

-- ============================================================
-- 11. media — 媒體庫
-- ============================================================
CREATE TABLE public.media (
  id            text PRIMARY KEY,
  url           text NOT NULL,
  name          text NOT NULL,
  type          text NOT NULL DEFAULT 'image/jpeg',
  storage_path  text,
  created_at    timestamptz DEFAULT now()
);

-- ============================================================
-- 12. updated_at 自動更新 trigger
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON public.articles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_pages_updated_at
  BEFORE UPDATE ON public.pages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_forms_updated_at
  BEFORE UPDATE ON public.forms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_vendors_updated_at
  BEFORE UPDATE ON public.vendors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_staff_updated_at
  BEFORE UPDATE ON public.staff
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_navigation_updated_at
  BEFORE UPDATE ON public.navigation
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- 13. Row Level Security (基礎啟用)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.navigation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

-- Helper: 檢查是否為 admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ── profiles ──
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admin can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admin full access profiles"
  ON public.profiles FOR ALL
  USING (public.is_admin());

-- ── articles ── (公開讀取已發布)
CREATE POLICY "Public can read published articles"
  ON public.articles FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admin full access articles"
  ON public.articles FOR ALL
  USING (public.is_admin());

-- ── pages ── (公開讀取已發布)
CREATE POLICY "Public can read published pages"
  ON public.pages FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admin full access pages"
  ON public.pages FOR ALL
  USING (public.is_admin());

-- ── products ── (公開讀取)
CREATE POLICY "Public can read products"
  ON public.products FOR SELECT
  USING (true);

CREATE POLICY "Admin full access products"
  ON public.products FOR ALL
  USING (public.is_admin());

-- ── orders ──
CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Admin full access orders"
  ON public.orders FOR ALL
  USING (public.is_admin());

-- ── forms ── (公開讀取)
CREATE POLICY "Public can read forms"
  ON public.forms FOR SELECT
  USING (true);

CREATE POLICY "Admin full access forms"
  ON public.forms FOR ALL
  USING (public.is_admin());

-- ── submissions ──
CREATE POLICY "Users can view own submissions"
  ON public.submissions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can create submissions"
  ON public.submissions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admin full access submissions"
  ON public.submissions FOR ALL
  USING (public.is_admin());

-- ── vendors ──
CREATE POLICY "Admin full access vendors"
  ON public.vendors FOR ALL
  USING (public.is_admin());

-- ── staff ──
CREATE POLICY "Admin full access staff"
  ON public.staff FOR ALL
  USING (public.is_admin());

-- ── navigation ── (公開讀取)
CREATE POLICY "Public can read navigation"
  ON public.navigation FOR SELECT
  USING (true);

CREATE POLICY "Admin full access navigation"
  ON public.navigation FOR ALL
  USING (public.is_admin());

-- ── media ── (公開讀取)
CREATE POLICY "Public can read media"
  ON public.media FOR SELECT
  USING (true);

CREATE POLICY "Admin full access media"
  ON public.media FOR ALL
  USING (public.is_admin());

-- ============================================================
-- 14. Storage bucket
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Public can read media files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'media');

CREATE POLICY "Admin can upload media files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'media' AND public.is_admin());

CREATE POLICY "Admin can delete media files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'media' AND public.is_admin());

-- ============================================================
-- Done! Schema ready.
-- ============================================================
