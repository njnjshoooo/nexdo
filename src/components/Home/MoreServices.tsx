import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { pageService } from '../../services/pageService';
import { productService } from '../../services/productService';
import ServiceCarousel from '../ServiceCarousel';
import { ServiceItem } from '../../types/admin';

interface MoreServicesProps {
  data?: {
    title: string;
    description: string;
    pageIds: string[];
  };
}

export default function MoreServices({ data }: MoreServicesProps) {
  if (!data || !data.pageIds || data.pageIds.length === 0) return null;

  const { title, description, pageIds } = data;

  // Convert pageIds to ServiceItem format for ServiceCarousel
  const services: ServiceItem[] = pageIds.map(id => ({
    id,
    targetPageId: id
  }));

  return (
    <section className="py-24 bg-[#FFF9F2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-[#4A5D3B] mb-4"
          >
            {title || '我們還提供'}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-stone-600 max-w-2xl mx-auto"
          >
            {description || '您可以自由編輯的文字'}
          </motion.p>
        </div>

        {services.length > 3 ? (
          <ServiceCarousel services={services} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((item, index) => {
              const targetPage = item.targetPageId ? pageService.getById(item.targetPageId) : null;
              const linkUrl = targetPage ? `/${targetPage.slug}` : null;

              const subItemContent = targetPage?.content?.subItem;
              const productData = subItemContent?.productId ? productService.getById(subItemContent.productId) : null;
              const displayTitle = item.title || productData?.name || '';
              const displayDescription = item.description || productData?.description || '';
              const displayImage = item.image || productData?.image || '';
              const displayChecklist = (item.items && item.items.length > 0) ? item.items : productData?.checklist?.map(c => c.text) || [];

              const CardContent = (
                <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-stone-100 h-full flex flex-col">
                  <div className="h-56 overflow-hidden relative">
                    <img 
                      src={displayImage} 
                      alt={displayTitle} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
                  </div>
                  <div className="p-8 flex-grow flex flex-col">
                    <h3 className="text-2xl font-bold text-[#4A5D3B] mb-3">{displayTitle}</h3>
                    <p className="text-stone-600 mb-6 leading-relaxed h-20 line-clamp-3">{displayDescription}</p>
                    
                    <div className="space-y-3 mb-8 flex-grow">
                      {displayChecklist.map((subItem, i) => (
                        <div key={i} className="flex items-center gap-2 text-stone-700">
                          <CheckCircle size={18} className="text-[#E07A5F]" />
                          <span className="text-sm font-medium">{subItem}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="pt-6 border-t border-stone-100 flex items-center justify-between mt-auto">
                      <span className="text-2xl font-bold text-[#E07A5F]">{item.price || '依需求報價'}</span>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${linkUrl ? 'bg-[#4A5D3B] text-white' : 'bg-[#F5F0EB] text-[#4A5D3B] group-hover:bg-[#4A5D3B] group-hover:text-white'}`}>
                        <ArrowRight size={20} />
                      </div>
                    </div>
                  </div>
                </div>
              );

              return (
                <motion.div
                  key={item.id || index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group h-full"
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
  );
}
