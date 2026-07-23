import { WidgetProps } from './WidgetProps';

export function WidgetSingleImage({ block, isSubItem }: WidgetProps) {
  const containerClass = isSubItem
    ? `p-6 md:p-10 bg-white rounded-3xl shadow-sm border border-stone-100`
    : `py-16 bg-white`;

  return (
    <section id={block.id} className={containerClass}>
      <div className="max-w-4xl mx-auto px-6">
        <img src={block.singleImage?.image || undefined} alt={block.singleImage?.caption} className="w-full rounded-3xl shadow-lg" referrerPolicy="no-referrer" />
        {block.singleImage?.caption && <p className="text-center text-stone-500 mt-4">{block.singleImage.caption}</p>}
      </div>
    </section>
  );
}
