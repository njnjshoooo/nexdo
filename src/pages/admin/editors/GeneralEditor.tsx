import React from 'react';
import { useFieldArray, Control, UseFormRegister, Controller } from 'react-hook-form';
import ImageUploader from '../../../components/admin/ImageUploader';
import ButtonEditor from '../../../components/admin/ButtonEditor';
import { Plus, Trash2, MoveUp, MoveDown, Type, Image as ImageIcon, FormInput, Settings } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Select } from '../../../components/ui/Select';
import { Label } from '../../../components/ui/Label';
import { Button } from '../../../components/ui/Button';

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

  const cardClass = "bg-white p-6 rounded-2xl shadow-sm border border-stone-200 relative";
  const innerCardClass = "bg-stone-50 p-4 rounded-xl border border-stone-200";

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

    append(newBlock);
    e.target.value = ""; 
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-stone-200 shadow-sm sticky top-24 z-10">
        <div>
          <h2 className="text-xl font-bold text-stone-800">區塊工廠</h2>
          <p className="text-sm text-stone-500">自定義通用頁面內容</p>
        </div>
        <Select onChange={handleAddBlock} className="w-auto">
          <option value="">➕ 新增區塊...</option>
          <option value="HERO_1">Hero 區塊 (簡版)</option>
          <option value="HERO_2">Hero 區塊 (完整版)</option>
          <option value="TEXT">文字區塊</option>
          <option value="GRID">多方格區塊</option>
          <option value="FORM">嵌入表單</option>
          <option value="SPACER">空白間距</option>
          <option value="SINGLE_IMAGE">純圖片區塊</option>
          <option value="IMAGE_CAROUSEL">圖片輪播區塊</option>
          <option value="IMAGE_TEXT_GRID">圖文區塊</option>
        </Select>
      </div>

      <div className="space-y-4">
        {blocks.map((field, index) => {
          const blockType = watch(`content.general.blocks.${index}.type`);
          
          return (
            <div key={field.id} className="mb-6">
              <div className="mb-4 flex justify-between items-center">
                <span className="text-xs font-mono font-bold text-stone-500">#{index + 1} {blockType}</span>
                <div className="flex gap-1">
                  <button type="button" onClick={() => move(index, index - 1)} disabled={index === 0} className="p-1 text-stone-400 hover:text-stone-900 disabled:opacity-20"><MoveUp size={16}/></button>
                  <button type="button" onClick={() => move(index, index + 1)} disabled={index === blocks.length - 1} className="p-1 text-stone-400 hover:text-stone-900 disabled:opacity-20"><MoveDown size={16}/></button>
                  <button type="button" onClick={() => remove(index)} className="p-1 text-stone-400 hover:text-red-600 ml-2"><Trash2 size={16}/></button>
                </div>
              </div>
              <div className={cardClass}>
                <div className="space-y-4">
                  {blockType === 'TEXT' && (
                    <div className="space-y-4">
                      <div>
                        <Label>文字內容</Label>
                        <Textarea {...register(`content.general.blocks.${index}.text.content`)} placeholder="輸入內容..." className="h-40" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>字體大小</Label>
                          <Select {...register(`content.general.blocks.${index}.text.fontSize`)}>
                            <option value="heading">大標</option>
                            <option value="medium_heading">中標</option>
                            <option value="body">內文</option>
                          </Select>
                        </div>
                        <div>
                          <Label>對齊方式</Label>
                          <Select {...register(`content.general.blocks.${index}.text.alignment`)}>
                            <option value="left">置左</option>
                            <option value="center">置中</option>
                            <option value="right">置右</option>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}

                  {blockType === 'HERO_1' && (
                    <div className="space-y-4">
                      <Input {...register(`content.general.blocks.${index}.hero1.title`)} placeholder="標題" />
                      <Controller control={control} name={`content.general.blocks.${index}.hero1.image`} render={({ field }) => <ImageUploader value={field.value} onChange={field.onChange} />} />
                    </div>
                  )}

                  {blockType === 'HERO_2' && (
                    <div className="space-y-4">
                      <div>
                        <Label>標題</Label>
                        <Textarea {...register(`content.general.blocks.${index}.hero2.title`)} rows={2} placeholder="標題" />
                      </div>
                      <div>
                        <Label>描述</Label>
                        <Textarea {...register(`content.general.blocks.${index}.hero2.description`)} rows={3} placeholder="描述" />
                      </div>
                      <div>
                        <Label>背景圖片</Label>
                        <Controller control={control} name={`content.general.blocks.${index}.hero2.backgroundImage`} render={({ field }) => <ImageUploader value={field.value} onChange={field.onChange} />} />
                      </div>
                      <div className="pt-4 border-t border-stone-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ButtonEditor control={control} register={register} name={`content.general.blocks.${index}.hero2.mainButton`} label="主按鈕設定" forms={forms} />
                        <ButtonEditor control={control} register={register} name={`content.general.blocks.${index}.hero2.secondaryButton`} label="次按鈕設定" forms={forms} />
                      </div>
                    </div>
                  )}

                  {blockType === 'FORM' && (
                    <Select {...register(`content.general.blocks.${index}.form.formId`)}>
                      <option value="">選擇表單...</option>
                      {forms?.map((f: any) => <option key={f.id} value={f.id}>{f.name}</option>)}
                    </Select>
                  )}

                  {blockType === 'GRID' && (
                    <div className="space-y-4">
                      <div>
                        <Label>區塊標題</Label>
                        <Input {...register(`content.general.blocks.${index}.grid.title`)} placeholder="區塊標題" />
                      </div>
                      <div>
                        <Label>欄位數</Label>
                        <Select {...register(`content.general.blocks.${index}.grid.columns`, { valueAsNumber: true })}>
                          {[2,3,4,5,6].map(n => <option key={n} value={n}>{n} 欄</option>)}
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>項目</Label>
                        {(watch(`content.general.blocks.${index}.grid.items`) || []).map((_: any, itemIndex: number) => (
                          <div key={itemIndex} className={innerCardClass}>
                            <Label>標題</Label>
                            <Input {...register(`content.general.blocks.${index}.grid.items.${itemIndex}.title`)} placeholder="標題" className="mb-2" />
                            <Label>圖片</Label>
                            <Controller control={control} name={`content.general.blocks.${index}.grid.items.${itemIndex}.image`} render={({ field }) => <ImageUploader value={field.value} onChange={field.onChange} />} />
                            <label className="flex items-center gap-2 mb-2">
                              <input type="checkbox" {...register(`content.general.blocks.${index}.grid.items.${itemIndex}.showImage`)} />
                              <span className="block text-sm font-medium text-stone-700 mb-0">顯示圖片</span>
                            </label>
                            <Label>描述</Label>
                            <Textarea {...register(`content.general.blocks.${index}.grid.items.${itemIndex}.description`)} placeholder="描述" className="mb-2" />
                            <Label>連結 (選填)</Label>
                            <Input {...register(`content.general.blocks.${index}.grid.items.${itemIndex}.link`)} placeholder="https://..." />
                          </div>
                        ))}
                        <Button type="button" variant="secondary" onClick={() => {
                          const items = watch(`content.general.blocks.${index}.grid.items`) || [];
                          setValue(`content.general.blocks.${index}.grid.items`, [...items, { title: '', image: '', showImage: true, description: '', link: '' }]);
                        }}>+ 新增項目</Button>
                      </div>
                    </div>
                  )}

                  {blockType === 'SPACER' && (
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-bold text-stone-500">高度:</span>
                      <Input type="number" {...register(`content.general.blocks.${index}.spacer.height`, { valueAsNumber: true })} className="w-24" />
                      <span className="text-xs text-stone-400">px</span>
                    </div>
                  )}

                  {blockType === 'SINGLE_IMAGE' && (
                    <div className="space-y-4">
                      <Label>圖片</Label>
                      <Controller control={control} name={`content.general.blocks.${index}.singleImage.image`} render={({ field }) => <ImageUploader value={field.value} onChange={field.onChange} />} />
                      <Input {...register(`content.general.blocks.${index}.singleImage.caption`)} placeholder="圖片說明" />
                    </div>
                  )}

                  {blockType === 'IMAGE_CAROUSEL' && (
                    <div className="space-y-4">
                      <Label>圖片列表</Label>
                      {(watch(`content.general.blocks.${index}.imageCarousel.items`) || []).map((_: any, itemIndex: number) => (
                        <div key={itemIndex} className={innerCardClass + " flex gap-4"}>
                          <Controller control={control} name={`content.general.blocks.${index}.imageCarousel.items.${itemIndex}.image`} render={({ field }) => <ImageUploader value={field.value} onChange={field.onChange} />} />
                          <Input {...register(`content.general.blocks.${index}.imageCarousel.items.${itemIndex}.alt`)} placeholder="圖片說明 (alt)" />
                          <button type="button" onClick={() => {
                            const items = watch(`content.general.blocks.${index}.imageCarousel.items`) || [];
                            setValue(`content.general.blocks.${index}.imageCarousel.items`, items.filter((_: any, i: number) => i !== itemIndex));
                          }} className="text-red-500"><Trash2 size={16}/></button>
                        </div>
                      ))}
                      <Button type="button" variant="secondary" onClick={() => {
                        const items = watch(`content.general.blocks.${index}.imageCarousel.items`) || [];
                        setValue(`content.general.blocks.${index}.imageCarousel.items`, [...items, { image: '', alt: '' }]);
                      }}>+ 新增圖片</Button>
                    </div>
                  )}

                  {blockType === 'IMAGE_TEXT_GRID' && (
                    <div className="space-y-4">
                      <div>
                        <Label>佈局</Label>
                        <Select {...register(`content.general.blocks.${index}.imageTextGrid.layout`)}>
                          <option value="imageLeft">圖片左</option>
                          <option value="imageRight">圖片右 </option>
                        </Select>
                      </div>
                      <div>
                        <Label>圖片</Label>
                        <Controller control={control} name={`content.general.blocks.${index}.imageTextGrid.image`} render={({ field }) => <ImageUploader value={field.value} onChange={field.onChange} />} />
                      </div>
                      <div>
                        <Label>標題</Label>
                        <Input {...register(`content.general.blocks.${index}.imageTextGrid.title`)} placeholder="標題" />
                      </div>
                      <div>
                        <Label>內容 (Markdown)</Label>
                        <Textarea {...register(`content.general.blocks.${index}.imageTextGrid.content`)} placeholder="內容 (Markdown)" className="h-32" />
                      </div>
                      <div>
                        <Label>按鈕文字</Label>
                        <Input {...register(`content.general.blocks.${index}.imageTextGrid.cta.text`)} placeholder="按鈕文字" />
                      </div>
                      <div>
                        <Label>按鈕連結</Label>
                        <Input {...register(`content.general.blocks.${index}.imageTextGrid.cta.link`)} placeholder="按鈕連結" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
