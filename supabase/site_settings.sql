-- ============================================================
-- 建立 site_settings 表（單筆 id=1，存 header/footer 全域設定）
-- ============================================================

CREATE TABLE IF NOT EXISTS public.site_settings (
  id         int PRIMARY KEY DEFAULT 1,
  data       jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT site_settings_singleton CHECK (id = 1)
);

DROP TRIGGER IF EXISTS site_settings_updated_at ON public.site_settings;
CREATE TRIGGER site_settings_updated_at BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "site_settings_read_public" ON public.site_settings;
CREATE POLICY "site_settings_read_public" ON public.site_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "site_settings_admin_write" ON public.site_settings;
CREATE POLICY "site_settings_admin_write" ON public.site_settings FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());
