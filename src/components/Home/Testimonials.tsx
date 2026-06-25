import React from 'react';
import { Star, Quote } from 'lucide-react';

export default function Testimonials({ data, title, description }: { data?: any[], title?: string, description?: string }) {
  // 💡 如果資料庫沒資料，就不顯示此區塊
  if (!data || data.length === 0) return null;

  const displayTitle = title || "";
  const displayDescription = description || "";

  return (
    <section id="cases" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4">
            {displayTitle}
          </h2>
          <p className="text-lg text-stone-600 max-w-2xl mx-auto">
            {displayDescription}
          </p>
        </div>

        <div className="flex md:grid md:grid-cols-3 gap-6 md:gap-8 overflow-x-auto md:overflow-x-visible snap-x snap-mandatory pb-8 md:pb-0 scrollbar-hide">
          {data.map((item, index) => (
            <div 
              key={`testimonial-item-${index}`} 
              className="flex-shrink-0 w-[85%] md:w-full snap-center bg-[#FFFBF7] p-8 rounded-2xl border border-stone-100 shadow-sm hover:shadow-md transition-shadow relative"
            >
              {/* 💡 這裡裝飾用的 Quote 圖標顏色微調以符合你的風格 */}
              <Quote className="absolute top-6 right-6 text-[#516438]/10 w-12 h-12" />
              
              <div className="flex gap-1 mb-4">
                {[...Array(item.rating || 5)].map((_, i) => (
                  <Star key={`star-${index}-${i}`} size={16} className="fill-[#885200] text-[#885200]" />
                ))}
              </div>

              <div className="mb-6 min-h-[120px]">
                <p className="text-stone-700 leading-relaxed italic">
                  "{item.content}"
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-stone-200 pt-4">
                <div>
                  <h4 className="font-bold text-stone-900">{item.author}</h4>
                  <p className="text-xs text-stone-500">{item.role}</p>
                </div>
                <span className="text-xs font-medium px-2 py-1 bg-stone-100 text-stone-600 rounded">
                  {item.tag}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
