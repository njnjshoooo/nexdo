import React from 'react';
import { MessageCircle, ClipboardCheck, FileText, Wrench } from 'lucide-react';

// 💡 建立圖標對照表
const IconMap: Record<string, React.ElementType> = {
  MessageCircle,
  ClipboardCheck,
  FileText,
  Wrench
};

export default function Process({ data }: { data?: any }) {
  if (!data) return null;
  
  const content = {
    title: data.title || '',
    description: data.description || '',
    steps: data.steps || [],
    footerLabels: data.footerLabels || [],
    buttonText: data.buttonText || '立即預約免費諮詢'
  };

  return (
    <section id="process" className="py-20 bg-warm-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4 whitespace-pre-line">
            {content.title}
          </h2>
          <p className="text-lg text-stone-600 max-w-2xl mx-auto">
            {content.description}
          </p>
        </div>

        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-10 left-0 w-full h-0.5 bg-stone-200 z-0"></div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
            {content.steps.map((step: any, index: number) => {
              const Icon = IconMap[step.icon] || MessageCircle; // 💡 動態選取圖標
              return (
                <div key={`process-step-${index}`} className="flex flex-col items-center text-center group">
                  <div className="w-20 h-20 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center text-[#885200] mb-6 group-hover:scale-110 transition-transform duration-300 relative">
                    <Icon size={32} />
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#516438] text-white rounded-full flex items-center justify-center font-bold text-sm border-2 border-white">
                      {index + 1}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-stone-900 mb-2">{step.title}</h3>
                  <span className="inline-block px-3 py-1 bg-stone-200 text-stone-700 text-xs font-bold rounded-full mb-3">
                    {content.footerLabels[index] || step.action}
                  </span>
                  <p className="text-stone-600 text-sm leading-relaxed max-w-[200px]">
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 底部預約按鈕維持原樣或也可改成動態 */}
        <div className="mt-16 text-center">
          <a
            href="#contact"
            className="inline-flex items-center justify-center gap-2 bg-[#885200] hover:bg-[#704300] text-white px-8 py-4 rounded-xl text-lg font-medium transition-all shadow-lg"
          >
            <MessageCircle size={20} />
            {content.buttonText}
          </a>
        </div>
      </div>
    </section>
  );
}
