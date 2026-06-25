import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { pageService } from '../../services/pageService';
import { Card, CardImage, CardImageWrapper } from '../ui/Card';

export default function Services({ data }: { data?: any }) {
  const subtitle = data?.subtitle || '';
  const title = data?.title || '';
  const items = data?.items || [];

  if (!items || items.length === 0) return null;

  return (
    <section id="services" className="py-20 bg-[#FFF9F2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-2">
          <h3 className="text-[#885200] font-bold tracking-wider">{subtitle}</h3>
          <h2 className="text-3xl md:text-4xl font-bold text-stone-900">
            {title}
          </h2>
        </div>

        {/* Service Cards */}
        <div className="space-y-12">
          {items.map((service: any, index: number) => {
            // 💡 判斷是否為第一個項目 (Primary: 綠底白字)
            const isPrimary = index === 0;

            // 💡 自動帶入關聯頁面的資訊 (如果當前項目沒有填寫)
            const targetPage = service.pageId ? pageService.getById(service.pageId) : null;
            const displayTitle = service.title || targetPage?.title || service.tags?.[0]?.replace('#', '') || '專業服務';
            const displayDescription = service.description || targetPage?.content?.hero?.description || '';
            const displayImage = service.image || targetPage?.content?.hero?.backgroundImage || '';
            const displayTags = service.tags || targetPage?.content?.hero?.tags || [];

            return (
              <motion.div
                key={`service-item-${service.pageId || index}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`rounded-[2rem] border-none shadow-xl ${
                  isPrimary ? 'bg-[#516438] text-white' : 'bg-white text-stone-900'
                }`}>
                  <div className={`flex flex-col lg:flex-row ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                    
                    {/* Image Section */}
                    <div className="lg:w-1/2 relative p-6 lg:p-12 pb-0 lg:pb-12 flex flex-col justify-center">
                      <CardImageWrapper className="rounded-xl aspect-[4/3] shadow-lg">
                        <CardImage 
                          src={displayImage} 
                          alt={displayDescription} 
                        />
                      </CardImageWrapper>
                      
                      {/* Testimonial Caption */}
                      {service.testimonial && (
                        <div className={`mt-4 p-4 rounded-xl flex items-start gap-3 ${
                          isPrimary ? 'bg-[#43522d] text-white/90' : 'bg-[#FFF9F2] text-stone-600'
                        }`}>
                          <div className="mt-1 flex-shrink-0">
                            <User size={16} className={isPrimary ? 'text-white' : 'text-[#885200]'} />
                          </div>
                          <div>
                            <p className="text-sm font-medium mb-1">{service.testimonial.text}</p>
                            <p className={`text-xs opacity-75`}>
                              {service.testimonial.author}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Content Section */}
                    <div className="lg:w-1/2 p-8 lg:p-16 flex flex-col justify-center">
                      <h3 className={`text-3xl font-bold mb-4 ${isPrimary ? 'text-white' : 'text-stone-900'}`}>
                        {displayTitle} 
                      </h3>
                      
                      <p className={`text-lg mb-8 leading-relaxed ${
                        isPrimary ? 'text-white/90' : 'text-stone-600'
                      }`}>
                        {displayDescription}
                      </p>
                      
                      {/* Tags */}
                      <div className="flex flex-wrap gap-3 mb-10">
                        {displayTags.map((tag: string, i: number) => (
                          <span 
                            key={i} 
                            className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                              isPrimary 
                                ? 'bg-white/10 text-white border border-white/20' 
                                : 'bg-stone-100 text-stone-500'
                            }`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Action Button */}
                      <div>
                        <Link 
                          to={`/${service.pageId}`}
                          className={`inline-flex items-center gap-2 px-8 py-3 rounded-full text-sm font-bold transition-all shadow-md active:scale-95 ${
                            isPrimary
                              ? 'bg-white text-[#516438] hover:bg-stone-100'
                              : 'bg-[#885200] text-white hover:bg-[#704300]'
                          }`}
                        >
                          {service.buttonText || '服務介紹'}
                          <ArrowRight size={16} />
                        </Link>
                      </div>
                    </div>

                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
