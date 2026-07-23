import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { WidgetProps } from './WidgetProps';

export function WidgetGrid({ block, isFirstBlock, isSubItem }: WidgetProps) {
  const cols = Number(block.grid?.columns || 3);
  let gridClass = 'grid-cols-1 md:grid-cols-3 sm:grid-cols-2';
  if (cols === 2) gridClass = 'grid-cols-1 sm:grid-cols-2';
  if (cols === 3) gridClass = 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3';
  if (cols === 4) gridClass = 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4';
  if (cols === 5) gridClass = 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5';
  if (cols === 6) gridClass = 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6';

  const containerClass = isSubItem
    ? `p-6 md:p-10 bg-white rounded-3xl shadow-sm border border-stone-100 ${isFirstBlock ? 'mt-8' : ''}`
    : `py-20 bg-white ${isFirstBlock ? 'mt-20' : ''}`;

  return (
    <section id={block.id} className={containerClass}>
      <div className="max-w-7xl mx-auto px-4">
        {block.grid?.title && <h2 className={`text-3xl font-bold text-center ${isSubItem ? 'mb-10' : 'mb-16'} text-stone-900`}>{block.grid?.title}</h2>}
        <div className={`grid ${gridClass} gap-8`}>
          {block.grid?.items?.map((item: any, i: number) => {
            const isLink = !!item.link;
            const Wrapper = isLink ? 'a' : 'div';
            const wrapperProps = isLink ? { href: item.link, target: item.link?.startsWith('http') ? '_blank' : '_self', rel: 'noopener noreferrer' } : {};
            
            return (
              <Wrapper 
                key={i} 
                {...wrapperProps as any}
                className={`bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden flex flex-col ${isLink ? 'hover:shadow-md hover:border-primary/30 hover:-translate-y-1 transition-all cursor-pointer group' : 'hover:shadow-md transition-shadow'}`}
              >
                {item.showImage && item.image && (
                  <div className="w-full h-48 md:h-56 shrink-0 border-b border-stone-100 overflow-hidden">
                    <img 
                      src={item.image || undefined} 
                      alt={item.title} 
                      className={`w-full h-full object-cover ${isLink ? 'transition-transform duration-500 group-hover:scale-105' : ''}`} 
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
                <div className="p-6 flex flex-col flex-1">
                  {item.title && <h3 className={`text-xl font-bold mb-3 ${isLink ? 'text-stone-900 group-hover:text-primary transition-colors' : 'text-stone-900'}`}>{item.title}</h3>}
                  <div className="text-stone-600 leading-relaxed prose prose-stone prose-sm max-w-none">
                    <Markdown remarkPlugins={[remarkGfm, remarkBreaks]}>{item.description}</Markdown>
                  </div>
                </div>
              </Wrapper>
            );
          })}
        </div>
      </div>
    </section>
  );
}
