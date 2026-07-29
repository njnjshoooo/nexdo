import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * SPA 環境下 GA4 追蹤：每次 React Router 路由改變就送 page_view event 給 GA4。
 *
 * 為什麼需要這個：GA4 的 gtag.js 預設會在初次載入時自動送一次 page_view，但 SPA
 * 的內部導航（例如 pushState / react-router 換頁）不會觸發整頁重新載入，
 * 所以 GA4 不會知道使用者換了頁。我們在 index.html 已把 `send_page_view: false`
 * 關掉預設 auto page view，改由這個 hook 統一手動送。
 *
 * 使用方式：在 <BrowserRouter> 內的元件（例如 App）呼叫 useGA4PageView()。
 */
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export function useGA4PageView(): void {
  const location = useLocation();
  useEffect(() => {
    if (typeof window.gtag !== 'function') return;
    window.gtag('event', 'page_view', {
      page_path: location.pathname + location.search,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [location.pathname, location.search]);
}
