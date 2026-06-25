import { Request, Response } from 'express';
import { getSupabaseAdmin } from '../_lib/supabase-admin.js';

export default async function createUserHandler(req: Request, res: Response) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Missing token' });
    }
    const token = authHeader.replace('Bearer ', '');

    const adminClient = getSupabaseAdmin();
    // 檢查是不是 Admin 呼叫的
    const { data: { user }, error: userError } = await adminClient.auth.getUser(token);
    if (userError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const { data: adminPerm } = await adminClient
      .from('admin_permission')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (!adminPerm || adminPerm.role !== 'admin') {
      return res.status(403).json({ error: 'Require administrative privileges' });
    }

    // 進行身份驗證後建立新使用者
    const { email, password, name, permissions, roleDescription } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }

    const { data: createData, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // 自動完成信箱驗證
      user_metadata: { displayName: name }
    });

    if (createError) {
      return res.status(500).json({ error: createError.message });
    }

    const newUser = createData.user;

    // 將使用者寫入 admin_permission 表格
    const { error: insertError } = await adminClient
      .from('admin_permission')
      .insert([
        {
          id: newUser.id,
          email: newUser.email,
          name: name,
          role: 'admin',
          permissions: permissions || ['all'],
          role_description: roleDescription || ''
        }
      ]);

    if (insertError) {
      // 若寫入權限表失敗，我們選擇刪除剛剛建立的 auth.users 紀錄以維持資料一致性
      await adminClient.auth.admin.deleteUser(newUser.id);
      return res.status(500).json({ error: insertError.message });
    }

    return res.json({ success: true, user: newUser });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
