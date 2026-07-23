import { WidgetProps } from './WidgetProps';

export function WidgetTextList({ block, isSubItem }: WidgetProps) {
  const containerClass = isSubItem
    ? `p-6 md:p-10 bg-white rounded-3xl shadow-sm border border-stone-100`
    : `py-20 bg-white`;

  return (
    <section id={block.id} className={containerClass}>
      <div className="max-w-3xl mx-auto px-4">
        {block.textList?.title && <h2 className="text-3xl font-bold text-stone-900 mb-12 text-center">{block.textList.title}</h2>}
        <div className="space-y-6">
          {block.textList?.items?.map((item: any, idx: number) => (
            <div key={item.id} className="flex gap-4 sm:gap-6 bg-stone-50 p-6 sm:p-8 rounded-3xl">
              <div className="text-primary font-bold text-2xl sm:text-3xl w-8 sm:w-12 shrink-0 pt-0.5">{idx + 1}</div>
              <div>
                {item.title && <h3 className="text-xl sm:text-2xl font-bold text-stone-900 mb-3">{item.title}</h3>}
                <p className="text-stone-700 leading-relaxed text-base sm:text-lg whitespace-pre-line">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
