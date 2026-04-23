import React, { useState, useEffect } from 'react';
import { User } from '../../types/auth';
import { Shield, Check } from 'lucide-react';
import SaveButton from '../../components/admin/SaveButton';
import AdminTable from '../../components/admin/AdminTable';

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
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

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

  const savePermissions = () => {
    setSaveStatus('saving');
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
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 500);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-stone-900 mb-2">權限管理</h1>
        <div className="flex gap-3">
          <button onClick={() => setDraftAdmins(JSON.parse(JSON.stringify(admins)))} className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg">重置</button>
          <SaveButton 
            onClick={savePermissions} 
            status={saveStatus}
            label="儲存設定"
          />
        </div>
      </div>
      <AdminTable.Container>
        <AdminTable.Main>
          <AdminTable.Head>
            <tr>
              <AdminTable.Th>管理員</AdminTable.Th>
              {PERMISSIONS.map(p => <AdminTable.Th key={p.id} className="text-center">{p.label}</AdminTable.Th>)}
              <AdminTable.Th className="text-center">全選 (ALL)</AdminTable.Th>
            </tr>
          </AdminTable.Head>
          <AdminTable.Body>
            {draftAdmins.map(admin => (
              <AdminTable.Row key={admin.id}>
                <AdminTable.Td className="font-medium text-stone-800">{admin.name}</AdminTable.Td>
                {PERMISSIONS.map(p => (
                  <AdminTable.Td key={p.id} className="text-center">
                    <input 
                      type="checkbox" 
                      checked={admin.permissions?.includes('all') || admin.permissions?.includes(p.id)}
                      onChange={() => togglePermission(admin.id, p.id)}
                      className="w-5 h-5 accent-[#8B5E34]"
                    />
                  </AdminTable.Td>
                ))}
                <AdminTable.Td className="text-center">
                  <input 
                    type="checkbox" 
                    checked={admin.permissions?.includes('all')}
                    onChange={() => togglePermission(admin.id, 'all')}
                    className="w-5 h-5 accent-[#8B5E34]"
                  />
                </AdminTable.Td>
              </AdminTable.Row>
            ))}
          </AdminTable.Body>
        </AdminTable.Main>
      </AdminTable.Container>
    </div>
  );
}
