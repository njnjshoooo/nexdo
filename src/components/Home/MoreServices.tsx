import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { pageService } from '../../services/pageService';
import { productService } from '../../services/productService';
import ServiceCarousel from '../ServiceCarousel';
import { ServiceItem } from '../../types/admin';
import { Card, CardContent, CardDescription, CardImage, CardImageWrapper, CardTitle } from '../ui/Card';

interface MoreServicesProps {
  data?: {
    title: string;
    description: string;
    pageIds: string[];
    defaultPriceText?: string;
  };
}

export default function MoreServices({ data }: MoreServicesProps) {
  const [loadedServices, setLoadedServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!data || !data.pageIds || data.pageIds.length === 0) {
        setLoading(false);
        return;
      }

      const servicesData = await Promise.all(data.pageIds.map(async (id, index) => {
        const targetPage = pageService.getById(id);
        const linkUrl = targetPage ? `/${targetPage.slug}` : null;
        const subItemContent = targetPage?.content?.subItem;
        const productData = subItemContent?.productId ? await productService.getById(subItemContent.productId) : null;
        
        const item: ServiceItem = {
          id,
          targetPageId: id
        };

        return {
          id: item.id || index,
          linkUrl,
          displayTitle: item.title || productData?.name || '',
          displayDescription: item.description || productData?.description || '',
          displayImage: item.image || productData?.image || '',
          displayChecklist: (item.items && item.items.length > 0) ? item.items : productData?.checklist?.map(c => c.text) || [],
          price: item.price || data.defaultPriceText || '依需求報價'
        };
      }));

      setLoadedServices(servicesData);
      setLoading(false);
    };

    loadData();
  }, [data]);

  if (!data || !data.pageIds || data.pageIds.length === 0 || loading) return null;

  const { title, description, pageIds } = data;

  // Convert pageIds to ServiceItem format for ServiceCarousel
  const carouselServices: ServiceItem[] = pageIds.map(id => ({
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
            {title || ''}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-stone-600 max-w-2xl mx-auto"
          >
            {description || ''}
          </motion.p>
        </div>

        {carouselServices.length > 3 ? (
          <ServiceCarousel services={carouselServices} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loadedServices.map((item, index) => {
              const CardContentUI = (
                <Card className="h-full rounded-2xl border-stone-100 shadow-lg hover:shadow-xl">
                  <CardImageWrapper className="h-56">
                    <CardImage 
                      src={item.displayImage} 
                      alt={item.displayTitle} 
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
                  </CardImageWrapper>
                  <CardContent className="p-8">
                    <CardTitle className="text-2xl text-[#4A5D3B] mb-3">{item.displayTitle}</CardTitle>
                    <CardDescription className="mb-6 h-20 line-clamp-3">{item.displayDescription}</CardDescription>
                    
                    <div className="space-y-3 mb-8 flex-grow">
                      {item.displayChecklist.map((subItem: string, i: number) => (
                        <div key={i} className="flex items-center gap-2 text-stone-700">
                          <CheckCircle size={18} className="text-[#E07A5F]" />
                          <span className="text-sm font-medium">{subItem}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="pt-6 border-t border-stone-100 flex items-center justify-between mt-auto">
                      <span className="text-2xl font-bold text-[#E07A5F]">{item.price}</span>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${item.linkUrl ? 'bg-[#4A5D3B] text-white' : 'bg-[#F5F0EB] text-[#4A5D3B] group-hover:bg-[#4A5D3B] group-hover:text-white'}`}>
                        <ArrowRight size={20} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );

              return (
                <motion.div
                  key={`more-service-${item.id}`}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="h-full"
                >
                  {item.linkUrl ? (
                    <Link to={item.linkUrl} className="block h-full">
                      {CardContentUI}
                    </Link>
                  ) : (
                    <div className="h-full">
                      {CardContentUI}
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
