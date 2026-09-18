import React, { useEffect, useState } from 'react';
const KEY = 'nexdo-reading-size-v2';
export default function FontSizeControl({ isDark }: { isDark?: boolean }) {
  const [size, setSize] = useState('16px');
  useEffect(() => {
    const sync = () => {
      let next = '16px';
      try { if (localStorage.getItem(KEY) === '20px') next = '20px'; } catch {}
      setSize(next); document.documentElement.style.fontSize = next;
    };
    sync(); window.addEventListener('nexdo-font-size', sync);
    return () => window.removeEventListener('nexdo-font-size', sync);
  }, []);
  function change(next: string) {
    try { localStorage.setItem(KEY, next); } catch {}
    setSize(next); document.documentElement.style.fontSize = next;
    window.dispatchEvent(new Event('nexdo-font-size'));
  }
  return <div className={`flex gap-1 rounded-full p-1 border ${isDark ? 'text-white border-white/30' : 'text-stone-700 border-stone-200'}`} aria-label="閱讀字體大小">
    {[['16px', 'A', '標準字體'], ['20px', 'A+', '放大字體']].map(([value, label, title]) => <button key={value} type="button" onClick={() => change(value)} aria-label={title} aria-pressed={size === value} title={title} className={`min-w-[44px] min-h-[44px] rounded-full text-[16px] ${size === value ? 'bg-white text-stone-900 shadow-sm font-bold' : ''}`}>{label}</button>)}
  </div>;
}
