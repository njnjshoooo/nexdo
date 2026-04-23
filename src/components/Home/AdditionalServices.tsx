import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { pageService } from '../../services/pageService';
import { productService } from '../../services/productService';

export default function AdditionalServices({ data }: { data?: { title?: string; items: string[] } | string[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadServices = async () => {
      if (!data) {
        setLoading(false);
        return;
      }

      const rawItems = Array.isArray(data) ? data : data.items;
      if (!rawItems || rawItems.length === 0) {
        setLoading(false);
        return;
      }

      const loadedServices = await Promise.all(rawItems.map(async id => {
        const p = pageService.getById(id) || pageService.getBySlug(id);
        if (!p) return null;
        
        let description = '';
        let image = 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?q=80&w=2070&auto=format&fit=crop';
        
        if (p.content.subItem?.productId) {
          const product = await productService.getById(p.content.subItem.productId);
          if (product) {
            description = product.description;
            if (product.image) image = product.image;
          }
        }

        return {
          id: p.id,
          title: p.title,
          description,
          image,
          link: `/${p.slug}`
        };
      }));

      setServices(loadedServices.filter(Boolean));
      setLoading(false);
    };

    loadServices();
  }, [data]);

  if (!data || loading || services.length === 0) return null;

  const title = Array.isArray(data) ? '' : (data.title || '');

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = 340;
      if (direction === 'left') {
        current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  if (services.length === 0) return null;

  return (
    <section className="py-16 bg-[#FFF9F2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#FDF2E9] rounded-[3rem] p-8 md:p-16 relative overflow-visible">
          {title && <h2 className="text-3xl font-bold text-center text-[#4A3B32] mb-12">{title}</h2>}
          
          <div className="relative group">
            {/* 按鈕邏輯維持不變 */}
            <button 
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-8 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-stone-600 hover:text-primary hover:scale-110 transition-all"
            >
              <ChevronLeft size={24} />
            </button>
            
            <button 
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-8 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-stone-600 hover:text-primary hover:scale-110 transition-all"
            >
              <ChevronRight size={24} />
            </button>

            <div 
              ref={scrollRef}
              className="flex overflow-x-auto gap-6 py-12 -my-12 hide-scrollbar snap-x snap-mandatory px-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {services.map((service: any) => (
                <motion.div
                  key={`additional-service-${service.id}`}
                  className="flex-shrink-0 w-[300px] md:w-[340px] bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow snap-center flex flex-col"
                  whileHover={{ y: -5 }}
                >
                  <div className="w-full h-48 bg-stone-200 rounded-xl mb-6 overflow-hidden">
                    <img src={service.image} alt={service.title} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                  </div>
                  <h3 className="text-xl font-bold text-stone-900 mb-3">{service.title}</h3>
                  <p className="text-stone-600 text-sm leading-relaxed mb-8 flex-grow line-clamp-3">{service.description}</p>
                  <div className="flex justify-end mt-auto">
                    <Link to={service.link} className="inline-flex items-center gap-1 bg-[#885200] hover:bg-[#663D00] text-white text-sm font-medium px-5 py-2 rounded-full transition-colors">
                      {service.buttonText || '服務介紹'} <ArrowRight size={14} />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
