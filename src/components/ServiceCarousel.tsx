import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import { pageService } from '../services/pageService';
import { productService } from '../services/productService';
import { ServiceItem } from '../types/admin';

interface ServiceCarouselProps {
  services: ServiceItem[];
}

export default function ServiceCarousel({ services }: ServiceCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: false,
  });

  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setPrevBtnEnabled(emblaApi.canScrollPrev());
    setNextBtnEnabled(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  return (
    <div className="relative group/carousel">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex -ml-4 md:-ml-8">
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
                    <span className="text-2xl font-bold text-[#E07A5F]">{item.price}</span>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${linkUrl ? 'bg-[#4A5D3B] text-white' : 'bg-[#F5F0EB] text-[#4A5D3B] group-hover:bg-[#4A5D3B] group-hover:text-white'}`}>
                      <ArrowRight size={20} />
                    </div>
                  </div>
                </div>
              </div>
            );

            return (
              <div 
                key={item.id || index} 
                className="flex-[0_0_83.333333%] min-w-0 pl-4 md:flex-[0_0_50%] md:pl-8 lg:flex-[0_0_33.333333%]"
              >
                <motion.div
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
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={scrollPrev}
        disabled={!prevBtnEnabled}
        className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-8 w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center text-[#4A5D3B] transition-all z-20 ${!prevBtnEnabled ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        aria-label="Previous slide"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={scrollNext}
        disabled={!nextBtnEnabled}
        className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-8 w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center text-[#4A5D3B] transition-all z-20 ${!nextBtnEnabled ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        aria-label="Next slide"
      >
        <ChevronRight size={24} />
      </button>

      {/* Pagination Dots */}
      <div className="flex justify-center gap-2 mt-12">
        {scrollSnaps.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${index === selectedIndex ? 'bg-[#E07A5F] w-8' : 'bg-stone-300'}`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
