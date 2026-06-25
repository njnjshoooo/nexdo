import AdminMarkdownEditor from '../../../components/admin/AdminMarkdownEditor';
import React from 'react';
import { useFieldArray, Control, UseFormRegister, Controller } from 'react-hook-form';
import ImageUploader from '../../../components/admin/ImageUploader';
import ButtonEditor from '../../../components/admin/ButtonEditor';
import { Plus, Trash2, Hash, ChevronLeft, ChevronRight, CheckCircle2, Briefcase } from 'lucide-react';
import { PageMainTitle, BlockContainer, InnerBlockContainer, FieldLabel, InputClass, PrimaryBtnClass, SecondaryBtnClass } from '../../../components/admin/ui/AdminEditorUI';
import { pageService } from '../../../services/pageService';
import { productService } from '../../../services/productService';

export default function MajorItemEditor({ control, register, activeTab, watch, setValue, forms }: any) {
  const allPages = pageService.getAll() || [];
  const subItemPages = allPages.filter((p: any) => p.template === 'SUB_ITEM');
  const isShowForm = watch('content.showForm');

  const { fields: serviceFields, append: appendService, remove: removeService, update: updateService, move: moveService } = useFieldArray({
    control,
    name: "content.services"
  });

  const { fields: caseFields, append: appendCase, remove: removeCase, move: moveCase } = useFieldArray({
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
            
  // --- 1. Hero 區塊 ---
  if (activeTab === 'hero') {
    return (
      <>
        <div className="mb-6 flex justify-between items-center border-b border-stone-200 pb-4"><PageMainTitle>Hero 區塊編輯</PageMainTitle></div>
        <BlockContainer>
          <div className="space-y-6">
            <div>
              <FieldLabel>主標題</FieldLabel>
              <AdminMarkdownEditor {...register('content.hero.title')} rows={2} className={InputClass} />
            </div>
            <div>
              <FieldLabel>背景圖片</FieldLabel>
              <Controller control={control} name="content.hero.backgroundImage" render={({ field }) => <ImageUploader value={field.value} onChange={field.onChange} />} />
            </div>
            <div className="pt-4 border-t border-stone-100">
               <ButtonEditor control={control} register={register} name="content.hero.mainButton" label="主按鈕設定" forms={forms} />
            </div>
          </div>
        </BlockContainer>
      </>
    );
  }

  // --- 2. 服務清單 ---
  if (activeTab === 'services') {
    return (
      <>
        <div className="mb-6 flex justify-between items-center border-b border-stone-200 pb-4">
          <PageMainTitle>服務清單列表</PageMainTitle>
        </div>
        <div className="space-y-6">
          {serviceFields.length === 0 && (
            <div className="p-8 text-center bg-stone-50 rounded-2xl border-2 border-dashed border-stone-200">
              <CheckCircle2 className="mx-auto h-8 w-8 text-stone-300 mb-3" />
              <h3 className="text-sm font-bold text-stone-900 mb-1">尚未建立服務清單</h3>
              <p className="text-xs text-stone-500 mb-4">點擊下方按鈕新增服務清單。</p>
            </div>
          )}
          {serviceFields.map((field, index) => (
            <InnerBlockContainer key={field.id}>
               <div className="absolute top-4 right-4 flex items-center gap-1 z-10">
                <button type="button" onClick={() => moveService(index, index - 1)} disabled={index === 0} className="p-1.5 text-stone-400 hover:text-primary disabled:opacity-30 transition-colors bg-white/50 backdrop-blur rounded-lg"><ChevronLeft className="rotate-90" size={16}/></button>
                <button type="button" onClick={() => moveService(index, index + 1)} disabled={index === serviceFields.length - 1} className="p-1.5 text-stone-400 hover:text-primary disabled:opacity-30 transition-colors bg-white/50 backdrop-blur rounded-lg"><ChevronRight className="rotate-90" size={16}/></button>
                <div className="w-px h-4 bg-stone-300 mx-1"></div>
                <button type="button" onClick={() => removeService(index)} className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors bg-white/50 backdrop-blur rounded-lg"><Trash2 size={16}/></button>
              </div>
              <div className="flex items-center gap-2 mb-4">
                 <div className="w-6 h-6 bg-stone-200 rounded text-[10px] font-bold text-stone-500 flex items-center justify-center">{index + 1}</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <FieldLabel>連結子項目</FieldLabel>
                    <select 
                      {...register(`content.services.${index}.targetPageId`, {
                        onChange: (e) => handleServiceSelect(index, e.target.value)
                      })} 
                      className={InputClass}
                    >
                      <option value="">-- 請選取子項目 --</option>
                      {subItemPages.map((p: any) => (<option key={p.id} value={p.id}>{p.title}</option>))}
                    </select>
                  </div>
                  <div><FieldLabel>服務名稱</FieldLabel><input {...register(`content.services.${index}.title`)} className={InputClass} /></div>
                  <div><FieldLabel>描述</FieldLabel><AdminMarkdownEditor {...register(`content.services.${index}.description`)} rows={3} className={InputClass} /></div>
                </div>
                <div><FieldLabel>示意圖片</FieldLabel><Controller control={control} name={`content.services.${index}.image`} render={({ field }) => <ImageUploader value={field.value} onChange={field.onChange} />} /></div>
              </div>
            </InnerBlockContainer>
          ))}
          <div className="flex justify-center mt-6 pt-4 border-t border-stone-200">
            <button type="button" onClick={() => appendService({ title: '', description: '', image: '', targetPageId: '' })} className={SecondaryBtnClass}>
              <Plus size={18} /> 新增服務
            </button>
          </div>
        </div>
      </>
    );
  }

  // --- 3. 成功案例 ---
  if (activeTab === 'cases') {
    return (
      <>
        <div className="mb-6 flex justify-between items-center border-b border-stone-200 pb-4">
          <PageMainTitle>成功案例管理</PageMainTitle>
        </div>
        <div className="space-y-6">
          {caseFields.length === 0 && (
            <div className="p-8 text-center bg-stone-50 rounded-2xl border-2 border-dashed border-stone-200">
              <Briefcase className="mx-auto h-8 w-8 text-stone-300 mb-3" />
              <h3 className="text-sm font-bold text-stone-900 mb-1">尚未建立成功案例</h3>
              <p className="text-xs text-stone-500 mb-4">點擊下方按鈕新增成功案例。</p>
            </div>
          )}
          {caseFields.map((field, index) => (
            <InnerBlockContainer key={field.id}>
              <div className="absolute top-4 right-4 flex items-center gap-1 z-10">
                <button type="button" onClick={() => moveCase(index, index - 1)} disabled={index === 0} className="p-1.5 text-stone-400 hover:text-primary disabled:opacity-30 transition-colors bg-white/50 backdrop-blur rounded-lg"><ChevronLeft className="rotate-90" size={16}/></button>
                <button type="button" onClick={() => moveCase(index, index + 1)} disabled={index === caseFields.length - 1} className="p-1.5 text-stone-400 hover:text-primary disabled:opacity-30 transition-colors bg-white/50 backdrop-blur rounded-lg"><ChevronRight className="rotate-90" size={16}/></button>
                <div className="w-px h-4 bg-stone-300 mx-1"></div>
                <button type="button" onClick={() => removeCase(index)} className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors bg-white/50 backdrop-blur rounded-lg"><Trash2 size={16}/></button>
              </div>
              <div className="flex items-center gap-2 mb-4">
                 <div className="w-6 h-6 bg-stone-200 rounded text-[10px] font-bold text-stone-500 flex items-center justify-center">{index + 1}</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                <div className="space-y-4">
                  <div><FieldLabel>案例名稱</FieldLabel><input {...register(`content.cases.${index}.title`)} className={InputClass} /></div>
                  <div><FieldLabel>分類標籤</FieldLabel><input {...register(`content.cases.${index}.tag`)} className={InputClass} /></div>
                  <div><FieldLabel>案例描述</FieldLabel><AdminMarkdownEditor {...register(`content.cases.${index}.description`)} rows={3} className={InputClass} /></div>
                </div>
                <div><FieldLabel>成果照</FieldLabel><Controller control={control} name={`content.cases.${index}.image`} render={({ field }) => <ImageUploader value={field.value} onChange={field.onChange} />} /></div>
              </div>
            </InnerBlockContainer>
          ))}
          <div className="flex justify-center mt-6 pt-4 border-t border-stone-200">
            <button type="button" onClick={() => appendCase({ title: '', description: '', image: '', tag: '' })} className={SecondaryBtnClass}>
              <Plus size={18} /> 新增案例
            </button>
          </div>
        </div>
      </>
    );
  }
  
  // --- 4. 表單開關 ---
  if (activeTab === 'home_form') {
    return (
      <>
        <div className="mb-6 flex justify-between items-center border-b border-stone-200 pb-4"><PageMainTitle>頁尾表單設定</PageMainTitle></div><BlockContainer>
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
              <FieldLabel>對接表單選擇</FieldLabel>
              <select {...register('content.formId')} className={InputClass}>
                <option value="">-- 請選擇表單 --</option>
                {forms?.map((f: any) => (<option key={f.id} value={f.id}>{f.name}</option>))}
              </select>
            </div>
          )}
        </BlockContainer>
      </>
    );
  }

  return null;
}

