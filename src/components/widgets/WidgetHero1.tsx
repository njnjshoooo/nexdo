import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { WidgetProps } from './WidgetProps';

export function WidgetHero1({ block, isFirstBlock, isSubItem, handleAnchorClick }: WidgetProps) {
  if (isSubItem) {
    return (
      <section id={block.id} className={`p-6 md:p-10 bg-[#FFF9F2] rounded-3xl shadow-sm ring-1 ring-stone-900/5 ${isFirstBlock ? 'mt-8' : ''}`}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-5">
              <h1 className="text-3xl md:text-4xl font-bold leading-tight text-stone-900 whitespace-pre-line">
                {block.hero1?.title}
              </h1>
              <div className="flex flex-col gap-4">
                {block.hero1?.buttons?.map((btn: any, i: number) => (
                  <a key={i} href={btn.link} onClick={(e) => handleAnchorClick && handleAnchorClick(e, btn.link)} className="inline-flex items-center justify-between border-b border-stone-200 pb-3 text-stone-600 hover:text-primary hover:border-primary transition-colors group">
                    <span className="text-lg font-bold">{btn.text}</span>
                    <ArrowUpRight className="w-5 h-5 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                  </a>
                ))}
              </div>
            </motion.div>
            <div className="relative rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center">
              <img src={block.hero1?.image || undefined} alt="" className="w-full h-auto object-contain" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id={block.id} className={`relative pt-24 pb-16 md:pt-20 md:pb-16 overflow-hidden bg-[#FFF9F2] ${isFirstBlock ? 'mt-20' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight text-stone-900 whitespace-pre-line">
              {block.hero1?.title}
            </h1>
            <div className="flex flex-col gap-4">
              {block.hero1?.buttons?.map((btn: any, i: number) => (
                <a key={i} href={btn.link} onClick={(e) => handleAnchorClick && handleAnchorClick(e, btn.link)} className="inline-flex items-center justify-between border-b border-stone-200 pb-3 text-stone-600 hover:text-primary hover:border-primary transition-colors group">
                  <span className="text-lg font-bold">{btn.text}</span>
                  <ArrowUpRight className="w-5 h-5 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                </a>
              ))}
            </div>
          </motion.div>
          <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[3/2]">
            <img src={block.hero1?.image || undefined} alt="" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </section>
  );
}
