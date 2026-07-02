import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { vendorService } from '../../services/vendorService';
import { Vendor } from '../../types/vendor';
import { Trash2, ArrowLeft } from 'lucide-react';
import ImageUploader from '../../components/admin/ImageUploader';
import SaveButton from '../../components/admin/SaveButton';
import { PageMainTitle } from '../../components/admin/ui/AdminEditorUI';

export default function VendorEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [formData, setFormData] = useState<Partial<Vendor>>({
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
  });

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  useEffect(() => {
    if (!isNew && id) {
      const allVendors = vendorService.getAll();
      const existingVendor = allVendors.find(v => v.id === id);
      if (existingVendor) {
        setVendor(existingVendor);
        setFormData(existingVendor);
      }
    }
  }, [id, isNew]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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

    const vendors = vendorService.getAll();
    if (!vendor && vendors.some(v => v.id === formData.id)) {
      alert('廠商ID已存在，請使用其他ID');
      return;
    }

    setSaveStatus('saving');
    
    try {
      if (vendor) {
        // Update
        const updateData: Partial<Vendor> = { ...formData };
        if (!formData.password) {
          delete updateData.password; // Don't update password if it's empty
        }
        await vendorService.update(vendor.id, updateData);
      } else {
        // Create
        await vendorService.create(formData as Omit<Vendor, 'createdAt' | 'updatedAt'>);
      }

      setSaveStatus('saved');
      setTimeout(() => {
        navigate('/admin/vendors');
      }, 500);
    } catch (error: any) {
      alert(error.message || '儲存失敗');
      setSaveStatus('idle');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto pb-20">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link to="/admin/vendors" className="text-stone-400 hover:text-stone-600 transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <PageMainTitle className="!text-3xl m-0">{isNew ? '新增廠商資訊' : '編輯廠商資訊'}</PageMainTitle>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/vendors')}
            className="px-6 py-2.5 text-stone-600 font-medium hover:bg-stone-100 rounded-xl transition-colors"
          >
            取消
          </button>
          <SaveButton status={saveStatus} />
        </div>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-200 space-y-12 mt-6">
        {/* 基本資訊 */}
        <section>
          <h3 className="text-xl font-bold text-stone-800 mb-6 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-primary rounded-full"></span>
            基本資訊
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">廠商名稱 <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-stone-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">統一編號 <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={formData.taxId || ''}
                onChange={e => setFormData({...formData, taxId: e.target.value})}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-stone-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">廠商類型 <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={formData.type || ''}
                onChange={e => setFormData({...formData, type: e.target.value})}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-stone-300"
                placeholder="例如：裝修工程、清潔服務..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">廠商ID <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={formData.id || ''}
                onChange={e => setFormData({...formData, id: e.target.value})}
                disabled={!!vendor} // 編輯時不可修改 ID
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-stone-300"
                placeholder="唯一值，例如：V001"
              />
            </div>
          </div>
        </section>

        <hr className="border-stone-100" />

        {/* 聯繫資訊 */}
        <section>
          <h3 className="text-xl font-bold text-stone-800 mb-6 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-primary rounded-full"></span>
            聯繫資訊
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">窗口姓名 <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={formData.contactName || ''}
                onChange={e => setFormData({...formData, contactName: e.target.value})}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-stone-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">職稱 <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={formData.jobTitle || ''}
                onChange={e => setFormData({...formData, jobTitle: e.target.value})}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-stone-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">公司電話 <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={formData.phone || ''}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-stone-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">分機</label>
              <input
                type="text"
                value={formData.extension || ''}
                onChange={e => setFormData({...formData, extension: e.target.value})}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-stone-300"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-stone-700 mb-2">公司地址 <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={formData.address || ''}
                onChange={e => setFormData({...formData, address: e.target.value})}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-stone-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">帳號 <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={formData.account || ''}
                onChange={e => setFormData({...formData, account: e.target.value})}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-stone-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">密碼 {vendor ? '(不修改請留白)' : <span className="text-red-500">*</span>}</label>
              <input
                type="password"
                required={!vendor}
                value={formData.password || ''}
                onChange={e => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-stone-300"
              />
            </div>
          </div>
        </section>

        <hr className="border-stone-100" />

        {/* 信賴與營運資訊 */}
        <section>
          <h3 className="text-xl font-bold text-stone-800 mb-6 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-primary rounded-full"></span>
            信賴與營運資訊
          </h3>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">合作狀態 <span className="text-red-500">*</span></label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value as any})}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-stone-300"
                >
                  <option value="active">合作中</option>
                  <option value="reviewing">審核中</option>
                  <option value="suspended">停權中</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-4">專業證照 / 認證 (附件)</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {formData.certifications?.map((cert, index) => (
                  <div key={index} className="relative group aspect-video rounded-xl overflow-hidden border border-stone-200">
                    <img src={cert || undefined} alt={`Certification ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        const newCerts = [...(formData.certifications || [])];
                        newCerts.splice(index, 1);
                        setFormData({...formData, certifications: newCerts});
                      }}
                      className="absolute top-2 right-2 p-2 bg-white/90 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-50"
                    >
                      <Trash2 size={16} />
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
                    className="h-full rounded-xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <hr className="border-stone-100" />

        {/* 財務結算設定 */}
        <section>
          <h3 className="text-xl font-bold text-stone-800 mb-6 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-primary rounded-full"></span>
            財務結算設定
          </h3>
          <div className="bg-stone-50 p-6 sm:p-8 rounded-2xl border border-stone-200 space-y-8">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">分潤比例 (%) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={formData.commissionRate ?? ''}
                  onChange={e => setFormData({...formData, commissionRate: Number(e.target.value)})}
                  className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-stone-300"
                  placeholder="例如：80"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">結算週期 <span className="text-red-500">*</span></label>
                <select
                  value={formData.settlementCycle || 'Monthly'}
                  onChange={e => setFormData({...formData, settlementCycle: e.target.value as any})}
                  className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-stone-300"
                >
                  <option value="Monthly">月結 (Monthly)</option>
                  <option value="Bi-weekly">半月結 (Bi-weekly)</option>
                  <option value="Weekly">週結 (Weekly)</option>
                </select>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-stone-800 mb-4 text-base border-b border-stone-200 pb-2">銀行帳戶資訊</h4>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">銀行代碼 <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={formData.bankInfo?.bankCode || ''}
                    onChange={e => setFormData({
                      ...formData, 
                      bankInfo: { ...formData.bankInfo!, bankCode: e.target.value }
                    })}
                    className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-stone-300"
                    placeholder="例如：808"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">匯款銀行 <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={formData.bankInfo?.bank || ''}
                    onChange={e => setFormData({
                      ...formData, 
                      bankInfo: { ...formData.bankInfo!, bank: e.target.value }
                    })}
                    className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-stone-300"
                    placeholder="例如：玉山銀行"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">分行名稱 <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={formData.bankInfo?.bankName || ''}
                    onChange={e => setFormData({
                      ...formData, 
                      bankInfo: { ...formData.bankInfo!, bankName: e.target.value }
                    })}
                    className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-stone-300"
                    placeholder="例如：信義分行"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-stone-700 mb-2">戶名 <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={formData.bankInfo?.accountName || ''}
                    onChange={e => setFormData({
                      ...formData, 
                      bankInfo: { ...formData.bankInfo!, accountName: e.target.value }
                    })}
                    className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-stone-300"
                    placeholder="例如：居家整聊室有限公司"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-stone-700 mb-2">帳號 <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={formData.bankInfo?.accountNumber || ''}
                    onChange={e => setFormData({
                      ...formData, 
                      bankInfo: { ...formData.bankInfo!, accountNumber: e.target.value }
                    })}
                    className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-stone-300"
                    placeholder="例如：1234567890123"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </form>
  );
}
