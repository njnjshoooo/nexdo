import { Request, Response } from 'express';
import { getSupabaseAdmin } from '../_lib/supabase-admin.js';

export default async function updateUserHandler(req: Request, res: Response) {
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

    // 進行身份驗證後修改目標使用者的密碼
    const targetUserId = req.body.userId;
    const newPassword = req.body.password;

    if (!targetUserId || !newPassword) {
      return res.status(400).json({ error: 'Missing userId or password' });
    }

    const { data: updateData, error: updateError } = await adminClient.auth.admin.updateUserById(
      targetUserId,
      { password: newPassword }
    );

    if (updateError) {
      return res.status(500).json({ error: updateError.message });
    }

    return res.json({ success: true, message: 'Password updated successfully' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
