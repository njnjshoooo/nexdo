import { WidgetProps } from './WidgetProps';

export function WidgetSpacer({ block }: WidgetProps) {
  return <div id={block.id} style={{ height: block.spacer?.height || 80 }} />;
}
