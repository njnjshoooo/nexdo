import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function GeneralImageCarousel({ items }: { items: { image: string, alt: string }[] }) {
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
