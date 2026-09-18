-- Restrict the permission directory to its subject and permission administrators.
-- Leaves existing grants intact; no customer or account records are deleted.
BEGIN;
CREATE OR REPLACE FUNCTION public.nexdo_has_permission(required_permission text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_permission a
    WHERE a.id = auth.uid() AND a.role = 'admin'
      AND a.permissions && ARRAY['all', required_permission]::text[]
  );
$$;
REVOKE ALL ON FUNCTION public.nexdo_has_permission(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.nexdo_has_permission(text) TO authenticated;
ALTER TABLE public.admin_permission ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "允許認證用戶全權操作" ON public.admin_permission;
DROP POLICY IF EXISTS "開發測試：允許所有人讀取" ON public.admin_permission;
CREATE POLICY admin_permission_self_read ON public.admin_permission FOR SELECT TO authenticated
  USING (id = auth.uid());
CREATE POLICY admin_permission_managers ON public.admin_permission FOR ALL TO authenticated
  USING (public.nexdo_has_permission('permissions'))
  WITH CHECK (public.nexdo_has_permission('permissions'));
COMMIT;
