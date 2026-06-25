import AdminMarkdownEditor from '../../../components/admin/AdminMarkdownEditor';
import React, { useEffect, useMemo, useState } from 'react';
import { useFieldArray, Control, UseFormRegister, Controller } from 'react-hook-form';
import { Link } from 'react-router-dom';
import ImageUploader from '../../../components/admin/ImageUploader';
import { PageMainTitle, SectionTitle, BlockContainer, FieldLabel, InputClass } from '../../../components/admin/ui/AdminEditorUI';
import { Plus, Trash2, Package, Users, CheckCircle2, List, Briefcase, Link as LinkIcon, Settings, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { pageService } from '../../../services/pageService';
import { productService } from '../../../services/productService';
import { v4 as uuidv4 } from 'uuid';

export default function SubItemEditor({ control, register, activeTab, watch, setValue, forms }: any) {
  const { fields: subPartners, append: appendPartner, remove: removePartner, move: movePartner } = useFieldArray({ control, name: "content.subItem.partners" });
  const { fields: subCases, append: appendCase, remove: removeCase, move: moveCase } = useFieldArray({ control, name: "content.subItem.cases" });
  const { fields: subFaqs, append: appendFaq, remove: removeFaq, move: moveFaq } = useFieldArray({ control, name: "content.subItem.faqs" });
  const { fields: subCoreServices, append: appendCoreService, remove: removeCoreService, move: moveCoreService } = useFieldArray({ control, name: "content.subItem.coreServices" });
  const { fields: subAdditionalServices, append: appendAdditionalService, remove: removeAdditionalService } = useFieldArray({ control, name: "content.subItem.additionalServices" });
  const { fields: introItems, append: appendIntroItem, remove: removeIntroItem } = useFieldArray({ 
    control, 
    name: "content.subItem.serviceIntro.blockA.items" 
  });

  const { fields: introSections, append: appendSection, remove: removeSection, move: moveSection } = useFieldArray({ 
    control, 
    name: "content.subItem.serviceIntro.sections" 
  });

  const allPages = pageService.getAll() || [];
  const subItemPages = useMemo(() => allPages.filter((p: any) => p.template === 'SUB_ITEM'), [allPages]);
  
  const [allProducts, setAllProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const products = await productService.getAll();
      setAllProducts(products);
    };
    fetchProducts();
  }, []);

  const isShowForm = watch('content.showForm');

  const labelClass = "block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 ml-1";
  const inputClass = "w-full border border-stone-200 bg-stone-50 p-3 rounded-xl text-sm focus:border-stone-900 focus:bg-white outline-none transition-all";
  const disabledInputClass = "w-full border border-stone-200 p-3 rounded-xl text-sm bg-stone-50 text-stone-400 outline-none cursor-not-allowed transition-all";
  const cardClass = "bg-white p-6 rounded-xl shadow-sm border border-stone-200 relative";
  const innerCardClass = "bg-white p-6 rounded-xl shadow-sm border border-stone-200 relative";
  const primaryBtn = "bg-stone-900 hover:bg-stone-800 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-sm";
  const secondaryBtn = "bg-white hover:bg-stone-50 border border-stone-200 text-stone-600 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap";

  const pageId = watch('id');
  const productId = watch('content.subItem.productId');
  const selectedProduct = useMemo(() => allProducts.find(p => p.id === productId), [allProducts, productId]);

  const addGridSection = () => {
    appendSection({
      id: uuidv4(),
      type: 'GRID',
      enabled: true,
      grid: {
        title: '服務項目',
        showCarousel: false,
        items: [{ id: uuidv4(), title: '項目名稱', image: '' }]
      }
    });
  };

  const addFeatureSection = () => {
    appendSection({
      id: uuidv4(),
      type: 'FEATURE',
      enabled: true,
      feature: {
        title: '特色介紹標題',
        showCarousel: false,
        images: [''],
        content: '特色介紹內容...',
        layout: 'LEFT'
      }
    });
  };

  const addComparisonSection = () => {
    appendSection({
      id: uuidv4(),
      type: 'COMPARISON',
      enabled: true,
      comparison: {
        title: '施作案例對比',
        beforeImage: '',
        afterImage: '',
        beforeLabel: 'Before',
        afterLabel: 'After'
      }
    });
  };

  const addTextListSection = () => {
    appendSection({
      id: uuidv4(),
      type: 'TEXT_LIST',
      enabled: true,
      textList: {
        title: '服務特色列表',
        items: [{ id: uuidv4(), title: '小標題一', text: '項目一說明...' }, { id: uuidv4(), title: '小標題二', text: '項目二說明...' }]
      }
    });
  };

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
                    <AdminMarkdownEditor 
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
                      <img src={selectedProduct.image || undefined} alt={selectedProduct.name} className="w-full h-48 object-cover rounded-lg border border-stone-200" />
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
        <div className="mb-6 flex justify-between items-center border-b border-stone-200 pb-4">
          <PageMainTitle>專業夥伴</PageMainTitle>
        </div>
        <div className="space-y-6">
          {subPartners.length === 0 && (
            <div className="p-8 text-center bg-stone-50 rounded-2xl border-2 border-dashed border-stone-200">
              <Users className="mx-auto h-8 w-8 text-stone-300 mb-3" />
              <h3 className="text-sm font-bold text-stone-900 mb-1">尚未建立專業夥伴</h3>
              <p className="text-xs text-stone-500 mb-4">點擊下方按鈕新增專業夥伴。</p>
            </div>
          )}
          {subPartners.map((field, index) => (
            <div key={field.id} className={innerCardClass}>
              <div className="absolute top-4 right-4 flex items-center gap-1">
                <button type="button" onClick={() => movePartner(index, index - 1)} disabled={index === 0} className="p-1.5 text-stone-400 hover:text-primary disabled:opacity-30 transition-colors"><ChevronLeft className="rotate-90" size={16}/></button>
                <button type="button" onClick={() => movePartner(index, index + 1)} disabled={index === subPartners.length - 1} className="p-1.5 text-stone-400 hover:text-primary disabled:opacity-30 transition-colors"><ChevronRight className="rotate-90" size={16}/></button>
                <div className="w-px h-4 bg-stone-200 mx-1"></div>
                <button type="button" onClick={() => removePartner(index)} className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16}/></button>
              </div>
              <div className="flex items-center gap-2 mb-4">
                 <div className="w-6 h-6 bg-stone-200 rounded text-[10px] font-bold text-stone-500 flex items-center justify-center">{index + 1}</div>
              </div>
              <div className="space-y-4">
                <div>
                  <FieldLabel>標題/姓名</FieldLabel>
                  <input {...register(`content.subItem.partners.${index}.title`)} placeholder="標題/姓名" className={InputClass} />
                </div>
                <div>
                  <FieldLabel>描述內容</FieldLabel>
                  <AdminMarkdownEditor {...register(`content.subItem.partners.${index}.description`)} placeholder="描述 (支援 Markdown)..." rows={3} className={InputClass} />
                </div>
              </div>
            </div>
          ))}
          
          <div className="flex justify-center mt-6 pt-4 border-t border-stone-200">
            <button type="button" onClick={() => appendPartner({ title: '', description: '', image: '' })} className={secondaryBtn}><Plus size={16}/> 新增夥伴</button>
          </div>
        </div>
      </>
    );
  }

  if (activeTab === 'sub_core_services') {
    return (
      <>
        
        <div className="mb-6 flex justify-between items-center border-b border-stone-200 pb-4">
          <PageMainTitle>服務流程</PageMainTitle>
        </div>
        <div className="space-y-6">
          {subCoreServices.length === 0 && (
            <div className="p-8 text-center bg-stone-50 rounded-2xl border-2 border-dashed border-stone-200">
              <CheckCircle2 className="mx-auto h-8 w-8 text-stone-300 mb-3" />
              <h3 className="text-sm font-bold text-stone-900 mb-1">尚未建立服務流程</h3>
              <p className="text-xs text-stone-500 mb-4">點擊下方按鈕新增服務流程。</p>
            </div>
          )}
          {subCoreServices.map((field, index) => (
            <div key={field.id} className={innerCardClass}>
              <div className="absolute top-4 right-4 flex items-center gap-1">
                <button type="button" onClick={() => moveCoreService(index, index - 1)} disabled={index === 0} className="p-1.5 text-stone-400 hover:text-primary disabled:opacity-30 transition-colors"><ChevronLeft className="rotate-90" size={16}/></button>
                <button type="button" onClick={() => moveCoreService(index, index + 1)} disabled={index === subCoreServices.length - 1} className="p-1.5 text-stone-400 hover:text-primary disabled:opacity-30 transition-colors"><ChevronRight className="rotate-90" size={16}/></button>
                <div className="w-px h-4 bg-stone-200 mx-1"></div>
                <button type="button" onClick={() => removeCoreService(index)} className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16}/></button>
              </div>
              <div className="flex items-center gap-2 mb-4">
                 <div className="w-6 h-6 bg-stone-200 rounded text-[10px] font-bold text-stone-500 flex items-center justify-center">{index + 1}</div>
              </div>
              <div className="space-y-4">
                <div>
                  <FieldLabel>流程名稱</FieldLabel>
                  <input {...register(`content.subItem.coreServices.${index}.title`)} placeholder="流程名稱" className={InputClass} />
                </div>
                <div>
                  <FieldLabel>流程內容</FieldLabel>
                  <AdminMarkdownEditor {...register(`content.subItem.coreServices.${index}.content`)} placeholder="流程內容 (支援 Markdown)..." rows={4} className={InputClass} />
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-center mt-6 pt-4 border-t border-stone-200">
            <button type="button" onClick={() => appendCoreService({ title: '', content: '' })} className={secondaryBtn}><Plus size={16}/> 新增流程</button>
          </div>
        </div>
      </>
    );
  }

  if (activeTab === 'sub_intro') {
    return (
      <div className="space-y-10">
        <div className="flex justify-between items-center mb-6 border-b border-stone-200 pb-4">
          <PageMainTitle>服務介紹</PageMainTitle>
        </div>
        {/* Main Title Editor */}
        <div className="space-y-6">
          <BlockContainer>
            <FieldLabel>頁面大標題 (顯示於內容區塊最上方的開場大標題)</FieldLabel>
            <input {...register('content.subItem.mainTitle')} placeholder="例如：全方位居家檢修服務" className={InputClass} />
          </BlockContainer>
        </div>

        {/* Dynamic Sections Editor */}
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h2 className="text-lg font-bold text-stone-900">服務介紹動態區塊</h2>
              <p className="text-xs text-stone-500 mt-1">您可以自由新增多個不同類型的介紹區塊</p>
            </div>
          </div>

          <div className="space-y-4">
            {introSections.map((field, index) => {
              const type = watch(`content.subItem.serviceIntro.sections.${index}.type`);
              const isEnabled = watch(`content.subItem.serviceIntro.sections.${index}.enabled`);

              return (
                <div key={field.id} className={cardClass}>
                  {/* Section Header */}
                  <div className="flex justify-between items-center mb-6 pb-4 border-b border-stone-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-stone-100 rounded-lg flex items-center justify-center font-bold text-stone-500 text-xs">
                        {index + 1}
                      </div>
                      <div>
                        <span className="text-xs font-black text-primary uppercase tracking-widest">
                          {type === 'GRID' ? '產品列表' : type === 'FEATURE' ? '大圖介紹' : type === 'COMPARISON' ? 'B/A 對比' : '文字列表'}
                        </span>
                        <h3 className="font-bold text-stone-900 text-sm">
                          {watch(`content.subItem.serviceIntro.sections.${index}.${type === 'TEXT_LIST' ? 'textList' : type.toLowerCase()}.title`) || '未命名區塊'}
                        </h3>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        type="button" 
                        onClick={() => moveSection(index, index - 1)} 
                        disabled={index === 0}
                        className="p-1.5 text-stone-400 hover:text-primary disabled:opacity-30"
                      >
                        <ChevronLeft className="rotate-90" size={18}/>
                      </button>
                      <button 
                        type="button" 
                        onClick={() => moveSection(index, index + 1)} 
                        disabled={index === introSections.length - 1}
                        className="p-1.5 text-stone-400 hover:text-primary disabled:opacity-30"
                      >
                        <ChevronRight className="rotate-90" size={18}/>
                      </button>
                      <div className="mx-2 w-px h-4 bg-stone-200" />
                      <button 
                        type="button"
                        onClick={() => setValue(`content.subItem.serviceIntro.sections.${index}.enabled`, !isEnabled)} 
                        className={`w-10 h-5 rounded-full p-0.5 transition-colors ${isEnabled ? 'bg-primary' : 'bg-stone-300'}`}
                      >
                        <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${isEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                      <button 
                        type="button" 
                        onClick={() => removeSection(index)} 
                        className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18}/>
                      </button>
                    </div>
                  </div>

                  {/* Section Content */}
                  <div className="space-y-6">
                    {/* Common Title */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {!(type === 'FEATURE' && watch(`content.subItem.serviceIntro.sections.${index}.feature.layout`) === 'IMAGE_ONLY') && (
                        <div>
                          <label className={labelClass}>區塊標題</label>
                          <input {...register(`content.subItem.serviceIntro.sections.${index}.${type === 'TEXT_LIST' ? 'textList' : type.toLowerCase()}.title`)} className={inputClass} />
                        </div>
                      )}
                      {(type === 'GRID' || (type === 'FEATURE' && watch(`content.subItem.serviceIntro.sections.${index}.feature.layout`) !== 'TEXT_ONLY')) && (
                        <div>
                          <label className={labelClass}>啟用輪播模式</label>
                          <div className="flex items-center gap-2 mt-2">
                            <input 
                              type="checkbox" 
                              {...register(`content.subItem.serviceIntro.sections.${index}.${type.toLowerCase()}.showCarousel`)} 
                              className="w-4 h-4 text-primary border-stone-300 rounded focus:ring-primary"
                            />
                            <span className="text-xs text-stone-500 font-medium">勾選後當超過圖片時自動輪播</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Type specific fields */}
                    {type === 'GRID' && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <label className={labelClass}>子項目列表</label>
                          <button 
                            type="button" 
                            onClick={() => {
                              const items = watch(`content.subItem.serviceIntro.sections.${index}.grid.items`) || [];
                              setValue(`content.subItem.serviceIntro.sections.${index}.grid.items`, [...items, { id: uuidv4(), title: '', image: '' }]);
                            }}
                            className="text-primary text-xs font-bold hover:underline"
                          >
                            + 新增子項目
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {(watch(`content.subItem.serviceIntro.sections.${index}.grid.items`) || []).map((_: any, itemIdx: number) => (
                            <div key={itemIdx} className="relative">
                              <button 
                                type="button" 
                                onClick={() => {
                                  const items = [...watch(`content.subItem.serviceIntro.sections.${index}.grid.items`)];
                                  items.splice(itemIdx, 1);
                                  setValue(`content.subItem.serviceIntro.sections.${index}.grid.items`, items);
                                }}
                                className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur-sm rounded-lg text-stone-400 hover:text-red-500 z-10 shadow-sm transition-colors"
                              >
                                <Trash2 size={14}/>
                              </button>
                              <div className="space-y-2">
                                <Controller 
                                  control={control} 
                                  name={`content.subItem.serviceIntro.sections.${index}.grid.items.${itemIdx}.image`} 
                                  render={({ field }) => <ImageUploader value={field.value} onChange={field.onChange} />} 
                                />
                                <input {...register(`content.subItem.serviceIntro.sections.${index}.grid.items.${itemIdx}.title`)} placeholder="服務名稱" className={inputClass} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {type === 'FEATURE' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {watch(`content.subItem.serviceIntro.sections.${index}.feature.layout`) !== 'IMAGE_ONLY' && (
                          <div className="space-y-4">
                            <div>
                              <label className={labelClass}>內容文字 (支援 Markdown)</label>
                              <AdminMarkdownEditor {...register(`content.subItem.serviceIntro.sections.${index}.feature.content`)} rows={4} className={inputClass} />
                            </div>
                            <div>
                              <label className={labelClass}>排版佈局</label>
                              <select {...register(`content.subItem.serviceIntro.sections.${index}.feature.layout`)} className={inputClass}>
                                <option value="LEFT">左圖右文</option>
                                <option value="RIGHT">右圖左文</option>
                                <option value="TOP">上圖下文</option>
                                <option value="BOTTOM">下圖上文</option>
                                <option value="TEXT_ONLY">純文字</option>
                                <option value="IMAGE_ONLY">純圖片</option>
                              </select>
                            </div>
                          </div>
                        )}
                        {watch(`content.subItem.serviceIntro.sections.${index}.feature.layout`) === 'IMAGE_ONLY' && (
                          <div className="space-y-4">
                            <div>
                              <label className={labelClass}>排版佈局</label>
                               <select {...register(`content.subItem.serviceIntro.sections.${index}.feature.layout`)} className={inputClass}>
                                <option value="LEFT">左圖右文</option>
                                <option value="RIGHT">右圖左文</option>
                                <option value="TOP">上圖下文</option>
                                <option value="BOTTOM">下圖上文</option>
                                <option value="TEXT_ONLY">純文字</option>
                                <option value="IMAGE_ONLY">純圖片</option>
                              </select>
                            </div>
                          </div>
                        )}
                        {watch(`content.subItem.serviceIntro.sections.${index}.feature.layout`) !== 'TEXT_ONLY' && (
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <label className={labelClass}>展示圖片</label>
                              <button 
                                type="button" 
                                onClick={() => {
                                  const imgs = watch(`content.subItem.serviceIntro.sections.${index}.feature.images`) || [];
                                  setValue(`content.subItem.serviceIntro.sections.${index}.feature.images`, [...imgs, '']);
                                }}
                                className="text-primary text-xs font-bold hover:underline"
                              >
                                + 新增圖片
                              </button>
                            </div>
                            <div className="space-y-3">
                              {(watch(`content.subItem.serviceIntro.sections.${index}.feature.images`) || []).map((_: any, imgIdx: number) => (
                                <div key={imgIdx} className="relative group">
                                  <Controller 
                                    control={control} 
                                    name={`content.subItem.serviceIntro.sections.${index}.feature.images.${imgIdx}`} 
                                    render={({ field }) => <ImageUploader value={field.value} onChange={field.onChange} />} 
                                  />
                                  <button 
                                    type="button" 
                                    onClick={() => {
                                      const imgs = [...watch(`content.subItem.serviceIntro.sections.${index}.feature.images`)];
                                      imgs.splice(imgIdx, 1);
                                      setValue(`content.subItem.serviceIntro.sections.${index}.feature.images`, imgs);
                                    }}
                                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <Trash2 size={12}/>
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {type === 'COMPARISON' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 relative">
                          <label className={labelClass}>Before 圖片與文字</label>
                          <input {...register(`content.subItem.serviceIntro.sections.${index}.comparison.beforeLabel`)} className={inputClass + " mb-2"} placeholder="標籤 (例如：改善前)" />
                          <Controller 
                            control={control} 
                            name={`content.subItem.serviceIntro.sections.${index}.comparison.beforeImage`} 
                            render={({ field }) => <ImageUploader value={field.value} onChange={field.onChange} />} 
                          />
                        </div>
                        <div className="space-y-2 relative">
                          <label className={labelClass}>After 圖片與文字</label>
                          <input {...register(`content.subItem.serviceIntro.sections.${index}.comparison.afterLabel`)} className={inputClass + " mb-2"} placeholder="標籤 (例如：改善後)" />
                          <Controller 
                            control={control} 
                            name={`content.subItem.serviceIntro.sections.${index}.comparison.afterImage`} 
                            render={({ field }) => <ImageUploader value={field.value} onChange={field.onChange} />} 
                          />
                        </div>
                      </div>
                    )}

                    {type === 'TEXT_LIST' && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <label className={labelClass}>文字列表項目</label>
                          <button 
                            type="button" 
                            onClick={() => {
                              const items = watch(`content.subItem.serviceIntro.sections.${index}.textList.items`) || [];
                              setValue(`content.subItem.serviceIntro.sections.${index}.textList.items`, [...items, { id: uuidv4(), title: '', text: '' }]);
                            }}
                            className="text-primary text-xs font-bold hover:underline"
                          >
                            + 新增項目
                          </button>
                        </div>
                        <div className="space-y-3">
                          {(watch(`content.subItem.serviceIntro.sections.${index}.textList.items`) || []).map((_: any, itemIdx: number) => (
                            <div key={itemIdx} className="flex gap-2 items-start relative group">
                              <div className="w-8 h-8 shrink-0 bg-stone-100 rounded-lg flex items-center justify-center font-bold text-stone-500 text-xs mt-2">
                                {itemIdx + 1}
                              </div>
                              <div className="flex-1 space-y-2">
                                <input {...register(`content.subItem.serviceIntro.sections.${index}.textList.items.${itemIdx}.title`)} className={inputClass} placeholder="輸入小標題..."/>
                                <AdminMarkdownEditor {...register(`content.subItem.serviceIntro.sections.${index}.textList.items.${itemIdx}.text`)} rows={2} className={inputClass} placeholder="輸入項目內容..."/>
                              </div>
                              <button 
                                type="button" 
                                onClick={() => {
                                  const items = [...watch(`content.subItem.serviceIntro.sections.${index}.textList.items`)];
                                  items.splice(itemIdx, 1);
                                  setValue(`content.subItem.serviceIntro.sections.${index}.textList.items`, items);
                                }}
                                className="w-8 h-8 shrink-0 text-stone-400 hover:text-red-500 rounded-lg flex items-center justify-center transition-colors"
                              >
                                <Trash2 size={16}/>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {introSections.length === 0 && (
              <div className="p-12 text-center bg-stone-50 rounded-3xl border-2 border-dashed border-stone-200">
                <List className="mx-auto h-12 w-12 text-stone-300 mb-4" />
                <h3 className="text-lg font-bold text-stone-900 mb-1">尚未建立介紹區塊</h3>
                <p className="text-sm text-stone-500 mb-6">點擊上方按鈕，開始建立您的動態服務清單、特色介紹或對比照。</p>
                <div className="flex justify-center gap-3">
                  <button type="button" onClick={addFeatureSection} className={primaryBtn}>建立大圖介紹</button>
                  <button type="button" onClick={addGridSection} className={primaryBtn}>建立產品列表</button>
                  <button type="button" onClick={addComparisonSection} className={primaryBtn}>建立 B/A 對比</button>
                  <button type="button" onClick={addTextListSection} className={primaryBtn}>建立文字列表</button>
                </div>
              </div>
            )}

            {introSections.length > 0 && (
              <div className="flex gap-2 justify-center mt-6 pt-4 border-t border-stone-200">
                <button type="button" onClick={addFeatureSection} className={secondaryBtn}><Plus size={14}/> 大圖介紹</button>
                <button type="button" onClick={addGridSection} className={secondaryBtn}><Plus size={14}/> 產品列表</button>
                <button type="button" onClick={addComparisonSection} className={secondaryBtn}><Plus size={14}/> B/A 對比</button>
                <button type="button" onClick={addTextListSection} className={secondaryBtn}><Plus size={14}/> 文字列表</button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'sub_cases') {
    return (
      <>
        <div className="mb-6 flex justify-between items-center border-b border-stone-200 pb-4">
          <PageMainTitle>真實案例</PageMainTitle>
        </div>
        <div className="space-y-6">
          {subCases.length === 0 && (
            <div className="p-8 text-center bg-stone-50 rounded-2xl border-2 border-dashed border-stone-200">
              <Briefcase className="mx-auto h-8 w-8 text-stone-300 mb-3" />
              <h3 className="text-sm font-bold text-stone-900 mb-1">尚未建立真實案例</h3>
              <p className="text-xs text-stone-500 mb-4">點擊下方按鈕新增真實案例。</p>
            </div>
          )}
          {subCases.map((field, index) => (
            <div key={field.id} className={innerCardClass}>
              <div className="absolute top-4 right-4 flex items-center gap-1 z-10">
                <button type="button" onClick={() => moveCase(index, index - 1)} disabled={index === 0} className="p-1.5 text-stone-400 hover:text-primary disabled:opacity-30 transition-colors bg-white/50 backdrop-blur rounded-lg"><ChevronLeft className="rotate-90" size={16}/></button>
                <button type="button" onClick={() => moveCase(index, index + 1)} disabled={index === subCases.length - 1} className="p-1.5 text-stone-400 hover:text-primary disabled:opacity-30 transition-colors bg-white/50 backdrop-blur rounded-lg"><ChevronRight className="rotate-90" size={16}/></button>
                <div className="w-px h-4 bg-stone-300 mx-1"></div>
                <button type="button" onClick={() => removeCase(index)} className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors bg-white/50 backdrop-blur rounded-lg"><Trash2 size={16}/></button>
              </div>
              <div className="flex items-center gap-2 mb-4">
                 <div className="w-6 h-6 bg-stone-200 rounded text-[10px] font-bold text-stone-500 flex items-center justify-center">{index + 1}</div>
              </div>
              
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-4">
                  <div>
                    <FieldLabel>案例標題</FieldLabel>
                    <input {...register(`content.subItem.cases.${index}.title`)} placeholder="案例標題" className={InputClass} />
                  </div>
                  <div>
                    <FieldLabel>標籤 (Hashtag)</FieldLabel>
                    <input {...register(`content.subItem.cases.${index}.tag`)} placeholder="標籤 (例如：適老換屋)" className={InputClass} />
                  </div>
                  <div>
                    <FieldLabel>案例描述</FieldLabel>
                    <AdminMarkdownEditor {...register(`content.subItem.cases.${index}.description`)} placeholder="案例描述 (支援 Markdown)..." rows={4} className={InputClass} />
                  </div>
                </div>
                <div className="w-full md:w-64">
                  <FieldLabel>案例圖片</FieldLabel>
                  <Controller control={control} name={`content.subItem.cases.${index}.image`} render={({ field }) => <ImageUploader value={field.value} onChange={field.onChange} />} />
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-center mt-6 pt-4 border-t border-stone-200">
            <button type="button" onClick={() => appendCase({ id: uuidv4(), title: '', description: '', image: '', tag: '' })} className={secondaryBtn}><Plus size={16}/> 新增案例</button>
          </div>
        </div>
      </>
    );
  }

  if (activeTab === 'sub_faqs') {
    return (
      <>
        <div className="mb-6 flex justify-between items-center border-b border-stone-200 pb-4">
          <PageMainTitle>常見問題 (FAQ)</PageMainTitle>
        </div>
        <div className="space-y-6">
          {subFaqs.length === 0 && (
            <div className="p-8 text-center bg-stone-50 rounded-2xl border-2 border-dashed border-stone-200">
              <AlertCircle className="mx-auto h-8 w-8 text-stone-300 mb-3" />
              <h3 className="text-sm font-bold text-stone-900 mb-1">尚未建立常見問題</h3>
              <p className="text-xs text-stone-500 mb-4">點擊下方按鈕新增常見問題。</p>
            </div>
          )}
          {subFaqs.map((field, index) => (
            <div key={field.id} className={innerCardClass}>
              <div className="absolute top-4 right-4 flex items-center gap-1">
                <button type="button" onClick={() => moveFaq(index, index - 1)} disabled={index === 0} className="p-1.5 text-stone-400 hover:text-primary disabled:opacity-30 transition-colors"><ChevronLeft className="rotate-90" size={16}/></button>
                <button type="button" onClick={() => moveFaq(index, index + 1)} disabled={index === subFaqs.length - 1} className="p-1.5 text-stone-400 hover:text-primary disabled:opacity-30 transition-colors"><ChevronRight className="rotate-90" size={16}/></button>
                <div className="w-px h-4 bg-stone-200 mx-1"></div>
                <button type="button" onClick={() => removeFaq(index)} className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16}/></button>
              </div>
              <div className="flex items-center gap-2 mb-4">
                 <div className="w-6 h-6 bg-stone-200 rounded text-[10px] font-bold text-stone-500 flex items-center justify-center">{index + 1}</div>
              </div>
              <div className="space-y-4">
                <div>
                  <FieldLabel>問題 (Q)</FieldLabel>
                  <input {...register(`content.subItem.faqs.${index}.question`)} placeholder="問題 (Q)" className={InputClass} />
                </div>
                <div>
                  <FieldLabel>解答 (A)</FieldLabel>
                  <AdminMarkdownEditor {...register(`content.subItem.faqs.${index}.answer`)} placeholder="解答 (支援 Markdown)..." rows={4} className={InputClass} />
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-center mt-6 pt-4 border-t border-stone-200">
            <button type="button" onClick={() => appendFaq({ id: uuidv4(), question: '', answer: '' })} className={secondaryBtn}><Plus size={16}/> 新增問題</button>
          </div>
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
        <div className="mb-6 flex justify-between items-center border-b border-stone-200 pb-4">
          <PageMainTitle>關聯服務 (我們還提供)</PageMainTitle>
        </div>
        <div className="space-y-4">
          {additionalServices.length === 0 && (
            <div className="p-8 text-center bg-stone-50 rounded-2xl border-2 border-dashed border-stone-200">
              <LinkIcon className="mx-auto h-8 w-8 text-stone-300 mb-3" />
              <h3 className="text-sm font-bold text-stone-900 mb-1">尚未建立關聯服務</h3>
              <p className="text-xs text-stone-500 mb-4">點擊下方按鈕新增關聯服務。</p>
            </div>
          )}
          {additionalServices.map((pageId: string, index: number) => (
            <div key={index} className={innerCardClass}>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <FieldLabel>選擇關聯子項目</FieldLabel>
                  <select 
                    {...register(`content.subItem.additionalServices.${index}`)} 
                    className={InputClass}
                  >
                    <option value="">-- 請選取子項目 --</option>
                    {subItemPages.map((p: any) => (<option key={p.id} value={p.id}>{p.title}</option>))}
                  </select>
                </div>
                <button type="button" onClick={() => handleRemoveRelated(index)} className="mt-7 p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18}/></button>
              </div>
            </div>
          ))}

          <div className="flex justify-center mt-6 pt-4 border-t border-stone-200">
            <button type="button" onClick={handleAddRelated} className={secondaryBtn}><Plus size={16}/> 新增</button>
          </div>
        </div>
      </>
    );
  }

  if (activeTab === 'home_form') {
    return (
      <>
        <div className="mb-6 flex justify-between items-center border-b border-stone-200 pb-4">
          <PageMainTitle>頁尾表單設定</PageMainTitle>
        </div>
        <BlockContainer>
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
