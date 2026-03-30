import React, { useState, useEffect } from 'react';
import { Staff, Vendor } from '../../../types/vendor';
import { staffService } from '../../../services/staffService';
import { orderService } from '../../../services/orderService';
import { Plus, Trash2, Eye, X, Save, User, ShieldCheck, ShieldAlert } from 'lucide-react';

interface StaffManagementProps {
  vendor: Vendor;
}

export default function StaffManagement({ vendor }: StaffManagementProps) {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [formData, setFormData] = useState<Partial<Staff>>({});

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

  const handleDelete = (staff: Staff) => {
    // Check if staff has active orders
    const allOrders = orderService.getAll();
    const hasActiveOrders = allOrders.some(
      o => o.assignedStaffId === staff.id && ['PENDING', 'ACTIVE'].includes(o.status)
    );

    if (hasActiveOrders) {
      alert('該人員目前有進行中的訂單，無法刪除。');
      return;
    }

    if (window.confirm(`確定要刪除服務人員 ${staff.name} 嗎？`)) {
      staffService.delete(staff.id);
      loadData();
    }
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
          <div>
            <label className="block text-sm font-bold text-stone-700 mb-2">大頭照 URL</label>
            <input 
              type="text" 
              value={formData.photoUrl || ''}
              onChange={e => setFormData({...formData, photoUrl: e.target.value})}
              placeholder="https://..."
              className="w-full px-4 py-2 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="md:col-span-2">
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
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-colors"
          >
            <Save size={18} />
            儲存
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
      <div className="p-6 border-b border-stone-100 flex justify-between items-center">
        <h2 className="text-xl font-bold text-stone-900">服務人員名單</h2>
        <button 
          onClick={() => {
            setSelectedStaff(null);
            setFormData({});
            setIsEditing(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-colors text-sm"
        >
          <Plus size={16} />
          新增人員
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-stone-50 text-stone-500 text-xs uppercase font-bold">
            <tr>
              <th className="px-6 py-4">人員</th>
              <th className="px-6 py-4">聯絡資訊</th>
              <th className="px-6 py-4">年齡/性別</th>
              <th className="px-6 py-4">良民證</th>
              <th className="px-6 py-4 text-center">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {staffList.map(staff => (
              <tr key={staff.id} className="hover:bg-stone-50/50 transition-colors">
                <td className="px-6 py-4">
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
                </td>
                <td className="px-6 py-4 text-sm text-stone-600">
                  <p>{staff.phone}</p>
                  <p className="text-xs text-stone-400">{staff.email}</p>
                </td>
                <td className="px-6 py-4 text-sm text-stone-600">
                  {calculateAge(staff.birthDate)} 歲 / {staff.gender === 'MALE' ? '男' : staff.gender === 'FEMALE' ? '女' : '其他'}
                </td>
                <td className="px-6 py-4">
                  {staff.hasPoliceRecord ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg text-xs font-bold">
                      <ShieldCheck size={14} /> 已提供
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-orange-600 bg-orange-50 px-2 py-1 rounded-lg text-xs font-bold">
                      <ShieldAlert size={14} /> 未提供
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button 
                      onClick={() => {
                        setSelectedStaff(staff);
                        setFormData(staff);
                        setIsEditing(true);
                      }}
                      className="p-2 text-stone-400 hover:text-primary transition-colors"
                      title="檢視/編輯"
                    >
                      <Eye size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(staff)}
                      className="p-2 text-stone-400 hover:text-red-500 transition-colors"
                      title="刪除"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {staffList.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-stone-400">
                  目前沒有服務人員資料
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
