import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { pageService } from '../services/pageService';
import { productService } from '../services/productService';
import { formService } from '../services/formService';
import { Page } from '../types/admin';
import DynamicForm from '../components/form/DynamicForm';
import ServiceCarousel from '../components/ServiceCarousel';

export default function MajorItemPage({ page: propPage }: { page?: Page | null }) {
  const { slug, category } = useParams<{ slug: string, category: string }>();

  // 1. 直接判斷：決定要顯示哪一頁
  const currentSlug = slug || 'home';
  const fullSlug = category ? `${category}/${currentSlug}` : currentSlug;
  const currentPage = propPage || pageService.getBySlug(fullSlug);

  // 2. 避免白屏：如果真的找不到資料，顯示錯誤提示
  if (!currentPage || !currentPage.content.hero) {
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

  const { hero, services, cases, servicesSectionTitle } = currentPage.content;

  return (
    <div className="bg-[#FFF9F2] min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[600px] flex items-center mt-20 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src={hero.backgroundImage} 
            alt={hero.title} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-white/20"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12 md:py-0">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-lg bg-white/80 backdrop-blur-md p-8 md:p-12 rounded-[2rem] shadow-2xl"
          >
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight text-stone-900 mb-6 whitespace-pre-line">
              {hero.title}
            </h1>
            
            <p className="text-stone-600 leading-relaxed mb-8 text-sm md:text-base whitespace-pre-line">
              {hero.description}
            </p>
            
            <div className="flex flex-wrap gap-4">
              {hero.mainButton?.isVisible && (
                <a href={hero.mainButton.value || '#services'} className="px-8 py-3 bg-[#4A5D3B] text-white rounded-full font-bold hover:bg-[#3A4A2E] transition-colors text-sm md:text-base">
                  {hero.mainButton.text || '預約諮詢'}
                </a>
              )}
              {hero.secondaryButton?.isVisible && (
                <a href={hero.secondaryButton.value || '#cases'} className="px-8 py-3 bg-transparent border border-[#4A5D3B] text-[#4A5D3B] rounded-full font-bold hover:bg-[#4A5D3B]/5 transition-colors text-sm md:text-base">
                  {hero.secondaryButton.text || '查看案例'}
                </a>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Service Items Section */}
      <section id="services" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#4A5D3B] mb-4">
              {servicesSectionTitle || '全方位服務'}
            </h2>
            <p className="text-stone-600 max-w-2xl mx-auto">
              我們提供一站式的專業服務，解決您對居住環境的所有擔憂。
            </p>
          </div>

          {services.length > 3 ? (
            <ServiceCarousel services={services} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {services.map((item, index) => {
                const targetPage = item.targetPageId ? pageService.getById(item.targetPageId) : null;
                const linkUrl = targetPage ? `/${targetPage.slug}` : null;

                // Dynamic Data Fetching Logic
                const subItemContent = targetPage?.content?.subItem;
                const productData = subItemContent?.productId ? productService.getById(subItemContent.productId) : null;
                const displayTitle = item.title || productData?.name || '';
                const displayDescription = item.description || productData?.description || '';
                const displayImage = item.image || productData?.image || '';
                const displayChecklist = (item.items && item.items.length > 0) ? item.items : productData?.checklist?.map(c => c.text) || [];

                const CardContent = (
                  <>
                    <div className="h-56 overflow-hidden relative">
                      <img 
                        src={displayImage} 
                        alt={displayTitle} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
                    </div>
                    <div className="p-8">
                      <h3 className="text-2xl font-bold text-[#4A5D3B] mb-3">{displayTitle}</h3>
                      <p className="text-stone-600 mb-6 leading-relaxed h-20 line-clamp-3">{displayDescription}</p>
                      
                      <div className="space-y-3 mb-8">
                        {displayChecklist.map((subItem, i) => (
                          <div key={i} className="flex items-center gap-2 text-stone-700">
                            <CheckCircle size={18} className="text-[#E07A5F]" />
                            <span className="text-sm font-medium">{subItem}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="pt-6 border-t border-stone-100 flex items-center justify-between">
                        <span className="text-2xl font-bold text-[#E07A5F]">{item.price}</span>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${linkUrl ? 'bg-[#4A5D3B] text-white' : 'bg-[#F5F0EB] text-[#4A5D3B] group-hover:bg-[#4A5D3B] group-hover:text-white'}`}>
                          <ArrowRight size={20} />
                        </div>
                      </div>
                    </div>
                  </>
                );

                return (
                  <motion.div
                    key={item.id || index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-stone-100 h-full"
                  >
                    {linkUrl ? (
                      <Link to={linkUrl} className="block h-full">
                        {CardContent}
                      </Link>
                    ) : (
                      <div className="h-full">
                        {CardContent}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Service Cases Section */}
      {cases.length > 0 && (
        <section id="cases" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-[#4A5D3B] mb-4">實際改善案例</h2>
                <p className="text-stone-600 max-w-xl">
                  看看我們如何協助其他家庭改善居住環境，找回生活的安心與便利。
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {cases.map((item, index) => (
                <motion.div
                  key={item.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group cursor-pointer"
                >
                  <div className="rounded-2xl overflow-hidden mb-5 relative aspect-[4/3]">
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-[#4A5D3B]">
                      {item.tag}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-stone-800 mb-2 group-hover:text-[#E07A5F] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-stone-500 text-sm leading-relaxed">
                    {item.description}
                  </p>
                  <div className="mt-4 flex items-center text-[#E07A5F] text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
                    閱讀完整故事 <ArrowRight size={14} className="ml-1" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 底部預約表單 */}
      {currentPage.content.showForm && currentPage.content.formId && formService.getById(currentPage.content.formId) && (
        <div className="py-20 bg-stone-50">
          <div className="max-w-3xl mx-auto px-4">
            <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-xl border border-stone-100">
              <DynamicForm 
                form={formService.getById(currentPage.content.formId)!} 
                pageSlug={currentPage.slug} 
                pageTitle={currentPage.title} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
