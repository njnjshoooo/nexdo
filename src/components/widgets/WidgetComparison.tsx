import { useState, useRef, useEffect } from 'react';
import { WidgetProps } from './WidgetProps';
import { ArrowLeftRight } from 'lucide-react';

export function WidgetComparison({ block, isSubItem }: WidgetProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const containerClass = isSubItem
    ? `p-6 md:p-10 bg-stone-50 rounded-3xl shadow-sm border border-stone-100`
    : `py-20 bg-stone-50`;

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
    setSliderPosition(percent);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <section id={block.id} className={containerClass}>
      <div className="max-w-7xl mx-auto px-4">
        {block.comparison?.title && <h2 className="text-3xl font-bold text-stone-900 mb-12 text-center">{block.comparison.title}</h2>}
        <div className="max-w-4xl mx-auto">
          <div 
            ref={containerRef}
            className="relative aspect-[4/3] sm:aspect-[16/9] rounded-3xl overflow-hidden shadow-xl select-none cursor-ew-resize"
            onMouseDown={(e) => {
              setIsDragging(true);
              handleMove(e.clientX);
            }}
            onTouchStart={(e) => {
              setIsDragging(true);
              handleMove(e.touches[0].clientX);
            }}
          >
            {/* After Image (Background) */}
            <img src={block.comparison?.afterImage || undefined} alt="After" className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none" referrerPolicy="no-referrer" />
            
            {/* Before Image (Foreground, Clipped) */}
            <div 
              className="absolute inset-0 z-10 pointer-events-none select-none"
              style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            >
              <img src={block.comparison?.beforeImage || undefined} alt="Before" className="absolute inset-0 w-full h-full object-cover select-none" referrerPolicy="no-referrer" />
            </div>
            
            {/* The handle and divider */}
            <div 
              className="absolute top-0 bottom-0 z-20 w-1 bg-white cursor-ew-resize transform -translate-x-1/2 flex items-center justify-center shadow-[0_0_10px_rgba(0,0,0,0.3)] pointer-events-none"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-stone-200 text-stone-600 transition-transform pointer-events-auto hover:scale-110">
                <ArrowLeftRight size={20} />
              </div>
            </div>

            {/* Labels overlay */}
            <div className="absolute inset-0 z-30 pointer-events-none">
                {block.comparison?.beforeLabel && sliderPosition > 15 && <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-bold backdrop-blur-sm pointer-events-auto">{block.comparison.beforeLabel}</div>}
                {block.comparison?.afterLabel && sliderPosition < 85 && <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-bold shadow-sm pointer-events-auto">{block.comparison.afterLabel}</div>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
