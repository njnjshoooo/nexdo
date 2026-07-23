import { GeneralImageCarousel } from './GeneralImageCarousel';
import { WidgetProps } from './WidgetProps';

export function WidgetImageCarousel({ block, isSubItem }: WidgetProps) {
  const containerClass = isSubItem
    ? `p-6 md:p-10 bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden`
    : `py-16 bg-white overflow-hidden`;

  return (
    <section id={block.id} className={containerClass}>
      <div className="max-w-7xl mx-auto px-4">
        <GeneralImageCarousel items={block.imageCarousel?.items || []} />
      </div>
    </section>
  );
}
