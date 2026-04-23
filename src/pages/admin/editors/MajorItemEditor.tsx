import React from 'react';
import { useFieldArray, Control, UseFormRegister, Controller } from 'react-hook-form';
import ImageUploader from '../../../components/admin/ImageUploader';
import ButtonEditor from '../../../components/admin/ButtonEditor';
import { Plus, Trash2, Hash } from 'lucide-react';
import { pageService } from '../../../services/pageService';
import { productService } from '../../../services/productService';

export default function MajorItemEditor({ control, register, activeTab, watch, setValue, forms }: any) {
  const allPages = pageService.getAll() || [];
  const subItemPages = allPages.filter((p: any) => p.template === 'SUB_ITEM');
  const isShowForm = watch('content.showForm');

  const { fields: serviceFields, append: appendService, remove: removeService, update: updateService } = useFieldArray({
    control,
    name: "content.services"
  });

  const { fields: caseFields, append: appendCase, remove: removeCase } = useFieldArray({
    control,
    name: "content.cases"
  });

  const handleServiceSelect = async (index: number, pageId: string) => {
    const selectedPage = subItemPages.find((p: any) => p.id === pageId);
    if (selectedPage) {
      const currentService = watch(`content.services.${index}`);
      const productId = selectedPage.content?.subItem?.productId;
      const productData = productId ? await productService.getById(productId) : null;
      updateService(index, {
        ...currentService,
        targetPageId: pageId,
        title: selectedPage.title,
        description: productData?.description || selectedPage.content?.hero?.description || '',
        image: productData?.image || selectedPage.content?.hero?.backgroundImage || ''
      });
    }
  };

  // 💡 樣式常數：嚴格對齊 UI 規範
  const labelClass = "block text-xs font-bold text-stone-500 uppercase mb-1";
  const inputClass = "w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#8B5E34] focus:border-transparent outline-none transition-all text-sm";
  const cardClass = "bg-white p-6 rounded-2xl shadow-sm border border-stone-200 relative";
  const innerCardClass = "bg-stone-50 p-4 rounded-xl border border-stone-200";
  const primaryBtn = "bg-[#8B5E34] hover:bg-black text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all";
  const secondaryBtn = "bg-stone-100 hover:bg-stone-200 text-stone-700 px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors";

  // --- 1. Hero 區塊 ---
  if (activeTab === 'hero') {
    return (
      <>
        <div className="mb-4">
          <h2 className="text-xl font-bold text-stone-900">Hero 區塊編輯</h2>
        </div>
        <div className={cardClass}>
          <div className="space-y-6">
            <div>
              <label className={labelClass}>主標題</label>
              <textarea {...register('content.hero.title')} rows={2} className="w-full px-4 py-3 border border-stone-300 rounded-xl font-bold text-lg focus:ring-2 focus:ring-[#8B5E34] focus:border-transparent outline-none transition-all" />
            </div>
            <div>
              <label className={labelClass}>背景圖片</label>
              <Controller control={control} name="content.hero.backgroundImage" render={({ field }) => <ImageUploader value={field.value} onChange={field.onChange} />} />
            </div>
            <div className="pt-4 border-t border-stone-100">
               <ButtonEditor control={control} register={register} name="content.hero.mainButton" label="主按鈕設定" forms={forms} />
            </div>
          </div>
        </div>
      </>
    );
  }

  // --- 2. 服務清單 ---
  if (activeTab === 'services') {
    return (
      <>
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-stone-900">服務清單列表</h2>
          <button type="button" onClick={() => appendService({ title: '', description: '', image: '', targetPageId: '' })} className={secondaryBtn}>
            <Plus size={18} /> 新增服務
          </button>
        </div>
        <div className="space-y-4">
          {serviceFields.map((field, index) => (
            <div key={field.id} className={cardClass}>
              <button type="button" onClick={() => removeService(index)} className="absolute top-4 right-4 p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>連結子項目</label>
                    <select 
                      {...register(`content.services.${index}.targetPageId`, {
                        onChange: (e) => handleServiceSelect(index, e.target.value)
                      })} 
                      className={inputClass}
                    >
                      <option value="">-- 請選取子項目 --</option>
                      {subItemPages.map((p: any) => (<option key={p.id} value={p.id}>{p.title}</option>))}
                    </select>
                  </div>
                  <div><label className={labelClass}>服務名稱</label><input {...register(`content.services.${index}.title`)} className={inputClass} /></div>
                  <div><label className={labelClass}>描述</label><textarea {...register(`content.services.${index}.description`)} rows={3} className={inputClass} /></div>
                </div>
                <div><label className={labelClass}>示意圖片</label><Controller control={control} name={`content.services.${index}.image`} render={({ field }) => <ImageUploader value={field.value} onChange={field.onChange} />} /></div>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  // --- 3. 成功案例 ---
  if (activeTab === 'cases') {
    return (
      <>
        <div className="mb-4 flex justify-between items-center px-2">
          <h2 className="text-xl font-bold text-stone-900">成功案例管理</h2>
          <button type="button" onClick={() => appendCase({ title: '', description: '', image: '', tag: '' })} className={secondaryBtn}>
            <Plus size={18} /> 新增案例
          </button>
        </div>
        <div className="space-y-4">
          {caseFields.map((field, index) => (
            <div key={field.id} className={cardClass}>
              <button type="button" onClick={() => removeCase(index)} className="absolute top-4 right-4 p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                <div className="space-y-4">
                  <div><label className={labelClass}>案例名稱</label><input {...register(`content.cases.${index}.title`)} className={inputClass} /></div>
                  <div><label className={labelClass}>分類標籤</label><input {...register(`content.cases.${index}.tag`)} className={inputClass} /></div>
                  <div><label className={labelClass}>案例描述</label><textarea {...register(`content.cases.${index}.description`)} rows={3} className={inputClass} /></div>
                </div>
                <div><label className={labelClass}>成果照</label><Controller control={control} name={`content.cases.${index}.image`} render={({ field }) => <ImageUploader value={field.value} onChange={field.onChange} />} /></div>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }
  
  // --- 4. 表單開關 ---
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
          
          {/* 隱藏的原始 Checkbox (讓 hook-form 感應到值) */}
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

