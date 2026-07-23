import { ArrowUpRight } from 'lucide-react';
import { pageService } from '../../services/pageService';
import { WidgetProps } from './WidgetProps';

export function WidgetAdditionalServices({ block, isSubItem }: WidgetProps) {
  const containerClass = isSubItem
    ? `p-6 md:p-10 bg-white rounded-3xl shadow-sm ring-1 ring-stone-900/5 hover:shadow-md transition-shadow duration-300`
    : `py-20 bg-stone-50`;

  const additionalContent = block.additionalServices;
  const additionalItems = Array.isArray(additionalContent) ? additionalContent : (additionalContent?.items || []);
  const additionalTitle = Array.isArray(additionalContent) ? '更多專業服務' : (additionalContent?.title || '更多專業服務');
  
  return (
    <section id={block.id} className={containerClass}>
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-stone-900 mb-12 text-center">{additionalTitle}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {additionalItems.map((id: string, i: number) => {
            const p = pageService.getById(id) || pageService.getBySlug(id);
            if (!p) return null;
            return (
              <a key={i} href={`/${p.slug}`} className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
                <span className="font-bold text-stone-800">{p.title}</span>
                <ArrowUpRight className="w-5 h-5 text-stone-400 group-hover:text-primary transition-colors" />
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
