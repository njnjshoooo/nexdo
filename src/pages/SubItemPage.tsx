import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { pageService } from '../services/pageService';
import { formService } from '../services/formService';
import { productService } from '../services/productService';
import { Page, Product } from '../types/admin';
import { ArrowRight, CheckCircle2, ChevronLeft, ChevronRight, Check, ChevronDown, Package, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import useEmblaCarousel from 'embla-carousel-react';
import Markdown from 'react-markdown';
import DynamicForm from '../components/form/DynamicForm';
import { useCart } from '../contexts/CartContext';
import ServiceCarousel from '../components/ServiceCarousel';

export default function SubItemPage({ page: propPage }: { page?: Page | null }) {
  const { slug, category } = useParams<{ slug: string, category: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  // 1. 直接判斷：決定要顯示哪一頁
  let currentSlug = slug || 'home';
  if (!slug && location.pathname !== '/') {
    currentSlug = location.pathname.replace(/^\//, '');
  }
  
  const fullSlug = category ? `${category}/${currentSlug}` : currentSlug;
  const currentPage = propPage || pageService.getBySlug(fullSlug);

  // 2. 避免白屏：如果真的找不到資料，顯示錯誤提示
  if (!currentPage || !currentPage.content.subItem) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4 bg-stone-50">
        <h1 className="text-2xl font-bold text-stone-900">找不到頁面</h1>
        <p className="text-stone-500">此頁面可能尚未建立或路徑不正確 (Slug: {currentSlug})。</p>
        <a href="/" className="px-6 py-2 bg-stone-800 text-white rounded-lg hover:bg-stone-700 transition-colors">
          回到首頁
        </a>
      </div>
    );
  }

  const { subItem, showForm, formId } = currentPage.content;
  const selectedForm = formId ? formService.getById(formId) : null;

  const productInfoRef = useRef<HTMLDivElement>(null);
  
  // Embla for Real Cases on Mobile
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    breakpoints: {
      '(min-width: 768px)': { active: false }
    }
  });

  // Fetch product data using productId
  const [productData, setProductData] = useState<Product | null>(null);

  useEffect(() => {
    if (!subItem.productId) {
      setProductData(null);
      return;
    }
    let cancelled = false;
    const fetchProduct = async () => {
      // 第一次：先從本地快取取（可能 null）
      const cached = await productService.getById(subItem.productId!);
      if (!cancelled && cached) setProductData(cached);
      // 第二次：強制從 Supabase 拉最新（避免快取沒有剛建立的產品）
      await productService.refresh();
      const fresh = await productService.getById(subItem.productId!);
      if (!cancelled) setProductData(fresh ?? null);
    };
    fetchProduct();
    // 監聽 productService 的 refresh 完成事件，自動重抓對應產品
    const handleRefresh = async () => {
      if (cancelled) return;
      const fresh = await productService.getById(subItem.productId!);
      if (!cancelled) setProductData(fresh ?? null);
    };
    window.addEventListener('products_refreshed', handleRefresh);
    return () => {
      cancelled = true;
      window.removeEventListener('products_refreshed', handleRefresh);
    };
  }, [subItem.productId]);

  const orderMode = productData?.orderMode;
  const fixedConfig = productData?.fixedConfig;
  const internalFormConfig = productData?.internalFormConfig;
  const externalLinkConfig = productData?.externalLinkConfig;

  // 處理錨點捲動
  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, link?: string, type?: string) => {
    if (type === 'FORM') {
      e.preventDefault();
      const form = formService.getById(link || '');
      if (form) {
        const element = document.getElementById(form.formId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          return;
        }
      }
    }

    if (link?.startsWith('#')) {
      e.preventDefault();
      const element = document.getElementById(link.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // New state for variants and field toggles
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [expectedDate1, setExpectedDate1] = useState('');
  const [expectedDate2, setExpectedDate2] = useState('');
  const [expectedDate3, setExpectedDate3] = useState('');
  const [expectedTime, setExpectedTime] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  // Calculate min date (today + 4 days)
  const getMinDate = () => {
    const today = new Date();
    const minDate = new Date(today);
    minDate.setDate(today.getDate() + 4);
    return minDate.toISOString().split('T')[0];
  };

  const minDate = getMinDate();

  const handleAddToCart = () => {
    if (orderMode === 'FIXED' && productData) {
      // Validate required fields
      if (productData.requireDate) {
        if (!expectedDate1 || !expectedDate2 || !expectedDate3) {
          alert('請填寫三個期望日期');
          return;
        }

        // Validate buffer period (min 4 days)
        const dates = [expectedDate1, expectedDate2, expectedDate3];
        const invalidDate = dates.find(d => d < minDate);
        if (invalidDate) {
          alert('為確保媒合品質，請選擇 4 天後的日期');
          return;
        }

        // Validate mutual exclusion
        const uniqueDates = new Set(dates);
        if (uniqueDates.size !== 3) {
          alert('三個期望日期不可重複，請選擇不同的日期');
          return;
        }
      }
      if (productData.requireTime && expectedTime.length === 0) {
        alert('請選擇期望時段');
        return;
      }

      const combinedDates = [expectedDate1, expectedDate2, expectedDate3].filter(Boolean).join(', ');

      const selectedVariant = productData.variants?.find(v => v.id === selectedVariantId);
      const finalPrice = selectedVariant ? (fixedConfig?.price || 0) + selectedVariant.price : (fixedConfig?.price || 0);
      const finalUnit = selectedVariant ? selectedVariant.unit : (fixedConfig?.unit || '');
      const finalName = selectedVariant ? `${productData.name} - ${selectedVariant.name}` : productData.name;

      addToCart({
        pageId: currentPage.id,
        name: finalName,
        price: finalPrice,
        unit: finalUnit,
        image: productData.image || '',
        expectedDates: productData.requireDate ? combinedDates : undefined,
        expectedTime: productData.requireTime ? expectedTime.join(', ') : undefined,
        notes: productData.requireNotes ? notes : undefined,
        selectedVariant
      });
      navigate('/cart');
    }
  };

  // 3. 直接計算相關服務
  const relatedPages = subItem.additionalServices
    ? subItem.additionalServices
        .map(id => pageService.getById(id))
        .filter((p): p is Page => !!p && p.template === 'SUB_ITEM')
    : [];

  // Related products state
  const [relatedProducts, setRelatedProducts] = useState<Record<string, Product>>({});

  useEffect(() => {
    if (relatedPages.length > 0) {
      relatedPages.forEach(page => {
        const productId = page.content.subItem?.productId;
        if (productId && !relatedProducts[productId]) {
          productService.getById(productId).then(product => {
            if (product) {
              setRelatedProducts(prev => ({ ...prev, [productId]: product }));
            }
          });
        }
      });
    }
  }, [relatedPages]);

  return (
    <div className="min-h-screen bg-stone-50 pt-20 pb-20">
      <div className="max-w-[1280px] mx-auto px-0 lg:px-6 xl:px-4">
        <div className="flex flex-col lg:flex-row gap-0 lg:gap-10 xl:gap-12">
          
          {/* Product Info Column (Top on Mobile, Right on Desktop) */}
          <div className="lg:w-[280px] xl:w-[300px] flex-shrink-0 order-1 lg:order-2 lg:sticky lg:top-24 self-start flex flex-col max-h-[calc(100vh-6rem)] bg-white rounded-none lg:rounded-3xl shadow-sm lg:shadow-lg border-b lg:border border-stone-200 lg:border-stone-100 overflow-hidden" ref={productInfoRef}>
            
            {/* Scrollable Content Area */}
            <div className="p-0 md:p-8 overflow-y-auto scrollbar-hide flex-1 pb-4">
              <div className="mb-2">
                {/* Product Gallery / Main Image */}
                <div className="mb-6 md:mb-6">
                  {productData?.images && productData.images.length > 0 ? (
                    <ProductGallery 
                      images={[productData.image, ...productData.images].filter((img): img is string => !!img)} 
                      aspectClass="aspect-[2/1] md:aspect-video"
                      roundedClass="rounded-none md:rounded-2xl"
                    />
                  ) : productData?.image ? (
                    <div className="md:rounded-2xl overflow-hidden aspect-[2/1] md:aspect-video">
                      <img 
                        src={productData.image || undefined} 
                        alt={productData.name} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ) : null}
                </div>
                <div className="px-5 md:px-0">
                  <div className="flex items-center gap-2 mb-3 md:mb-4">
                    <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] md:text-xs font-bold">
                      熱門服務
                    </span>
                  </div>
                  <h1 className="text-xl md:text-2xl font-extrabold text-stone-900 mb-2 md:mb-3 leading-tight tracking-tight text-left">
                    {productData?.name || currentPage.title}
                  </h1>
                  
                  {/* Price/Quote Display */}
                  <div className="mb-4 md:mb-5">
                    {orderMode === 'FIXED' ? (
                      <div className="flex items-baseline gap-1">
                        <span className="text-[10px] md:text-xs font-bold text-stone-400">NT$</span>
                        <span className="text-xl md:text-2xl font-black text-primary">
                          {((fixedConfig?.price || 0) + (productData?.variants?.find(v => v.id === selectedVariantId)?.price || 0)).toLocaleString()}
                        </span>
                        <span className="text-[10px] md:text-xs font-bold text-stone-400">
                          / {productData?.variants?.find(v => v.id === selectedVariantId)?.unit || fixedConfig?.unit || '次'}
                        </span>
                      </div>
                    ) : orderMode === 'INTERNAL_FORM' ? (
                      <div className="text-lg md:text-xl font-bold text-primary">
                        {internalFormConfig?.priceText || '依需求報價'}
                      </div>
                    ) : (
                      <div className="text-lg md:text-xl font-bold text-primary">
                        {externalLinkConfig?.priceText || '依需求報價'}
                      </div>
                    )}
                  </div>

                  <p className="text-stone-600 text-xs md:text-sm leading-relaxed mb-4 md:mb-5 line-clamp-3 md:line-clamp-none">
                    {productData?.description}
                  </p>

                {productData?.checklist && productData.checklist.length > 0 && (
                  <ul className="space-y-2 md:space-y-2.5 mb-6 md:mb-6">
                    {productData.checklist.map((item: any, index: number) => (
                      <li key={index} className="flex items-start gap-2 md:gap-3">
                        <CheckCircle2 className="text-[#5C704A] w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0 mt-0.5" />
                        <span className="text-stone-700 text-xs md:text-sm font-medium">{item.text}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Variants Selection */}
                {orderMode === 'FIXED' && productData?.variants && productData.variants.length > 0 && (
                  <div className="mb-6 space-y-3">
                    <h3 className="text-xs font-bold text-stone-900">選擇方案</h3>
                    <div className="space-y-2">
                      <label className={`flex items-start gap-3 p-3 md:p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedVariantId === '' ? 'border-primary bg-primary/5' : 'border-stone-100 hover:border-stone-200'}`}>
                        <input 
                          type="radio" 
                          name="variant" 
                          checked={selectedVariantId === ''}
                          onChange={() => setSelectedVariantId('')}
                          className="mt-0.5 w-3.5 h-3.5 md:w-4 md:h-4 text-primary focus:ring-primary border-stone-300"
                        />
                        <div>
                          <p className="text-xs md:text-sm font-bold text-stone-900">標準方案</p>
                          <p className="text-[10px] md:text-xs text-stone-500 mt-1">基本服務內容</p>
                        </div>
                      </label>
                      {productData.variants.map(variant => (
                        <label key={variant.id} className={`flex items-start gap-3 p-3 md:p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedVariantId === variant.id ? 'border-primary bg-primary/5' : 'border-stone-100 hover:border-stone-200'}`}>
                          <input 
                            type="radio" 
                            name="variant" 
                            checked={selectedVariantId === variant.id}
                            onChange={() => setSelectedVariantId(variant.id)}
                            className="mt-0.5 w-3.5 h-3.5 md:w-4 md:h-4 text-primary focus:ring-primary border-stone-300"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-xs md:text-sm font-bold text-stone-900">{variant.name}</p>
                              <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                +NT$ {variant.price.toLocaleString()}
                              </span>
                            </div>
                            {variant.description && (
                              <p className="text-[10px] md:text-xs text-stone-500 mt-1">{variant.description}</p>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Field Toggles */}
                {orderMode === 'FIXED' && (productData?.requireDate || productData?.requireTime || productData?.requireNotes) && (
                  <div className="mb-6 space-y-4 p-4 md:p-5 bg-stone-50 rounded-2xl border border-stone-100">
                    <h3 className="text-xs font-bold text-stone-900 mb-2">需求資訊</h3>
                    {productData.requireDate && (
                      <div className="space-y-2 md:space-y-3">
                        <label className="block text-[10px] md:text-xs font-bold text-stone-600 mb-1">期望日期（請選三個） <span className="text-red-500">*</span></label>
                        <div className="grid grid-cols-1 gap-2">
                          <input 
                            type="date" 
                            value={expectedDate1}
                            min={minDate}
                            onChange={(e) => setExpectedDate1(e.target.value)}
                            className="w-full px-3 py-1.5 md:px-4 md:py-2 bg-white border border-stone-200 rounded-lg text-xs md:text-sm focus:ring-2 focus:ring-primary/20 outline-none disabled:bg-stone-100 disabled:text-stone-400"
                          />
                          <input 
                            type="date" 
                            value={expectedDate2}
                            min={minDate}
                            onChange={(e) => setExpectedDate2(e.target.value)}
                            className="w-full px-3 py-1.5 md:px-4 md:py-2 bg-white border border-stone-200 rounded-lg text-xs md:text-sm focus:ring-2 focus:ring-primary/20 outline-none disabled:bg-stone-100 disabled:text-stone-400"
                          />
                          <input 
                            type="date" 
                            value={expectedDate3}
                            min={minDate}
                            onChange={(e) => setExpectedDate3(e.target.value)}
                            className="w-full px-3 py-1.5 md:px-4 md:py-2 bg-white border border-stone-200 rounded-lg text-xs md:text-sm focus:ring-2 focus:ring-primary/20 outline-none disabled:bg-stone-100 disabled:text-stone-400"
                          />
                        </div>
                        <p className="text-[10px] text-stone-400 mt-1">* 為確保媒合品質，請選擇 4 天後的日期</p>
                      </div>
                    )}
                    {productData.requireTime && (
                      <div className="space-y-2">
                        <label className="block text-[10px] md:text-xs font-bold text-stone-600 mb-1">期望時段 (可多選) <span className="text-red-500">*</span></label>
                        <div className="flex flex-col gap-2">
                          <label className={`flex items-center gap-2 p-2.5 md:p-3 rounded-xl border cursor-pointer transition-all ${expectedTime.includes('9:00~12:00') ? 'border-primary bg-primary/5' : 'border-stone-100 hover:border-stone-200'}`}>
                            <input 
                              type="checkbox" 
                              name="expectedTime" 
                              value="9:00~12:00" 
                              checked={expectedTime.includes('9:00~12:00')}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setExpectedTime(prev => [...prev, '9:00~12:00']);
                                } else {
                                  setExpectedTime(prev => prev.filter(t => t !== '9:00~12:00'));
                                }
                              }}
                              className="hidden" 
                            />
                            <div className={`w-3.5 h-3.5 md:w-4 md:h-4 rounded border flex items-center justify-center ${expectedTime.includes('9:00~12:00') ? 'border-primary bg-primary' : 'border-stone-300'}`}>
                              {expectedTime.includes('9:00~12:00') && <Check size={12} className="text-white" />}
                            </div>
                            <span className="text-xs md:text-sm text-stone-700">9:00~12:00</span>
                          </label>
                          <label className={`flex items-center gap-2 p-2.5 md:p-3 rounded-xl border cursor-pointer transition-all ${expectedTime.includes('13:00~18:00') ? 'border-primary bg-primary/5' : 'border-stone-100 hover:border-stone-200'}`}>
                            <input 
                              type="checkbox" 
                              name="expectedTime" 
                              value="13:00~18:00" 
                              checked={expectedTime.includes('13:00~18:00')}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setExpectedTime(prev => [...prev, '13:00~18:00']);
                                } else {
                                  setExpectedTime(prev => prev.filter(t => t !== '13:00~18:00'));
                                }
                              }}
                              className="hidden" 
                            />
                            <div className={`w-3.5 h-3.5 md:w-4 md:h-4 rounded border flex items-center justify-center ${expectedTime.includes('13:00~18:00') ? 'border-primary bg-primary' : 'border-stone-300'}`}>
                              {expectedTime.includes('13:00~18:00') && <Check size={12} className="text-white" />}
                            </div>
                            <span className="text-xs md:text-sm text-stone-700">13:00~18:00</span>
                          </label>
                        </div>
                      </div>
                    )}
                    {productData.requireNotes && (
                      <div>
                        <label className="block text-[10px] md:text-xs font-bold text-stone-600 mb-1">備註需求</label>
                        <textarea 
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="請填寫其他需求或備註事項"
                          rows={3}
                          className="w-full px-3 py-1.5 md:px-4 md:py-2 bg-white border border-stone-200 rounded-lg text-xs md:text-sm focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                        />
                      </div>
                    )}
                  </div>
                )}
                </div>
              </div>
            </div>

            {/* Sticky CTA Area at Bottom (Desktop Only) */}
            <div className="hidden lg:block p-5 md:p-6 pt-4 border-t border-stone-100 bg-white shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)] shrink-0 relative z-20">
              {/* CTA 顯示條件：有連動產品時必顯示，或者頁面自己有設 isVisible=true */}
              {(productData || subItem.button?.isVisible) && (
                <button
                  onClick={() => {
                    // Prioritize subItem.button if it's set to something specific
                    if (subItem.button?.type === 'FORM' && subItem.button?.value) {
                      const form = formService.getById(subItem.button.value) || formService.getByFormId(subItem.button.value);
                      if (form) {
                        navigate(`/forms/${form.formId || form.id}`);
                        return;
                      }
                    } else if (subItem.button?.type === 'URL' && subItem.button?.value) {
                      if (subItem.button.value.startsWith('http')) {
                        window.open(subItem.button.value, '_blank');
                      } else {
                        // Handle internal anchor or path
                        const target = document.querySelector(subItem.button.value);
                        if (target) {
                          target.scrollIntoView({ behavior: 'smooth' });
                        } else {
                          navigate(subItem.button.value);
                        }
                      }
                      return;
                    }

                    // Fallback to product-based logic
                    if (orderMode === 'FIXED') {
                      handleAddToCart();
                    } else if (orderMode === 'INTERNAL_FORM') {
                      if (internalFormConfig?.formId) {
                        const form = formService.getById(internalFormConfig.formId) || formService.getByFormId(internalFormConfig.formId);
                        if (form) {
                          navigate(`/forms/${form.formId || form.id}`);
                        }
                      }
                    } else if (orderMode === 'EXTERNAL_LINK') {
                      if (externalLinkConfig?.url) {
                        window.open(externalLinkConfig.url, '_blank');
                      } else {
                        // Default scroll to footer form
                        const footerForm = document.getElementById('booking-form');
                        if (footerForm) {
                          footerForm.scrollIntoView({ behavior: 'smooth' });
                        }
                      }
                    }
                  }}
                  className="block w-full bg-[#885200] hover:bg-[#663D00] text-white text-center font-bold py-3 md:py-3.5 text-sm md:text-base rounded-xl transition-colors shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transform hover:-translate-y-0.5 transition-all"
                >
                  {/* 按鈕文字優先順序：1. 產品設定的按鈕文字 2. 頁面設定的按鈕文字 3. 預設文字 */}
                  {(orderMode === 'FIXED' ? fixedConfig?.buttonText : (orderMode === 'INTERNAL_FORM' ? internalFormConfig?.buttonText : externalLinkConfig?.buttonText)) || subItem.button?.text || '立即預約'}
                </button>
              )}
              <div className="pt-2 md:pt-3">
                <p className="text-[10px] md:text-xs text-stone-500 text-center flex flex-col gap-0.5 md:gap-1">
                  <span>有任何疑問？歡迎直接聯繫我們</span>
                  <a href="tel:02-7755-0920" className="font-bold hover:text-primary transition-colors">或撥打：02-7755-0920</a>
                </p>
              </div>
            </div>

          </div>

          {/* Content Column (Bottom on Mobile, Left on Desktop) */}
          <div className="flex-1 space-y-16 md:space-y-20 order-2 lg:order-1 min-w-0 px-4 lg:px-0 mt-8 lg:mt-0">

            {/* Product/Service Main Title */}
            {(subItem.mainTitle || subItem.coreServicesSectionTitle) && (
              <div className="pb-6 border-b-2 border-stone-100 mt-8 mb-12 relative">
                <h2 className="text-4xl md:text-5xl font-extrabold text-stone-900 tracking-tight text-left leading-tight">
                  {subItem.mainTitle || subItem.coreServicesSectionTitle}
                </h2>
                <div className="absolute bottom-[-2px] left-0 w-24 h-[2px] bg-primary"></div>
              </div>
            )}

            {/* Service Introduction Module */}
            {(subItem.serviceIntro?.sections || subItem.serviceIntro?.blockA?.enabled || subItem.serviceIntro?.blockB?.enabled || subItem.serviceIntro?.blockC?.enabled) && (
              <div className="space-y-16 md:space-y-20">
                {/* Dynamic Sections */}
                {subItem.serviceIntro?.sections?.map((section, sectionIdx) => {
                  const isFirstBlock = sectionIdx === 0;
                  return (
                    <div key={section.id || sectionIdx}>
                      {(() => {
                      switch (section.type) {
                                case 'HERO_1':
                                  return (
                                    <section key={section.id} id={section.id} className={`relative pt-24 pb-16 md:pt-20 md:pb-16 overflow-hidden bg-[#FFF9F2] ${isFirstBlock ? 'mt-20' : ''}`}>
                                      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                                          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                                            <h1 className="text-4xl md:text-5xl font-bold leading-tight text-stone-900 whitespace-pre-line">
                                              {section.hero1?.title}
                                            </h1>
                                            <div className="flex flex-col gap-4">
                                              {section.hero1?.buttons?.map((btn, i) => (
                                                <a key={i} href={btn.link} onClick={(e) => handleAnchorClick(e, btn.link)} className="inline-flex items-center justify-between border-b border-stone-200 pb-3 text-stone-600 hover:text-primary hover:border-primary transition-colors group">
                                                  <span className="text-lg font-bold">{btn.text}</span>
                                                  <ArrowUpRight className="w-5 h-5 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                                                </a>
                                              ))}
                                            </div>
                                          </motion.div>
                                          <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[3/2]">
                                            <img src={section.hero1?.image || undefined} alt="" className="w-full h-full object-cover" />
                                          </div>
                                        </div>
                                      </div>
                                    </section>
                                  );
                      
                                case 'SECONDARY_SERVICES':
                                  return (
                                    <section key={section.id} id={section.id} className="py-24 bg-white">
                                      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                                          {section.secondaryServices?.map((service, i) => {
                                            const targetPage = pageService.getById(service.pageId) || pageService.getBySlug(service.pageId);
                                            return (
                                              <motion.div 
                                                key={i}
                                                initial={{ opacity: 0, y: 20 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ delay: i * 0.1 }}
                                                className="group cursor-pointer"
                                                onClick={() => targetPage && navigate(`/${targetPage.slug}`)}
                                              >
                                                <div className="relative aspect-[4/3] rounded-3xl overflow-hidden mb-6 shadow-lg">
                                                  <img src={service.image || undefined} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                                                </div>
                                                <div className="flex flex-wrap gap-2 mb-4">
                                                  {service.tags.map((tag, j) => (
                                                    <span key={j} className="text-xs font-bold text-primary bg-primary/5 px-2 py-1 rounded-full">{tag}</span>
                                                  ))}
                                                </div>
                                                <p className="text-stone-600 mb-6 leading-relaxed">{service.description}</p>
                                                <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100">
                                                  <p className="text-stone-500 text-sm italic mb-2">「{service.testimonial.text}」</p>
                                                  <p className="text-stone-400 text-xs">— {service.testimonial.author}</p>
                                                </div>
                                              </motion.div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    </section>
                                  );
                      
                                case 'ADDITIONAL_SERVICES':
                                  const additionalContent = section.additionalServices;
                                  const additionalItems = Array.isArray(additionalContent) ? additionalContent : (additionalContent?.items || []);
                                  const additionalTitle = Array.isArray(additionalContent) ? '更多專業服務' : (additionalContent?.title || '更多專業服務');
                                  
                                  return (
                                    <section key={section.id} id={section.id} className="py-20 bg-stone-50">
                                      <div className="max-w-7xl mx-auto px-4">
                                        <h2 className="text-2xl font-bold text-stone-900 mb-12 text-center">{additionalTitle}</h2>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                          {additionalItems.map((id, i) => {
                                            const p = pageService.getById(id) || pageService.getBySlug(id);
                                            if (!p) return null;
                                            return (
                                              <a key={i} href={`/${p.slug}`} className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
                                                <span className="font-bold text-stone-800">{p.title}</span>
                                                <ArrowUpRight className="w-5 h-5 text-stone-400 group-hover:text-primary transition-colors" />
                                              </a>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    </section>
                                  );
                      
                                case 'TEXT':
                                  const textStyles = {
                                    heading: 'text-3xl font-bold text-center mb-16 text-stone-900',
                                    medium_heading: 'text-xl font-bold text-stone-900 mb-3',
                                    body: 'text-stone-600 leading-relaxed'
                                  }[section.text?.fontSize || 'body'];
                      
                                  return (
                                    <section key={section.id} id={section.id} className={`py-16 bg-white ${isFirstBlock ? 'mt-20' : ''}`}>
                                      <div className="max-w-4xl mx-auto px-6">
                                        <div className={`${textStyles} ${
                                          section.text?.alignment === 'center' ? 'text-center' : 
                                          section.text?.alignment === 'right' ? 'text-right' : ''
                                        }`}>
                                          <Markdown>{section.text?.content || ''}</Markdown>
                                        </div>
                                      </div>
                                    </section>
                                  );
                      
                                case 'GRID':
                                  const cols = section.grid?.columns || 3;
                                  let gridClass = 'grid-cols-1 md:grid-cols-3 sm:grid-cols-2';
                                  if (cols === 2) gridClass = 'grid-cols-1 sm:grid-cols-2';
                                  if (cols === 3) gridClass = 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3';
                                  if (cols === 4) gridClass = 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4';
                                  if (cols === 5) gridClass = 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5';
                                  if (cols === 6) gridClass = 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6';
                      
                                  return (
                                    <section key={section.id} id={section.id} className={`py-20 bg-stone-50 ${isFirstBlock ? 'mt-20' : ''}`}>
                                      <div className="max-w-7xl mx-auto px-4">
                                        <h2 className="text-3xl font-bold text-center mb-16 text-stone-900">{section.grid?.title}</h2>
                                        <div className={`grid ${gridClass} gap-8`}>
                                          {section.grid?.items?.map((item, i) => {
                                            const isLink = !!item.link;
                                            const Wrapper = isLink ? 'a' : 'div';
                                            const wrapperProps = isLink ? { href: item.link, target: item.link?.startsWith('http') ? '_blank' : '_self', rel: 'noopener noreferrer' } : {};
                                            
                                            return (
                                              <Wrapper 
                                                key={i} 
                                                {...wrapperProps}
                                                className={`bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden flex flex-col ${isLink ? 'hover:shadow-md hover:border-primary/30 hover:-translate-y-1 transition-all cursor-pointer group' : 'hover:shadow-md transition-shadow'}`}
                                              >
                                                {item.showImage && item.image && (
                                                  <div className="w-full h-48 md:h-56 shrink-0 border-b border-stone-100 overflow-hidden">
                                                    <img 
                                                      src={item.image || undefined} 
                                                      alt={item.title} 
                                                      className={`w-full h-full object-cover ${isLink ? 'transition-transform duration-500 group-hover:scale-105' : ''}`} 
                                                      referrerPolicy="no-referrer"
                                                    />
                                                  </div>
                                                )}
                                                <div className="p-6 flex flex-col flex-1">
                                                  <h3 className={`text-xl font-bold mb-3 ${isLink ? 'text-stone-900 group-hover:text-primary transition-colors' : 'text-stone-900'}`}>{item.title}</h3>
                                                  <div className="text-stone-600 leading-relaxed prose prose-stone prose-sm max-w-none">
                                                    <Markdown>{item.description}</Markdown>
                                                  </div>
                                                </div>
                                              </Wrapper>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    </section>
                                  );
                      
                                case 'HERO_2':
                                  return (
                                    <section key={section.id} id={section.id} className={`relative pt-24 pb-16 md:pt-32 md:pb-24 bg-[#FFF9F2] overflow-hidden ${isFirstBlock ? 'mt-0' : ''}`}>
                                      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                                          {/* Left Text */}
                                          <motion.div
                                            initial={{ opacity: 0, x: -30 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.8 }}
                                            className="space-y-8"
                                          >
                                            <h1 className="text-4xl md:text-5xl lg:text-5xl font-bold leading-tight text-stone-900 whitespace-pre-line">
                                              {section.hero2?.title}
                                            </h1>
                                            <p className="text-stone-600 leading-relaxed text-lg whitespace-pre-line">
                                              {section.hero2?.description}
                                            </p>
                                            <div className="flex flex-wrap gap-4 pt-4">
                                              {section.hero2?.mainButton?.isVisible && (
                                                <a 
                                                  href={section.hero2.mainButton.value || '#'} 
                                                  onClick={(e) => handleAnchorClick(e, section.hero2?.mainButton.value, section.hero2?.mainButton.type)}
                                                  className="px-8 py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors"
                                                >
                                                  {section.hero2.mainButton.text || '預約諮詢'}
                                                </a>
                                              )}
                                              {section.hero2?.secondaryButton?.isVisible && (
                                                <a 
                                                  href={section.hero2.secondaryButton.value || '#'} 
                                                  onClick={(e) => handleAnchorClick(e, section.hero2?.secondaryButton.value, section.hero2?.secondaryButton.type)}
                                                  className="px-8 py-4 bg-transparent border-2 border-primary text-primary rounded-xl font-bold hover:bg-primary/5 transition-colors"
                                                >
                                                  {section.hero2.secondaryButton.text || '查看案例'}
                                                </a>
                                              )}
                                            </div>
                                          </motion.div>
                                          
                                          {/* Right Image */}
                                          <motion.div
                                            initial={{ opacity: 0, x: 30 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.8 }}
                                            className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3] lg:aspect-square"
                                          >
                                            <img 
                                              src={section.hero2?.backgroundImage || undefined} 
                                              alt={section.hero2?.title} 
                                              className="w-full h-full object-cover"
                                              referrerPolicy="no-referrer"
                                            />
                                          </motion.div>
                                        </div>
                                      </div>
                                    </section>
                                  );
                      
                                case 'FORM':
                                  if (!section.form?.formId) return null;
                                  const form = formService.getById(section.form.formId);
                                  if (!form) return null;
                                  return (
                                    <section key={section.id} id={section.id} className="py-16 bg-[#FDF8F3]">
                                      <div className="max-w-3xl mx-auto px-4">
                                        <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-xl">
                                          <DynamicForm form={form} pageSlug={currentPage.slug} pageTitle={currentPage.title} />
                                        </div>
                                      </div>
                                    </section>
                                  );
                      
                                case 'SPACER':
                                  return <div key={section.id} id={section.id} style={{ height: section.spacer?.height || 80 }} />;
                      
                                case 'SINGLE_IMAGE':
                                  return (
                                    <section key={section.id} id={section.id} className="py-16 bg-white">
                                      <div className="max-w-4xl mx-auto px-6">
                                        <img src={section.singleImage?.image || undefined} alt={section.singleImage?.caption} className="w-full rounded-3xl shadow-lg" referrerPolicy="no-referrer" />
                                        {section.singleImage?.caption && <p className="text-center text-stone-500 mt-4">{section.singleImage.caption}</p>}
                                      </div>
                                    </section>
                                  );
                      
                                case 'IMAGE_CAROUSEL':
                                  return (
                                    <section key={section.id} id={section.id} className="py-16 bg-white overflow-hidden">
                                      <div className="max-w-7xl mx-auto px-4">
                                        <GeneralImageCarousel items={section.imageCarousel?.items || []} />
                                      </div>
                                    </section>
                                  );
                      
                                case 'IMAGE_TEXT_GRID':
                                  return (
                                    <section key={section.id} id={section.id} className="py-20 bg-white">
                                      <div className="max-w-7xl mx-auto px-4">
                                        {/* 強制左側文字、右側圖片 */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                                          <div className="w-full md:order-1">
                                            <h2 className="text-3xl font-bold text-stone-900 mb-6">{section.imageTextGrid?.title}</h2>
                                            <div className="prose prose-stone mb-8">
                                              <Markdown>{section.imageTextGrid?.content || ''}</Markdown>
                                            </div>
                                            {section.imageTextGrid?.cta?.text && (
                                              <a href={section.imageTextGrid.cta.link} className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-bold hover:bg-primary/90 transition-all">
                                                {section.imageTextGrid.cta.text}
                                                <ArrowUpRight size={18} />
                                              </a>
                                            )}
                                          </div>
                                          <div className="w-full md:order-2">
                                            <img 
                                              src={section.imageTextGrid?.image || undefined} 
                                              alt={section.imageTextGrid?.title} 
                                              className="w-full rounded-3xl shadow-xl" 
                                              referrerPolicy="no-referrer" 
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    </section>
                                  );
                      
                                case 'FEATURE':
                                  return (
                                    <section key={section.id} id={section.id} className="py-20 bg-white">
                                      <div className="max-w-7xl mx-auto px-4">
                                        {section.feature?.title && <h2 className="text-3xl font-bold text-stone-900 mb-12 text-center">{section.feature.title}</h2>}
                                        <div className={`grid grid-cols-1 ${section.feature?.layout !== 'TEXT_ONLY' && section.feature?.layout !== 'IMAGE_ONLY' ? 'lg:grid-cols-2' : ''} gap-12 items-center`}>
                                          {(section.feature?.layout === 'LEFT' || section.feature?.layout === 'TOP' || section.feature?.layout === 'IMAGE_ONLY') && section.feature?.images && section.feature.images.length > 0 && (
                                            <div className={`${section.feature.layout === 'TOP' ? 'lg:col-span-2' : ''}`}>
                                              <div className={`rounded-3xl overflow-hidden shadow-xl ${section.feature.layout === 'TOP' ? 'aspect-video' : 'aspect-square'}`}>
                                                <img src={section.feature.images[0] || undefined} alt="" className={`w-full h-full ${section.feature.imageFit === 'contain' ? 'object-contain bg-stone-50' : 'object-cover'}`} referrerPolicy="no-referrer" />
                                              </div>
                                            </div>
                                          )}
                                          {(section.feature?.layout !== 'IMAGE_ONLY') && (
                                            <div className={`${section.feature?.layout === 'BOTTOM' || section.feature?.layout === 'TOP' ? 'lg:col-span-2 text-center' : ''}`}>
                                              <div className="prose prose-stone prose-lg max-w-none">
                                                <Markdown>{section.feature?.content || ''}</Markdown>
                                              </div>
                                            </div>
                                          )}
                                          {(section.feature?.layout === 'RIGHT' || section.feature?.layout === 'BOTTOM') && section.feature?.images && section.feature.images.length > 0 && (
                                            <div className={`${section.feature.layout === 'BOTTOM' ? 'lg:col-span-2' : ''}`}>
                                              <div className={`rounded-3xl overflow-hidden shadow-xl ${section.feature.layout === 'BOTTOM' ? 'aspect-video' : 'aspect-square'}`}>
                                                <img src={section.feature.images[0] || undefined} alt="" className={`w-full h-full ${section.feature.imageFit === 'contain' ? 'object-contain bg-stone-50' : 'object-cover'}`} referrerPolicy="no-referrer" />
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </section>
                                  );
                                case 'COMPARISON':
                                  return (
                                    <section key={section.id} id={section.id} className="py-20 bg-stone-50">
                                      <div className="max-w-7xl mx-auto px-4">
                                        {section.comparison?.title && <h2 className="text-3xl font-bold text-stone-900 mb-12 text-center">{section.comparison.title}</h2>}
                                        <div className="max-w-4xl mx-auto">
                                          <div className="relative aspect-[4/3] sm:aspect-[16/9] rounded-3xl overflow-hidden shadow-xl group">
                                            <div className="absolute inset-0 w-1/2 overflow-hidden z-10 border-r-4 border-white transition-all duration-300 ease-in-out group-hover:w-[45%]">
                                              <img src={section.comparison?.beforeImage || undefined} alt="Before" className="absolute top-0 left-0 w-[200vw] sm:w-[100vw] md:w-[896px] h-full object-cover" referrerPolicy="no-referrer" style={{ maxWidth: 'none' }}/>
                                              {section.comparison?.beforeLabel && <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-bold backdrop-blur-sm">{section.comparison.beforeLabel}</div>}
                                            </div>
                                            <img src={section.comparison?.afterImage || undefined} alt="After" className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
                                            {section.comparison?.afterLabel && <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-bold shadow-sm z-20">{section.comparison.afterLabel}</div>}
                                          </div>
                                        </div>
                                      </div>
                                    </section>
                                  );
                                case 'TEXT_LIST':
                                  return (
                                    <section key={section.id} id={section.id} className="py-20 bg-white">
                                      <div className="max-w-3xl mx-auto px-4">
                                        {section.textList?.title && <h2 className="text-3xl font-bold text-stone-900 mb-12 text-center">{section.textList.title}</h2>}
                                        <div className="space-y-6">
                                          {section.textList?.items.map((item, idx) => (
                                            <div key={item.id} className="flex gap-4 sm:gap-6 bg-stone-50 p-6 sm:p-8 rounded-3xl">
                                              <div className="text-primary font-bold text-2xl sm:text-3xl w-8 sm:w-12 shrink-0 pt-0.5">{idx + 1}</div>
                                              <div>
                                                {item.title && <h3 className="text-xl sm:text-2xl font-bold text-stone-900 mb-3">{item.title}</h3>}
                                                <p className="text-stone-700 leading-relaxed text-base sm:text-lg whitespace-pre-line">{item.text}</p>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </section>
                                  );
                                case 'HTML_CODE':
                                  return (
                                    <section key={section.id} id={section.id} className="w-full">
                                      <div dangerouslySetInnerHTML={{ __html: section.htmlCode?.html || '' }} />
                                    </section>
                                  );
                      default:
                      return <div key={section.id} className="p-4 text-stone-400 italic text-center">不支援的區塊類型: {section.type}</div>;
                      }
                    })()}
                  </div>
                );
                })}

                {/* Legacy Fallback Blocks */}
                {!subItem.serviceIntro?.sections && (
                  <>
                    {/* Block A: Grid or Carousel */}
                    {subItem.serviceIntro?.blockA?.enabled && (
                      <section>
                        <div className="mb-8 pl-4 border-l-4 border-primary">
                          <h2 className="text-2xl md:text-3xl font-bold text-stone-900 text-left">
                            {subItem.serviceIntro.blockA.title}
                          </h2>
                        </div>
                        {subItem.serviceIntro.blockA.showCarousel !== false ? (
                          <IntroCarousel items={subItem.serviceIntro.blockA.items} />
                        ) : (
                          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                            {subItem.serviceIntro.blockA.items.map((item, index) => (
                              <motion.div 
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-100 hover:shadow-md transition-shadow"
                              >
                                <div className="aspect-square overflow-hidden">
                                  <img 
                                    src={item.image || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=2070&auto=format&fit=crop'} 
                                    alt={item.title} 
                                    className="w-full h-full object-cover"
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                                <div className="p-4 text-center">
                                  <h3 className="font-bold text-stone-900 text-sm md:text-base">{item.title}</h3>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </section>
                    )}

                    {/* Block B: Large Image */}
                    {subItem.serviceIntro?.blockB?.enabled && (
                      <section>
                        <div className={`flex flex-col md:items-center ${
                          subItem.serviceIntro.blockB.layout === 'LEFT' ? 'md:flex-row gap-8 lg:gap-16' : 
                          subItem.serviceIntro.blockB.layout === 'RIGHT' ? 'md:flex-row-reverse gap-8 lg:gap-16' : 
                          subItem.serviceIntro.blockB.layout === 'TOP' ? 'flex-col gap-8 lg:gap-12' : 'flex-col-reverse gap-8 lg:gap-12'
                        }`}>
                          <div className={`${
                            (subItem.serviceIntro.blockB.layout === 'LEFT' || subItem.serviceIntro.blockB.layout === 'RIGHT') && subItem.serviceIntro.blockB.content ? 'md:w-1/2' : 'w-full'
                          } ${subItem.serviceIntro.blockB.imageFit === 'contain' ? 'h-auto' : 'aspect-video md:aspect-[4/3] min-h-[300px]'} relative rounded-2xl shadow-xl overflow-hidden bg-white`}>
                            {subItem.serviceIntro.blockB.images && subItem.serviceIntro.blockB.images.filter(Boolean).length > 0 ? (
                              subItem.serviceIntro.blockB.showCarousel !== false ? (
                                <ProductGallery
                                  images={subItem.serviceIntro.blockB.images.filter((img): img is string => !!img)}
                                  autoplay={true}
                                  fill={subItem.serviceIntro.blockB.imageFit !== 'contain'}
                                  aspectClass={subItem.serviceIntro.blockB.imageFit === 'contain' ? 'aspect-auto' : undefined}
                                  roundedClass="rounded-none"
                                  imageFit={subItem.serviceIntro.blockB.imageFit || 'cover'}
                                />
                              ) : (
                                <div className={`grid ${subItem.serviceIntro.blockB.images.filter(Boolean).length === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} gap-0 w-full ${subItem.serviceIntro.blockB.imageFit === 'contain' ? 'h-auto' : 'h-full'}`}>
                                  {subItem.serviceIntro.blockB.images.filter(Boolean).map((img, idx) => (
                                    <img 
                                      key={idx}
                                      src={img || undefined} 
                                      alt={`${subItem.serviceIntro.blockB.title}-${idx}`} 
                                      className={`w-full ${subItem.serviceIntro.blockB.imageFit === 'contain' ? 'h-auto object-contain' : 'h-full aspect-video object-cover'}`}
                                      referrerPolicy="no-referrer"
                                    />
                                  ))}
                                </div>
                              )
                            ) : (
                              <img 
                                src='https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=2070&auto=format&fit=crop' 
                                alt={subItem.serviceIntro.blockB.title} 
                                className={`w-full ${subItem.serviceIntro.blockB.imageFit === 'contain' ? 'h-auto object-contain' : 'h-full object-cover'}`}
                                referrerPolicy="no-referrer"
                              />
                            )}
                          </div>
                          {subItem.serviceIntro.blockB.content && (
                            <div className={`${
                              subItem.serviceIntro.blockB.layout === 'LEFT' || subItem.serviceIntro.blockB.layout === 'RIGHT' ? 'md:w-1/2' : 'w-full'
                            } flex flex-col justify-center py-0`}>
                              <h3 className="text-2xl md:text-4xl font-bold text-stone-900 mb-6 tracking-tight">{subItem.serviceIntro.blockB.title}</h3>
                              <div className="markdown-body text-stone-600 leading-relaxed text-lg lg:text-xl">
                                <Markdown>{subItem.serviceIntro.blockB.content}</Markdown>
                              </div>
                            </div>
                          )}
                        </div>
                      </section>
                    )}

                    {/* Block C: Before/After Slider */}
                    {subItem.serviceIntro?.blockC?.enabled && (
                      <section>
                        <div className="mb-8 pl-4 border-l-4 border-primary">
                          <h2 className="text-2xl md:text-3xl font-bold text-stone-900 text-left">
                            {subItem.serviceIntro.blockC.title}
                          </h2>
                        </div>
                        <div className="bg-white p-4 md:p-8 rounded-3xl shadow-sm border border-stone-100">
                          <BeforeAfterSlider 
                            beforeImage={subItem.serviceIntro.blockC.beforeImage || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=2070&auto=format&fit=crop'} 
                            afterImage={subItem.serviceIntro.blockC.afterImage || 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?q=80&w=2070&auto=format&fit=crop'} 
                            beforeLabel={subItem.serviceIntro.blockC.beforeLabel}
                            afterLabel={subItem.serviceIntro.blockC.afterLabel}
                          />
                        </div>
                      </section>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Professional Partners Module */}
            {subItem.partners && subItem.partners.length > 0 && (
              <section className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-stone-100">
                <div className="mb-10 text-left pl-4 border-l-4 border-primary">
                  <p className="text-primary font-bold mb-2">專業團隊</p>
                  <h2 className="text-2xl md:text-3xl font-bold text-stone-900 leading-tight">連結最專業的團隊，給您最安心的守護</h2>
                </div>
                <div className="space-y-6">
                  {subItem.partners.map((partner, index) => (
                    <div key={index} className="flex items-start gap-4 md:gap-6 p-4 rounded-xl hover:bg-stone-50 transition-colors">
                      <div className="w-12 h-12 md:w-16 md:h-16 bg-stone-100 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden">
                        {partner.image ? (
                          <img src={partner.image || undefined} alt={partner.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <CheckCircle2 className="text-primary w-6 h-6 md:w-8 md:h-8" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-stone-900 mb-2">{partner.title}</h3>
                        <div className="markdown-body text-stone-600 text-sm md:text-base leading-relaxed">
                          <Markdown>{partner.description}</Markdown>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Real Cases Module */}
            {subItem.cases.length > 0 && (
              <section>
                <div className="mb-8 pl-4 border-l-4 border-primary">
                  <h2 className="text-2xl md:text-3xl font-bold text-stone-900 text-left">真實案例</h2>
                </div>
                <div className="overflow-hidden md:overflow-visible" ref={emblaRef}>
                  <div className="flex md:grid md:grid-cols-3 gap-6">
                    {subItem.cases.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="flex-[0_0_83.333333%] min-w-0 md:flex-none group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-stone-100"
                      >
                        <div className="relative aspect-[4/3] overflow-hidden">
                          {item.image ? (
                            <img
                              src={item.image || undefined}
                              alt={item.title}
                              className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-full h-full bg-stone-100 flex items-center justify-center">
                              <Package className="text-stone-300 w-12 h-12" />
                            </div>
                          )}
                          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-stone-800 shadow-sm">
                            {item.tag}
                          </div>
                        </div>
                        <div className="p-6">
                          <h3 className="text-lg font-bold text-stone-900 mb-2 group-hover:text-primary transition-colors">
                            {item.title}
                          </h3>
                          <div className="markdown-body text-stone-600 text-sm leading-relaxed">
                            <Markdown>{item.description}</Markdown>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Core Services Module (Service Process) */}
            {subItem.coreServices && subItem.coreServices.length > 0 && (
              <section className="bg-[#FAF9F7] sm:bg-[#FAF9F7] -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10 py-12 lg:py-16 my-8 rounded-[2.5rem]">
                <div className="mb-10 pl-4 border-l-4 border-primary">
                  <h2 className="text-2xl md:text-3xl font-bold text-stone-900 text-left">
                    服務流程
                  </h2>
                </div>
                <div className="relative pl-2 md:pl-4">
                  {/* Continuous Vertical Line */}
                  <div className="absolute left-[35px] md:left-[43px] top-6 bottom-6 w-0.5 bg-stone-200"></div>

                  <div className="space-y-6 md:space-y-8">
                    {subItem.coreServices.map((service, index) => (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        viewport={{ once: true, margin: "-50px" }}
                        className="relative flex items-stretch gap-6 md:gap-8 group"
                      >
                        {/* Step Indicator */}
                        <div className="relative z-10 shrink-0 mt-3 md:mt-2">
                          <div className="w-[54px] h-[54px] md:w-[62px] md:h-[62px] bg-white border-4 border-[#FAF9F7] shadow-sm ring-1 ring-stone-200 group-hover:ring-[#8B5E34] rounded-full flex items-center justify-center transition-all duration-300">
                            <span className="text-stone-400 group-hover:text-[#8B5E34] font-bold text-xl md:text-2xl transition-colors duration-300">
                              {index + 1}
                            </span>
                          </div>
                        </div>

                        {/* Content Card */}
                        <div className="flex-1 bg-white p-6 md:p-8 rounded-[1.5rem] shadow-sm border border-stone-100 group-hover:shadow-md group-hover:border-[#8B5E34]/20 transition-all duration-300">
                          <h3 className="text-xl md:text-2xl font-bold text-stone-900 mb-3 group-hover:text-[#8B5E34] transition-colors">{service.title}</h3>
                          <div className="markdown-body text-stone-600 leading-relaxed text-sm md:text-base">
                            <Markdown>{service.content}</Markdown>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* FAQ Module */}
            {subItem.faqs && subItem.faqs.length > 0 && (
              <section>
                <div className="mb-8 pl-4 border-l-4 border-primary">
                  <h2 className="text-2xl md:text-3xl font-bold text-stone-900 text-left mb-1">常見問題</h2>
                  <p className="text-stone-500 text-left text-sm md:text-base">有任何疑問嗎？看看是否有您需要的解答</p>
                </div>
                <div className="max-w-3xl ml-4">
                  {subItem.faqs.map((faq) => (
                    <FAQItem key={faq.id} question={faq.question} answer={faq.answer} />
                  ))}
                </div>
              </section>
            )}

            {/* Related Services Module */}
            {relatedPages.length > 0 && (
              <section>
                <div className="mb-8 pl-4 border-l-4 border-primary">
                  <h2 className="text-2xl md:text-3xl font-bold text-stone-900 text-left">我們還提供</h2>
                </div>
                <div className="md:hidden">
                  <ServiceCarousel 
                    services={relatedPages.map(p => ({ id: p.id, targetPageId: p.id }))} 
                    desktopColumns={2}
                  />
                </div>
                <div className="hidden md:block">
                  {relatedPages.length > 2 ? (
                    <ServiceCarousel 
                      services={relatedPages.map(p => ({ id: p.id, targetPageId: p.id }))} 
                      desktopColumns={2}
                    />
                  ) : (
                    <div className="grid grid-cols-2 gap-6">
                      {relatedPages.map(page => {
                        const productId = page.content.subItem?.productId;
                        const relatedProductData = productId ? relatedProducts[productId] : null;
                          
                        return (
                          <motion.div
                            key={page.id}
                            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col border border-stone-100"
                            whileHover={{ y: -5 }}
                          >
                            <div className="w-full h-48 bg-stone-200 rounded-xl mb-6 overflow-hidden">
                              <img 
                                src={relatedProductData?.image || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=2070&auto=format&fit=crop'} 
                                alt={page.title} 
                                className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            
                            <h3 className="text-xl font-bold text-stone-900 mb-3">{page.title}</h3>
                            <p className="text-stone-600 text-sm leading-relaxed mb-8 flex-grow line-clamp-3">
                              {relatedProductData?.description}
                            </p>
                            
                            <div className="flex justify-end mt-auto">
                              <a 
                                href={`/${page.slug}`}
                                className="inline-flex items-center gap-1 bg-[#885200] hover:bg-[#663D00] text-white text-sm font-medium px-5 py-2 rounded-full transition-colors"
                              >
                                服務介紹
                                <ArrowRight size={14} />
                              </a>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </section>
            )}

          </div>
        </div>
      </div>

      {/* Sticky CTA for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] bg-gradient-to-t from-white via-white to-white/0 pt-8 lg:hidden">
        <button
          onClick={
                orderMode === 'FIXED' 
                  ? handleAddToCart 
                  : () => {
                      if (orderMode === 'INTERNAL_FORM') {
                        if (internalFormConfig?.formId) {
                          const form = formService.getById(internalFormConfig.formId) || formService.getByFormId(internalFormConfig.formId);
                          if (form) {
                            navigate(`/forms/${form.formId || form.id}`);
                          }
                        }
                      } else if (orderMode === 'EXTERNAL_LINK') {
                        if (externalLinkConfig?.url) {
                          window.open(externalLinkConfig.url, '_blank');
                        } else {
                          // Default scroll to footer form
                          const footerForm = document.getElementById('booking-form');
                          if (footerForm) {
                            footerForm.scrollIntoView({ behavior: 'smooth' });
                          }
                        }
                      } else if (subItem.button?.type === 'FORM') {
                        const targetId = formService.getByFormId(subItem.button?.value || '')?.formId || formService.getById(subItem.button?.value || '')?.formId || 'booking-form';
                        document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
                      } else {
                        window.open(subItem.button?.value, '_blank');
                      }
                    }
              }
              className="w-full bg-[#885200] hover:bg-[#663D00] text-white font-bold py-4 rounded-xl shadow-lg transition-colors"
            >
              {/* 按鈕文字優先順序：1. 產品設定的按鈕文字 2. 頁面設定的按鈕文字 3. 預設文字 */}
              {(orderMode === 'FIXED' ? fixedConfig?.buttonText : (orderMode === 'INTERNAL_FORM' ? internalFormConfig?.buttonText : externalLinkConfig?.buttonText)) || subItem.button?.text || '立即預約'}
            </button>
      </div>

      {/* Form Section */}
      {showForm && selectedForm && (
        <div className="py-20 bg-stone-50 mt-12">
          <div className="max-w-3xl mx-auto px-4">
            <DynamicForm 
              form={selectedForm} 
              pageSlug={currentPage.slug} 
              pageTitle={currentPage.title} 
            />
          </div>
        </div>
      )}
    </div>
  );
}

function ProductGallery({ images, autoplay = false, fill = false, aspectClass = "aspect-[4/3] sm:aspect-[16/9] md:aspect-video", roundedClass = "rounded-2xl", imageFit = 'cover' }: { images: string[], autoplay?: boolean, fill?: boolean, aspectClass?: string, roundedClass?: string, imageFit?: 'cover' | 'contain' }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };
    emblaApi.on('select', onSelect);

    let intervalId: any;
    if (autoplay && images.length > 1) {
      intervalId = setInterval(() => {
        emblaApi.scrollNext();
      }, 4000);
    }

    return () => {
      emblaApi.off('select', onSelect);
      if (intervalId) clearInterval(intervalId);
    };
  }, [emblaApi, autoplay, images.length]);

  // fill=true 時讓畫廊填滿父容器（用於 FEATURE 左右佈局，避免文字較長時圖片下方留白）
  return (
    <div className={`group ${fill ? 'absolute inset-0' : 'relative'}`}>
      <div className={`overflow-hidden ${roundedClass} ${fill ? 'h-full w-full' : aspectClass}`} ref={emblaRef}>
        <div className={`flex ${fill ? 'h-full' : ''}`}>
          {images.filter(Boolean).map((src, index) => (
            <div key={index} className="flex-[0_0_100%] min-w-0 relative h-full">
              <img 
                src={src || undefined} 
                alt={`Product image ${index + 1}`}
                className={`w-full ${imageFit === 'contain' ? 'h-auto object-contain' : 'h-full object-cover'}`}
                referrerPolicy="no-referrer"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button 
            onClick={() => emblaApi?.scrollPrev()}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-md rounded-full shadow-lg text-stone-800 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={() => emblaApi?.scrollNext()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-md rounded-full shadow-lg text-stone-800 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => emblaApi?.scrollTo(index)}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                index === selectedIndex ? 'bg-white w-4' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function IntroCarousel({ items }: { items: { id: string; title: string; image: string; }[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
  });

  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setPrevBtnEnabled(emblaApi.canScrollPrev());
    setNextBtnEnabled(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  return (
    <div className="relative group/intro">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex -ml-4 md:-ml-6">
          {items.map((item, index) => (
            <div key={item.id} className="flex-[0_0_50%] md:flex-[0_0_33.333333%] min-w-0 pl-4 md:pl-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-100 hover:shadow-md transition-shadow h-full"
              >
                <div className="aspect-square overflow-hidden">
                  <img 
                    src={item.image || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=2070&auto=format&fit=crop'} 
                    alt={item.title} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="p-4 text-center">
                  <h3 className="font-bold text-stone-900 text-sm md:text-base">{item.title}</h3>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Navigation Arrows */}
      <button
        onClick={scrollPrev}
        disabled={!prevBtnEnabled}
        className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-stone-800 transition-all z-10 ${!prevBtnEnabled ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={scrollNext}
        disabled={!nextBtnEnabled}
        className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-stone-800 transition-all z-10 ${!nextBtnEnabled ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string, answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-stone-200 rounded-2xl overflow-hidden bg-white mb-4 shadow-sm hover:shadow-md transition-shadow">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left px-6 py-5 flex items-center justify-between focus:outline-none"
      >
        <span className="font-bold text-stone-900 pr-4 text-lg">{question}</span>
        <ChevronDown 
          className={`text-[#8B5E34] transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} 
          size={20} 
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="markdown-body px-6 pb-5 text-stone-600 leading-relaxed">
              <Markdown>{answer}</Markdown>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function BeforeAfterSlider({ beforeImage, afterImage, beforeLabel, afterLabel }: { beforeImage: string, afterImage: string, beforeLabel: string, afterLabel: string }) {
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const position = (x / rect.width) * 100;
    setSliderPos(Math.max(0, Math.min(100, position)));
  }, []);

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  }, [isDragging, handleMove]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    } else {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    }
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging, handlePointerMove, handlePointerUp]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden cursor-ew-resize select-none"
      onPointerDown={(e) => {
        setIsDragging(true);
        handleMove(e.clientX);
      }}
    >
      {/* After Image (Background) */}
      <div className="absolute inset-0">
        {afterImage ? (
          <img 
            src={afterImage || undefined} 
            alt="After" 
            className="w-full h-full object-cover pointer-events-none"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full bg-stone-200" />
        )}
        <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold pointer-events-none">
          {afterLabel || 'After'}
        </div>
      </div>

      {/* Before Image (Foreground with Clip) */}
      <div 
        className="absolute inset-0 border-r-2 border-white pointer-events-none"
        style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
      >
        {beforeImage ? (
          <img 
            src={beforeImage || undefined} 
            alt="Before" 
            className="w-full h-full object-cover pointer-events-none"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full bg-stone-300" />
        )}
        <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold pointer-events-none">
          {beforeLabel || 'Before'}
        </div>
      </div>

      {/* Slider Handle */}
      <div 
        className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.3)] z-10 pointer-events-none"
        style={{ left: `${sliderPos}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center pointer-events-none">
          <div className="flex gap-1">
            <ChevronLeft size={16} className="text-stone-800" />
            <ChevronRight size={16} className="text-stone-800" />
          </div>
        </div>
      </div>
    </div>
  );
}

function GeneralImageCarousel({ items }: { items: { image: string, alt: string }[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    loop: true,
    skipSnaps: false,
    dragFree: true,
  });

  const scrollPrev = () => emblaApi && emblaApi.scrollPrev();
  const scrollNext = () => emblaApi && emblaApi.scrollNext();

  return (
    <div className="relative group p-4 -m-4">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4 sm:gap-6">
          {items.map((item, i) => (
            <div key={i} className="flex-[0_0_85%] min-w-0 md:flex-[0_0_40%] bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md">
              <img src={item.image || undefined} alt={item.alt} className={`w-full object-cover ${item.alt ? 'aspect-video' : 'h-[300px] md:h-[400px]'}`} referrerPolicy="no-referrer" />
              {item.alt && (
                <div className="p-6">
                  <p className="text-stone-700 font-medium text-lg text-center">{item.alt}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {items.length > 1 && (
        <>
          <button 
            type="button"
            onClick={scrollPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg text-stone-600 hover:text-stone-900 hover:scale-110 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50 z-10"
          >
            <ChevronLeft size={24} />
          </button>
          <button 
            type="button"
            onClick={scrollNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg text-stone-600 hover:text-stone-900 hover:scale-110 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50 z-10"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}
    </div>
  );
}
