import React, { useState, useEffect } from 'react';
import { Staff, Vendor } from '../../../types/vendor';
import { staffService } from '../../../services/staffService';
import { orderService } from '../../../services/orderService';
import { Plus, Trash2, Eye, X, User, ShieldCheck, ShieldAlert, Camera } from 'lucide-react';
import CreateButton from '../../../components/admin/CreateButton';
import SaveButton from '../../../components/admin/SaveButton';
import VendorImageUploader from '../../../components/vendor/VendorImageUploader';
import VendorEditButton from '../../../components/vendor/VendorEditButton';
import VendorDeleteButton from '../../../components/vendor/VendorDeleteButton';
import AdminTable from '../../../components/admin/AdminTable';
import { Pagination } from '../../../components/ui/Pagination';

interface StaffManagementProps {
  vendor: Vendor;
}

export default function StaffManagement({ vendor }: StaffManagementProps) {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [formData, setFormData] = useState<Partial<Staff>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<Staff | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadData();
  }, [vendor.id]);

  const loadData = () => {
    setStaffList(staffService.getAll(vendor.id));
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return '-';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleSave = () => {
    if (!formData.name || !formData.phone || !formData.email || !formData.birthDate || !formData.gender) {
      alert('請填寫所有必填欄位');
      return;
    }

    if (selectedStaff) {
      staffService.update(selectedStaff.id, formData);
    } else {
      staffService.create({
        vendorId: vendor.id,
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        birthDate: formData.birthDate,
        gender: formData.gender as 'MALE' | 'FEMALE' | 'OTHER',
        photoUrl: formData.photoUrl || '',
        hasPoliceRecord: formData.hasPoliceRecord || false
      });
    }

    setIsEditing(false);
    setSelectedStaff(null);
    setFormData({});
    loadData();
  };

  const totalPages = Math.ceil(staffList.length / itemsPerPage);
  const paginatedStaff = staffList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDelete = async (staff: Staff) => {
    // Check if staff has active orders
    const allOrders = await orderService.getAll();
    const hasActiveOrders = allOrders.some(
      o => o.assignedStaffId === staff.id && ['PENDING', 'ACTIVE'].includes(o.status)
    );

    if (hasActiveOrders) {
      alert('該人員目前有進行中的訂單，無法刪除。');
      return;
    }

    setStaffToDelete(staff);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (!staffToDelete) return;
    staffService.delete(staffToDelete.id);
    setShowDeleteConfirm(false);
    setStaffToDelete(null);
    loadData();
  };

  if (isEditing) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
        <div className="flex justify-between items-center mb-6 border-b border-stone-100 pb-4">
          <h2 className="text-xl font-bold text-stone-900">
            {selectedStaff ? '編輯服務人員' : '新增服務人員'}
          </h2>
          <button 
            onClick={() => {
              setIsEditing(false);
              setSelectedStaff(null);
              setFormData({});
            }}
            className="text-stone-400 hover:text-stone-600"
          >
            <X size={24} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="md:col-span-1 flex flex-col items-center justify-start pt-4">
            <VendorImageUploader 
              value={formData.photoUrl}
              onChange={url => setFormData({...formData, photoUrl: url})}
              label="服務人員大頭照"
              placeholder="點擊上傳照片"
              className="w-full max-w-[240px]"
            />
            <p className="text-xs text-stone-400 mt-3 text-center">建議尺寸：500x500px<br />支援 JPG, PNG 格式</p>
          </div>

          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2">姓名 *</label>
              <input 
                type="text" 
                value={formData.name || ''}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2">電話 *</label>
              <input 
                type="text" 
                value={formData.phone || ''}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                className="w-full px-4 py-2 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2">電子信箱 *</label>
              <input 
                type="email" 
                value={formData.email || ''}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-2 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2">出生年月日 *</label>
              <input 
                type="date" 
                value={formData.birthDate || ''}
                onChange={e => setFormData({...formData, birthDate: e.target.value})}
                className="w-full px-4 py-2 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
              />
              {formData.birthDate && (
                <p className="text-xs text-stone-500 mt-1">系統計算年齡：{calculateAge(formData.birthDate)} 歲</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2">性別 *</label>
              <select 
                value={formData.gender || ''}
                onChange={e => setFormData({...formData, gender: e.target.value as any})}
                className="w-full px-4 py-2 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 bg-white"
              >
                <option value="">請選擇性別</option>
                <option value="MALE">男</option>
                <option value="FEMALE">女</option>
                <option value="OTHER">其他</option>
              </select>
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={formData.hasPoliceRecord || false}
                  onChange={e => setFormData({...formData, hasPoliceRecord: e.target.checked})}
                  className="w-5 h-5 text-primary rounded border-stone-300 focus:ring-primary"
                />
                <span className="text-sm font-bold text-stone-700">已提供良民證</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button 
            onClick={() => {
              setIsEditing(false);
              setSelectedStaff(null);
              setFormData({});
            }}
            className="px-6 py-2 border border-stone-200 text-stone-600 rounded-xl font-bold hover:bg-stone-50 transition-colors"
          >
            取消
          </button>
          <SaveButton 
            status="idle"
            onClick={handleSave}
            label="儲存"
            className="px-6 py-2"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
      <div className="p-6 border-b border-stone-100 flex justify-between items-center">
        <h2 className="text-xl font-bold text-stone-900">服務人員名單</h2>
        <CreateButton 
          onClick={() => {
            setSelectedStaff(null);
            setFormData({});
            setIsEditing(true);
          }}
          text="新增人員"
          icon={Plus}
          className="text-sm px-4 py-2 min-w-0"
        />
      </div>
      
      <div className="overflow-x-auto">
        <AdminTable.Main>
          <AdminTable.Head>
            <tr>
              <AdminTable.Th>人員</AdminTable.Th>
              <AdminTable.Th>聯絡資訊</AdminTable.Th>
              <AdminTable.Th>年齡/性別</AdminTable.Th>
              <AdminTable.Th>良民證</AdminTable.Th>
              <AdminTable.Th className="text-center">操作</AdminTable.Th>
            </tr>
          </AdminTable.Head>
          <AdminTable.Body>
            {paginatedStaff.map(staff => (
              <AdminTable.Row key={staff.id}>
                <AdminTable.Td>
                  <div className="flex items-center gap-3">
                    {staff.photoUrl ? (
                      <img src={staff.photoUrl} alt={staff.name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                        <User size={20} />
                      </div>
                    )}
                    <span className="font-bold text-stone-900">{staff.name}</span>
                  </div>
                </AdminTable.Td>
                <AdminTable.Td className="text-sm text-stone-600">
                  <p>{staff.phone}</p>
                  <p className="text-xs text-stone-400">{staff.email}</p>
                </AdminTable.Td>
                <AdminTable.Td className="text-sm text-stone-600">
                  {calculateAge(staff.birthDate)} 歲 / {staff.gender === 'MALE' ? '男' : staff.gender === 'FEMALE' ? '女' : '其他'}
                </AdminTable.Td>
                <AdminTable.Td>
                  {staff.hasPoliceRecord ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg text-xs font-bold">
                      <ShieldCheck size={14} /> 已提供
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-orange-600 bg-orange-50 px-2 py-1 rounded-lg text-xs font-bold">
                      <ShieldAlert size={14} /> 未提供
                    </span>
                  )}
                </AdminTable.Td>
                <AdminTable.Td className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <VendorEditButton 
                      onClick={() => {
                        setSelectedStaff(staff);
                        setFormData(staff);
                        setIsEditing(true);
                      }}
                    />
                    <VendorDeleteButton 
                      onClick={() => handleDelete(staff)}
                    />
                  </div>
                </AdminTable.Td>
              </AdminTable.Row>
            ))}
            {paginatedStaff.length === 0 && (
              <AdminTable.Empty colSpan={5}>
                目前沒有服務人員資料
              </AdminTable.Empty>
            )}
          </AdminTable.Body>
        </AdminTable.Main>
      </div>

      {totalPages > 1 && (
        <div className="p-6 border-t border-stone-100 flex justify-center">
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={setCurrentPage} 
          />
        </div>
      )}

      {/* 刪除確認 Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[80] p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-stone-100 flex items-center gap-3 text-red-600">
              <Trash2 size={24} />
              <h2 className="text-xl font-bold">確認刪除服務人員</h2>
            </div>
            <div className="p-6">
              <p className="text-stone-600 mb-2">
                您確定要刪除服務人員嗎？
              </p>
              <p className="text-sm text-stone-400">
                此動作將會移除該人員的所有資訊，且無法復原。
              </p>
              {staffToDelete && (
                <div className="mt-4 p-3 bg-stone-50 rounded-lg border border-stone-100">
                  <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">人員姓名</p>
                  <p className="text-stone-800 font-bold">{staffToDelete.name}</p>
                </div>
              )}
            </div>
            <div className="p-6 bg-stone-50 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setStaffToDelete(null);
                }}
                className="px-4 py-2 text-stone-600 hover:text-stone-800 font-medium"
              >
                取消
              </button>
              <button
                onClick={confirmDelete}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-bold shadow-sm"
              >
                確認刪除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
