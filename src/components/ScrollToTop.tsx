import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '');
      
      // Try to find the element and scroll to it
      const tryScroll = (attempts = 0) => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        } else if (attempts < 10) {
          // Retry every 100ms up to 10 times (1 second total)
          setTimeout(() => tryScroll(attempts + 1), 100);
        }
      };
      
      tryScroll();
    } else {
      // No hash, scroll to top immediately
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant'
      });
    }
  }, [pathname, hash]);

  return null;
}
