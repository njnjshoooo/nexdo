import { motion } from 'motion/react';
import { Eyebrow } from './Eyebrow';
import { WidgetProps } from './WidgetProps';

export function WidgetHero2({ block, isFirstBlock, isSubItem, handleAnchorClick }: WidgetProps) {
  const containerClass = isSubItem 
    ? `relative rounded-3xl overflow-hidden shadow-sm flex flex-col justify-end min-h-[500px] ${isFirstBlock ? 'mt-8' : ''}`
    : `relative w-full h-[80vh] min-h-[600px] max-h-[1000px] flex flex-col justify-end overflow-hidden ${isFirstBlock ? 'mt-0' : 'mt-20'}`;

  return (
    <section id={block.id} className={containerClass}>
      <div className="absolute inset-0 z-0">
        <img 
          src={block.hero2?.backgroundImage || undefined} 
          alt={block.hero2?.title} 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10"></div>
      </div>

      <div className={`relative z-10 w-full ${isSubItem ? 'p-8 md:p-12' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 md:pb-20'}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl space-y-6"
        >
          <Eyebrow text={block.hero2.eyebrow} />
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-white whitespace-pre-line drop-shadow-md">
            {block.hero2?.title}
          </h1>
          <p className="text-white/90 leading-relaxed text-base md:text-lg whitespace-pre-line drop-shadow-sm max-w-2xl">
            {block.hero2?.description}
          </p>
          <div className="flex flex-wrap gap-4 pt-6">
            {block.hero2?.mainButton?.isVisible && (
              <a 
                href={block.hero2.mainButton.value || '#'} 
                onClick={(e) => handleAnchorClick && handleAnchorClick(e, block.hero2?.mainButton.value, block.hero2?.mainButton.type)}
                className="px-8 py-4 bg-primary text-white rounded-full font-bold hover:bg-primary/90 transition-colors shadow-lg"
              >
                {block.hero2.mainButton.text || '預約諮詢'}
              </a>
            )}
            {block.hero2?.secondaryButton?.isVisible && (
              <a 
                href={block.hero2.secondaryButton.value || '#'} 
                onClick={(e) => handleAnchorClick && handleAnchorClick(e, block.hero2?.secondaryButton.value, block.hero2?.secondaryButton.type)}
                className="px-8 py-4 bg-black/30 backdrop-blur-sm border-2 border-white/80 text-white rounded-full font-bold hover:bg-white/20 transition-colors shadow-lg"
              >
                {block.hero2.secondaryButton.text || '查看案例'}
              </a>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
