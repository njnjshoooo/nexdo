import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { WidgetProps } from './WidgetProps';

export function WidgetText({ block, isFirstBlock, isSubItem }: WidgetProps) {
  const containerClass = isSubItem
    ? `p-6 md:p-10 bg-white rounded-3xl shadow-sm border border-stone-100 ${isFirstBlock ? 'mt-8' : ''}`
    : `py-16 bg-white ${isFirstBlock ? 'mt-20' : ''}`;
    
  const textStyles = {
    heading: `text-3xl font-bold text-center mb-16 text-stone-900`,
    medium_heading: `text-xl font-bold text-stone-900 mb-3`,
    body: `text-stone-600 leading-relaxed ${isSubItem ? 'text-[18px] md:text-[20px]' : ''} markdown-body`
  }[block.text?.fontSize || 'body'];

  return (
    <section id={block.id} className={containerClass}>
      <div className="max-w-4xl mx-auto px-6">
        <div className={`${textStyles} ${
          block.text?.alignment === 'center' ? 'text-center' : 
          block.text?.alignment === 'right' ? 'text-right' : ''
        }`}>
          <Markdown remarkPlugins={[remarkGfm, remarkBreaks]}>{block.text?.content || ''}</Markdown>
        </div>
      </div>
    </section>
  );
}
