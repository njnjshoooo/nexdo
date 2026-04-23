import React from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, MessageCircle } from 'lucide-react';

export default function Hero({ data }: { data?: any }) {
  // 💡 資料提取與預設值設定（確保後台沒填資料時，畫面依然精美）
  const subtitle = data?.subtitle || "";
  const title = data?.title || "";
  const image = data?.image || "";
  const buttons = data?.buttons || [];
  const imageTestimonial = {
    text: data?.imageTestimonial?.text || "",
    author: data?.imageTestimonial?.author || ""
  };

  return (
    <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 overflow-hidden">
      {/* Background Decorative Elements - 保持原樣 */}
      <div className="absolute top-0 right-0 -z-10 w-1/2 h-full bg-stone-100/50 rounded-bl-[100px] opacity-60"></div>
      <div className="absolute bottom-0 left-0 -z-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <h2 className="text-xl font-bold text-primary tracking-wide">
              {subtitle}
            </h2>
            
            {/* 💡 動態標題：支援換行符號 */}
            <h1 className="text-4xl md:text-5xl lg:text-5xl font-bold leading-tight text-stone-900 whitespace-pre-line">
              {title}
            </h1>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8 pt-8">
              {/* 💡 動態按鈕列表 */}
              {buttons.map((item: any) => (
                <a
                  key={item.text}
                  href={item.link}
                  className="group flex items-center justify-between border-b border-secondary/30 pb-3 text-secondary hover:text-primary hover:border-primary transition-colors"
                >
                  <span className="text-lg font-bold tracking-wide">{item.text}</span>
                  <ArrowUpRight className="w-5 h-5 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                </a>
              ))}
            </div>
          </motion.div>

          {/* Image Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative hidden md:block"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3]">
              {/* 💡 動態圖片 */}
              <img 
                src={image} 
                alt={title} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              
              {/* 💡 動態漂浮小卡 (Floating Card) */}
              <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-white/20">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0">
                    <MessageCircle size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-900">
                      {imageTestimonial.text}
                    </p>
                    <p className="text-xs text-stone-500 mt-1">
                      — {imageTestimonial.author}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Decorative dots */}
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-pattern-dots opacity-20"></div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
