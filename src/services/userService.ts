import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { User } from '../types/auth';

const TABLE_NAME = 'profiles';

class UserService {
  async getAll(): Promise<User[]> {
    if (!isSupabaseConfigured) {
      console.warn('⚠️ [userService] Supabase 未設定，回傳空陣列');
      return [];
    }

    console.log('📡 [userService] 開始向 Supabase 索取 profiles 資料...');
    const { data, error } = await supabase.from(TABLE_NAME).select('*');

    if (error) {
      console.error('❌ [userService] getAll 失敗:', error.message);
      return [];
    }

    // 🚨 抓鬼大隊 1：看看 Supabase 到底吐了什麼原始資料
    console.log('📦 [userService] Supabase 吐出的原始 profiles 資料:', data);

    if (!data || data.length === 0) {
      console.warn('⚠️ [userService] 注意：Supabase 回傳了空陣列 []，裡面真的沒資料！');
      return [];
    }

    try {
      // 💡 使用箭頭函式確保 this 綁定正確
      const mappedData = data.map(row => this.mapRow(row));
      console.log('✨ [userService] 轉換成功後的會員資料:', mappedData);
      return mappedData;
    } catch (err) {
      console.error('💥 [userService] 在 mapRow 轉換時崩潰:', err);
      return [];
    }
  }

  async getById(id: string): Promise<User | null> {
    if (!isSupabaseConfigured) return null;
    const { data, error } = await supabase.from(TABLE_NAME).select('*').eq('id', id).maybeSingle();
    if (error) {
      console.error('[userService] getById failed:', error);
      return null;
    }
    return data ? this.mapRow(data) : null;
  }

  async update(id: string, updates: Partial<User>): Promise<boolean> {
    if (!isSupabaseConfigured) return false;
    const row = this.toRow(updates);
    const { error } = await supabase.from(TABLE_NAME).update(row).eq('id', id);
    if (error) {
      console.error('[userService] update failed:', error);
      return false;
    }
    return true;
  }

  async delete(id: string): Promise<boolean> {
    if (!isSupabaseConfigured) return false;
    const { error } = await supabase.from(TABLE_NAME).delete().eq('id', id);
    if (error) {
      console.error('[userService] delete failed:', error);
      return false;
    }
    return true;
  }

  // 💡 強化相容型對照器：相容底線、大小寫駝峰，並對 JSON 進行防呆
  private mapRow(row: any): User {
    const getJson = (val: any) => {
      if (!val) return [];
      if (typeof val === 'string') {
        try { return JSON.parse(val); } catch { return []; }
      }
      return val;
    };

    return {
      id: row.id,
      name: row.name || row.username || '未命名用戶', // 相容 username 欄位
      title: row.title,
      nickname: row.nickname,
      email: row.email,
      phone: row.phone,
      address: row.address,
      lineId: row.line_id || row.lineId,
      emergencyContactName: row.emergency_contact_name || row.emergencyContactName,
      emergencyContactPhone: row.emergency_contact_phone || row.emergencyContactPhone,
      specialRequirements: row.special_requirements || row.specialRequirements,
      role: row.role || 'admin', // 🔥 防呆：如果是後台管理，先給 admin 確保看得到
      permissions: getJson(row.permissions),
      createdAt: row.created_at || row.createdAt,
    };
  }

  private toRow(user: Partial<User>): any {
    const row: any = {};
    if (user.id !== undefined) row.id = user.id;
    if (user.name !== undefined) { row.name = user.name; row.username = user.name; }
    if (user.title !== undefined) row.title = user.title;
    if (user.nickname !== undefined) row.nickname = user.nickname;
    if (user.email !== undefined) row.email = user.email;
    if (user.phone !== undefined) row.phone = user.phone;
    if (user.address !== undefined) row.address = user.address;
    
    // 雙向寫入確保相容
    if (user.lineId !== undefined) { row.line_id = user.lineId; row.lineId = user.lineId; }
    if (user.emergencyContactName !== undefined) { row.emergency_contact_name = user.emergencyContactName; row.emergencyContactName = user.emergencyContactName; }
    if (user.emergencyContactPhone !== undefined) { row.emergency_contact_phone = user.emergencyContactPhone; row.emergencyContactPhone = user.emergencyContactPhone; }
    if (user.specialRequirements !== undefined) { row.special_requirements = user.specialRequirements; row.specialRequirements = user.specialRequirements; }
    if (user.role !== undefined) row.role = user.role;
    if (user.permissions !== undefined) row.permissions = JSON.stringify(user.permissions);
    
    return row;
  }
}

export const userService = new UserService();