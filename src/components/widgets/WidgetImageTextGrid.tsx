import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { ArrowUpRight } from 'lucide-react';
import { WidgetProps } from './WidgetProps';

export function WidgetImageTextGrid({ block, isSubItem }: WidgetProps) {
  const containerClass = isSubItem
    ? `p-6 md:p-10 bg-white rounded-3xl shadow-sm border border-stone-100`
    : `py-20 bg-white`;

  const layout = block.imageTextGrid?.layout || 'imageLeft';
  
  // Determine grid classes based on layout
  let gridClass = "grid grid-cols-1 gap-12 items-center";
  let textOrderClass = "";
  let imageOrderClass = "";

  if (layout === 'imageLeft') {
    gridClass = "grid grid-cols-1 md:grid-cols-2 gap-12 items-center";
    imageOrderClass = "w-full order-1 md:order-1";
    textOrderClass = "w-full order-2 md:order-2";
  } else if (layout === 'imageRight') {
    gridClass = "grid grid-cols-1 md:grid-cols-2 gap-12 items-center";
    imageOrderClass = "w-full order-1 md:order-2";
    textOrderClass = "w-full order-2 md:order-1";
  } else if (layout === 'imageTop') {
    gridClass = "grid grid-cols-1 gap-12 items-center";
    imageOrderClass = "w-full order-1";
    textOrderClass = "w-full order-2";
  } else if (layout === 'imageBottom') {
    gridClass = "grid grid-cols-1 gap-12 items-center";
    imageOrderClass = "w-full order-2";
    textOrderClass = "w-full order-1";
  }

  return (
    <section id={block.id} className={containerClass}>
      <div className="max-w-7xl mx-auto px-4">
        <div className={gridClass}>
          <div className={textOrderClass}>
            {block.imageTextGrid?.title && (
              <h2 className="text-3xl font-bold text-stone-900 mb-6">{block.imageTextGrid.title}</h2>
            )}
            <div className="prose prose-stone mb-8">
              <Markdown remarkPlugins={[remarkGfm, remarkBreaks]}>{block.imageTextGrid?.content || ''}</Markdown>
            </div>
            {block.imageTextGrid?.cta?.text && (
              <a href={block.imageTextGrid.cta.link} className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-bold hover:bg-primary/90 transition-all">
                {block.imageTextGrid.cta.text}
                <ArrowUpRight size={18} />
              </a>
            )}
          </div>
          <div className={imageOrderClass}>
            {block.imageTextGrid?.image && (
              <img 
                src={block.imageTextGrid.image} 
                alt={block.imageTextGrid?.title || ''} 
                className="w-full rounded-3xl shadow-xl" 
                referrerPolicy="no-referrer" 
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
