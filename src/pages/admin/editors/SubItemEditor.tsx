import React, { useEffect, useMemo } from 'react';
import { useFieldArray, Control, UseFormRegister, Controller } from 'react-hook-form';
import { Link } from 'react-router-dom';
import ImageUploader from '../../../components/admin/ImageUploader';
import ButtonEditor from '../../../components/admin/ButtonEditor';
import { Plus, Trash2, Package, Users, CheckCircle2, List, Briefcase, Link as LinkIcon, Settings, AlertCircle } from 'lucide-react';
import { pageService } from '../../../services/pageService';
import { productService } from '../../../services/productService';
import { v4 as uuidv4 } from 'uuid';

export default function SubItemEditor({ control, register, activeTab, watch, setValue, forms }: any) {
  const { fields: subPartners, append: appendPartner, remove: removePartner } = useFieldArray({ control, name: "content.subItem.partners" });
  const { fields: subCases, append: appendCase, remove: removeCase } = useFieldArray({ control, name: "content.subItem.cases" });
  const { fields: subCoreServices, append: appendCoreService, remove: removeCoreService } = useFieldArray({ control, name: "content.subItem.coreServices" });
  const { fields: subAdditionalServices, append: appendAdditionalService, remove: removeAdditionalService } = useFieldArray({ control, name: "content.subItem.additionalServices" });

  const allPages = pageService.getAll() || [];
  const subItemPages = useMemo(() => allPages.filter((p: any) => p.template === 'SUB_ITEM'), [allPages]);
  
  const allProducts = productService.getAll() || [];

  const isShowForm = watch('content.showForm');

  const labelClass = "block text-xs font-bold text-stone-500 uppercase mb-1";
  const inputClass = "w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#8B5E34] focus:border-transparent outline-none transition-all text-sm";
  const disabledInputClass = "w-full px-3 py-2 border border-stone-200 rounded-lg bg-stone-50 text-stone-400 outline-none text-sm cursor-not-allowed";
  const cardClass = "bg-white p-6 rounded-2xl shadow-sm border border-stone-200 relative";
  const innerCardClass = "bg-stone-50 p-4 rounded-xl border border-stone-200 relative";
  const primaryBtn = "bg-[#8B5E34] hover:bg-black text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all";
  const secondaryBtn = "bg-stone-100 hover:bg-stone-200 text-stone-700 px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all";

  const pageId = watch('id');
  const productId = watch('content.subItem.productId');
  const selectedProduct = useMemo(() => allProducts.find(p => p.id === productId), [allProducts, productId]);

  if (activeTab === 'sub_product') {
    return (
      <>
        {/* Product Link Info */}
        <div className="mb-6 p-4 bg-white border border-stone-200 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="flex-1 max-w-xs">
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">產品資訊來源 (核心資訊與定價)</p>
            <select 
              {...register('content.subItem.productId')}
              className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-900 outline-none focus:ring-2 focus:ring-[#8B5E34]/20 focus:border-[#8B5E34]"
            >
              <option value="">-- 請選擇關聯產品 --</option>
              {allProducts.map((p: any) => (
                <option key={p.id} value={p.id} className="text-stone-900">
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <Link 
            to="/admin/products"
            className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-bold transition-all flex items-center gap-2"
          >
            <Settings size={14} />
            前往產品管理
          </Link>
        </div>

        {selectedProduct ? (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-stone-900">產品預覽</h2>
              <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-600 rounded-lg border border-amber-100">
                <AlertCircle size={14} />
                <span className="text-[10px] font-bold uppercase">唯讀區域</span>
              </div>
            </div>

            {/* Warning Message */}
            <div className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-3">
              <AlertCircle className="text-amber-500 mt-0.5" size={18} />
              <div>
                <p className="text-sm font-bold text-amber-900">此為產品核心資訊</p>
                <p className="text-xs text-amber-700 mt-0.5">
                  此頁面已連結至產品「{selectedProduct.name}」。
                  如需修改產品名稱、主圖、描述或定價，請至「產品管理」頁面進行統一管理。
                </p>
              </div>
            </div>

            <div className={cardClass + " mb-8 opacity-80"}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>產品名稱</label>
                    <input 
                      value={selectedProduct.name || ''} 
                      className={disabledInputClass} 
                      disabled 
                    />
                  </div>
                  <div>
                    <label className={labelClass}>詳細描述</label>
                    <textarea 
                      value={selectedProduct.description || ''} 
                      rows={6} 
                      className={disabledInputClass} 
                      disabled 
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>產品主圖</label>
                  <div className="pointer-events-none grayscale-[0.5]">
                    {selectedProduct.image ? (
                      <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-48 object-cover rounded-lg border border-stone-200" />
                    ) : (
                      <div className="w-full h-48 bg-stone-100 rounded-lg border border-stone-200 flex items-center justify-center text-stone-400">
                        無圖片
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-stone-100">
                <div className="flex justify-between items-center mb-4">
                  <label className={labelClass}>產品特色清單 (Checklist)</label>
                  <span className="text-[10px] font-bold text-stone-400 uppercase">鎖定中</span>
                </div>
                <div className="space-y-3">
                  {selectedProduct.checklist && selectedProduct.checklist.map((item: any, index: number) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="flex-grow">
                        <input 
                          value={item.text || ''} 
                          className={disabledInputClass} 
                          disabled 
                        />
                      </div>
                    </div>
                  ))}
                  {(!selectedProduct.checklist || selectedProduct.checklist.length === 0) && (
                    <p className="text-sm text-stone-400 italic">尚未新增任何特色項目</p>
                  )}
                </div>
              </div>
            </div>

            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-stone-900">定價/報價模式設定</h2>
              <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-600 rounded-lg border border-amber-100">
                <AlertCircle size={14} />
                <span className="text-[10px] font-bold uppercase">唯讀區域</span>
              </div>
            </div>
            <div className={cardClass + " opacity-80"}>
              <div className="space-y-6">
                <div>
                  <label className={labelClass}>訂單模式</label>
                  <div className="flex gap-4 mt-2 pointer-events-none">
                    <label className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${selectedProduct.orderMode === 'FIXED' ? 'border-[#8B5E34] bg-stone-50' : 'border-stone-100'}`}>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedProduct.orderMode === 'FIXED' ? 'border-[#8B5E34]' : 'border-stone-300'}`}>
                        {selectedProduct.orderMode === 'FIXED' && <div className="w-2 h-2 rounded-full bg-[#8B5E34]" />}
                      </div>
                      <span className={`font-bold ${selectedProduct.orderMode === 'FIXED' ? 'text-stone-900' : 'text-stone-500'}`}>標價模式 (FIXED)</span>
                    </label>
                    <label className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${selectedProduct.orderMode === 'INTERNAL_FORM' ? 'border-[#8B5E34] bg-stone-50' : 'border-stone-100'}`}>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedProduct.orderMode === 'INTERNAL_FORM' ? 'border-[#8B5E34]' : 'border-stone-300'}`}>
                        {selectedProduct.orderMode === 'INTERNAL_FORM' && <div className="w-2 h-2 rounded-full bg-[#8B5E34]" />}
                      </div>
                      <span className={`font-bold ${selectedProduct.orderMode === 'INTERNAL_FORM' ? 'text-stone-900' : 'text-stone-500'}`}>內部表單 (INTERNAL_FORM)</span>
                    </label>
                    <label className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${selectedProduct.orderMode === 'EXTERNAL_LINK' ? 'border-[#8B5E34] bg-stone-50' : 'border-stone-100'}`}>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedProduct.orderMode === 'EXTERNAL_LINK' ? 'border-[#8B5E34]' : 'border-stone-300'}`}>
                        {selectedProduct.orderMode === 'EXTERNAL_LINK' && <div className="w-2 h-2 rounded-full bg-[#8B5E34]" />}
                      </div>
                      <span className={`font-bold ${selectedProduct.orderMode === 'EXTERNAL_LINK' ? 'text-stone-900' : 'text-stone-500'}`}>外部連結 (EXTERNAL_LINK)</span>
                    </label>
                  </div>
                </div>

                {selectedProduct.orderMode === 'FIXED' ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-stone-50 rounded-2xl border border-stone-200">
                    <div>
                      <label className={labelClass}>價格 (數字)</label>
                      <input type="number" value={selectedProduct.fixedConfig?.price || ''} className={disabledInputClass} disabled />
                    </div>
                    <div>
                      <label className={labelClass}>單位 (例如：次、坪)</label>
                      <input value={selectedProduct.fixedConfig?.unit || ''} className={disabledInputClass} disabled />
                    </div>
                    <div>
                      <label className={labelClass}>按鈕文字</label>
                      <input value={selectedProduct.fixedConfig?.buttonText || ''} className={disabledInputClass} disabled />
                    </div>
                  </div>
                ) : selectedProduct.orderMode === 'INTERNAL_FORM' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-stone-50 rounded-2xl border border-stone-200">
                    <div>
                      <label className={labelClass}>報價文字 (例如：依需求報價)</label>
                      <input value={selectedProduct.internalFormConfig?.priceText || ''} className={disabledInputClass} disabled />
                    </div>
                    <div>
                      <label className={labelClass}>按鈕文字</label>
                      <input value={selectedProduct.internalFormConfig?.buttonText || ''} className={disabledInputClass} disabled />
                    </div>
                    <div className="col-span-2">
                      <label className={labelClass}>關聯表單 ID</label>
                      <input value={selectedProduct.internalFormConfig?.formId || '未設定'} className={disabledInputClass} disabled />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-stone-50 rounded-2xl border border-stone-200">
                    <div>
                      <label className={labelClass}>報價文字 (例如：依需求報價)</label>
                      <input value={selectedProduct.externalLinkConfig?.priceText || ''} className={disabledInputClass} disabled />
                    </div>
                    <div>
                      <label className={labelClass}>按鈕文字</label>
                      <input value={selectedProduct.externalLinkConfig?.buttonText || ''} className={disabledInputClass} disabled />
                    </div>
                    <div className="col-span-2">
                      <label className={labelClass}>外部連結 (網址)</label>
                      <input value={selectedProduct.externalLinkConfig?.url || '未設定'} className={disabledInputClass} disabled />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="p-8 text-center bg-stone-50 rounded-2xl border border-stone-200">
            <Package className="mx-auto h-12 w-12 text-stone-300 mb-3" />
            <h3 className="text-lg font-bold text-stone-900 mb-1">尚未選擇關聯產品</h3>
            <p className="text-sm text-stone-500">請從上方選單選擇一個產品，以載入產品核心資訊。</p>
          </div>
        )}
      </>
    );
  }

  if (activeTab === 'sub_partners') {
    return (
      <>
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-stone-900">專業夥伴/證照清單</h2>
          <button type="button" onClick={() => appendPartner({ title: '', description: '', image: '' })} className={secondaryBtn}><Plus size={16}/> 新增</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {subPartners.map((field, index) => (
            <div key={field.id} className={innerCardClass}>
              <button type="button" onClick={() => removePartner(index)} className="absolute top-4 right-4 p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18}/></button>
              <div className="space-y-4">
                <input {...register(`content.subItem.partners.${index}.title`)} placeholder="標題/姓名" className={inputClass} />
                <textarea {...register(`content.subItem.partners.${index}.description`)} placeholder="描述..." rows={2} className={inputClass} />
                <Controller control={control} name={`content.subItem.partners.${index}.image`} render={({ field }) => <ImageUploader value={field.value} onChange={field.onChange} />} />
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  if (activeTab === 'sub_core_services') {
    return (
      <>
        <div className="mb-4">
          <h2 className="text-xl font-bold text-stone-900">核心服務區塊標題</h2>
        </div>
        <div className={cardClass + " mb-8"}>
          <input {...register('content.subItem.coreServicesSectionTitle')} placeholder="例如：核心服務" className={inputClass} />
        </div>
        
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-stone-900">核心服務項目</h2>
          <button type="button" onClick={() => appendCoreService({ title: '', content: '' })} className={secondaryBtn}><Plus size={16}/> 新增</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {subCoreServices.map((field, index) => (
            <div key={field.id} className={innerCardClass}>
              <button type="button" onClick={() => removeCoreService(index)} className="absolute top-4 right-4 p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18}/></button>
              <div className="space-y-4">
                <input {...register(`content.subItem.coreServices.${index}.title`)} placeholder="服務名稱" className={inputClass} />
                <textarea {...register(`content.subItem.coreServices.${index}.content`)} placeholder="服務內容..." rows={3} className={inputClass} />
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  if (activeTab === 'sub_cases') {
    return (
      <>
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-stone-900">真實案例</h2>
          <button type="button" onClick={() => appendCase({ id: uuidv4(), title: '', description: '', image: '', tag: '' })} className={secondaryBtn}><Plus size={16}/> 新增</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {subCases.map((field, index) => (
            <div key={field.id} className={innerCardClass}>
              <button type="button" onClick={() => removeCase(index)} className="absolute top-4 right-4 p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18}/></button>
              <div className="space-y-4">
                <input {...register(`content.subItem.cases.${index}.title`)} placeholder="案例標題" className={inputClass} />
                <input {...register(`content.subItem.cases.${index}.tag`)} placeholder="標籤 (例如：適老換屋)" className={inputClass} />
                <textarea {...register(`content.subItem.cases.${index}.description`)} placeholder="案例描述..." rows={3} className={inputClass} />
                <Controller control={control} name={`content.subItem.cases.${index}.image`} render={({ field }) => <ImageUploader value={field.value} onChange={field.onChange} />} />
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  if (activeTab === 'sub_related') {
    const additionalServices = watch('content.subItem.additionalServices') || [];
    
    const handleAddRelated = () => {
      setValue('content.subItem.additionalServices', [...additionalServices, '']);
    };
    
    const handleRemoveRelated = (index: number) => {
      const newArr = [...additionalServices];
      newArr.splice(index, 1);
      setValue('content.subItem.additionalServices', newArr);
    };

    return (
      <>
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-stone-900">關聯服務 (我們還提供)</h2>
          <button type="button" onClick={handleAddRelated} className={secondaryBtn}><Plus size={16}/> 新增</button>
        </div>
        <div className="space-y-4">
          {additionalServices.map((pageId: string, index: number) => (
            <div key={index} className={innerCardClass}>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className={labelClass}>選擇關聯子項目</label>
                  <select 
                    {...register(`content.subItem.additionalServices.${index}`)} 
                    className={inputClass}
                  >
                    <option value="">-- 請選取子項目 --</option>
                    {subItemPages.map((p: any) => (<option key={p.id} value={p.id}>{p.title}</option>))}
                  </select>
                </div>
                <button type="button" onClick={() => handleRemoveRelated(index)} className="mt-6 p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18}/></button>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  if (activeTab === 'sub_button') {
    return (
      <>
        <div className="mb-4">
          <h2 className="text-xl font-bold text-stone-900">按鈕設定</h2>
          <p className="text-sm text-stone-500 mt-1">設定此頁面主按鈕的行為，可選擇導向表單、外部連結或預約流程。</p>
        </div>
        <div className={cardClass}>
          <ButtonEditor 
            control={control} 
            register={register} 
            name="content.subItem.button" 
            label="主按鈕設定" 
            forms={forms} 
          />
        </div>
      </>
    );
  }

  if (activeTab === 'home_form') {
    return (
      <>
        <div className="mb-4">
          <h2 className="text-xl font-bold text-stone-900">頁尾表單設定</h2>
        </div>
        <div className={cardClass}>
          <div className="flex items-center justify-between p-6 bg-stone-50 rounded-xl border border-stone-200">
            <div>
              <div className="text-sm font-bold text-stone-700">啟用頁尾表單</div>
              <div className="text-xs text-stone-500 font-medium">開啟後將於此頁面底部顯示聯繫表單</div>
            </div>
            <button 
              type="button"
              onClick={() => setValue('content.showForm', !isShowForm)} 
              className={`w-11 h-6 rounded-full p-1 transition-colors ${isShowForm ? 'bg-[#8B5E34]' : 'bg-stone-300'}`}
            >
              <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${isShowForm ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
          
          <input type="checkbox" {...register('content.showForm')} className="hidden" />

          {isShowForm && (
            <div className="mt-6">
              <label className={labelClass}>對接表單選擇</label>
              <select {...register('content.formId')} className={inputClass}>
                <option value="">-- 請選擇表單 --</option>
                {forms?.map((f: any) => (<option key={f.id} value={f.id}>{f.name}</option>))}
              </select>
            </div>
          )}
        </div>
      </>
    );
  }

  return null;
}
