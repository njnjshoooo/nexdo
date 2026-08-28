import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import ErrorBoundary from './components/ErrorBoundary';
import ScrollToTop from './components/ScrollToTop';

// 全域攔截器：強制所有指向小遊戲與外連的連結都在新分頁開啟，並容錯處理常見格式
window.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  const anchor = target?.closest('a');
  
  if (anchor) {
    let href = anchor.getAttribute('href');
    if (!href) return;

    // 清理 url: 前綴（Markdown 常見誤植）
    if (/^url:/i.test(href)) {
      href = href.replace(/^url:/i, '').trim();
      anchor.setAttribute('href', href);
    }

    // 自動補齊 /minigame 斜線
    if (/^minigame(\/|#|$)/i.test(href)) {
      href = '/' + href;
      anchor.setAttribute('href', href);
    }

    // 只要包含 minigame 或 http/https 外部連結，強制開新分頁
    const isMinigame = href.includes('minigame');
    const isExternal = href.startsWith('http://') || href.startsWith('https://');

    if (isMinigame || isExternal) {
      anchor.setAttribute('target', '_blank');
      anchor.setAttribute('rel', 'noopener noreferrer');
    }
  }
}, true); // 使用 capture 階段，確保在 React Router 攔截之前執行

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <HelmetProvider>
        <BrowserRouter>
          <ScrollToTop />
          <AuthProvider>
            <CartProvider>
              <App />
            </CartProvider>
          </AuthProvider>
        </BrowserRouter>
      </HelmetProvider>
    </ErrorBoundary>
  </StrictMode>,
);
// trigger reload
