import { useForm } from '../../hooks/useForm';
import DynamicForm from '../form/DynamicForm';
import { WidgetProps } from './WidgetProps';

function FormBlock({ formId, pageSlug, pageTitle, blockId }: { formId: string, pageSlug: string, pageTitle: string, blockId: string }) {
  const form = useForm(formId);
  if (!form) return null;
  return (
    <section key={blockId} id={blockId} className="py-16 bg-[#FDF8F3]">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-xl">
          <DynamicForm form={form} pageSlug={pageSlug} pageTitle={pageTitle} />
        </div>
      </div>
    </section>
  );
}

export function WidgetForm({ block, currentPage }: WidgetProps) {
  if (!block.form?.formId || !currentPage) return null;
  return <FormBlock blockId={block.id} formId={block.form.formId} pageSlug={currentPage.slug} pageTitle={currentPage.title} />;
}
