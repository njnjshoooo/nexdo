import React, { useEffect, useState } from 'react';
import { Type } from 'lucide-react';

export default function FontSizeControl({ isDark }: { isDark?: boolean }) {
  const [fontSize, setFontSize] = useState<'18px' | '20px'>('18px');
  
  useEffect(() => {
    const savedFontSize = localStorage.getItem('app-font-size');
    if (savedFontSize === '18px' || savedFontSize === '20px') {
      setFontSize(savedFontSize);
      document.documentElement.style.fontSize = savedFontSize;
    } else {
      document.documentElement.style.fontSize = '18px'; // Default
    }
  }, []);

  const changeFontSize = (size: '18px' | '20px') => {
    setFontSize(size);
    localStorage.setItem('app-font-size', size);
    document.documentElement.style.fontSize = size;
  };

  return (
    <div className={`flex items-center gap-1 rounded-full p-1 border transition-colors ${isDark ? 'bg-white/10 border-white/20' : 'bg-stone-100 border-stone-200'}`}>
      <button
        onClick={() => changeFontSize('18px')}
        className={`w-7 h-7 flex items-center justify-center rounded-full text-sm transition-colors ${
          fontSize === '18px' 
            ? isDark ? 'bg-white text-stone-900 font-bold shadow-sm' : 'bg-white text-stone-900 font-bold shadow-sm'
            : isDark ? 'text-white hover:bg-white/20' : 'text-stone-500 hover:text-stone-900'
        }`}
        title="字體：中 (A) - 預設"
      >
        A
      </button>
      <button
        onClick={() => changeFontSize('20px')}
        className={`w-7 h-7 flex items-center justify-center rounded-full text-base transition-colors ${
          fontSize === '20px' 
            ? isDark ? 'bg-white text-stone-900 font-bold shadow-sm' : 'bg-white text-stone-900 font-bold shadow-sm'
            : isDark ? 'text-white hover:bg-white/20' : 'text-stone-500 hover:text-stone-900'
        }`}
        title="字體：大 (A+)"
      >
        A+
      </button>
    </div>
  );
}
