import { Request, Response } from 'express';
import { getSupabaseAdmin } from '../_lib/supabase-admin.js';

export default async function syncAdminHandler(req: Request, res: Response) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Missing logic' });
    }
    const token = authHeader.replace('Bearer ', '');

    const adminClient = getSupabaseAdmin();
    const { data: { user }, error: userError } = await adminClient.auth.getUser(token);
    
    if (userError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Check if user is in admin_permission
    const { data: adminPerm, error: permError } = await adminClient
      .from('admin_permission')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();
    
    if (adminPerm && adminPerm.role === 'admin') {
      // Sync to profiles
      await adminClient.from('profiles').update({ role: 'admin' }).eq('id', user.id);
      return res.json({ success: true, message: 'Profile synced to admin' });
    }

    return res.json({ success: false, message: 'Not an admin' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
