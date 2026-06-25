import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { pageService } from '../services/pageService';
import { formService } from '../services/formService';
import { Page, GeneralBlock } from '../types/admin';
import Markdown from 'react-markdown';
import { motion } from 'framer-motion'; // 確保你的專案是用 framer-motion 或 motion
import { 
  ArrowUpRight,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import DynamicForm from '../components/form/DynamicForm';

// 圖示對照表：確保後台選的圖示能正確顯示
// (已移除)

export default function GeneralPage({ page: propPage }: { page?: Page | null }) {
  const { slug, category } = useParams<{ slug: string, category: string }>();
  const navigate = useNavigate();

  // 1. 直接判斷：決定要顯示哪一頁
  const currentSlug = slug || 'home';
  const fullSlug = category ? `${category}/${currentSlug}` : currentSlug;
  const currentPage = propPage || pageService.getBySlug(fullSlug);

  // 2. 避免白屏：如果真的找不到資料，顯示錯誤提示
  if (!currentPage || !currentPage.content.general) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4 bg-stone-50">
        <h1 className="text-2xl font-bold text-stone-900">找不到頁面</h1>
        <p className="text-stone-500">此頁面可能尚未建立或路徑不正確 (Slug: {currentSlug})。</p>
        <button 
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-stone-800 text-white rounded-lg hover:bg-stone-700 transition-colors"
        >
          回到首頁
        </button>
      </div>
    );
  }

  const { blocks } = currentPage.content.general;

  return (
    <div className="min-h-screen bg-white pb-20">
      {blocks?.map((block: GeneralBlock, index: number) => {
        const isFirstBlock = index === 0;
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

        switch (block.type) {
          case 'HERO_1':
            return (
              <section key={block.id} id={block.id} className={`relative pt-24 pb-16 md:pt-20 md:pb-16 overflow-hidden bg-[#FFF9F2] ${isFirstBlock ? 'mt-20' : ''}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                      <h1 className="text-4xl md:text-5xl font-bold leading-tight text-stone-900 whitespace-pre-line">
                        {block.hero1?.title}
                      </h1>
                      <div className="flex flex-col gap-4">
                        {block.hero1?.buttons?.map((btn, i) => (
                          <a key={i} href={btn.link} onClick={(e) => handleAnchorClick(e, btn.link)} className="inline-flex items-center justify-between border-b border-stone-200 pb-3 text-stone-600 hover:text-primary hover:border-primary transition-colors group">
                            <span className="text-lg font-bold">{btn.text}</span>
                            <ArrowUpRight className="w-5 h-5 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                          </a>
                        ))}
                      </div>
                    </motion.div>
                    <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[3/2]">
                      <img src={block.hero1?.image || undefined} alt="" className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>
              </section>
            );

          case 'SECONDARY_SERVICES':
            return (
              <section key={block.id} id={block.id} className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {block.secondaryServices?.map((service, i) => {
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
            const additionalContent = block.additionalServices;
            const additionalItems = Array.isArray(additionalContent) ? additionalContent : (additionalContent?.items || []);
            const additionalTitle = Array.isArray(additionalContent) ? '更多專業服務' : (additionalContent?.title || '更多專業服務');
            
            return (
              <section key={block.id} id={block.id} className="py-20 bg-stone-50">
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
            }[block.text?.fontSize || 'body'];

            return (
              <section key={block.id} id={block.id} className={`py-16 bg-white ${isFirstBlock ? 'mt-20' : ''}`}>
                <div className="max-w-4xl mx-auto px-6">
                  <div className={`${textStyles} ${
                    block.text?.alignment === 'center' ? 'text-center' : 
                    block.text?.alignment === 'right' ? 'text-right' : ''
                  }`}>
                    <Markdown>{block.text?.content || ''}</Markdown>
                  </div>
                </div>
              </section>
            );

          case 'GRID':
            const cols = block.grid?.columns || 3;
            let gridClass = 'grid-cols-1 md:grid-cols-3 sm:grid-cols-2';
            if (cols === 2) gridClass = 'grid-cols-1 sm:grid-cols-2';
            if (cols === 3) gridClass = 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3';
            if (cols === 4) gridClass = 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4';
            if (cols === 5) gridClass = 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5';
            if (cols === 6) gridClass = 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6';

            return (
              <section key={block.id} id={block.id} className={`py-20 bg-stone-50 ${isFirstBlock ? 'mt-20' : ''}`}>
                <div className="max-w-7xl mx-auto px-4">
                  <h2 className="text-3xl font-bold text-center mb-16 text-stone-900">{block.grid?.title}</h2>
                  <div className={`grid ${gridClass} gap-8`}>
                    {block.grid?.items?.map((item, i) => {
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
              <section key={block.id} id={block.id} className={`relative pt-24 pb-16 md:pt-32 md:pb-24 bg-[#FFF9F2] overflow-hidden ${isFirstBlock ? 'mt-0' : ''}`}>
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
                        {block.hero2?.title}
                      </h1>
                      <p className="text-stone-600 leading-relaxed text-lg whitespace-pre-line">
                        {block.hero2?.description}
                      </p>
                      <div className="flex flex-wrap gap-4 pt-4">
                        {block.hero2?.mainButton?.isVisible && (
                          <a 
                            href={block.hero2.mainButton.value || '#'} 
                            onClick={(e) => handleAnchorClick(e, block.hero2?.mainButton.value, block.hero2?.mainButton.type)}
                            className="px-8 py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors"
                          >
                            {block.hero2.mainButton.text || '預約諮詢'}
                          </a>
                        )}
                        {block.hero2?.secondaryButton?.isVisible && (
                          <a 
                            href={block.hero2.secondaryButton.value || '#'} 
                            onClick={(e) => handleAnchorClick(e, block.hero2?.secondaryButton.value, block.hero2?.secondaryButton.type)}
                            className="px-8 py-4 bg-transparent border-2 border-primary text-primary rounded-xl font-bold hover:bg-primary/5 transition-colors"
                          >
                            {block.hero2.secondaryButton.text || '查看案例'}
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
                        src={block.hero2?.backgroundImage || undefined} 
                        alt={block.hero2?.title} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </motion.div>
                  </div>
                </div>
              </section>
            );

          case 'FORM':
            if (!block.form?.formId) return null;
            const form = formService.getById(block.form.formId);
            if (!form) return null;
            return (
              <section key={block.id} id={block.id} className="py-16 bg-[#FDF8F3]">
                <div className="max-w-3xl mx-auto px-4">
                  <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-xl">
                    <DynamicForm form={form} pageSlug={currentPage.slug} pageTitle={currentPage.title} />
                  </div>
                </div>
              </section>
            );

          case 'SPACER':
            return <div key={block.id} id={block.id} style={{ height: block.spacer?.height || 80 }} />;

          case 'SINGLE_IMAGE':
            return (
              <section key={block.id} id={block.id} className="py-16 bg-white">
                <div className="max-w-4xl mx-auto px-6">
                  <img src={block.singleImage?.image || undefined} alt={block.singleImage?.caption} className="w-full rounded-3xl shadow-lg" referrerPolicy="no-referrer" />
                  {block.singleImage?.caption && <p className="text-center text-stone-500 mt-4">{block.singleImage.caption}</p>}
                </div>
              </section>
            );

          case 'IMAGE_CAROUSEL':
            return (
              <section key={block.id} id={block.id} className="py-16 bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto px-4">
                  <GeneralImageCarousel items={block.imageCarousel?.items || []} />
                </div>
              </section>
            );

          case 'IMAGE_TEXT_GRID':
            return (
              <section key={block.id} id={block.id} className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                  {/* 強制左側文字、右側圖片 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div className="w-full md:order-1">
                      <h2 className="text-3xl font-bold text-stone-900 mb-6">{block.imageTextGrid?.title}</h2>
                      <div className="prose prose-stone mb-8">
                        <Markdown>{block.imageTextGrid?.content || ''}</Markdown>
                      </div>
                      {block.imageTextGrid?.cta?.text && (
                        <a href={block.imageTextGrid.cta.link} className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-bold hover:bg-primary/90 transition-all">
                          {block.imageTextGrid.cta.text}
                          <ArrowUpRight size={18} />
                        </a>
                      )}
                    </div>
                    <div className="w-full md:order-2">
                      <img 
                        src={block.imageTextGrid?.image || undefined} 
                        alt={block.imageTextGrid?.title} 
                        className="w-full rounded-3xl shadow-xl" 
                        referrerPolicy="no-referrer" 
                      />
                    </div>
                  </div>
                </div>
              </section>
            );

default:
return <div key={block.id} className="p-4 text-stone-400 italic text-center">不支援的區塊類型: {block.type}</div>;
}
})}
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