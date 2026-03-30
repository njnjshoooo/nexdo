import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, User } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Services({ data }: { data?: any[] }) {
  if (!data || data.length === 0) return null;

  return (
    <section id="services" className="py-20 bg-[#FFF9F2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-2">
          <h3 className="text-[#885200] font-bold tracking-wider">我們提供</h3>
          <h2 className="text-3xl md:text-4xl font-bold text-stone-900">
            從家庭環境到銀髮健康，提供全面的生活服務
          </h2>
        </div>

        {/* Service Cards */}
        <div className="space-y-12">
          {data.map((service, index) => {
            // 💡 判斷是否為第一個項目 (Primary: 綠底白字)
            const isPrimary = index === 0;

            return (
              <motion.div
                key={service.pageId || index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`rounded-[2rem] overflow-hidden shadow-xl transition-all duration-300 ${
                  isPrimary ? 'bg-[#516438] text-white' : 'bg-white text-stone-900'
                }`}
              >
                {/* 💡 處理左右交錯：偶數索引圖片在左，奇數索引圖片在右 */}
                <div className={`flex flex-col lg:flex-row ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                  
                  {/* Image Section */}
                  <div className="lg:w-1/2 relative p-6 lg:p-12 pb-0 lg:pb-12 flex flex-col justify-center">
                    <div className="relative rounded-xl overflow-hidden aspect-[4/3] shadow-lg">
                      <img 
                        src={service.image} 
                        alt={service.description} 
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    
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
  {/* 💡 優先讀取 service.title，沒有才用 tag 墊後 */}
  <h3 className={`text-3xl font-bold mb-4 ${isPrimary ? 'text-white' : 'text-stone-900'}`}>
    {service.title || service.tags?.[0]?.replace('#', '') || '專業服務'} 
  </h3>
  
  <p className={`text-lg mb-8 leading-relaxed ${
    isPrimary ? 'text-white/90' : 'text-stone-600'
  }`}>
    {service.description}
  </p>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-3 mb-10">
                      {service.tags?.map((tag: string, i: number) => (
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
                        服務介紹
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>

                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
