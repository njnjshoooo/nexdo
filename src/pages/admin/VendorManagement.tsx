import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, Upload, Briefcase } from 'lucide-react';
import { Vendor } from '../../types/vendor';
import ImageUploader from '../../components/admin/ImageUploader';

const defaultVendors: Vendor[] = [
  {
    id: 'tidyman',
    name: '居家整聊室',
    taxId: '88888888',
    type: '居家整聊',
    contactName: '賴芝芝',
    jobTitle: '課程顧問',
    phone: '02-8888-8888',
    extension: '888',
    address: '台北市信義區松德路',
    account: 'tidyman@tidyman.com',
    password: '888888',
    status: 'active',
    certifications: [],
    billingCycle: 'monthly',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'hobbystudio',
    name: '習慣健康國際',
    taxId: '82977822',
    type: '樂齡健康',
    contactName: '林阿茹',
    jobTitle: '課程顧問',
    phone: '02-2222-2222',
    extension: '222',
    address: '台北市大同區長安西路',
    account: 'hobbystudio@hobbystudio.com',
    password: '222222',
    status: 'active',
    certifications: [],
    billingCycle: 'monthly',
    createdAt: '2026-03-24T00:00:00Z',
    updatedAt: '2026-03-24T00:00:00Z',
  }
];

