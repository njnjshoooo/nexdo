import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { pageService } from '../services/pageService';
import { formService } from '../services/formService';
import { productService } from '../services/productService';
import { Page } from '../types/admin';
import { ArrowRight, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [productData, setProductData] = useState(() => 
    subItem.productId ? productService.getById(subItem.productId) : null
  );

  useEffect(() => {
    const updateProductData = () => {
      if (subItem.productId) {
        setProductData(productService.getById(subItem.productId));
      }
    };

    window.addEventListener('storage', updateProductData);
    return () => window.removeEventListener('storage', updateProductData);
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
  const [expectedTime, setExpectedTime] = useState('');
  const [notes, setNotes] = useState('');

  const handleAddToCart = () => {
    if (orderMode === 'FIXED' && productData) {
      // Validate required fields
      if (productData.requireDate && (!expectedDate1 || !expectedDate2 || !expectedDate3)) {
        alert('請填寫三個期望日期');
        return;
      }
      if (productData.requireTime && !expectedTime) {
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
        expectedTime: productData.requireTime ? expectedTime : undefined,
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

  return (
    <div className="min-h-screen bg-stone-50 pt-20 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          
          {/* Product Info Column (Top on Mobile, Right on Desktop) */}
          <div className="lg:w-1/3 order-1 lg:order-2" ref={productInfoRef}>
            <div className="bg-white p-5 md:p-8 rounded-3xl shadow-lg border border-stone-100">
              <div className="mb-4 md:mb-6">
                {productData?.image && (
                  <div className="mb-4 md:mb-6 rounded-2xl overflow-hidden aspect-[16/9] md:aspect-video">
                    <img 
                      src={productData.image} 
                      alt={productData.name} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
                <div className="flex items-center gap-2 mb-2 md:mb-4">
                  <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-xs md:text-sm font-bold">
                    熱門服務
                  </span>
                </div>
                <h1 className="text-2xl md:text-4xl font-bold text-stone-900 mb-2 md:mb-4 leading-tight">
                  {productData?.name || currentPage.title}
                </h1>
                
                {/* Price/Quote Display */}
                <div className="mb-4 md:mb-6">
                  {orderMode === 'FIXED' ? (
                    <div className="flex items-baseline gap-1">
                      <span className="text-xs md:text-sm font-bold text-stone-400">NT$</span>
                      <span className="text-2xl md:text-3xl font-black text-stone-900">
                        {((fixedConfig?.price || 0) + (productData?.variants?.find(v => v.id === selectedVariantId)?.price || 0)).toLocaleString()}
                      </span>
                      <span className="text-xs md:text-sm font-bold text-stone-400">
                        / {productData?.variants?.find(v => v.id === selectedVariantId)?.unit || fixedConfig?.unit || '次'}
                      </span>
                    </div>
                  ) : orderMode === 'INTERNAL_FORM' ? (
                    <div className="text-xl md:text-2xl font-bold text-stone-900">
                      {internalFormConfig?.priceText || '依需求報價'}
                    </div>
                  ) : (
                    <div className="text-xl md:text-2xl font-bold text-stone-900">
                      {externalLinkConfig?.priceText || '依需求報價'}
                    </div>
                  )}
                </div>

                <p className="text-stone-600 text-base md:text-lg leading-relaxed mb-4 md:mb-6 line-clamp-3 md:line-clamp-none">
                  {productData?.description}
                </p>

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
                            onChange={(e) => setExpectedDate1(e.target.value)}
                            className="w-full px-4 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                          />
                          <input 
                            type="date" 
                            value={expectedDate2}
                            onChange={(e) => setExpectedDate2(e.target.value)}
                            className="w-full px-4 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                          />
                          <input 
                            type="date" 
                            value={expectedDate3}
                            onChange={(e) => setExpectedDate3(e.target.value)}
                            className="w-full px-4 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                          />
                        </div>
                      </div>
                    )}
                    {productData.requireTime && (
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-stone-600 mb-1">期望時段 <span className="text-red-500">*</span></label>
                        <div className="flex flex-col gap-2">
                          <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${expectedTime === '9:00~12:00' ? 'border-primary bg-primary/5' : 'border-stone-100 hover:border-stone-200'}`}>
                            <input 
                              type="radio" 
                              name="expectedTime" 
                              value="9:00~12:00" 
                              checked={expectedTime === '9:00~12:00'}
                              onChange={(e) => setExpectedTime(e.target.value)}
                              className="hidden" 
                            />
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${expectedTime === '9:00~12:00' ? 'border-primary' : 'border-stone-300'}`}>
                              {expectedTime === '9:00~12:00' && <div className="w-2 h-2 rounded-full bg-primary" />}
                            </div>
                            <span className="text-sm text-stone-700">9:00~12:00</span>
                          </label>
                          <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${expectedTime === '13:00~18:00' ? 'border-primary bg-primary/5' : 'border-stone-100 hover:border-stone-200'}`}>
                            <input 
                              type="radio" 
                              name="expectedTime" 
                              value="13:00~18:00" 
                              checked={expectedTime === '13:00~18:00'}
                              onChange={(e) => setExpectedTime(e.target.value)}
                              className="hidden" 
                            />
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${expectedTime === '13:00~18:00' ? 'border-primary' : 'border-stone-300'}`}>
                              {expectedTime === '13:00~18:00' && <div className="w-2 h-2 rounded-full bg-primary" />}
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

                {subItem.button?.isVisible && (
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
              </div>
              
              <div className="border-t border-stone-100 pt-6">
                <p className="text-sm text-stone-500 text-center">
                  有任何疑問？歡迎直接聯繫我們
                </p>
              </div>
            </div>
          </div>

          {/* Content Column (Bottom on Mobile, Left on Desktop) */}
          <div className="flex-1 space-y-16 md:space-y-20 order-2 lg:order-1">
            
            {/* Core Services Module */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-stone-900 mb-8 mt-8 ml-4">
                {subItem.coreServicesSectionTitle || '核心服務'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {subItem.coreServices.map((service, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 hover:shadow-md transition-shadow"
                  >
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold mb-4">
                      {index + 1}
                    </div>
                    <h3 className="text-xl font-bold text-stone-900 mb-3">{service.title}</h3>
                    <p className="text-stone-600 leading-relaxed">{service.content}</p>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Professional Partners Module */}
            {subItem.partners && subItem.partners.length > 0 && (
              <section className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-stone-100">
                <div className="text-center mb-10">
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
                <h2 className="text-2xl md:text-3xl font-bold text-stone-900 mb-8">真實案例</h2>
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
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                            referrerPolicy="no-referrer"
                          />
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

            {/* Related Services Module */}
            {relatedPages.length > 0 && (
              <section>
                <h2 className="text-2xl md:text-3xl font-bold text-stone-900 mb-8">我們還提供</h2>
                <div className="md:hidden">
                  <ServiceCarousel 
                    services={relatedPages.map(p => ({ id: p.id, targetPageId: p.id }))} 
                  />
                </div>
                <div className="hidden md:grid grid-cols-2 gap-6">
                  {relatedPages.map(page => {
                    const relatedProductData = page.content.subItem?.productId 
                      ? productService.getById(page.content.subItem.productId) 
                      : null;
                      
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
