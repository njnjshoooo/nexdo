import { motion } from 'motion/react';
import { pageService } from '../../services/pageService';
import { WidgetProps } from './WidgetProps';

export function WidgetSecondaryServices({ block, isSubItem, navigate }: WidgetProps) {
  const containerClass = isSubItem
    ? `p-6 md:p-10 bg-white rounded-3xl shadow-sm ring-1 ring-stone-900/5 hover:shadow-md transition-shadow duration-300`
    : `py-24 bg-white`;

  return (
    <section id={block.id} className={containerClass}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-12">
          {block.secondaryServices?.map((service: any, i: number) => {
            const targetPage = pageService.getById(service.pageId) || pageService.getBySlug(service.pageId);
            return (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group cursor-pointer"
                onClick={() => targetPage && navigate && navigate(`/${targetPage.slug}`)}
              >
                <div className="relative aspect-[4/3] rounded-3xl overflow-hidden mb-5 sm:mb-6 shadow-lg">
                  <img src={service.image || undefined} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {service.tags?.map((tag: string, j: number) => (
                    <span key={j} className="text-xs font-bold text-primary bg-primary/5 px-2 py-1 rounded-full">{tag}</span>
                  ))}
                </div>
                <p className="text-stone-600 mb-5 sm:mb-6 leading-relaxed">{service.description}</p>
                <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100">
                  <p className="text-stone-500 text-sm italic mb-2">「{service.testimonial?.text}」</p>
                  <p className="text-stone-400 text-xs">— {service.testimonial?.author}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