export default function VendorManagement() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('vendors');
    if (stored) {
      setVendors(JSON.parse(stored));
    } else {
      setVendors(defaultVendors);
      localStorage.setItem('vendors', JSON.stringify(defaultVendors));
    }
  }, []);

  const saveVendors = (newVendors: Vendor[]) => {
    setVendors(newVendors);
    localStorage.setItem('vendors', JSON.stringify(newVendors));
  };

  const handleDelete = (id: string) => {
    if (window.confirm('確定要刪除此廠商嗎？')) {
      saveVendors(vendors.filter(v => v.id !== id));
    }
  };

  const filteredVendors = vendors.filter(v => 
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.taxId.includes(searchTerm) ||
    v.contactName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">合作中</span>;
      case 'suspended':
        return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">停權中</span>;
      case 'reviewing':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">審核中</span>;
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-stone-900 mb-2">廠商管理</h1>
          <p className="text-stone-500">管理所有合作廠商資訊與狀態</p>
        </div>
        <button
          onClick={() => {
            setEditingVendor(null);
            setIsModalOpen(true);
          }}
          className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus size={20} />
          新增廠商資訊
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="p-4 border-b border-stone-100 flex items-center gap-4 bg-stone-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input
              type="text"
              placeholder="搜尋廠商名稱、統編或聯絡人..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-100">
                <th className="p-4 text-sm font-medium text-stone-500">廠商名稱</th>
                <th className="p-4 text-sm font-medium text-stone-500">統一編號</th>
                <th className="p-4 text-sm font-medium text-stone-500">廠商類型</th>
                <th className="p-4 text-sm font-medium text-stone-500">聯絡人</th>
                <th className="p-4 text-sm font-medium text-stone-500">聯絡人電話</th>
                <th className="p-4 text-sm font-medium text-stone-500">狀態</th>
                <th className="p-4 text-sm font-medium text-stone-500 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredVendors.map((vendor) => (
                <tr key={vendor.id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="p-4">
                    <div className="font-medium text-stone-900">{vendor.name}</div>
                    <div className="text-xs text-stone-500">ID: {vendor.id}</div>
                  </td>
                  <td className="p-4 text-stone-600">{vendor.taxId}</td>
                  <td className="p-4 text-stone-600">{vendor.type}</td>
                  <td className="p-4">
                    <div className="text-stone-900">{vendor.contactName}</div>
                    <div className="text-xs text-stone-500">{vendor.jobTitle}</div>
                  </td>
                  <td className="p-4 text-stone-600">
                    {vendor.phone}{vendor.extension ? ` #${vendor.extension}` : ''}
                  </td>
                  <td className="p-4">{getStatusBadge(vendor.status)}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingVendor(vendor);
                          setIsModalOpen(true);
                        }}
                        className="p-2 text-stone-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                        title="編輯"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(vendor.id)}
                        className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="刪除"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredVendors.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-stone-500">
                    找不到符合的廠商
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <VendorModal
          vendor={editingVendor}
          vendors={vendors}
          onClose={() => setIsModalOpen(false)}
          onSave={(vendor) => {
            if (editingVendor) {
              saveVendors(vendors.map(v => v.id === vendor.id ? vendor : v));
            } else {
              saveVendors([...vendors, vendor]);
            }
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

function VendorModal({ 
  vendor, 
  vendors,
  onClose, 
  onSave 
}: { 
  vendor: Vendor | null, 
  vendors: Vendor[],
  onClose: () => void,
  onSave: (vendor: Vendor) => void
}) {
  const [formData, setFormData] = useState<Partial<Vendor>>(
    vendor || {
      status: 'reviewing',
      billingCycle: 'monthly',
      certifications: []
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.taxId || !formData.type || !formData.id || 
        !formData.contactName || !formData.jobTitle || !formData.phone || 
        !formData.address || !formData.account || (!vendor && !formData.password)) {
      alert('請填寫所有必填欄位');
      return;
    }

    if (!vendor && vendors.some(v => v.id === formData.id)) {
      alert('廠商ID已存在，請使用其他ID');
      return;
    }

    onSave({
      ...formData,
      createdAt: vendor?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Vendor);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl my-8">
        <div className="flex items-center justify-between p-6 border-b border-stone-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <h2 className="text-xl font-bold text-stone-900">
            {vendor ? '編輯廠商資訊' : '新增廠商資訊'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
            <X size={24} className="text-stone-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto">
            {/* 基本資訊 */}
          <section>
            <h3 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-primary rounded-full"></span>
              基本資訊
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">廠商名稱 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">統一編號 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.taxId || ''}
                  onChange={e => setFormData({...formData, taxId: e.target.value})}
                  className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">廠商類型 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.type || ''}
                  onChange={e => setFormData({...formData, type: e.target.value})}
                  className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  placeholder="例如：裝修工程、清潔服務..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">廠商ID <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.id || ''}
                  onChange={e => setFormData({...formData, id: e.target.value})}
                  disabled={!!vendor} // 編輯時不可修改 ID
                  className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="唯一值，例如：V001"
                />
              </div>
            </div>
          </section>

          {/* 聯繫資訊 */}
          <section>
            <h3 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-primary rounded-full"></span>
              聯繫資訊
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">窗口姓名 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.contactName || ''}
                  onChange={e => setFormData({...formData, contactName: e.target.value})}
                  className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">職稱 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.jobTitle || ''}
                  onChange={e => setFormData({...formData, jobTitle: e.target.value})}
                  className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">公司電話 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.phone || ''}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">分機</label>
                <input
                  type="text"
                  value={formData.extension || ''}
                  onChange={e => setFormData({...formData, extension: e.target.value})}
                  className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-stone-700 mb-1">公司地址 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.address || ''}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                  className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">帳號 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.account || ''}
                  onChange={e => setFormData({...formData, account: e.target.value})}
                  className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">密碼 {vendor ? '(不修改請留白)' : <span className="text-red-500">*</span>}</label>
                <input
                  type="password"
                  required={!vendor}
                  value={formData.password || ''}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>
            </div>
          </section>

          {/* 信賴與營運資訊 */}
          <section>
            <h3 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-primary rounded-full"></span>
              信賴與營運資訊
            </h3>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">合作狀態 <span className="text-red-500">*</span></label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value as any})}
                    className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  >
                    <option value="active">合作中</option>
                    <option value="reviewing">審核中</option>
                    <option value="suspended">停權中</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">結帳週期 <span className="text-red-500">*</span></label>
                  <select
                    value={formData.billingCycle}
                    onChange={e => setFormData({...formData, billingCycle: e.target.value as any})}
                    className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  >
                    <option value="monthly">月結</option>
                    <option value="cash">現金</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">專業證照 / 認證 (附件)</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {formData.certifications?.map((cert, index) => (
                    <div key={index} className="relative group aspect-video rounded-lg overflow-hidden border border-stone-200">
                      <img src={cert} alt={`Certification ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          const newCerts = [...(formData.certifications || [])];
                          newCerts.splice(index, 1);
                          setFormData({...formData, certifications: newCerts});
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-white/90 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-50"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  <div className="aspect-video">
                    <ImageUploader
                      value=""
                      onChange={(url) => {
                        if (url) {
                          setFormData({
                            ...formData,
                            certifications: [...(formData.certifications || []), url]
                          });
                        }
                      }}
                      placeholder="上傳證照"
                      className="h-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          </div>

          <div className="flex justify-end gap-3 p-6 border-t border-stone-100 sticky bottom-0 bg-white rounded-b-2xl z-10">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-stone-600 font-medium hover:bg-stone-100 rounded-xl transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white font-medium rounded-xl transition-colors shadow-sm"
            >
              儲存設定
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
