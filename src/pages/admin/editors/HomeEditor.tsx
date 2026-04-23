import React from 'react';
import { Control, UseFormRegister, Controller, useFieldArray } from 'react-hook-form';
import ImageUploader from '../../../components/admin/ImageUploader';
import { Layout, ClipboardList, List, Hash, ExternalLink, ToggleRight, Quote, Plus, Trash2, Star } from 'lucide-react';
import { pageService } from '../../../services/pageService';

export default function HomeEditor({ control, register, activeTab, watch, setValue, forms }: any) {
  const blocks = watch("content.home.blocks") || [];
  const allPages = pageService.getAll();
  const getIdx = (type: string) => blocks.findIndex((b: any) => b?.type === type);

  // --- [ 1. 預約諮詢步驟 Hook ] ---
  const processIdx = getIdx('PROCESS');
  const { fields: stepFields, append: appendStep, remove: removeStep } = useFieldArray({
    control,
    name: `content.home.blocks.${processIdx}.process.steps`
  });

  // --- [ 2. 客戶好評項目 Hook ] ---
  const testimonialIdx = getIdx('TESTIMONIALS');
  const { fields: testimonialFields, append: appendTestimonial, remove: removeTestimonial } = useFieldArray({
    control,
    name: `content.home.blocks.${testimonialIdx}.testimonials.items`
  });

  // --- [ 3. 服務項目 Hook ] ---
  const servicesIdx = getIdx('SERVICES');
  const { fields: serviceFields, append: appendService, remove: removeService, update: updateService } = useFieldArray({
    control,
    name: `content.home.blocks.${servicesIdx}.services.items`
  });

  // --- [ 4. 更多服務 (子項目) Hook ] ---
  const moreServicesIdx = getIdx('MORE_SERVICES');
  const { fields: moreServiceFields, append: appendMoreService, remove: removeMoreService } = useFieldArray({
    control,
    name: `content.home.blocks.${moreServicesIdx}.moreServices.pageIds`
  });

  const handleServiceSelect = (blockIdx: number, path: string, serviceIdx: number, pageId: string) => {
    const selectedPage = allPages.find(p => p.id === pageId);
    if (selectedPage) {
      const currentService = watch(`content.home.blocks.${blockIdx}.services.items.${serviceIdx}`);
      updateService(serviceIdx, {
        ...currentService,
        pageId: pageId,
        title: selectedPage.title,
        description: selectedPage.content?.hero?.description || '',
        image: selectedPage.content?.hero?.backgroundImage || ''
      });
    }
  };

  if (blocks.length === 0) return <div className="p-12 text-center text-stone-400 font-medium">系統初始化中...</div>;

  const Label = ({ children }: any) => (
    <label className="block text-xs font-bold text-stone-500 uppercase mb-1">{children}</label>
  );

  // --- Hero 區塊 ---
  if (activeTab === 'home_hero') {
    const idx = getIdx('HERO_1');
    return (
      <>
        <div className="mb-4">
          <h2 className="text-xl font-bold text-stone-900">Hero 主視覺設定</h2>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
          <div className="space-y-4">
            <div className="space-y-1">
              <Label>眉標內容</Label>
              <input {...register(`content.home.blocks.${idx}.hero1.subtitle`)} className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#8B5E34] focus:border-transparent outline-none transition-all" placeholder="例如：樂齡的居住服務" />
            </div>
            <div className="space-y-1">
              <Label>主標題內容</Label>
              <textarea {...register(`content.home.blocks.${idx}.hero1.title`)} rows={3} className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#8B5E34] focus:border-transparent outline-none transition-all" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className="p-4 bg-stone-50 rounded-xl border border-stone-100 space-y-3">
                  <Label>按鈕 {i + 1} 設定</Label>
                  <input {...register(`content.home.blocks.${idx}.hero1.buttons.${i}.text`)} placeholder="按鈕文字" className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm" />
                  <input {...register(`content.home.blocks.${idx}.hero1.buttons.${i}.link`)} placeholder="跳轉連結" className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm" />
                </div>
              ))}
            </div>

            <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 space-y-3">
              <Label>圖片上的「顧客好評」</Label>
              <textarea {...register(`content.home.blocks.${idx}.hero1.imageTestimonial.text`)} rows={2} placeholder="好評內容" className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm" />
              <input {...register(`content.home.blocks.${idx}.hero1.imageTestimonial.author`)} placeholder="署名 (例如：台北市 林小姐)" className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm" />
            </div>

            <div className="space-y-1">
              <Label>主視覺圖片</Label>
              <Controller control={control} name={`content.home.blocks.${idx}.hero1.image`} render={({ field }) => <ImageUploader value={field.value} onChange={field.onChange} />} />
            </div>
          </div>
        </div>
      </>
    );
  }

  // --- 服務項目 ---
  if (activeTab === 'home_secondary') {
    return (
      <>
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-stone-900">服務項目管理</h2>
          <button type="button" onClick={() => appendService({ title: '', description: '', tags: '', image: '' })} className="bg-stone-100 hover:bg-stone-200 text-stone-700 px-4 py-2 rounded-lg font-bold transition-colors flex items-center gap-2"><Plus size={18} /> 新增服務項目</button>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 mb-6 space-y-4">
          <div className="space-y-1">
            <Label>區塊眉標</Label>
            <input {...register(`content.home.blocks.${servicesIdx}.services.subtitle`)} className="w-full px-3 py-2 border border-stone-300 rounded-lg" placeholder="例如：我們提供" />
          </div>
          <div className="space-y-1">
            <Label>區塊主標題</Label>
            <input {...register(`content.home.blocks.${servicesIdx}.services.title`)} className="w-full px-3 py-2 border border-stone-300 rounded-lg" placeholder="例如：從家庭環境到銀髮健康..." />
          </div>
        </div>

        <div className="space-y-4">
          {serviceFields.map((field, index) => (
            <div key={field.id} className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 relative group">
              <button type="button" onClick={() => removeService(index)} className="absolute top-4 right-4 p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-8 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label>{index < 4 ? '核心主要服務' : '延伸次要服務'}</Label>
                      <select 
                        {...register(`content.home.blocks.${servicesIdx}.services.items.${index}.pageId`, {
                          onChange: (e) => handleServiceSelect(servicesIdx, 'services', index, e.target.value)
                        })} 
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#8B5E34] focus:border-transparent outline-none transition-all"
                      >
                        <option value="">-- 選擇關聯頁面 --</option>
                        {allPages.filter(p => p.template === 'MAJOR_ITEM').map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <Label>主要服務標題</Label>
                      <input {...register(`content.home.blocks.${servicesIdx}.services.items.${index}.title`)} placeholder="服務顯示標題" className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#8B5E34] focus:border-transparent outline-none transition-all" />
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <Label>服務描述</Label>
                    <textarea {...register(`content.home.blocks.${servicesIdx}.services.items.${index}.description`)} rows={3} placeholder="描述文字內容" className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#8B5E34] focus:border-transparent outline-none transition-all" />
                  </div>
                </div>
                <div className="md:col-span-4 space-y-1">
                  <Label>服務展示圖</Label>
                  <Controller control={control} name={`content.home.blocks.${servicesIdx}.services.items.${index}.image`} render={({ field }) => <ImageUploader value={field.value} onChange={field.onChange} />} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  // --- 更多服務 (子項目卡牌) ---
  if (activeTab === 'home_more_services') {
    return (
      <div className="bg-white p-10 rounded-[2.5rem] border border-stone-200 shadow-sm space-y-8">
        <h2 className="text-2xl font-bold text-stone-800 px-2 tracking-tight">我們還提供</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-2">
          <div className="space-y-2">
            <Label>區塊顯示標題</Label>
            <input {...register(`content.home.blocks.${moreServicesIdx}.moreServices.title`)} className="w-full border border-stone-200 p-4 rounded-xl font-bold bg-white outline-none shadow-sm" placeholder="例如：我們還提供" />
          </div>
          <div className="space-y-2">
            <Label>區塊副標題</Label>
            <input {...register(`content.home.blocks.${moreServicesIdx}.moreServices.description`)} className="w-full border border-stone-200 p-4 rounded-xl bg-white outline-none shadow-sm" placeholder="輸入副標題文字..." />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <Label>子項目列表</Label>
            <button type="button" onClick={() => appendMoreService('')} className="text-xs font-bold text-[#8B5E34] hover:underline flex items-center gap-1">
              <Plus size={14} /> 新增子項目
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {moreServiceFields.map((field, index) => (
              <div key={field.id} className="p-6 bg-[#F9F9F9] rounded-2xl border border-stone-100 relative group flex items-center gap-4">
                <div className="flex-grow">
                  <select 
                    {...register(`content.home.blocks.${moreServicesIdx}.moreServices.pageIds.${index}`)} 
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#8B5E34] focus:border-transparent outline-none transition-all"
                  >
                    <option value="">-- 選擇子項目頁面 --</option>
                    {allPages.filter(p => p.template === 'SUB_ITEM').map(p => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>
                <button type="button" onClick={() => removeMoreService(index)} className="p-2 text-stone-300 hover:text-red-500 transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          {moreServiceFields.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed border-stone-100 rounded-[2rem] text-stone-400">
              目前尚未選擇任何子項目
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- 預約諮詢步驟 ---
  if (activeTab === 'home_consultation') {
    return (
      <div className="bg-white p-10 rounded-[2.5rem] border border-stone-200 shadow-sm space-y-8">
        <h2 className="text-2xl font-bold text-stone-800 px-2 tracking-tight">預約諮詢步驟</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-2">
          <div className="space-y-2">
            <Label>區塊顯示標題</Label>
            <input {...register(`content.home.blocks.${processIdx}.process.title`)} className="w-full border border-stone-200 p-4 rounded-2xl font-bold text-lg bg-white outline-none" placeholder="輸入區塊標題..." />
          </div>
          <div className="space-y-2">
            <Label>區塊副標題</Label>
            <textarea {...register(`content.home.blocks.${processIdx}.process.description`)} rows={2} className="w-full border border-stone-200 p-4 rounded-2xl bg-white outline-none" placeholder="輸入副標題文字..." />
          </div>
        </div>

        <div className="px-2 space-y-4">
          <Label>步驟下方欄位 (Footer Labels)</Label>
          <div className="grid grid-cols-4 gap-4">
            {[0, 1, 2, 3].map(i => (
              <input key={i} {...register(`content.home.blocks.${processIdx}.process.footerLabels.${i}`)} className="w-full border border-stone-200 p-3 rounded-xl bg-white outline-none text-sm" placeholder={`標籤 ${i + 1}`} />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {stepFields.map((field, index) => (
            <div key={field.id} className="p-10 bg-[#F9F9F9] rounded-[2rem] border border-stone-100 relative group transition-all">
              <button type="button" onClick={() => removeStep(index)} className="absolute top-10 right-10 text-stone-300 hover:text-red-500"><Trash2 size={24} /></button>
              <div className="grid grid-cols-12 gap-8">
                <div className="col-span-8 space-y-2">
                  <Label>步驟名稱 (STEP 0{index + 1})</Label>
                  <input {...register(`content.home.blocks.${processIdx}.process.steps.${index}.title`)} className="w-full border border-stone-200 p-4 rounded-xl font-bold bg-white outline-none shadow-sm" />
                </div>
                <div className="col-span-4 space-y-2">
                  <Label>ICON 代碼</Label>
                  <input {...register(`content.home.blocks.${processIdx}.process.steps.${index}.icon`)} className="w-full border border-stone-200 p-4 rounded-xl font-mono text-sm bg-white outline-none shadow-sm" />
                </div>
                <div className="col-span-12 space-y-2">
                  <Label>步驟詳細描述</Label>
                  <input {...register(`content.home.blocks.${processIdx}.process.steps.${index}.desc`)} className="w-full border border-stone-200 p-4 rounded-xl text-sm bg-white outline-none shadow-sm" />
                </div>
              </div>
            </div>
          ))}
          <button type="button" onClick={() => appendStep({ title: '', desc: '', icon: '' })} className="w-full py-6 border-2 border-dashed border-stone-200 rounded-[2.5rem] text-stone-400 font-bold hover:border-stone-400 flex items-center justify-center gap-2 bg-white transition-all"><Plus size={22} /> 新增步驟</button>
        </div>
      </div>
    );
  }

  // --- 客戶好評 ---
  if (activeTab === 'home_testimonials') {
    return (
      <div className="bg-white p-10 rounded-[2.5rem] border border-stone-200 shadow-sm space-y-8">
        <h2 className="text-2xl font-bold text-stone-800 px-2 tracking-tight">客戶好評區域</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-2">
          <div className="space-y-2">
            <Label>區塊顯示標題</Label>
            <input {...register(`content.home.blocks.${testimonialIdx}.testimonials.title`)} className="w-full border border-stone-200 p-4 rounded-2xl font-bold text-lg bg-white outline-none" />
          </div>
          <div className="space-y-2">
            <Label>區塊副標題</Label>
            <textarea {...register(`content.home.blocks.${testimonialIdx}.testimonials.description`)} rows={2} className="w-full border border-stone-200 p-4 rounded-2xl bg-white outline-none" placeholder="輸入副標題文字..." />
          </div>
        </div>
        <div className="space-y-8">
          {testimonialFields.map((field, index) => (
            <div key={field.id} className="p-10 bg-[#F9F9F9] rounded-[2rem] border border-stone-100 relative">
              <button type="button" onClick={() => removeTestimonial(index)} className="absolute top-10 right-10 text-stone-300 hover:text-red-500 transition-colors"><Trash2 size={24} /></button>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>心得內容文字</Label>
                  <textarea {...register(`content.home.blocks.${testimonialIdx}.testimonials.items.${index}.content`)} rows={4} className="w-full border border-stone-200 p-6 rounded-3xl text-stone-700 bg-white shadow-sm leading-relaxed outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>客戶署名 / 稱呼</Label>
                    <input {...register(`content.home.blocks.${testimonialIdx}.testimonials.items.${index}.author`)} className="w-full border border-stone-200 p-4 rounded-2xl font-bold bg-white shadow-sm outline-none" />
                  </div>
                  <div className="space-y-2">
                    <Label>職業 / 親屬關係</Label>
                    <input {...register(`content.home.blocks.${testimonialIdx}.testimonials.items.${index}.role`)} className="w-full border border-stone-200 p-4 rounded-2xl bg-white shadow-sm outline-none" placeholder="例如：上班族 / 父親78歲" />
                  </div>
                </div>
              </div>
            </div>
          ))}
          <button type="button" onClick={() => appendTestimonial({ content: '', author: '', role: '', tag: '' })} className="w-full py-10 border-2 border-dashed border-stone-200 rounded-[2.5rem] text-stone-400 font-bold hover:border-stone-400 flex items-center justify-center gap-2 bg-white transition-all shadow-sm"><Plus size={24} /> 新增好評項目</button>
        </div>
      </div>
    );
  }

  // --- 頁尾表單 ---
  if (activeTab === 'home_form') {
    const isShowForm = watch('content.showForm'); // 監控目前的開關狀態

    return (
      <div className="bg-white p-10 rounded-[2.5rem] border border-stone-200 shadow-sm space-y-8">
        <h2 className="text-2xl font-bold text-stone-800 px-2 tracking-tight">頁尾諮詢表單設定</h2>
        
        {/* 開關橫條 */}
        <div className="flex items-center justify-between p-8 bg-[#F9F9F9] rounded-[2.5rem] border border-stone-100">
          <div className="space-y-1">
            <div className="font-bold text-lg text-stone-800 tracking-tight">啟用首頁底部諮詢區塊</div>
            <div className="text-xs text-stone-500 font-medium tracking-wide">開啟後將於首頁底部顯示聯繫表單</div>
          </div>

          {/* 💡 關鍵修正：加上 onClick 事件切換布林值 */}
          <div 
            onClick={() => setValue('content.showForm', !isShowForm)} 
            className={`w-16 h-8 rounded-full p-1 cursor-pointer transition-all duration-300 ${isShowForm ? 'bg-[#8B5E34]' : 'bg-stone-200'}`}
          >
            <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${isShowForm ? 'translate-x-8' : 'translate-x-0'}`} />
          </div>
        </div>

        {/* 隱藏的原始 Checkbox (讓 hook-form 感應到值) */}
        <input type="checkbox" {...register('content.showForm')} className="hidden" />

        {/* 💡 下拉選單連動修正 */}
        {isShowForm && (
          <div className="p-8 bg-white border border-stone-100 rounded-[2rem] space-y-4 shadow-inner animate-in slide-in-from-top-2">
            <Label>對接表單選擇</Label>
            <div className="relative">
              <select 
                {...register('content.formId')} 
                className="w-full border border-stone-200 p-4 rounded-2xl bg-white font-bold outline-none shadow-sm appearance-none"
              >
                <option value="">-- 請選擇表單 --</option>
                {forms && forms.length > 0 ? (
                  forms.map((f: any) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))
                ) : (
                  <option disabled>目前無可用的表單</option>
                )}
              </select>
              {/* 下拉箭頭裝飾 */}
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
                <List size={16} />
              </div>
            </div>
            
            {!forms || forms.length === 0 && (
              <p className="text-[10px] text-red-400 mt-2 ml-1">
                ⚠️ 尚未偵測到表單資料，請先至「表單管理」建立新表單。
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  return null;
}
