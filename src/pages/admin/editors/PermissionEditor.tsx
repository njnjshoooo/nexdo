import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { ArrowLeft, Save } from 'lucide-react';
import { PageMainTitle, FieldLabel, InputClass, PrimaryBtnClass, SecondaryBtnClass, BlockContainer } from '../../../components/admin/ui/AdminEditorUI';
import SaveButton from '../../../components/admin/SaveButton';
import AdminPageHeader from '../../../components/admin/ui/AdminPageHeader';

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

const PERMISSIONS = CATEGORIZED_PERMISSIONS.flatMap(c => c.items);

export default function PermissionEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [permissions, setPermissions] = useState<string[]>([]);

  useEffect(() => {
    if (id) fetchAdmin();
  }, [id]);

  const fetchAdmin = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('admin_permission')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      if (data) {
        setName(data.name || '');
        setEmail(data.email || '');
        setRoleDescription(data.role_description || '');
        setPermissions(data.permissions || []);
      }
    } catch (err: any) {
      console.error(err);
      alert('無法載入管理員資料');
      navigate('/admin/permissions');
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (pId: string) => {
    setPermissions(prev => prev.includes(pId) ? prev.filter(p => p !== pId) : [...prev, pId]);
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      const updates = {
        name,
        email,
        role_description: roleDescription,
        permissions,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('admin_permission')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      if (password) {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;
        if (token) {
          const res = await fetch('/api/admin/update-user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ userId: id, password })
          });
          const updateRes = await res.json();
          if (!updateRes.success) {
            throw new Error(updateRes.error || '密碼更新失敗');
          }
          setPassword(''); // clear on success
        } else {
          throw new Error('無法取得授權 Token');
        }
      }

      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err: any) {
      alert(`更新失敗: ${err.message}`);
      setSaveStatus('idle');
    }
  };

  if (loading) return <div className="p-8 text-center text-stone-500">載入中...</div>;

  return (
    <div className="max-w-7xl mx-auto pb-24">
      {/* Header */}
      <AdminPageHeader
        title="編輯管理員權限"
        subtitle={`${name} (${email})`}
        backTo="/admin/permissions"
        actionButtons={
          <SaveButton status={saveStatus} onClick={handleSave} label="儲存變更" />
        }
      />

      <BlockContainer className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <FieldLabel>姓名</FieldLabel>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              className={InputClass} 
            />
          </div>
          <div>
            <FieldLabel>Email</FieldLabel>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className={InputClass} 
              disabled
            />
          </div>
          <div>
            <FieldLabel>密碼更新</FieldLabel>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className={InputClass} 
              placeholder="若不修改請留空" 
            />
          </div>
          <div>
            <FieldLabel>身份說明</FieldLabel>
            <input 
              type="text" 
              value={roleDescription} 
              onChange={e => setRoleDescription(e.target.value)} 
              className={InputClass} 
              placeholder="例如：行銷主管" 
            />
          </div>
        </div>

        <div className="pt-6 border-t border-stone-100">
          <div className="flex items-center justify-between mb-2">
            <FieldLabel className="!mb-0">權限模組調整</FieldLabel>
            <button 
              type="button" 
              onClick={() => {
                if (permissions.includes('all') || permissions.length === PERMISSIONS.length) {
                  setPermissions([]);
                } else {
                  setPermissions(['all', ...PERMISSIONS.map(p => p.id)]);
                }
              }}
              className="text-xs text-primary font-bold hover:bg-stone-100 px-3 py-1.5 rounded-md transition-colors"
            >
              {(permissions.includes('all') || permissions.length === PERMISSIONS.length) ? '全部取消' : '一鍵全選'}
            </button>
          </div>
          <div className="space-y-6 mt-4">
            {CATEGORIZED_PERMISSIONS.map((cat, idx) => (
              <div key={idx} className="space-y-3">
                <div className="text-sm font-bold text-stone-500 border-b border-stone-200 pb-1">{cat.category}</div>
                <div className="grid grid-cols-2 gap-3">
                  {cat.items.map(p => (
                    <label key={p.id} className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200 cursor-pointer hover:border-stone-400 transition-colors">
                      <input 
                        type="checkbox" 
                        checked={permissions.includes(p.id) || permissions.includes('all')} 
                        onChange={() => togglePermission(p.id)} 
                        className="w-4 h-4 accent-stone-800 rounded text-primary focus:ring-primary border-stone-300" 
                      />
                      <span className="text-sm font-medium text-stone-700">{p.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </BlockContainer>
    </div>
  );
}
