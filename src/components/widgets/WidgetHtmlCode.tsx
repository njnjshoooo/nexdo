import { useEffect, useRef } from 'react';
import { WidgetProps } from './WidgetProps';

function HtmlBlock({ html }: { html: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (iframeRef.current && event.source === iframeRef.current.contentWindow) {
        if (event.data.type === 'resize') {
          iframeRef.current.style.height = `${event.data.height}px`;
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);
  
  const injectedHtml = `
    <style>
      /* Hide scrollbars inside the iframe to prevent double scrolling */
      html, body {
        margin: 0;
        padding: 0;
        overflow: hidden !important;
      }
    </style>
    ${html}
    <script>
      const sendHeight = () => {
        window.parent.postMessage({ type: 'resize', height: document.documentElement.scrollHeight }, '*');
      };
      window.addEventListener('load', sendHeight);
      window.addEventListener('resize', sendHeight);
      if (window.ResizeObserver) {
        new ResizeObserver(sendHeight).observe(document.body);
      }
    </script>
  `;
  
  return (
    <iframe 
      ref={iframeRef}
      srcDoc={injectedHtml}
      className="w-full border-0 transition-all duration-300 overflow-hidden block"
      scrolling="no"
      title="Custom Code"
      sandbox="allow-scripts allow-popups allow-forms allow-same-origin"
    />
  );
}

export function WidgetHtmlCode({ block }: WidgetProps) {
  const containerClass = `w-full overflow-hidden rounded-3xl`;

  return (
    <section id={block.id} className={containerClass}>
      <HtmlBlock html={block.htmlCode?.html || ''} />
    </section>
  );
}
