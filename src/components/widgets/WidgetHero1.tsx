import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { WidgetProps } from './WidgetProps';

export function WidgetHero1({ block, isFirstBlock, isSubItem, handleAnchorClick }: WidgetProps) {
  const containerClass = isSubItem
    ? `relative rounded-3xl overflow-hidden shadow-sm flex flex-col justify-end min-h-[500px] ${isFirstBlock ? 'mt-8' : ''}`
    : `relative w-full h-[70vh] min-h-[500px] max-h-[800px] flex flex-col justify-end overflow-hidden ${isFirstBlock ? 'mt-0' : 'mt-20'}`;

  return (
    <section id={block.id} className={containerClass}>
      <div className="absolute inset-0 z-0">
        <img src={block.hero1?.image || undefined} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10"></div>
      </div>

      <div className={`relative z-10 w-full ${isSubItem ? 'p-8 md:p-12' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 md:pb-20'}`}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl space-y-6">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-white whitespace-pre-line drop-shadow-md">
            {block.hero1?.title}
          </h1>
          
          <div className="flex flex-col gap-4 pt-4 max-w-md">
            {block.hero1?.buttons?.map((btn: any, i: number) => (
              <a 
                key={i} 
                href={btn.link} 
                onClick={(e) => handleAnchorClick && handleAnchorClick(e, btn.link)} 
                className="inline-flex items-center justify-between border-b border-white/40 pb-3 text-white/90 hover:text-white hover:border-white transition-colors group"
              >
                <span className="text-lg font-bold">{btn.text}</span>
                <ArrowUpRight className="w-5 h-5 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
              </a>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
