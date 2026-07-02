-- Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create vendors table
CREATE TABLE IF NOT EXISTS vendors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tax_id TEXT NOT NULL,
  type TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  job_title TEXT NOT NULL,
  phone TEXT NOT NULL,
  extension TEXT,
  address TEXT NOT NULL,
  account TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'reviewing',
  certifications JSONB DEFAULT '[]'::jsonb,
  commission_rate NUMERIC DEFAULT 80,
  settlement_cycle TEXT DEFAULT 'monthly',
  bank_info JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default vendors with hashed passwords
INSERT INTO vendors (id, name, tax_id, type, contact_name, job_title, phone, extension, address, account, password_hash, status, commission_rate, settlement_cycle, bank_info, created_at, updated_at)
VALUES 
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
  80, 
  'Monthly', 
  '{"bankCode": "808", "bank": "玉山銀行", "bankName": "信義分行", "accountName": "居家整聊有限公司", "accountNumber": "1234567890123"}'::jsonb,
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
  70, 
  'Monthly', 
  '{"bankCode": "808", "bank": "玉山銀行", "bankName": "信義分行", "accountName": "好習慣運動有限公司", "accountNumber": "1234567890135"}'::jsonb,
  '2026-03-24T00:00:00Z', 
  '2026-03-24T00:00:00Z'
)
ON CONFLICT (id) DO NOTHING;

-- Create RPC function to verify vendor password
CREATE OR REPLACE FUNCTION verify_vendor_password(p_account TEXT, p_password TEXT)
RETURNS SETOF vendors AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM vendors
  WHERE account = p_account
    AND password_hash = crypt(p_password, password_hash)
    AND status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS for vendors
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;

-- Allow public read access to vendors (or authenticated only, adjust as needed)
CREATE POLICY "Enable public read access for vendors"
  ON vendors FOR SELECT
  USING (true);

-- Allow authenticated admins to do everything
CREATE POLICY "Enable full access for authenticated users to vendors"
  ON vendors FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ==========================================
-- Vendor Applications Table
-- ==========================================
CREATE TABLE IF NOT EXISTS vendor_applications (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tax_id TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  job_title TEXT NOT NULL,
  phone TEXT NOT NULL,
  extension TEXT,
  email TEXT NOT NULL,
  address TEXT NOT NULL,
  motivation TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for vendor_applications
ALTER TABLE vendor_applications ENABLE ROW LEVEL SECURITY;

-- Allow public insert access
CREATE POLICY "Enable public insert access for vendor_applications"
  ON vendor_applications FOR INSERT
  WITH CHECK (true);

-- Allow authenticated admins to do everything
CREATE POLICY "Enable full access for authenticated users to vendor_applications"
  ON vendor_applications FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ==========================================
-- Articles Table (Blog / Content)
-- ==========================================
CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT,  -- Changed from JSONB to TEXT since it stores Markdown
  cover_image TEXT,
  category_id TEXT,
  seo_keywords TEXT[] DEFAULT '{}',
  related_service_ids TEXT[] DEFAULT '{}',
  show_form BOOLEAN DEFAULT false,
  form_id TEXT,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for articles
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Allow public read access to articles
CREATE POLICY "Enable public read access for articles"
  ON articles FOR SELECT
  USING (true);

-- Allow authenticated admins to do everything
CREATE POLICY "Enable full access for authenticated users"
  ON articles FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
