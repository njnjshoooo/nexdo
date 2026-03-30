import React, { useState, useEffect } from 'react';
import { Search, Trash2, Shield, User as UserIcon, AlertTriangle, X, Save } from 'lucide-react';
import { User } from '../../types/auth';

const defaultUsers: User[] = [
  { id: '1', name: 'Admin', email: 'admin@nexdo.com', role: 'admin', createdAt: '2026-01-01T00:00:00Z' },
  { id: '2', name: 'User', email: 'user@gmail.com', role: 'user', createdAt: '2026-01-01T00:00:00Z' }
];

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const stored = localStorage.getItem('users');
    let localUsers: User[] = [];
    if (stored) {
      try {
        localUsers = JSON.parse(stored);
      } catch (e) {}
    }
    setUsers([...defaultUsers, ...localUsers]);
  };

  const handleSaveUser = (updatedUser: User) => {
    const stored = localStorage.getItem('users');
    let localUsers: User[] = stored ? JSON.parse(stored) : [];
    
    // Update in local storage
    const updatedUsers = localUsers.map(u => u.id === updatedUser.id ? updatedUser : u);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    loadUsers();
    setEditModalOpen(false);
    setUserToEdit(null);
  };

  const confirmDelete = (user: User) => {
    if (user.id === '1' || user.id === '2') return;
    setUserToDelete(user);
    setDeleteModalOpen(true);
  };

  const handleDelete = () => {
    if (!userToDelete) return;
    
    const stored = localStorage.getItem('users');
    if (stored) {
      try {
        let localUsers: User[] = JSON.parse(stored);
        const updatedUsers = localUsers.filter(u => u.id !== userToDelete.id);
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        loadUsers();
      } catch (e) {}
    }
    setDeleteModalOpen(false);
    setUserToDelete(null);
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-stone-900 mb-2">會員管理</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="p-4 border-b border-stone-200 bg-stone-50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
            <input
              type="text"
              placeholder="搜尋姓名或 Email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#8B5E34] focus:border-transparent outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-sm text-stone-500">
                <th className="px-6 py-4 font-medium">姓名</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">手機號碼</th>
                <th className="px-6 py-4 font-medium">身分</th>
                <th className="px-6 py-4 font-medium">註冊時間</th>
                <th className="px-6 py-4 font-medium text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {filteredUsers.map((user) => {
                const isDefault = user.id === '1' || user.id === '2';
                const registerTime = user.createdAt ? new Date(user.createdAt).toLocaleString('zh-TW') : '預設帳號';

                return (
                  <tr key={user.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-stone-800">{user.name}</div>
                    </td>
                    <td className="px-6 py-4 text-stone-600">{user.email}</td>
                    <td className="px-6 py-4 text-stone-600">{user.phone || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'bg-stone-100 text-stone-700'
                      }`}>
                        {user.role === 'admin' ? <Shield size={14} /> : <UserIcon size={14} />}
                        {user.role === 'admin' ? '管理員' : '一般用戶'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-stone-500 text-sm">{registerTime}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => { setUserToEdit(user); setEditModalOpen(true); }}
                          className="px-3 py-1.5 rounded-lg text-sm font-medium bg-stone-100 text-stone-700 hover:bg-stone-200 transition-colors"
                        >
                          編輯
                        </button>
                        <button
                          onClick={() => confirmDelete(user)}
                          disabled={isDefault}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isDefault
                              ? 'text-stone-300 cursor-not-allowed'
                              : 'text-red-500 hover:bg-red-50'
                          }`}
                          title="刪除用戶"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-stone-500">
                    找不到符合的用戶
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editModalOpen && userToEdit && (
        <EditUserModal 
          user={userToEdit} 
          onClose={() => { setEditModalOpen(false); setUserToEdit(null); }} 
          onSave={handleSaveUser}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-3 text-red-600 mb-4">
                <AlertTriangle size={24} />
                <h3 className="text-lg font-bold">確認刪除用戶</h3>
              </div>
              <p className="text-stone-600 mb-6">
                您確定要刪除用戶 <span className="font-semibold text-stone-800">{userToDelete?.name}</span> 嗎？此動作無法復原。
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg font-medium transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg font-medium transition-colors"
                >
                  確認刪除
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EditUserModal({ user, onClose, onSave }: { user: User, onClose: () => void, onSave: (u: User) => void }) {
  const [formData, setFormData] = useState<User>(user);
  const [password, setPassword] = useState('');

  const handleSave = () => {
    const dataToSave = { ...formData };
    if (password) {
      (dataToSave as any).password = password;
    }
    onSave(dataToSave);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl my-8">
        <div className="p-6 border-b border-stone-200 flex justify-between items-center sticky top-0 bg-white rounded-t-xl z-10">
          <h3 className="text-lg font-bold text-stone-800">編輯會員資料</h3>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto">
          <section>
            <h4 className="font-bold text-stone-700 mb-4">帳號資訊</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-stone-600 mb-1">電子郵件 (帳號)</label>
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm text-stone-600 mb-1">新密碼 (若不修改請留白)</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="輸入新密碼" className="w-full px-3 py-2 border rounded-lg" />
              </div>
            </div>
          </section>

          <section>
            <h4 className="font-bold text-stone-700 mb-4">基本資料</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-stone-600 mb-1">姓名</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm text-stone-600 mb-1">稱謂</label>
                <select value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-white">
                  <option value="">請選擇</option>
                  <option value="先生">先生</option>
                  <option value="小姐">小姐</option>
                  <option value="女士">女士</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-stone-600 mb-1">聯絡電話</label>
                <input type="text" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm text-stone-600 mb-1">LINE ID</label>
                <input type="text" value={formData.lineId || ''} onChange={e => setFormData({...formData, lineId: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm text-stone-600 mb-1">聯絡地址</label>
                <input type="text" value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm text-stone-600 mb-1">身份</label>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({...prev, role: prev.role === 'admin' ? 'user' : 'admin'}))}
                  className={`w-full px-3 py-2 border rounded-lg flex items-center justify-between transition-colors ${formData.role === 'admin' ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-stone-50 border-stone-200 text-stone-700'}`}
                >
                  <span className="font-medium">{formData.role === 'admin' ? '管理員' : '一般用戶'}</span>
                  <div className={`w-4 h-4 rounded-full transition-colors ${formData.role === 'admin' ? 'bg-purple-500' : 'bg-stone-400'}`} />
                </button>
              </div>
              <div>
                <label className="block text-sm text-stone-600 mb-1">註冊時間</label>
                <input type="text" value={formData.createdAt ? new Date(formData.createdAt).toLocaleString('zh-TW') : '預設帳號'} disabled className="w-full px-3 py-2 border rounded-lg bg-stone-50 text-stone-500" />
              </div>
            </div>
          </section>

          <section>
            <h4 className="font-bold text-stone-700 mb-4">緊急聯絡人與其他資訊</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-stone-600 mb-1">緊急聯絡人姓名</label>
                <input type="text" value={formData.emergencyContactName || ''} onChange={e => setFormData({...formData, emergencyContactName: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm text-stone-600 mb-1">緊急聯絡人電話</label>
                <input type="text" value={formData.emergencyContactPhone || ''} onChange={e => setFormData({...formData, emergencyContactPhone: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm text-stone-600 mb-1">特殊需求或備註</label>
                <textarea value={formData.specialRequirements || ''} onChange={e => setFormData({...formData, specialRequirements: e.target.value})} className="w-full px-3 py-2 border rounded-lg" rows={3} />
              </div>
            </div>
          </section>
        </div>
        <div className="p-6 border-t border-stone-200 flex justify-end gap-3 sticky bottom-0 bg-white rounded-b-xl z-10">
          <button onClick={onClose} className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg">取消</button>
          <button onClick={handleSave} className="px-4 py-2 bg-[#8B5E34] text-white hover:bg-[#704d2a] rounded-lg flex items-center gap-2">
            <Save size={16} /> 儲存
          </button>
        </div>
      </div>
    </div>
  );
}
