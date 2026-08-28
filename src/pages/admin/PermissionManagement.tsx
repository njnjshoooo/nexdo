import React, { useState, useEffect } from 'react';
import { Shield, Plus, Edit2, X, Key, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import SaveButton from '../../components/admin/SaveButton';
import AdminTable from '../../components/admin/AdminTable';
import CreateButton from '../../components/admin/CreateButton';
import { PageMainTitle, InputClass, SecondaryBtnClass, PrimaryBtnClass, FieldLabel } from '../../components/admin/ui/AdminEditorUI';

const CATEGORIZED_PERMISSIONS = [
  {
    category: '營運管理',
    items: [
      { id: 'consultations', label: '諮詢紀錄' },
      { id: 'appointments', label: '預約記錄' },
      { id: 'orders', label: '訂單管理' },
      { id: 'finance', label: '財務結算' },
    ]
  },
  {
    category: '產品管理',
    items: [
      { id: 'products', label: '產品管理' },
    ]
  },
  {
    category: '會員管理',
    items: [
      { id: 'users', label: '會員管理' },
    ]
  },
  {
    category: '內容管理',
    items: [
      { id: 'pages', label: '頁面管理' },
      { id: 'articles', label: '文章管理' },
      { id: 'media', label: '媒體庫' },
    ]
  },
  {
    category: '資源管理',
    items: [
      { id: 'vendors', label: '合作廠商' },
      { id: 'forms', label: '表單工具' },
    ]
  },
  {
    category: '系統配置',
    items: [
      { id: 'settings', label: '網站外觀設定' },
      { id: 'navigation', label: '導覽列管理' },
      { id: 'emails', label: '自動發信管理' },
      { id: 'permissions', label: '管理員與權限設定' },
    ]
  }
];

// 為了相容原本的寫法，我們展平出一個簡單的陣列供一些舊邏輯使用，或直接給新邏輯用
const PERMISSIONS = CATEGORIZED_PERMISSIONS.flatMap(c => c.items);

interface AdminPermissionRow {
  id: string;
  email: string;
  name: string;
  role: string;
  role_description?: string;
  permissions: string[];
}

export default function PermissionManagement() {
  const navigate = useNavigate();
  const [admins, setAdmins] = useState<AdminPermissionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // 彈窗狀態控制
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // 新增員工的表單 State
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [newPermissions, setNewPermissions] = useState<string[]>([]);

  // 編輯員工權限的 State
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  useEffect(() => {
    fetchAdmins();
  }, []);

  // 💡 從 Supabase 撈取所有管理員（已更名為 admin_permission）
  const fetchAdmins = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      // 確保即使 supabase hang 也能強制退出
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('連線超時')), 8000));
      const fetchPromise = supabase
        .from('admin_permission')
        .select('*')
        .order('created_at', { ascending: false });

      const response: any = await Promise.race([fetchPromise, timeoutPromise]);
      const { data, error } = response;

      if (error) throw new Error(error.message || JSON.stringify(error));
      
      if (!Array.isArray(data)) {
        throw new Error('回傳資料格式錯誤，預期為陣列');
      }

      setAdmins(data || []);
    } catch (error: any) {
      console.error('撈取管理員失敗:', error);
      setFetchError(error.message || '未知錯誤');
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  };

  // 💡 處理「新增員工」
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newPassword || !newName) return;

    setSaveStatus('saving');
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      
      if (!token) throw new Error('無法取得授權 Token，請重新登入管理員帳號');

      const res = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: newEmail,
          password: newPassword,
          name: newName,
          roleDescription: newRoleDescription,
          permissions: newPermissions
        })
      });

      const responseData = await res.json();
      if (!responseData.success) {
        throw new Error(responseData.error || '開通新館理帳號失敗');
      }

      setSaveStatus('saved');
      setTimeout(() => {
        setIsCreateModalOpen(false);
        setSaveStatus('idle');
        // 清空表單
        setNewEmail('');
        setNewName('');
        setNewPassword('');
        setNewRoleDescription('');
        setNewPermissions([]);
        fetchAdmins();
      }, 1000);
    } catch (error: any) {
      setSaveStatus('idle');
      alert(`新增失敗: ${error.message}`);
    }
  };

  const handleDeleteAdmin = async (id: string) => {
    if (!window.confirm('確定要刪除這位管理員嗎？')) return;
    try {
      const { error } = await supabase.from('admin_permission').delete().eq('id', id);
      if (error) throw error;
      fetchAdmins();
    } catch (err: any) {
      alert(`刪除失敗: ${err.message}`);
    }
  };

  // 控制新增表單的 Checkbox 勾選
  const toggleNewPermission = (pId: string) => {
    setNewPermissions(prev => prev.includes(pId) ? prev.filter(id => id !== pId) : [...prev, pId]);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <PageMainTitle className="!text-3xl mb-2">管理員與權限設定</PageMainTitle>
          <p className="text-stone-500">管理後台登入人員與其功能模組存取權限</p>
        </div>
        <CreateButton text="新增管理員" onClick={() => setIsCreateModalOpen(true)} icon={Plus} />
      </div>

      {loading ? (
        <div className="text-center text-stone-400 py-12">載入管理員名單中...</div>
      ) : fetchError ? (
        <div className="text-center text-red-500 py-12">載入失敗: {fetchError}</div>
      ) : (
        <AdminTable.Container>
          <AdminTable.Main>
            <AdminTable.Head>
              <tr>
                <AdminTable.Th>管理員姓名</AdminTable.Th>
                <AdminTable.Th>登入 Email</AdminTable.Th>
                <AdminTable.Th>身份說明</AdminTable.Th>
                <AdminTable.Th>擁有權限數</AdminTable.Th>
                <AdminTable.Th className="text-right">操作</AdminTable.Th>
              </tr>
            </AdminTable.Head>
            <AdminTable.Body>
              {admins.map(admin => (
                <AdminTable.Row key={admin.id}>
                  <AdminTable.Td className="font-bold text-stone-800 flex items-center gap-2">
                    <Shield size={16} className="text-amber-500" />
                    {admin.name}
                  </AdminTable.Td>
                  <AdminTable.Td className="text-stone-500 font-mono text-sm">{admin.email}</AdminTable.Td>
                  <AdminTable.Td>
                    <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-stone-100 text-stone-600">
                      {admin.role_description || '管理員'}
                    </span>
                  </AdminTable.Td>
                  <AdminTable.Td className="text-stone-600 text-sm">
                    {`${admin.permissions?.length || 0} 個模組`}
                  </AdminTable.Td>
                  <AdminTable.Td className="text-right">
                    <AdminTable.Actions>
                      <AdminTable.Edit 
                        onClick={() => navigate(`/admin/permissions/${admin.id}`)} 
                      />
                      <button onClick={() => handleDeleteAdmin(admin.id)} className="p-2 text-stone-400 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </AdminTable.Actions>
                  </AdminTable.Td>
                </AdminTable.Row>
              ))}
            </AdminTable.Body>
          </AdminTable.Main>
        </AdminTable.Container>
      )}

      {/* 彈窗一：新增管理員 */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50">
              <h3 className="font-bold text-lg text-stone-900">＋ 開通新員工管理帳號</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-stone-400 hover:text-stone-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateAdmin} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
              <FieldLabel>員工姓名</FieldLabel>
                <input type="text" required value={newName} onChange={e => setNewName(e.target.value)} placeholder="例如：王小明" className={`!w-full ${InputClass}`} />
              </div>
              <div>
              <FieldLabel>登入 Email</FieldLabel>
                <input type="email" required value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="staff@example.com" className={`!w-full ${InputClass}`} />
              </div>
              <div>
              <FieldLabel>預設登入密碼</FieldLabel>
                <input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="至少 6 位數密碼" className={`!w-full ${InputClass}`} />
              </div>
              <div>
                <FieldLabel>身份說明</FieldLabel>
                <input type="text" value={newRoleDescription} onChange={e => setNewRoleDescription(e.target.value)} placeholder="例如：行銷主管" className={`!w-full ${InputClass}`} />
              </div>

              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <FieldLabel className="!mb-0">指派可用功能模組</FieldLabel>
                  <button 
                    type="button" 
                    onClick={() => {
                      if (newPermissions.includes('all') || newPermissions.length === PERMISSIONS.length) {
                        setNewPermissions([]);
                      } else {
                        setNewPermissions(['all', ...PERMISSIONS.map(p => p.id)]);
                      }
                    }}
                    className="text-xs text-primary font-bold hover:bg-stone-100 px-2 py-1 rounded-md transition-colors"
                  >
                    {(newPermissions.includes('all') || newPermissions.length === PERMISSIONS.length) ? '全部取消' : '一鍵全選'}
                  </button>
                </div>
                <div className="space-y-4 bg-stone-50 p-4 rounded-xl border border-stone-200 h-64 overflow-y-auto">
                  {CATEGORIZED_PERMISSIONS.map((cat, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="text-xs font-bold text-stone-400 mb-1 border-b border-stone-200 pb-1">{cat.category}</div>
                      <div className="grid grid-cols-2 gap-2">
                        {cat.items.map(p => (
                          <label key={p.id} className="flex items-center gap-3 p-2 bg-white rounded-lg border border-stone-100 shadow-sm cursor-pointer hover:border-stone-300 transition-colors">
                            <input type="checkbox" checked={newPermissions.includes(p.id) || newPermissions.includes('all')} onChange={() => toggleNewPermission(p.id)} className="w-4 h-4 accent-stone-800" />
                            <span className="text-sm font-medium text-stone-700">{p.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-stone-100 items-center">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className={SecondaryBtnClass}>取消</button>
                <SaveButton status={saveStatus} label="確認開通" />
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
