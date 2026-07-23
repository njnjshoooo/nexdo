import { WidgetHero1 } from './WidgetHero1';
import { WidgetHero2 } from './WidgetHero2';
import { WidgetText } from './WidgetText';
import { WidgetGrid } from './WidgetGrid';
import { WidgetForm } from './WidgetForm';
import { WidgetSpacer } from './WidgetSpacer';
import { WidgetSingleImage } from './WidgetSingleImage';
import { WidgetImageCarousel } from './WidgetImageCarousel';
import { WidgetImageTextGrid } from './WidgetImageTextGrid';
import { WidgetComparison } from './WidgetComparison';
import { WidgetTextList } from './WidgetTextList';
import { WidgetHtmlCode } from './WidgetHtmlCode';
import { WidgetSecondaryServices } from './WidgetSecondaryServices';
import { WidgetAdditionalServices } from './WidgetAdditionalServices';
import { WidgetProps } from './WidgetProps';

export function WidgetRenderer(props: WidgetProps) {
  const { block } = props;
  
  switch (block.type) {
    case 'HERO_1': return <WidgetHero1 {...props} />;
    case 'HERO_2': return <WidgetHero2 {...props} />;
    case 'TEXT': return <WidgetText {...props} />;
    case 'GRID': return <WidgetGrid {...props} />;
    case 'FORM': return <WidgetForm {...props} />;
    case 'SPACER': return <WidgetSpacer {...props} />;
    case 'SINGLE_IMAGE': return <WidgetSingleImage {...props} />;
    case 'IMAGE_CAROUSEL': return <WidgetImageCarousel {...props} />;
    case 'IMAGE_TEXT_GRID': return <WidgetImageTextGrid {...props} />;
    case 'COMPARISON': return <WidgetComparison {...props} />;
    case 'TEXT_LIST': return <WidgetTextList {...props} />;
    case 'HTML_CODE': return <WidgetHtmlCode {...props} />;
    case 'SECONDARY_SERVICES': return <WidgetSecondaryServices {...props} />;
    case 'ADDITIONAL_SERVICES': return <WidgetAdditionalServices {...props} />;
    default:
      return <div key={block.id} className="p-4 text-stone-400 italic text-center">不支援的區塊類型: {block.type}</div>;
  }
}
