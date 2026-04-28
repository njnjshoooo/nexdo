import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { pageService } from '../services/pageService';
import { formService } from '../services/formService';
import { productService } from '../services/productService';
import { Page, Product } from '../types/admin';
import { ArrowRight, CheckCircle2, ChevronLeft, ChevronRight, Check, ChevronDown, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import useEmblaCarousel from 'embla-carousel-react';
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

  // Sticky CTA logic
  const [showStickyCTA, setShowStickyCTA] = useState(false);
  const productInfoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (productInfoRef.current) {
        const rect = productInfoRef.current.getBoundingClientRect();
        // Show sticky CTA when the bottom of product info is above the viewport
        setShowStickyCTA(rect.bottom < 0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          
          {/* Product Info Column (Top on Mobile, Right on Desktop) */}
          <div className="lg:w-[35%] order-1 lg:order-2 lg:sticky lg:top-24 self-start flex flex-col max-h-[calc(100vh-6rem)] bg-white rounded-3xl shadow-lg border border-stone-100 overflow-hidden" ref={productInfoRef}>
            
            {/* Scrollable Content Area */}
            <div className="p-5 md:p-8 overflow-y-auto scrollbar-hide flex-1 pb-4">
              <div className="mb-2">
                {/* Product Gallery / Main Image */}
                <div className="mb-4 md:mb-6">
                  {productData?.images && productData.images.length > 0 ? (
                    <ProductGallery images={[productData.image, ...productData.images].filter((img): img is string => !!img)} />
                  ) : productData?.image ? (
                    <div className="rounded-2xl overflow-hidden aspect-[16/9] md:aspect-video">
                      <img 
                        src={productData.image} 
                        alt={productData.name} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ) : null}
                </div>
                <div className="flex items-center gap-2 mb-2 md:mb-4">
                  <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-xs md:text-sm font-bold">
                    熱門服務
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-stone-900 mb-2 md:mb-4 leading-tight tracking-tight text-left">
                  {productData?.name || currentPage.title}
                </h1>
                
                {/* Price/Quote Display */}
                <div className="mb-4 md:mb-6">
                  {orderMode === 'FIXED' ? (
                    <div className="flex items-baseline gap-1">
                      <span className="text-xs md:text-sm font-bold text-stone-400">NT$</span>
                      <span className="text-2xl md:text-3xl font-black text-primary">
                        {((fixedConfig?.price || 0) + (productData?.variants?.find(v => v.id === selectedVariantId)?.price || 0)).toLocaleString()}
                      </span>
                      <span className="text-xs md:text-sm font-bold text-stone-400">
                        / {productData?.variants?.find(v => v.id === selectedVariantId)?.unit || fixedConfig?.unit || '次'}
                      </span>
                    </div>
                  ) : orderMode === 'INTERNAL_FORM' ? (
                    <div className="text-xl md:text-2xl font-bold text-primary">
                      {internalFormConfig?.priceText || '依需求報價'}
                    </div>
                  ) : (
                    <div className="text-xl md:text-2xl font-bold text-primary">
                      {externalLinkConfig?.priceText || '依需求報價'}
                    </div>
                  )}
                </div>

                <p className="text-stone-600 text-base md:text-lg leading-relaxed mb-4 md:mb-6 line-clamp-3 md:line-clamp-none">
                  {productData?.description}
                </p>

                {productData?.checklist && productData.checklist.length > 0 && (
                  <ul className="space-y-2 md:space-y-3 mb-6 md:mb-8">
                    {productData.checklist.map((item: any, index: number) => (
                      <li key={index} className="flex items-start gap-2 md:gap-3">
                        <CheckCircle2 className="text-[#5C704A] w-4 h-4 md:w-5 md:h-5 flex-shrink-0 mt-1" />
                        <span className="text-stone-700 text-sm md:text-base font-medium">{item.text}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Variants Selection */}
                {orderMode === 'FIXED' && productData?.variants && productData.variants.length > 0 && (
                  <div className="mb-6 space-y-3">
                    <h3 className="text-sm font-bold text-stone-900">選擇方案</h3>
                    <div className="space-y-2">
                      <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedVariantId === '' ? 'border-primary bg-primary/5' : 'border-stone-100 hover:border-stone-200'}`}>
                        <input 
                          type="radio" 
                          name="variant" 
                          checked={selectedVariantId === ''}
                          onChange={() => setSelectedVariantId('')}
                          className="mt-1 w-4 h-4 text-primary focus:ring-primary border-stone-300"
                        />
                        <div>
                          <p className="font-bold text-stone-900">標準方案</p>
                          <p className="text-sm text-stone-500 mt-1">基本服務內容</p>
                        </div>
                      </label>
                      {productData.variants.map(variant => (
                        <label key={variant.id} className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedVariantId === variant.id ? 'border-primary bg-primary/5' : 'border-stone-100 hover:border-stone-200'}`}>
                          <input 
                            type="radio" 
                            name="variant" 
                            checked={selectedVariantId === variant.id}
                            onChange={() => setSelectedVariantId(variant.id)}
                            className="mt-1 w-4 h-4 text-primary focus:ring-primary border-stone-300"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-stone-900">{variant.name}</p>
                              <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                +NT$ {variant.price.toLocaleString()}
                              </span>
                            </div>
                            {variant.description && (
                              <p className="text-sm text-stone-500 mt-1">{variant.description}</p>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Field Toggles */}
                {orderMode === 'FIXED' && (productData?.requireDate || productData?.requireTime || productData?.requireNotes) && (
                  <div className="mb-6 space-y-4 p-5 bg-stone-50 rounded-2xl border border-stone-100">
                    <h3 className="text-sm font-bold text-stone-900 mb-2">需求資訊</h3>
                    {productData.requireDate && (
                      <div className="space-y-3">
                        <label className="block text-xs font-bold text-stone-600 mb-1">期望日期（請選三個） <span className="text-red-500">*</span></label>
                        <div className="grid grid-cols-1 gap-2">
                          <input 
                            type="date" 
                            value={expectedDate1}
                            min={minDate}
                            onChange={(e) => setExpectedDate1(e.target.value)}
                            className="w-full px-4 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none disabled:bg-stone-100 disabled:text-stone-400"
                          />
                          <input 
                            type="date" 
                            value={expectedDate2}
                            min={minDate}
                            onChange={(e) => setExpectedDate2(e.target.value)}
                            className="w-full px-4 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none disabled:bg-stone-100 disabled:text-stone-400"
                          />
                          <input 
                            type="date" 
                            value={expectedDate3}
                            min={minDate}
                            onChange={(e) => setExpectedDate3(e.target.value)}
                            className="w-full px-4 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none disabled:bg-stone-100 disabled:text-stone-400"
                          />
                        </div>
                        <p className="text-[10px] text-stone-400 mt-1">* 為確保媒合品質，請選擇 4 天後的日期</p>
                      </div>
                    )}
                    {productData.requireTime && (
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-stone-600 mb-1">期望時段 (可多選) <span className="text-red-500">*</span></label>
                        <div className="flex flex-col gap-2">
                          <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${expectedTime.includes('9:00~12:00') ? 'border-primary bg-primary/5' : 'border-stone-100 hover:border-stone-200'}`}>
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
                            <div className={`w-4 h-4 rounded border flex items-center justify-center ${expectedTime.includes('9:00~12:00') ? 'border-primary bg-primary' : 'border-stone-300'}`}>
                              {expectedTime.includes('9:00~12:00') && <Check size={12} className="text-white" />}
                            </div>
                            <span className="text-sm text-stone-700">9:00~12:00</span>
                          </label>
                          <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${expectedTime.includes('13:00~18:00') ? 'border-primary bg-primary/5' : 'border-stone-100 hover:border-stone-200'}`}>
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
                            <div className={`w-4 h-4 rounded border flex items-center justify-center ${expectedTime.includes('13:00~18:00') ? 'border-primary bg-primary' : 'border-stone-300'}`}>
                              {expectedTime.includes('13:00~18:00') && <Check size={12} className="text-white" />}
                            </div>
                            <span className="text-sm text-stone-700">13:00~18:00</span>
                          </label>
                        </div>
                      </div>
                    )}
                    {productData.requireNotes && (
                      <div>
                        <label className="block text-xs font-bold text-stone-600 mb-1">備註需求</label>
                        <textarea 
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="請填寫其他需求或備註事項"
                          rows={3}
                          className="w-full px-4 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Sticky CTA Area at Bottom */}
            <div className="p-5 md:p-6 pt-4 border-t border-stone-100 bg-white shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)] shrink-0 relative z-20">
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
                  className="block w-full bg-[#885200] hover:bg-[#663D00] text-white text-center font-bold py-4 rounded-xl transition-colors shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transform hover:-translate-y-0.5 transition-all"
                >
                  {/* 按鈕文字優先順序：1. 產品設定的按鈕文字 2. 頁面設定的按鈕文字 3. 預設文字 */}
                  {(orderMode === 'FIXED' ? fixedConfig?.buttonText : (orderMode === 'INTERNAL_FORM' ? internalFormConfig?.buttonText : externalLinkConfig?.buttonText)) || subItem.button?.text || '立即預約'}
                </button>
              )}
              <div className="pt-3">
                <p className="text-xs text-stone-500 text-center flex flex-col gap-1">
                  <span>有任何疑問？歡迎直接聯繫我們</span>
                  <a href="tel:02-7755-0920" className="font-bold hover:text-primary transition-colors">或撥打：02-7755-0920</a>
                </p>
              </div>
            </div>

          </div>

          {/* Content Column (Bottom on Mobile, Left on Desktop) */}
          <div className="flex-1 space-y-16 md:space-y-20 order-2 lg:order-1 min-w-0">

            {/* Product/Service Main Title */}
            {(subItem.mainTitle || subItem.coreServicesSectionTitle) && (
              <div className="pb-4 border-b border-stone-100 mt-8 mb-10">
                <h2 className="text-3xl md:text-4xl font-extrabold text-stone-900 tracking-tight text-left">
                  {subItem.mainTitle || subItem.coreServicesSectionTitle}
                </h2>
              </div>
            )}

            {/* Service Introduction Module */}
            {(subItem.serviceIntro?.sections || subItem.serviceIntro?.blockA?.enabled || subItem.serviceIntro?.blockB?.enabled || subItem.serviceIntro?.blockC?.enabled) && (
              <div className="space-y-16 md:space-y-20">
                {/* Dynamic Sections */}
                {subItem.serviceIntro?.sections?.map((section, sectionIdx) => (
                  <div key={section.id || sectionIdx}>
                    {section.type === 'GRID' && section.enabled && section.grid && (
                      <section>
                        <div className="mb-8 pl-4 border-l-4 border-primary">
                          <h2 className="text-2xl md:text-3xl font-bold text-stone-900 text-left">
                            {section.grid.title}
                          </h2>
                        </div>
                        {section.grid.showCarousel !== false ? (
                          <IntroCarousel items={section.grid.items} />
                        ) : (
                          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                            {section.grid.items.map((item, index) => (
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

                    {section.type === 'FEATURE' && section.enabled && section.feature && (
                      <section>
                        <div className={`flex flex-col ${
                          section.feature.layout === 'LEFT' ? 'md:flex-row' :
                          section.feature.layout === 'RIGHT' ? 'md:flex-row-reverse' :
                          section.feature.layout === 'TOP' ? 'flex-col' : 'flex-col-reverse'
                        } bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden`}>
                          <div className={`${
                            (section.feature.layout === 'LEFT' || section.feature.layout === 'RIGHT') && section.feature.content ? 'md:w-1/2' : 'w-full'
                          } aspect-video md:aspect-auto`}>
                            {section.feature.images && section.feature.images.filter(Boolean).length > 0 ? (
                              section.feature.showCarousel !== false ? (
                                <ProductGallery
                                  images={section.feature.images.filter((img): img is string => !!img)}
                                  autoplay={true}
                                  fill={section.feature.layout === 'LEFT' || section.feature.layout === 'RIGHT'}
                                />
                              ) : (
                                <div className={`grid ${section.feature.images.filter(Boolean).length === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} gap-0 w-full h-full`}>
                                  {section.feature.images.filter(Boolean).map((img, idx) => (
                                    <img
                                      key={idx}
                                      src={img || undefined}
                                      alt={`${section.feature.title}-${idx}`}
                                      className="w-full h-full object-cover aspect-video"
                                      referrerPolicy="no-referrer"
                                    />
                                  ))}
                                </div>
                              )
                            ) : (
                              <img
                                src='https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=2070&auto=format&fit=crop'
                                alt={section.feature.title}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            )}
                          </div>
                          {section.feature.content && (
                            <div className={`${
                              section.feature.layout === 'LEFT' || section.feature.layout === 'RIGHT' ? 'md:w-1/2' : 'w-full'
                            } flex flex-col justify-center p-6 md:p-10`}>
                              <h3 className="text-2xl md:text-3xl font-bold text-stone-900 mb-4">{section.feature.title}</h3>
                              <div className="text-stone-600 leading-relaxed whitespace-pre-wrap">{section.feature.content}</div>
                            </div>
                          )}
                        </div>
                      </section>
                    )}

                    {section.type === 'COMPARISON' && section.enabled && section.comparison && (
                      <section>
                        <div className="mb-8 pl-4 border-l-4 border-primary">
                          <h2 className="text-2xl md:text-3xl font-bold text-stone-900 text-left">
                            {section.comparison.title}
                          </h2>
                        </div>
                        <div className="bg-white p-4 md:p-8 rounded-3xl shadow-sm border border-stone-100">
                          <BeforeAfterSlider 
                            beforeImage={section.comparison.beforeImage || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=2070&auto=format&fit=crop'} 
                            afterImage={section.comparison.afterImage || 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?q=80&w=2070&auto=format&fit=crop'} 
                            beforeLabel={section.comparison.beforeLabel}
                            afterLabel={section.comparison.afterLabel}
                          />
                        </div>
                      </section>
                    )}
                  </div>
                ))}

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
                        <div className={`flex flex-col ${
                          subItem.serviceIntro.blockB.layout === 'LEFT' ? 'md:flex-row' : 
                          subItem.serviceIntro.blockB.layout === 'RIGHT' ? 'md:flex-row-reverse' : 
                          subItem.serviceIntro.blockB.layout === 'TOP' ? 'flex-col' : 'flex-col-reverse'
                        } bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden`}>
                          <div className={`${
                            (subItem.serviceIntro.blockB.layout === 'LEFT' || subItem.serviceIntro.blockB.layout === 'RIGHT') && subItem.serviceIntro.blockB.content ? 'md:w-1/2' : 'w-full'
                          } aspect-video md:aspect-auto`}>
                            {subItem.serviceIntro.blockB.images && subItem.serviceIntro.blockB.images.filter(Boolean).length > 0 ? (
                              subItem.serviceIntro.blockB.showCarousel !== false ? (
                                <ProductGallery
                                  images={subItem.serviceIntro.blockB.images.filter((img): img is string => !!img)}
                                  autoplay={true}
                                  fill={subItem.serviceIntro.blockB.layout === 'LEFT' || subItem.serviceIntro.blockB.layout === 'RIGHT'}
                                />
                              ) : (
                                <div className={`grid ${subItem.serviceIntro.blockB.images.filter(Boolean).length === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} gap-0 w-full h-full`}>
                                  {subItem.serviceIntro.blockB.images.filter(Boolean).map((img, idx) => (
                                    <img 
                                      key={idx}
                                      src={img || undefined} 
                                      alt={`${subItem.serviceIntro.blockB.title}-${idx}`} 
                                      className="w-full h-full object-cover aspect-video"
                                      referrerPolicy="no-referrer"
                                    />
                                  ))}
                                </div>
                              )
                            ) : (
                              <img 
                                src='https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=2070&auto=format&fit=crop' 
                                alt={subItem.serviceIntro.blockB.title} 
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            )}
                          </div>
                          {subItem.serviceIntro.blockB.content && (
                            <div className={`${
                              subItem.serviceIntro.blockB.layout === 'LEFT' || subItem.serviceIntro.blockB.layout === 'RIGHT' ? 'md:w-1/2' : 'w-full'
                            } flex flex-col justify-center p-6 md:p-10`}>
                              <h3 className="text-2xl md:text-3xl font-bold text-stone-900 mb-4">{subItem.serviceIntro.blockB.title}</h3>
                              <div className="text-stone-600 leading-relaxed whitespace-pre-wrap">{subItem.serviceIntro.blockB.content}</div>
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
                          <img src={partner.image} alt={partner.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <CheckCircle2 className="text-primary w-6 h-6 md:w-8 md:h-8" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-stone-900 mb-2">{partner.title}</h3>
                        <p className="text-stone-600 text-sm md:text-base leading-relaxed">{partner.description}</p>
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
                              src={item.image}
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
                          <p className="text-stone-600 text-sm leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Core Services Module (Service Process) */}
            <section>
              <div className="mb-8 pl-4 border-l-4 border-primary">
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
                        <div className="w-[54px] h-[54px] md:w-[62px] md:h-[62px] bg-stone-50 border-4 border-white shadow-sm ring-1 ring-stone-200 group-hover:ring-[#8B5E34] rounded-full flex items-center justify-center transition-all duration-300">
                          <span className="text-stone-400 group-hover:text-[#8B5E34] font-bold text-xl md:text-2xl transition-colors duration-300">
                            {index + 1}
                          </span>
                        </div>
                      </div>

                      {/* Content Card */}
                      <div className="flex-1 bg-white p-6 md:p-8 rounded-[1.5rem] shadow-sm border border-stone-100 group-hover:shadow-md group-hover:border-[#8B5E34]/20 transition-all duration-300">
                        <h3 className="text-xl md:text-2xl font-bold text-stone-900 mb-3 group-hover:text-[#8B5E34] transition-colors">{service.title}</h3>
                        <p className="text-stone-600 leading-relaxed text-sm md:text-base">{service.content}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

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
      <AnimatePresence>
        {showStickyCTA && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white/80 backdrop-blur-md border-t border-stone-100 lg:hidden"
          >
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
          </motion.div>
        )}
      </AnimatePresence>

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

function ProductGallery({ images, autoplay = false, fill = false }: { images: string[], autoplay?: boolean, fill?: boolean }) {
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
    <div className={`relative group ${fill ? 'h-full' : ''}`}>
      <div className={`overflow-hidden rounded-2xl ${fill ? 'h-full' : 'aspect-[16/9] md:aspect-video'}`} ref={emblaRef}>
        <div className="flex">
          {images.filter(Boolean).map((src, index) => (
            <div key={index} className="flex-[0_0_100%] min-w-0 relative h-full">
              <img 
                src={src} 
                alt={`Product image ${index + 1}`}
                className="w-full h-full object-cover"
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
            <div className="px-6 pb-5 text-stone-600 leading-relaxed whitespace-pre-wrap">
              {answer}
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
            src={afterImage} 
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
            src={beforeImage} 
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
