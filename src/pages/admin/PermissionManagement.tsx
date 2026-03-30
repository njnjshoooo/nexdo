import React, { useState, useEffect } from 'react';
import { User } from '../../types/auth';
import { Shield, Check } from 'lucide-react';

const PERMISSIONS = [
  { id: 'member', label: '會員權限管理' },
  { id: 'product', label: '產品訂單管理' },
  { id: 'form', label: '諮詢表單管理' },
  { id: 'page', label: '頁面維護' },
  { id: 'article', label: '內容維護' },
  { id: 'media', label: '媒體庫管理' },
];

export default function PermissionManagement() {
  const [admins, setAdmins] = useState<User[]>([]);
  const [draftAdmins, setDraftAdmins] = useState<User[]>([]);

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = () => {
    const stored = localStorage.getItem('users');
    let localUsers: User[] = stored ? JSON.parse(stored) : [];
    // Include default admin (id: '1')
    const allUsers = [{ id: '1', name: 'Admin User', email: 'admin@test.com', role: 'admin', permissions: ['all'] } as User, ...localUsers];
    const adminList = allUsers.filter(u => u.role === 'admin');
    setAdmins(adminList);
    setDraftAdmins(JSON.parse(JSON.stringify(adminList))); // Deep copy
  };

  const togglePermission = (userId: string, permission: string) => {
    setDraftAdmins(prev => prev.map(u => {
      if (u.id === userId) {
        let newPermissions = u.permissions || [];
        if (permission === 'all') {
          newPermissions = newPermissions.includes('all') ? [] : ['all'];
        } else {
          if (newPermissions.includes('all')) {
            newPermissions = PERMISSIONS.map(p => p.id).filter(p => p !== permission);
          } else {
            newPermissions = newPermissions.includes(permission) 
              ? newPermissions.filter(p => p !== permission)
              : [...newPermissions, permission];
          }
        }
        return { ...u, permissions: newPermissions };
      }
      return u;
    }));
  };

  const [saving, setSaving] = useState(false);

  const savePermissions = () => {
    setSaving(true);
    const stored = localStorage.getItem('users');
    let localUsers: User[] = stored ? JSON.parse(stored) : [];
    
    // Update local users with draft permissions (excluding id: '1')
    const updatedUsers = localUsers.map(u => {
      const draft = draftAdmins.find(d => d.id === u.id);
      return draft ? { ...u, permissions: draft.permissions } : u;
    });
    
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    setTimeout(() => {
      loadAdmins();
      setSaving(false);
      alert('權限已儲存');
    }, 500);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-stone-900 mb-2">權限管理</h1>
        <div className="flex gap-3">
          <button onClick={() => setDraftAdmins(JSON.parse(JSON.stringify(admins)))} className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg">重置</button>
          <button 
            onClick={savePermissions} 
            disabled={saving}
            className={`px-4 py-2 text-white rounded-lg transition-all ${saving ? 'bg-green-600' : 'bg-[#8B5E34] hover:bg-[#704d2a]'}`}
          >
            {saving ? '儲存中...' : '儲存設定'}
          </button>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-200 text-sm text-stone-500">
              <th className="px-6 py-4 font-medium">管理員</th>
              {PERMISSIONS.map(p => <th key={p.id} className="px-6 py-4 font-medium text-center">{p.label}</th>)}
              <th className="px-6 py-4 font-medium text-center">全選 (ALL)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200">
            {draftAdmins.map(admin => (
              <tr key={admin.id} className="hover:bg-stone-50">
                <td className="px-6 py-4 font-medium text-stone-800">{admin.name}</td>
                {PERMISSIONS.map(p => (
                  <td key={p.id} className="px-6 py-4 text-center">
                    <input 
                      type="checkbox" 
                      checked={admin.permissions?.includes('all') || admin.permissions?.includes(p.id)}
                      onChange={() => togglePermission(admin.id, p.id)}
                      className="w-5 h-5 accent-[#8B5E34]"
                    />
                  </td>
                ))}
                <td className="px-6 py-4 text-center">
                  <input 
                    type="checkbox" 
                    checked={admin.permissions?.includes('all')}
                    onChange={() => togglePermission(admin.id, 'all')}
                    className="w-5 h-5 accent-[#8B5E34]"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
