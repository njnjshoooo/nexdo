import AdminMarkdownEditor from '../../../components/admin/AdminMarkdownEditor';
import ButtonEditor from '../../../components/admin/ButtonEditor';
import React, { useEffect, useMemo, useState } from 'react';
import { useFieldArray, Control, UseFormRegister, Controller } from 'react-hook-form';
import { Link } from 'react-router-dom';
import ImageUploader from '../../../components/admin/ImageUploader';
import { PageMainTitle, SectionTitle, BlockContainer, FieldLabel, InputClass, EditorCardHeader } from '../../../components/admin/ui/AdminEditorUI';
import { Plus, Trash2, Package, Users, CheckCircle2, List, Briefcase, Link as LinkIcon, Settings, AlertCircle, ChevronLeft, ChevronRight, LayoutTemplate, Eye, EyeOff, ArrowUp, ArrowDown } from 'lucide-react';
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

  const addHtmlCodeSection = () => {
    appendSection({
      id: uuidv4(),
      type: 'HTML_CODE',
      enabled: true,
      htmlCode: { html: '' }
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
              <EditorCardHeader
                index={index}
                canMoveUp={index > 0}
                canMoveDown={index < subPartners.length - 1}
                onMoveUp={() => movePartner(index, index - 1)}
                onMoveDown={() => movePartner(index, index + 1)}
                onDelete={() => removePartner(index)}
              />
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
              <EditorCardHeader
                index={index}
                canMoveUp={index > 0}
                canMoveDown={index < subCoreServices.length - 1}
                onMoveUp={() => moveCoreService(index, index - 1)}
                onMoveDown={() => moveCoreService(index, index + 1)}
                onDelete={() => removeCoreService(index)}
              />
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
      <>
        <div className="mb-6 flex justify-between items-center border-b border-stone-200 pb-4">
          <PageMainTitle>服務介紹</PageMainTitle>
        </div>
        <div className="mb-8">
          <div className="space-y-4">
            
            {introSections.length === 0 && (
              <div className="p-8 text-center bg-stone-50 rounded-2xl border-2 border-dashed border-stone-200">
                <LayoutTemplate className="mx-auto h-8 w-8 text-stone-300 mb-3" />
                <h3 className="text-stone-900 font-bold mb-1">尚未建立介紹區塊</h3>
                <p className="text-stone-500 text-sm mb-4">選擇下方適合的版型，開始豐富您的服務介紹內容。</p>
                <div className="flex flex-wrap gap-2 justify-center max-w-xl mx-auto">
                  <select 
                    className={inputClass + " max-w-xs text-center font-bold text-stone-700 bg-white transition-colors shadow-sm cursor-pointer"} 
                    onChange={(e) => {
                      const type = e.target.value;
                      if (!type) return;
                      const newBlock: any = { id: `block-${Date.now()}`, type, enabled: true };
                      // ... minimal init ...
                      if (type === 'GRID') newBlock.grid = { title: '服務項目', columns: 3, items: [{ id: Date.now().toString(), title: '項目名稱', image: '' }] };
                      if (type === 'HTML_CODE') newBlock.htmlCode = { html: '' };
                      appendSection(newBlock);
                      e.target.value = '';
                    }}
                  >
                    <option value="">➕ 選擇第一個小工具...</option>
                    <option value="GRID">多欄位卡片組</option>
                    <option value="FEATURE">大圖特色介紹</option>
                    <option value="COMPARISON">B/A 對比 (Before/After)</option>
                    <option value="TEXT_LIST">文字列表 (如常見問題)</option>
                    <option value="HTML_CODE">自訂 HTML</option>
                  </select>
                </div>
              </div>
            )}

            {introSections.map((field, index) => {
              const type = watch(`content.subItem.serviceIntro.sections.${index}.type`);
              const isEnabled = watch(`content.subItem.serviceIntro.sections.${index}.enabled`);
          const blockLabels: Record<string, string> = {
            'HERO_1': '滿版主視覺 (無按鈕)',
            'HERO_2': '滿版主視覺 (含按鈕)',
            'TEXT': '純文字段落',
            'GRID': '多欄位卡片組',
            'FORM': '嵌入表單',
            'SPACER': '空白間距',
            'SINGLE_IMAGE': '單張大圖',
            'IMAGE_TEXT_GRID': '左圖右文 / 右圖左文',
            'IMAGE_CAROUSEL': '圖片輪播',
            'FEATURE': '大圖特色介紹',
            'COMPARISON': 'B/A 對比 (Before/After)',
            'TEXT_LIST': '文字列表 (如常見問題)',
            'HTML_CODE': '自訂 HTML'
          };
              const displayLabel = blockLabels[type] || type;
              return (
                <div key={field.id} className={cardClass}>
                  <EditorCardHeader
                    index={index}
                    canMoveUp={index > 0}
                    canMoveDown={index < introSections.length - 1}
                    onMoveUp={() => moveSection(index, index - 1)}
                    onMoveDown={() => moveSection(index, index + 1)}
                    onDelete={() => removeSection(index)}
                    onToggleVisible={() => setValue(`content.subItem.serviceIntro.sections.${index}.enabled`, !isEnabled)}
                    isVisible={isEnabled !== false}
                    title={displayLabel}
                    badgeLabel={type}
                  />
                  {type === 'TEXT' && (
                    <div className="space-y-4">
                      <div>
                        <FieldLabel>文字內容</FieldLabel>
                        <AdminMarkdownEditor className={InputClass} {...register(`content.subItem.serviceIntro.sections.${index}.text.content`)} placeholder="輸入內容..."  />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <FieldLabel>字體大小</FieldLabel>
                          <select className={InputClass} {...register(`content.subItem.serviceIntro.sections.${index}.text.fontSize`)}>
                            <option value="heading">大標</option>
                            <option value="medium_heading">中標</option>
                            <option value="body">內文</option>
                          </select>
                        </div>
                        <div>
                          <FieldLabel>對齊方式</FieldLabel>
                          <select className={InputClass} {...register(`content.subItem.serviceIntro.sections.${index}.text.alignment`)}>
                            <option value="left">置左</option>
                            <option value="center">置中</option>
                            <option value="right">置右</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {type === 'HTML_CODE' && (
                    <div className="space-y-4">
                      <FieldLabel>HTML 程式碼</FieldLabel>
                      <textarea 
                        {...register(`content.subItem.serviceIntro.sections.${index}.htmlCode.html`)} 
                        placeholder="請貼上 HTML 程式碼..." 
                        rows={10} 
                        className={InputClass + " font-mono"} 
                      />
                    </div>
                  )}
                  {type === 'TEXT_LIST' && (
                    <div className="space-y-4">
                      <input {...register(`content.subItem.serviceIntro.sections.${index}.textList.title`)} placeholder="標題 (如：常見問題)" className={InputClass} />
                      <div className="space-y-2">
                        {(watch(`content.subItem.serviceIntro.sections.${index}.textList.items`) || []).map((_: any, idx: number) => (
                          <div key={idx} className="flex gap-2 items-start bg-stone-50 p-2 rounded-lg">
                            <div className="flex-1 space-y-2">
                              <input {...register(`content.subItem.serviceIntro.sections.${index}.textList.items.${idx}.title`)} placeholder="項目標題" className={InputClass} />
                              <textarea {...register(`content.subItem.serviceIntro.sections.${index}.textList.items.${idx}.text`)} placeholder="項目內容" rows={2} className={InputClass} />
                            </div>
                            <button type="button" onClick={() => {
                              const items = [...watch(`content.subItem.serviceIntro.sections.${index}.textList.items`)];
                              items.splice(idx, 1);
                              setValue(`content.subItem.serviceIntro.sections.${index}.textList.items`, items);
                            }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">刪除</button>
                          </div>
                        ))}
                        <button type="button" onClick={() => {
                          const items = watch(`content.subItem.serviceIntro.sections.${index}.textList.items`) || [];
                          setValue(`content.subItem.serviceIntro.sections.${index}.textList.items`, [...items, { id: Date.now().toString(), title: '', text: '' }]);
                        }} className="text-sm text-primary font-bold">+ 新增項目</button>
                      </div>
                    </div>
                  )}
                  {type === 'FEATURE' && (
                    <div className="space-y-4">
                      <input className={InputClass} {...register(`content.subItem.serviceIntro.sections.${index}.feature.title`)} placeholder="區塊標題" />
                      <FieldLabel>內容文字 (支援 Markdown)</FieldLabel>
                      <textarea className={InputClass} {...register(`content.subItem.serviceIntro.sections.${index}.feature.content`)} rows={4} />
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <FieldLabel>排版佈局</FieldLabel>
                          <select {...register(`content.subItem.serviceIntro.sections.${index}.feature.layout`)} className={InputClass}>
                            <option value="LEFT">左圖右文</option>
                            <option value="RIGHT">右圖左文</option>
                            <option value="TOP">上圖下文</option>
                            <option value="BOTTOM">下圖上文</option>
                            <option value="TEXT_ONLY">純文字</option>
                            <option value="IMAGE_ONLY">純圖片</option>
                          </select>
                        </div>
                        <div>
                          <FieldLabel>圖片填充方式</FieldLabel>
                          <select {...register(`content.subItem.serviceIntro.sections.${index}.feature.imageFit`)} className={InputClass}>
                            <option value="cover">填滿 (Cover)</option>
                            <option value="contain">包含 (Contain)</option>
                          </select>
                        </div>
                      </div>
                      <FieldLabel>圖片 (可多張)</FieldLabel>
                      <div className="space-y-2">
                        {(watch(`content.subItem.serviceIntro.sections.${index}.feature.images`) || []).map((img: string, idx: number) => (
                          <div key={idx} className="flex gap-2 items-center">
                            <div className="flex-1">
                              <Controller control={control} name={`content.subItem.serviceIntro.sections.${index}.feature.images.${idx}`} render={({ field }) => <ImageUploader value={field.value} onChange={field.onChange} />} />
                            </div>
                            <button type="button" onClick={() => {
                              const images = [...watch(`content.subItem.serviceIntro.sections.${index}.feature.images`)];
                              images.splice(idx, 1);
                              setValue(`content.subItem.serviceIntro.sections.${index}.feature.images`, images);
                            }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">刪除</button>
                          </div>
                        ))}
                        <button type="button" onClick={() => {
                          const images = watch(`content.subItem.serviceIntro.sections.${index}.feature.images`) || [];
                          setValue(`content.subItem.serviceIntro.sections.${index}.feature.images`, [...images, '']);
                        }} className="text-sm text-primary font-bold">+ 新增圖片</button>
                      </div>
                    </div>
                  )}
                  {type === 'COMPARISON' && (
                    <div className="space-y-4">
                      <input className={InputClass} {...register(`content.subItem.serviceIntro.sections.${index}.comparison.title`)} placeholder="標題" />
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <FieldLabel>Before 圖片</FieldLabel>
                          <Controller control={control} name={`content.subItem.serviceIntro.sections.${index}.comparison.beforeImage`} render={({ field }) => <ImageUploader value={field.value} onChange={field.onChange} />} />
                          <input className={InputClass + " mt-2"} {...register(`content.subItem.serviceIntro.sections.${index}.comparison.beforeLabel`)} placeholder="Before 標籤" />
                        </div>
                        <div>
                          <FieldLabel>After 圖片</FieldLabel>
                          <Controller control={control} name={`content.subItem.serviceIntro.sections.${index}.comparison.afterImage`} render={({ field }) => <ImageUploader value={field.value} onChange={field.onChange} />} />
                          <input className={InputClass + " mt-2"} {...register(`content.subItem.serviceIntro.sections.${index}.comparison.afterLabel`)} placeholder="After 標籤" />
                        </div>
                      </div>
                    </div>
                  )}
                  {type === 'HERO_1' && (
                    <div className="space-y-4">
                      <input className={InputClass} {...register(`content.subItem.serviceIntro.sections.${index}.hero1.title`)} placeholder="標題" />
                      <Controller control={control} name={`content.subItem.serviceIntro.sections.${index}.hero1.image`} render={({ field }) => <ImageUploader value={field.value} onChange={field.onChange} />} />
                    </div>
                  )}

                  {type === 'HERO_2' && (
                    <div className="space-y-4">
                      <div>
                        <FieldLabel>標題</FieldLabel>
                        <AdminMarkdownEditor className={InputClass} {...register(`content.subItem.serviceIntro.sections.${index}.hero2.title`)} rows={2} placeholder="標題" />
                      </div>
                      <div>
                        <FieldLabel>描述</FieldLabel>
                        <AdminMarkdownEditor className={InputClass} {...register(`content.subItem.serviceIntro.sections.${index}.hero2.description`)} rows={3} placeholder="描述" />
                      </div>
                      <div>
                        <FieldLabel>背景圖片</FieldLabel>
                        <Controller control={control} name={`content.subItem.serviceIntro.sections.${index}.hero2.backgroundImage`} render={({ field }) => <ImageUploader value={field.value} onChange={field.onChange} />} />
                      </div>
                      <div className="pt-4 border-t border-stone-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ButtonEditor control={control} register={register} name={`content.subItem.serviceIntro.sections.${index}.hero2.mainButton`} label="主按鈕設定" forms={forms} />
                        <ButtonEditor control={control} register={register} name={`content.subItem.serviceIntro.sections.${index}.hero2.secondaryButton`} label="次按鈕設定" forms={forms} />
                      </div>
                    </div>
                  )}

                  {type === 'FORM' && (
                    <select className={InputClass} {...register(`content.subItem.serviceIntro.sections.${index}.form.formId`)}>
                      <option value="">選擇表單...</option>
                      {forms?.map((f: any) => <option key={f.id} value={f.id}>{f.name}</option>)}
                    </select>
                  )}

                  {type === 'GRID' && (
                    <div className="space-y-4">
                      <div>
                        <FieldLabel>區塊標題</FieldLabel>
                        <input className={InputClass} {...register(`content.subItem.serviceIntro.sections.${index}.grid.title`)} placeholder="區塊標題" />
                      </div>
                      <div>
                        <FieldLabel>欄位數</FieldLabel>
                        <select className={InputClass} {...register(`content.subItem.serviceIntro.sections.${index}.grid.columns`, { valueAsNumber: true })}>
                          {[2,3,4,5,6].map(n => <option key={n} value={n}>{n} 欄</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <FieldLabel>項目</FieldLabel>
                        {(watch(`content.subItem.serviceIntro.sections.${index}.grid.items`) || []).map((_: any, itemIndex: number) => (
                          <div key={itemIndex} className={innerCardClass}>
                            <FieldLabel>標題</FieldLabel>
                            <input className={InputClass} {...register(`content.subItem.serviceIntro.sections.${index}.grid.items.${itemIndex}.title`)} placeholder="標題"  />
                            <FieldLabel>圖片</FieldLabel>
                            <Controller control={control} name={`content.subItem.serviceIntro.sections.${index}.grid.items.${itemIndex}.image`} render={({ field }) => <ImageUploader value={field.value} onChange={field.onChange} />} />
                            <label className="flex items-center gap-2 mb-2">
                              <input type="checkbox" {...register(`content.subItem.serviceIntro.sections.${index}.grid.items.${itemIndex}.showImage`)} />
                              <span className="block text-sm font-medium text-stone-700 mb-0">顯示圖片</span>
                            </label>
                            <FieldLabel>描述</FieldLabel>
                            <AdminMarkdownEditor className={InputClass} {...register(`content.subItem.serviceIntro.sections.${index}.grid.items.${itemIndex}.description`)} placeholder="描述"  />
                            <FieldLabel>連結 (選填)</FieldLabel>
                            <input className={InputClass} {...register(`content.subItem.serviceIntro.sections.${index}.grid.items.${itemIndex}.link`)} placeholder="https://..." />
                          </div>
                        ))}
                        <button className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-sm" type="button" onClick={() => {
                          const items = watch(`content.subItem.serviceIntro.sections.${index}.grid.items`) || [];
                          setValue(`content.subItem.serviceIntro.sections.${index}.grid.items`, [...items, { title: '', image: '', showImage: true, description: '', link: '' }]);
                        }}>+ 新增項目</button>
                      </div>
                    </div>
                  )}

                  {type === 'SPACER' && (
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-bold text-stone-500">高度:</span>
                      <input className={InputClass} type="number" {...register(`content.subItem.serviceIntro.sections.${index}.spacer.height`, { valueAsNumber: true })}  />
                      <span className="text-xs text-stone-400">px</span>
                    </div>
                  )}

                  {type === 'SINGLE_IMAGE' && (
                    <div className="space-y-4">
                      <FieldLabel>圖片</FieldLabel>
                      <Controller control={control} name={`content.subItem.serviceIntro.sections.${index}.singleImage.image`} render={({ field }) => <ImageUploader value={field.value} onChange={field.onChange} />} />
                      <input className={InputClass} {...register(`content.subItem.serviceIntro.sections.${index}.singleImage.caption`)} placeholder="圖片說明" />
                    </div>
                  )}

                  {type === 'IMAGE_CAROUSEL' && (
                    <div className="space-y-4">
                      <FieldLabel>圖片輪播設定</FieldLabel>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {(watch(`content.subItem.serviceIntro.sections.${index}.imageCarousel.items`) || []).map((_: any, itemIndex: number) => (
                          <div key={itemIndex} className="relative group border border-stone-200 rounded-xl overflow-hidden bg-white shadow-sm flex flex-col p-3 gap-3">
                            <Controller control={control} name={`content.subItem.serviceIntro.sections.${index}.imageCarousel.items.${itemIndex}.image`} render={({ field }) => <div className="aspect-video w-full"><ImageUploader value={field.value} onChange={field.onChange} /></div>} />
                            <input className={InputClass + " w-full text-sm"} {...register(`content.subItem.serviceIntro.sections.${index}.imageCarousel.items.${itemIndex}.alt`)} placeholder="輸入說明文字..." />
                            <button type="button" onClick={() => {
                              const items = watch(`content.subItem.serviceIntro.sections.${index}.imageCarousel.items`) || [];
                              setValue(`content.subItem.serviceIntro.sections.${index}.imageCarousel.items`, items.filter((_: any, i: number) => i !== itemIndex));
                            }} className="absolute top-4 right-4 bg-white/90 shadow-sm p-1.5 rounded-lg text-stone-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all z-10"><Trash2 size={16}/></button>
                          </div>
                        ))}
                      </div>
                      <button className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-sm" type="button" onClick={() => {
                        const items = watch(`content.subItem.serviceIntro.sections.${index}.imageCarousel.items`) || [];
                        setValue(`content.subItem.serviceIntro.sections.${index}.imageCarousel.items`, [...items, { image: '', alt: '' }]);
                      }}>+ 新增圖片</button>
                    </div>
                  )}

                  {type === 'IMAGE_TEXT_GRID' && (
                    <div className="space-y-4">
                      <div>
                        <FieldLabel>佈局</FieldLabel>
                        <select className={InputClass} {...register(`content.subItem.serviceIntro.sections.${index}.imageTextGrid.layout`)}>
                          <option value="imageLeft">圖片左</option>
                          <option value="imageRight">圖片右 </option>
                        </select>
                      </div>
                      <div>
                        <FieldLabel>圖片</FieldLabel>
                        <Controller control={control} name={`content.subItem.serviceIntro.sections.${index}.imageTextGrid.image`} render={({ field }) => <ImageUploader value={field.value} onChange={field.onChange} />} />
                      </div>
                      <div>
                        <FieldLabel>標題</FieldLabel>
                        <input className={InputClass} {...register(`content.subItem.serviceIntro.sections.${index}.imageTextGrid.title`)} placeholder="標題" />
                      </div>
                      <div>
                        <FieldLabel>內容 (Markdown)</FieldLabel>
                        <AdminMarkdownEditor className={InputClass} {...register(`content.subItem.serviceIntro.sections.${index}.imageTextGrid.content`)} placeholder="內容 (Markdown)"  />
                      </div>
                      <div>
                        <FieldLabel>按鈕文字</FieldLabel>
                        <input className={InputClass} {...register(`content.subItem.serviceIntro.sections.${index}.imageTextGrid.cta.text`)} placeholder="按鈕文字" />
                      </div>
                      <div>
                        <FieldLabel>按鈕連結</FieldLabel>
                        <input className={InputClass} {...register(`content.subItem.serviceIntro.sections.${index}.imageTextGrid.cta.link`)} placeholder="按鈕連結" />
                      </div>
                    </div>
                  )}


                </div>
              );
            })}
            
            {introSections.length > 0 && (
              <div className="flex justify-center mt-6 pt-6 border-t border-stone-200">
                <select 
                  className={inputClass + " max-w-xs text-center font-bold text-stone-700 bg-stone-50 transition-colors shadow-sm cursor-pointer"} 
                  onChange={(e) => {
                    const type = e.target.value;
                    if (!type) return;
                    
                    const newBlock: any = { id: `block-${Date.now()}`, type, enabled: true };
                    if (type === 'HERO_1') newBlock.hero1 = { title: '', image: '' };
                    if (type === 'HERO_2') newBlock.hero2 = { 
                      title: '', 
                      description: '', 
                      backgroundImage: '', 
                      mainButton: { text: '預約諮詢', type: 'FORM', value: '', isVisible: true },
                      secondaryButton: { text: '查看案例', type: 'URL', value: '#cases', isVisible: true }
                    };
                    if (type === 'TEXT') newBlock.text = { content: '', alignment: 'left', fontSize: 'body' };
                    if (type === 'GRID') newBlock.grid = { title: '服務項目', columns: 3, items: [{ id: Date.now().toString(), title: '項目名稱', image: '' }] };
                    if (type === 'SPACER') newBlock.spacer = { height: 80 };
                    if (type === 'FORM') newBlock.form = { formId: '' };
                    if (type === 'SINGLE_IMAGE') newBlock.singleImage = { image: '', caption: '' };
                    if (type === 'IMAGE_CAROUSEL') newBlock.imageCarousel = { items: [] };
                    if (type === 'IMAGE_TEXT_GRID') newBlock.imageTextGrid = { layout: 'imageLeft', image: '', title: '', content: '', cta: { text: '', link: '' } };
                    if (type === 'FEATURE') newBlock.feature = { title: '', showCarousel: true, images: [], content: '', layout: 'LEFT', imageFit: 'cover' };
                    if (type === 'COMPARISON') newBlock.comparison = { title: '', beforeImage: '', afterImage: '', beforeLabel: 'Before', afterLabel: 'After' };
                    if (type === 'TEXT_LIST') newBlock.textList = { title: '', items: [] };
                    if (type === 'HTML_CODE') newBlock.htmlCode = { html: '' };

                    appendSection(newBlock);
                    e.target.value = '';
                  }}
                >
                  <option value="">➕ 新增小工具...</option>
                  <option value="HERO_1">滿版主視覺 (無按鈕)</option>
                  <option value="HERO_2">滿版主視覺 (含按鈕)</option>
                  <option value="TEXT">純文字段落</option>
                  <option value="GRID">多欄位卡片組</option>
                  <option value="FORM">嵌入表單</option>
                  <option value="SPACER">空白間距</option>
                  <option value="SINGLE_IMAGE">單張大圖</option>
                  <option value="IMAGE_CAROUSEL">圖片輪播</option>
                  <option value="IMAGE_TEXT_GRID">左圖右文 / 右圖左文</option>
                  <option value="FEATURE">大圖特色介紹</option>
                  <option value="COMPARISON">B/A 對比 (Before/After)</option>
                  <option value="TEXT_LIST">文字列表 (如常見問題)</option>
                  <option value="HTML_CODE">自訂 HTML</option>
                </select>
              </div>
            )}

          </div>
        </div>
      </>
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
              <h3 className="text-stone-900 font-bold mb-1">尚未建立真實案例</h3>
              <p className="text-stone-500 text-sm mb-4">新增客戶的成功案例或實際成果，增加服務說服力。</p>
              <button type="button" onClick={() => appendCase({ id: `case-${Date.now()}`, title: '', description: '', image: '', tag: '' })} className={primaryBtn}>建立第一個案例</button>
            </div>
          )}
          {subCases.map((field, index) => (
            <div key={field.id} className={cardClass}>
              <EditorCardHeader
                index={index}
                canMoveUp={index > 0}
                canMoveDown={index < subCases.length - 1}
                onMoveUp={() => moveCase(index, index - 1)}
                onMoveDown={() => moveCase(index, index + 1)}
                onDelete={() => removeCase(index)}
                title={watch(`content.subItem.cases.${index}.title`) || '新案例'}
                badgeLabel="真實案例"
              />
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>標籤 (例如：電子商務、企業官網)</label>
                  <input {...register(`content.subItem.cases.${index}.tag`)} className={inputClass} placeholder="選填" />
                </div>
                <div>
                  <label className={labelClass}>案例標題 *</label>
                  <input {...register(`content.subItem.cases.${index}.title`)} className={inputClass} placeholder="輸入吸引人的標題" />
                </div>
                <div>
                  <label className={labelClass}>案例說明</label>
                  <textarea {...register(`content.subItem.cases.${index}.description`)} rows={3} className={inputClass} placeholder="描述專案成果或亮點..." />
                </div>
                <div>
                  <label className={labelClass}>代表圖片</label>
                  <Controller control={control} name={`content.subItem.cases.${index}.image`} render={({ field }) => <ImageUploader value={field.value} onChange={field.onChange} />} />
                </div>
              </div>
            </div>
          ))}
          {subCases.length > 0 && (
            <div className="flex justify-center mt-6 pt-4 border-t border-stone-200">
              <button type="button" onClick={() => appendCase({ id: `case-${Date.now()}`, title: '', description: '', image: '', tag: '' })} className={secondaryBtn}><Plus size={16}/> 新增案例</button>
            </div>
          )}
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
              <EditorCardHeader
                index={index}
                canMoveUp={index > 0}
                canMoveDown={index < subFaqs.length - 1}
                onMoveUp={() => moveFaq(index, index - 1)}
                onMoveDown={() => moveFaq(index, index + 1)}
                onDelete={() => removeFaq(index)}
              />
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
