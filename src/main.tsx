import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import ErrorBoundary from './components/ErrorBoundary';
import ScrollToTop from './components/ScrollToTop';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <ScrollToTop />
        <AuthProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
);
