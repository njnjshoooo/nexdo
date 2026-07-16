import AdminMarkdownEditor from '../../../components/admin/AdminMarkdownEditor';
import React from 'react';
import { useFieldArray, Control, UseFormRegister, Controller } from 'react-hook-form';
import ImageUploader from '../../../components/admin/ImageUploader';
import ButtonEditor from '../../../components/admin/ButtonEditor';
import { Plus, Trash2, MoveUp, MoveDown, Type, Image as ImageIcon, FormInput, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { PageMainTitle, SectionTitle, BlockContainer, FieldLabel, InputClass } from '../../../components/admin/ui/AdminEditorUI';

interface GeneralEditorProps {
  control: Control<any>;
  register: UseFormRegister<any>;
  activeTab: string;
  watch: any;
  setValue: any;
  forms: any[];
}

export default function GeneralEditor({ control, register, activeTab, watch, setValue, forms }: GeneralEditorProps) {
  const { fields: blocks, append, remove, move } = useFieldArray({
    control,
    name: "content.general.blocks"
  });

  const cardClass = "bg-white p-6 rounded-xl shadow-sm border border-stone-200 relative";
  const innerCardClass = "bg-white p-6 rounded-xl shadow-sm border border-stone-200 relative";

  if (activeTab !== 'general_blocks') return null;

  const handleAddBlock = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value;
    if (!type) return;

    const newBlock: any = { id: `block-${Date.now()}`, type };
    if (type === 'HERO_1') newBlock.hero1 = { title: '', image: '' };
    if (type === 'HERO_2') newBlock.hero2 = { 
      title: '', 
      description: '', 
      backgroundImage: '', 
      mainButton: { text: '預約諮詢', type: 'FORM', value: '', isVisible: true },
      secondaryButton: { text: '查看案例', type: 'URL', value: '#cases', isVisible: true }
    };
    if (type === 'TEXT') newBlock.text = { content: '', alignment: 'left', fontSize: 'body' };
    if (type === 'GRID') newBlock.grid = { title: '', columns: 3, items: [] };
    if (type === 'SPACER') newBlock.spacer = { height: 80 };
    if (type === 'FORM') newBlock.form = { formId: '' };
    if (type === 'SINGLE_IMAGE') newBlock.singleImage = { image: '', caption: '' };
    if (type === 'IMAGE_CAROUSEL') newBlock.imageCarousel = { items: [] };
    if (type === 'IMAGE_TEXT_GRID') newBlock.imageTextGrid = { layout: 'imageLeft', image: '', title: '', content: '', cta: { text: '', link: '' } };
    if (type === 'COMPARISON') newBlock.comparison = { title: '', beforeImage: '', afterImage: '', beforeLabel: 'Before', afterLabel: 'After' };
    if (type === 'TEXT_LIST') newBlock.textList = { title: '', items: [] };
    if (type === 'HTML_CODE') newBlock.htmlCode = { html: '', adminLabel: '' };

    append(newBlock);
    e.target.value = ""; 
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6 border-b border-stone-200 pb-4">
        <PageMainTitle>通用頁面內容 (區塊工廠)</PageMainTitle>
      </div>

      <div className="space-y-6">
        {blocks.map((field, index) => {
          const blockType = watch(`content.general.blocks.${index}.type`);
          const isEnabled = watch(`content.general.blocks.${index}.enabled`) ?? true;
          
                    const blockLabels: Record<string, string> = {
            'HERO_1': '滿版主視覺 (無按鈕)',
            'HERO_2': '滿版主視覺 (含按鈕)',
            'TEXT': '純文字段落',
            'GRID': '多欄位卡片組',
            'FORM': '嵌入表單',
            'SPACER': '空白間距',
            'SINGLE_IMAGE': '單張大圖',
            'IMAGE_TEXT_GRID': '圖文區塊',
            'IMAGE_CAROUSEL': '圖片輪播',
            'FEATURE': '大圖特色介紹',
            'COMPARISON': 'B/A對比',
            'TEXT_LIST': '文字列表',
            'HTML_CODE': '自訂 HTML'
          };
          const displayLabel = blockLabels[blockType] || '通用區塊設定';

          return (
            <div key={field.id} className={cardClass}>
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-stone-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-stone-100 rounded-lg flex items-center justify-center font-bold text-stone-500 text-xs">
                    {index + 1}
                  </div>
                  <div>
                    <span className="text-xs font-black text-primary uppercase tracking-widest">{blockType}</span>
                    <h3 className="font-bold text-stone-900 text-sm">{displayLabel}</h3>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => move(index, index - 1)} disabled={index === 0} className="p-1.5 text-stone-400 hover:text-primary disabled:opacity-30 transition-colors"><ChevronLeft className="rotate-90" size={18}/></button>
                  <button type="button" onClick={() => move(index, index + 1)} disabled={index === blocks.length - 1} className="p-1.5 text-stone-400 hover:text-primary disabled:opacity-30 transition-colors"><ChevronRight className="rotate-90" size={18}/></button>
                  <div className="mx-2 w-px h-4 bg-stone-200" />
                  <button type="button" onClick={() => setValue(`content.general.blocks.${index}.enabled`, !isEnabled)} className={`w-10 h-5 rounded-full p-0.5 transition-colors ${isEnabled ? 'bg-primary' : 'bg-stone-300'}`}><div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${isEnabled ? 'translate-x-5' : 'translate-x-0'}`} /></button>
                  <button type="button" onClick={() => remove(index)} className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18}/></button>
                </div>
              </div>
              <div className="space-y-4">
                  {blockType === 'TEXT' && (
                    <div className="space-y-4">
                      <div>
                        <FieldLabel>文字內容</FieldLabel>
                        <AdminMarkdownEditor className={InputClass} {...register(`content.general.blocks.${index}.text.content`)} placeholder="輸入內容..."  />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <FieldLabel>字體大小</FieldLabel>
                          <select className={InputClass} {...register(`content.general.blocks.${index}.text.fontSize`)}>
                            <option value="heading">大標</option>
                            <option value="medium_heading">中標</option>
                            <option value="body">內文</option>
                          </select>
                        </div>
                        <div>
                          <FieldLabel>對齊方式</FieldLabel>
                          <select className={InputClass} {...register(`content.general.blocks.${index}.text.alignment`)}>
                            <option value="left">置左</option>
                            <option value="center">置中</option>
                            <option value="right">置右</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {blockType === 'HTML_CODE' && (
                    <div className="space-y-4">
                      <div>
                        <FieldLabel>管理員備註 (不會顯示於前台)</FieldLabel>
                        <input 
                          {...register(`content.general.blocks.${index}.htmlCode.adminLabel`)} 
                          placeholder="例如: 這裡是首頁的輪播圖區塊" 
                          className={InputClass} 
                        />
                      </div>
                      <div>
                        <FieldLabel>HTML 程式碼</FieldLabel>
                        <textarea 
                          {...register(`content.general.blocks.${index}.htmlCode.html`)} 
                          placeholder="請貼上 HTML 程式碼..." 
                          rows={10} 
                          className={InputClass + " font-mono"} 
                        />
                      </div>
                    </div>
                  )}
                  {blockType === 'TEXT_LIST' && (
                    <div className="space-y-4">
                      <input {...register(`content.general.blocks.${index}.textList.title`)} placeholder="標題 (如：常見問題)" className={InputClass} />
                      <div className="space-y-2">
                        {(watch(`content.general.blocks.${index}.textList.items`) || []).map((_: any, idx: number) => (
                          <div key={idx} className="flex gap-2 items-start bg-stone-50 p-2 rounded-lg">
                            <div className="flex-1 space-y-2">
                              <input {...register(`content.general.blocks.${index}.textList.items.${idx}.title`)} placeholder="項目標題" className={InputClass} />
                              <textarea {...register(`content.general.blocks.${index}.textList.items.${idx}.text`)} placeholder="項目內容" rows={2} className={InputClass} />
                            </div>
                            <button type="button" onClick={() => {
                              const items = [...watch(`content.general.blocks.${index}.textList.items`)];
                              items.splice(idx, 1);
                              setValue(`content.general.blocks.${index}.textList.items`, items);
                            }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">刪除</button>
                          </div>
                        ))}
                        <button type="button" onClick={() => {
                          const items = watch(`content.general.blocks.${index}.textList.items`) || [];
                          setValue(`content.general.blocks.${index}.textList.items`, [...items, { id: Date.now().toString(), title: '', text: '' }]);
                        }} className="text-sm text-primary font-bold">+ 新增項目</button>
                      </div>
                    </div>
                  )}
                  {blockType === 'GRID' && (
                    <div className="space-y-4">
                      <div>
                        <FieldLabel>區塊標題</FieldLabel>
                        <input className={InputClass} {...register(`content.general.blocks.${index}.grid.title`)} placeholder="例如：服務項目" />
                      </div>
                      <div>
                        <FieldLabel>每列欄數</FieldLabel>
                        <select className={InputClass} {...register(`content.general.blocks.${index}.grid.columns`)}>
                          {[2,3,4,5,6].map(n => <option key={n} value={n}>{n} 欄</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <FieldLabel>項目</FieldLabel>
                        {(watch(`content.general.blocks.${index}.grid.items`) || []).map((_: any, itemIndex: number) => (
                          <div key={itemIndex} className={innerCardClass}>
                            <FieldLabel>標題</FieldLabel>
                            <input className={InputClass} {...register(`content.general.blocks.${index}.grid.items.${itemIndex}.title`)} placeholder="標題"  />
                            <FieldLabel>圖片</FieldLabel>
                            <Controller control={control} name={`content.general.blocks.${index}.grid.items.${itemIndex}.image`} render={({ field }) => <ImageUploader value={field.value} onChange={field.onChange} />} />
                            <label className="flex items-center gap-2 mb-2">
                              <input type="checkbox" {...register(`content.general.blocks.${index}.grid.items.${itemIndex}.showImage`)} />
                              <span className="block text-sm font-medium text-stone-700 mb-0">顯示圖片</span>
                            </label>
                            <FieldLabel>描述</FieldLabel>
                            <AdminMarkdownEditor className={InputClass} {...register(`content.general.blocks.${index}.grid.items.${itemIndex}.description`)} placeholder="描述"  />
                            <FieldLabel>連結 (選填)</FieldLabel>
                            <input className={InputClass} {...register(`content.general.blocks.${index}.grid.items.${itemIndex}.link`)} placeholder="https://..." />
                          </div>
                        ))}
                        <button className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-sm" type="button" onClick={() => {
                          const items = watch(`content.general.blocks.${index}.grid.items`) || [];
                          setValue(`content.general.blocks.${index}.grid.items`, [...items, { title: '', image: '', showImage: true, description: '', link: '' }]);
                        }}>+ 新增項目</button>
                      </div>
                    </div>
                  )}

                  {blockType === 'SPACER' && (
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-bold text-stone-500">高度:</span>
                      <input className={InputClass} type="number" {...register(`content.general.blocks.${index}.spacer.height`, { valueAsNumber: true })}  />
                      <span className="text-xs text-stone-400">px</span>
                    </div>
                  )}

                  {blockType === 'SINGLE_IMAGE' && (
                    <div className="space-y-4">
                      <FieldLabel>圖片</FieldLabel>
                      <Controller control={control} name={`content.general.blocks.${index}.singleImage.image`} render={({ field }) => <ImageUploader value={field.value} onChange={field.onChange} />} />
                      <input className={InputClass} {...register(`content.general.blocks.${index}.singleImage.caption`)} placeholder="圖片說明" />
                    </div>
                  )}

                  {blockType === 'IMAGE_CAROUSEL' && (
                    <div className="space-y-4">
                      <FieldLabel>圖片輪播設定</FieldLabel>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {(watch(`content.general.blocks.${index}.imageCarousel.items`) || []).map((_: any, itemIndex: number) => (
                          <div key={itemIndex} className="relative group border border-stone-200 rounded-xl overflow-hidden bg-white shadow-sm flex flex-col p-3 gap-3">
                            <Controller control={control} name={`content.general.blocks.${index}.imageCarousel.items.${itemIndex}.image`} render={({ field }) => <div className="aspect-video w-full"><ImageUploader value={field.value} onChange={field.onChange} /></div>} />
                            <input className={InputClass + " w-full text-sm"} {...register(`content.general.blocks.${index}.imageCarousel.items.${itemIndex}.alt`)} placeholder="輸入說明文字..." />
                            <button type="button" onClick={() => {
                              const items = watch(`content.general.blocks.${index}.imageCarousel.items`) || [];
                              setValue(`content.general.blocks.${index}.imageCarousel.items`, items.filter((_: any, i: number) => i !== itemIndex));
                            }} className="absolute top-4 right-4 bg-white/90 shadow-sm p-1.5 rounded-lg text-stone-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all z-10"><Trash2 size={16}/></button>
                          </div>
                        ))}
                      </div>
                      <button className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-sm" type="button" onClick={() => {
                        const items = watch(`content.general.blocks.${index}.imageCarousel.items`) || [];
                        setValue(`content.general.blocks.${index}.imageCarousel.items`, [...items, { image: '', alt: '' }]);
                      }}>+ 新增圖片</button>
                    </div>
                  )}

                  {blockType === 'IMAGE_TEXT_GRID' && (
                    <div className="space-y-4">
                      <div>
                        <FieldLabel>佈局</FieldLabel>
                        <select className={InputClass} {...register(`content.general.blocks.${index}.imageTextGrid.layout`)}>
                          <option value="imageLeft">圖片左</option>
                          <option value="imageRight">圖片右 </option>
                        </select>
                      </div>
                      <div>
                        <FieldLabel>圖片</FieldLabel>
                        <Controller control={control} name={`content.general.blocks.${index}.imageTextGrid.image`} render={({ field }) => <ImageUploader value={field.value} onChange={field.onChange} />} />
                      </div>
                      <div>
                        <FieldLabel>標題</FieldLabel>
                        <input className={InputClass} {...register(`content.general.blocks.${index}.imageTextGrid.title`)} placeholder="標題" />
                      </div>
                      <div>
                        <FieldLabel>內容 (Markdown)</FieldLabel>
                        <AdminMarkdownEditor className={InputClass} {...register(`content.general.blocks.${index}.imageTextGrid.content`)} placeholder="內容 (Markdown)"  />
                      </div>
                      <div>
                        <FieldLabel>按鈕文字</FieldLabel>
                        <input className={InputClass} {...register(`content.general.blocks.${index}.imageTextGrid.cta.text`)} placeholder="按鈕文字" />
                      </div>
                      <div>
                        <FieldLabel>按鈕連結</FieldLabel>
                        <input className={InputClass} {...register(`content.general.blocks.${index}.imageTextGrid.cta.link`)} placeholder="按鈕連結" />
                      </div>
                    </div>
                  )}

                  {blockType === 'HERO_1' && (
                    <div className="space-y-4">
                      <FieldLabel>標題</FieldLabel>
                      <input className={InputClass} {...register(`content.general.blocks.${index}.hero1.title`)} placeholder="標題" />
                      <FieldLabel>背景圖片</FieldLabel>
                      <Controller control={control} name={`content.general.blocks.${index}.hero1.image`} render={({ field }) => <ImageUploader value={field.value} onChange={field.onChange} />} />
                    </div>
                  )}
                  {blockType === 'HERO_2' && (
                    <div className="space-y-4">
                      <FieldLabel>標題</FieldLabel>
                      <input className={InputClass} {...register(`content.general.blocks.${index}.hero2.title`)} placeholder="標題" />
                      <FieldLabel>描述</FieldLabel>
                      <textarea className={InputClass} {...register(`content.general.blocks.${index}.hero2.description`)} placeholder="描述" rows={3} />
                      <FieldLabel>背景圖片</FieldLabel>
                      <Controller control={control} name={`content.general.blocks.${index}.hero2.backgroundImage`} render={({ field }) => <ImageUploader value={field.value} onChange={field.onChange} />} />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className={innerCardClass}>
                          <FieldLabel>主按鈕文字</FieldLabel>
                          <input className={InputClass} {...register(`content.general.blocks.${index}.hero2.mainButton.text`)} placeholder="主按鈕文字" />
                          <FieldLabel>主按鈕類型</FieldLabel>
                          <select className={InputClass} {...register(`content.general.blocks.${index}.hero2.mainButton.type`)}>
                            <option value="URL">網址</option>
                            <option value="FORM">表單</option>
                            <option value="EMAIL">Email</option>
                            <option value="PHONE">電話</option>
                          </select>
                          <FieldLabel>主按鈕連結/表單ID</FieldLabel>
                          <input className={InputClass} {...register(`content.general.blocks.${index}.hero2.mainButton.value`)} placeholder="連結或表單ID" />
                          <label className="flex items-center gap-2 mt-2">
                            <input type="checkbox" {...register(`content.general.blocks.${index}.hero2.mainButton.isVisible`)} /> 顯示主按鈕
                          </label>
                        </div>
                        <div className={innerCardClass}>
                          <FieldLabel>次按鈕文字</FieldLabel>
                          <input className={InputClass} {...register(`content.general.blocks.${index}.hero2.secondaryButton.text`)} placeholder="次按鈕文字" />
                          <FieldLabel>次按鈕類型</FieldLabel>
                          <select className={InputClass} {...register(`content.general.blocks.${index}.hero2.secondaryButton.type`)}>
                            <option value="URL">網址</option>
                            <option value="FORM">表單</option>
                            <option value="EMAIL">Email</option>
                            <option value="PHONE">電話</option>
                          </select>
                          <FieldLabel>次按鈕連結/表單ID</FieldLabel>
                          <input className={InputClass} {...register(`content.general.blocks.${index}.hero2.secondaryButton.value`)} placeholder="連結或表單ID" />
                          <label className="flex items-center gap-2 mt-2">
                            <input type="checkbox" {...register(`content.general.blocks.${index}.hero2.secondaryButton.isVisible`)} /> 顯示次按鈕
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                  {blockType === 'COMPARISON' && (
                    <div className="space-y-4">
                      <FieldLabel>標題</FieldLabel>
                      <input className={InputClass} {...register(`content.general.blocks.${index}.comparison.title`)} placeholder="標題" />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className={innerCardClass}>
                          <FieldLabel>Before 圖片</FieldLabel>
                          <Controller control={control} name={`content.general.blocks.${index}.comparison.beforeImage`} render={({ field }) => <ImageUploader value={field.value} onChange={field.onChange} />} />
                          <FieldLabel>Before 標籤</FieldLabel>
                          <input className={InputClass} {...register(`content.general.blocks.${index}.comparison.beforeLabel`)} placeholder="例如: Before" />
                        </div>
                        <div className={innerCardClass}>
                          <FieldLabel>After 圖片</FieldLabel>
                          <Controller control={control} name={`content.general.blocks.${index}.comparison.afterImage`} render={({ field }) => <ImageUploader value={field.value} onChange={field.onChange} />} />
                          <FieldLabel>After 標籤</FieldLabel>
                          <input className={InputClass} {...register(`content.general.blocks.${index}.comparison.afterLabel`)} placeholder="例如: After" />
                        </div>
                      </div>
                    </div>
                  )}
                  {blockType === 'FORM' && (
                    <div className="space-y-4">
                      <FieldLabel>選擇表單</FieldLabel>
                      <select className={InputClass} {...register(`content.general.blocks.${index}.form.formId`)}>
                        <option value="">-- 請選擇表單 --</option>
                        {forms?.map((f: any) => (<option key={f.id} value={f.id}>{f.name}</option>))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
      </div>

      <div className="flex justify-center mt-6 pt-6 border-t border-stone-200">
        <select className={InputClass + " max-w-xs text-center font-bold text-stone-700 bg-stone-50 transition-colors shadow-sm cursor-pointer"} onChange={handleAddBlock}>
          <option value="">➕ 新增區塊...</option>
          <option value="HERO_1">滿版主視覺 (無按鈕)</option>
          <option value="HERO_2">滿版主視覺 (含按鈕)</option>
          <option value="TEXT">純文字段落</option>
          <option value="GRID">多欄位卡片組</option>
          <option value="FORM">嵌入表單</option>
          <option value="SPACER">空白間距</option>
          <option value="SINGLE_IMAGE">單張大圖</option>
          <option value="IMAGE_CAROUSEL">圖片輪播</option>
          <option value="IMAGE_TEXT_GRID">圖文區塊</option>
          
          <option value="COMPARISON">B/A對比</option>
          <option value="TEXT_LIST">文字列表</option>
          <option value="HTML_CODE">自訂 HTML</option>
        </select>
      </div>
    </div>
  );
}
