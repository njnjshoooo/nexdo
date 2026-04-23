import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, Upload, Briefcase } from 'lucide-react';
import { Vendor } from '../../types/vendor';
import { vendorService } from '../../services/vendorService';
import ImageUploader from '../../components/admin/ImageUploader';
import AdminTable from '../../components/admin/AdminTable';
import AdminSearchBar from '../../components/admin/search/AdminSearchBar';
import AdminSearchInput from '../../components/admin/search/AdminSearchInput';
import { Pagination } from '../../components/ui/Pagination';

export default function VendorManagement() {
  const [vendors, setVendors] = useState<Vendor[]>(() => vendorService.getAll());
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [vendorToDelete, setVendorToDelete] = useState<Vendor | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setVendors(vendorService.getAll());
    
    const handleStorage = () => {
      setVendors(vendorService.getAll());
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const saveVendors = (newVendors: Vendor[]) => {
    setVendors(newVendors);
    vendorService.saveAll(newVendors);
  };

  const handleDelete = (id: string) => {
    const vendor = vendors.find(v => v.id === id);
    if (vendor) {
      setVendorToDelete(vendor);
      setShowDeleteConfirm(true);
    }
  };

  const confirmDelete = () => {
    if (!vendorToDelete) return;
    saveVendors(vendors.filter(v => v.id !== vendorToDelete.id));
    setShowDeleteConfirm(false);
    setVendorToDelete(null);
  };

  const filteredVendors = vendors.filter(v => 
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.taxId.includes(searchTerm) ||
    v.contactName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredVendors.length / itemsPerPage);
  const paginatedVendors = filteredVendors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

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

      <AdminSearchBar>
        <AdminSearchInput
          placeholder="搜尋廠商名稱、統編或聯絡人..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
      </AdminSearchBar>

      <AdminTable.Container>
        <AdminTable.Main>
          <AdminTable.Head>
            <tr>
              <AdminTable.Th>廠商名稱</AdminTable.Th>
              <AdminTable.Th>統一編號</AdminTable.Th>
              <AdminTable.Th>廠商類型</AdminTable.Th>
              <AdminTable.Th>聯絡人</AdminTable.Th>
              <AdminTable.Th>聯絡人電話</AdminTable.Th>
              <AdminTable.Th>狀態</AdminTable.Th>
              <AdminTable.Th className="text-right">操作</AdminTable.Th>
            </tr>
          </AdminTable.Head>
          <AdminTable.Body>
            {paginatedVendors.map((vendor) => (
              <AdminTable.Row key={vendor.id}>
                <AdminTable.Td>
                  <div className="font-medium text-stone-900">{vendor.name}</div>
                  <div className="text-xs text-stone-500">ID: {vendor.id}</div>
                </AdminTable.Td>
                <AdminTable.Td className="text-stone-600">{vendor.taxId}</AdminTable.Td>
                <AdminTable.Td className="text-stone-600">{vendor.type}</AdminTable.Td>
                <AdminTable.Td>
                  <div className="text-stone-900">{vendor.contactName}</div>
                  <div className="text-xs text-stone-500">{vendor.jobTitle}</div>
                </AdminTable.Td>
                <AdminTable.Td className="text-stone-600">
                  {vendor.phone}{vendor.extension ? ` #${vendor.extension}` : ''}
                </AdminTable.Td>
                <AdminTable.Td>{getStatusBadge(vendor.status)}</AdminTable.Td>
                <AdminTable.Td className="text-right">
                  <AdminTable.Actions>
                    <AdminTable.Edit onClick={() => {
                      setEditingVendor(vendor);
                      setIsModalOpen(true);
                    }} />
                    <AdminTable.Delete onClick={() => handleDelete(vendor.id)} />
                  </AdminTable.Actions>
                </AdminTable.Td>
              </AdminTable.Row>
            ))}
            {paginatedVendors.length === 0 && (
              <AdminTable.Empty colSpan={7}>
                找不到符合的廠商
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
            onPageChange={setCurrentPage} 
          />
        </div>
      )}

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

      {/* 刪除確認 Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[80] p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-stone-100 flex items-center gap-3 text-red-600">
              <Trash2 size={24} />
              <h2 className="text-xl font-bold">確認刪除廠商</h2>
            </div>
            <div className="p-6">
              <p className="text-stone-600 mb-2">
                您確定要刪除此廠商嗎？
              </p>
              <p className="text-sm text-stone-400">
                此動作將會移除該廠商的所有資訊，且無法復原。
              </p>
              {vendorToDelete && (
                <div className="mt-4 p-3 bg-stone-50 rounded-lg border border-stone-100">
                  <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">廠商名稱</p>
                  <p className="text-stone-800 font-bold">{vendorToDelete.name}</p>
                </div>
              )}
            </div>
            <div className="p-6 bg-stone-50 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setVendorToDelete(null);
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

import SaveButton from '../../components/admin/SaveButton';

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
      certifications: [],
      commissionRate: 80,
      settlementCycle: 'Monthly',
      bankInfo: {
        bankCode: '',
        bank: '',
        bankName: '',
        accountName: '',
        accountNumber: ''
      }
    }
  );

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.taxId || !formData.type || !formData.id || 
        !formData.contactName || !formData.jobTitle || !formData.phone || 
        !formData.address || !formData.account || (!vendor && !formData.password)) {
      alert('請填寫所有必填欄位');
      return;
    }

    if (formData.commissionRate !== undefined && (formData.commissionRate < 0 || formData.commissionRate > 100)) {
      alert('分潤比例必須在 0 到 100 之間');
      return;
    }

    if (!vendor && vendors.some(v => v.id === formData.id)) {
      alert('廠商ID已存在，請使用其他ID');
      return;
    }

    setSaveStatus('saving');
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    onSave({
      ...formData,
      createdAt: vendor?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Vendor);
    
    setSaveStatus('saved');
    setTimeout(() => {
      onClose();
    }, 500);
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
              <div className="grid grid-cols-1 gap-4">
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

          {/* 財務結算設定 */}
          <section>
            <h3 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-primary rounded-full"></span>
              財務結算設定
            </h3>
            <div className="bg-stone-50 p-6 rounded-xl border border-stone-200 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">分潤比例 (%) <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={formData.commissionRate ?? ''}
                    onChange={e => setFormData({...formData, commissionRate: Number(e.target.value)})}
                    className="w-full px-4 py-2 bg-white border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="例如：80"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">結算週期 <span className="text-red-500">*</span></label>
                  <select
                    value={formData.settlementCycle || 'Monthly'}
                    onChange={e => setFormData({...formData, settlementCycle: e.target.value as any})}
                    className="w-full px-4 py-2 bg-white border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  >
                    <option value="Monthly">月結 (Monthly)</option>
                    <option value="Bi-weekly">半月結 (Bi-weekly)</option>
                    <option value="Weekly">週結 (Weekly)</option>
                  </select>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-stone-700 mb-3 text-sm">銀行帳戶資訊</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">銀行代碼 <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={formData.bankInfo?.bankCode || ''}
                      onChange={e => setFormData({
                        ...formData, 
                        bankInfo: { ...formData.bankInfo!, bankCode: e.target.value }
                      })}
                      className="w-full px-4 py-2 bg-white border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      placeholder="例如：808"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">匯款銀行 <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={formData.bankInfo?.bank || ''}
                      onChange={e => setFormData({
                        ...formData, 
                        bankInfo: { ...formData.bankInfo!, bank: e.target.value }
                      })}
                      className="w-full px-4 py-2 bg-white border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      placeholder="例如：玉山銀行"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">分行名稱 <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={formData.bankInfo?.bankName || ''}
                      onChange={e => setFormData({
                        ...formData, 
                        bankInfo: { ...formData.bankInfo!, bankName: e.target.value }
                      })}
                      className="w-full px-4 py-2 bg-white border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      placeholder="例如：信義分行"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">戶名 <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={formData.bankInfo?.accountName || ''}
                      onChange={e => setFormData({
                        ...formData, 
                        bankInfo: { ...formData.bankInfo!, accountName: e.target.value }
                      })}
                      className="w-full px-4 py-2 bg-white border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      placeholder="例如：居家整聊室有限公司"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">帳號 <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={formData.bankInfo?.accountNumber || ''}
                      onChange={e => setFormData({
                        ...formData, 
                        bankInfo: { ...formData.bankInfo!, accountNumber: e.target.value }
                      })}
                      className="w-full px-4 py-2 bg-white border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      placeholder="例如：1234567890123"
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
            <SaveButton status={saveStatus} />
          </div>
        </form>
      </div>
    </div>
  );
}
