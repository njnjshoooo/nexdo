import { motion } from 'motion/react';
import { WidgetProps } from './WidgetProps';

export function WidgetHero2({ block, isFirstBlock, isSubItem, handleAnchorClick }: WidgetProps) {
  const containerClass = isSubItem 
    ? `p-6 md:p-10 bg-[#FFF9F2] rounded-3xl shadow-sm ring-1 ring-stone-900/5 ${isFirstBlock ? 'mt-8' : ''}`
    : `relative pt-24 pb-16 md:pt-32 md:pb-24 bg-[#FFF9F2] overflow-hidden ${isFirstBlock ? 'mt-0' : ''}`;

  return (
    <section id={block.id} className={containerClass}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <h1 className="text-4xl md:text-5xl lg:text-5xl font-bold leading-tight text-stone-900 whitespace-pre-line">
              {block.hero2?.title}
            </h1>
            <p className="text-stone-600 leading-relaxed text-lg whitespace-pre-line">
              {block.hero2?.description}
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              {block.hero2?.mainButton?.isVisible && (
                <a 
                  href={block.hero2.mainButton.value || '#'} 
                  onClick={(e) => handleAnchorClick && handleAnchorClick(e, block.hero2?.mainButton.value, block.hero2?.mainButton.type)}
                  className="px-8 py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors"
                >
                  {block.hero2.mainButton.text || '預約諮詢'}
                </a>
              )}
              {block.hero2?.secondaryButton?.isVisible && (
                <a 
                  href={block.hero2.secondaryButton.value || '#'} 
                  onClick={(e) => handleAnchorClick && handleAnchorClick(e, block.hero2?.secondaryButton.value, block.hero2?.secondaryButton.type)}
                  className="px-8 py-4 bg-transparent border-2 border-primary text-primary rounded-xl font-bold hover:bg-primary/5 transition-colors"
                >
                  {block.hero2.secondaryButton.text || '查看案例'}
                </a>
              )}
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3] lg:aspect-square"
          >
            <img 
              src={block.hero2?.backgroundImage || undefined} 
              alt={block.hero2?.title} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
