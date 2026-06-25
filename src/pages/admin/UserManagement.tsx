import React, { useState, useEffect } from 'react';
import { PageMainTitle } from '../../components/admin/ui/AdminEditorUI';
import { Search, Trash2, Shield, User as UserIcon, AlertTriangle, X } from 'lucide-react';
import { User } from '../../types/auth';
import SaveButton from '../../components/admin/SaveButton';
import AdminTable from '../../components/admin/AdminTable';
import AdminSearchBar from '../../components/admin/search/AdminSearchBar';
import AdminSearchInput from '../../components/admin/search/AdminSearchInput';
import { Pagination } from '../../components/ui/Pagination';
// 🔌 引入的 userService
import { userService } from '../../services/userService'; 

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true); // 加上載入狀態
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadUsers();
  }, []);

  // 📡 改由 userService 從 Supabase 撈取真實資料
  const loadUsers = async () => {
    setLoading(true);
    const cloudUsers = await userService.getAll();
    
    // 💡 關鍵改造：從前端就將殘留的 role === 'admin' 帳號徹底過濾掉，只留下純一般會員！
    const pureMembers = cloudUsers.filter(u => u.role !== 'admin');
    
    setUsers(pureMembers);
    setLoading(false);
  };

  // 💾 儲存修改到 Supabase
  const handleSaveUser = async (updatedUser: User) => {
    if (!updatedUser.id) return;
    
    // 呼交雲端更新
    const success = await userService.update(updatedUser.id, updatedUser);
    if (success) {
      loadUsers(); // 重新整理列表
      setEditModalOpen(false);
      setUserToEdit(null);
    } else {
      alert('儲存失敗，請檢查主控台報錯！');
    }
  };

  const confirmDelete = (user: User) => {
    setUserToDelete(user);
    setDeleteModalOpen(true);
  };

  // 🗑️ 從 Supabase 刪除資料
  const handleDelete = async () => {
    if (!userToDelete || !userToDelete.id) return;
    
    const success = await userService.delete(userToDelete.id);
    if (success) {
      loadUsers(); // 重新整理列表
    } else {
      alert('刪除失敗！');
    }
    setDeleteModalOpen(false);
    setUserToDelete(null);
  };

  const filteredUsers = users.filter(u => 
    (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <PageMainTitle className="!text-3xl mb-2">會員管理</PageMainTitle>
          <p className="text-stone-500">檢視及維護平台前台註冊會員的基本資料</p>
        </div>
      </div>

      <AdminSearchBar>
        <AdminSearchInput
          placeholder="搜尋姓名或 Email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
      </AdminSearchBar>

      <AdminTable.Container>
        <AdminTable.Main>
          <AdminTable.Head>
            <tr>
              <AdminTable.Th>姓名</AdminTable.Th>
              <AdminTable.Th>Email</AdminTable.Th>
              <AdminTable.Th>手機號碼</AdminTable.Th>
              {/* 💡 移除：舊的身分 (TH) 欄位 */}
              <AdminTable.Th>註冊時間</AdminTable.Th>
              <AdminTable.Th className="text-right">操作</AdminTable.Th>
            </tr>
          </AdminTable.Head>
          <AdminTable.Body>
            {loading ? (
              <AdminTable.Empty colSpan={5}>
                資料連線載入中...
              </AdminTable.Empty>
            ) : (
              paginatedUsers.map((user) => {
                const registerTime = user.createdAt ? new Date(user.createdAt).toLocaleString('zh-TW') : '無資料';

                return (
                  <AdminTable.Row key={user.id}>
                    <AdminTable.Td>
                      <div className="font-medium text-stone-800">{user.name}</div>
                    </AdminTable.Td>
                    <AdminTable.Td className="text-stone-600">{user.email}</AdminTable.Td>
                    <AdminTable.Td className="text-stone-600">{user.phone || '-'}</AdminTable.Td>
                    {/* 💡 移除：舊的身分 (TD) 標籤狀態 */}
                    <AdminTable.Td className="text-stone-500 text-sm">{registerTime}</AdminTable.Td>
                    <AdminTable.Td className="text-right">
                      <AdminTable.Actions>
                        <AdminTable.Edit onClick={() => { setUserToEdit(user); setEditModalOpen(true); }} />
                        <AdminTable.Delete onClick={() => confirmDelete(user)} />
                      </AdminTable.Actions>
                    </AdminTable.Td>
                  </AdminTable.Row>
                );
              })
            )}
            {!loading && paginatedUsers.length === 0 && (
              <AdminTable.Empty colSpan={5}>
                找不到符合的用戶
              </AdminTable.Empty>
            )}
          </AdminTable.Body>
        </AdminTable.Main>
      </AdminTable.Container>

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={setCurrentPage} />
        </div>
      )}

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

// 💡 已經將內部的「身份切換按鈕」完全拔除，防止管理員被從此處設定
function EditUserModal({ user, onClose, onSave }: { user: User, onClose: () => void, onSave: (u: User) => void }) {
  const [formData, setFormData] = useState<User>(user);
  const [password, setPassword] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const handleSave = async () => {
    setSaveStatus('saving');
    const dataToSave = { ...formData };
    if (password) {
      (dataToSave as any).password = password;
    }
    setSaveStatus('saved');
    setTimeout(() => {
      onSave(dataToSave);
    }, 200);
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
              {/* 💡 移除：這裡原本有身分 (role) 切換按鈕的區塊已整塊安全蒸發 */}
              <div>
                <label className="block text-sm text-stone-600 mb-1">註冊時間</label>
                <input type="text" value={formData.createdAt ? new Date(formData.createdAt).toLocaleString('zh-TW') : '無資料'} disabled className="w-full px-3 py-2 border rounded-lg bg-stone-50 text-stone-500" />
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
          <SaveButton 
            onClick={handleSave}
            status={saveStatus}
            label="儲存"
          />
        </div>
      </div>
    </div>
  );
}