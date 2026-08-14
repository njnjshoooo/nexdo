import React from 'react';

interface EyebrowProps {
  text?: string;
  align?: 'left' | 'center';
}

export const Eyebrow: React.FC<EyebrowProps> = ({ text, align = 'left' }) => {
  if (!text) return null;

  return (
    <div 
      className={`text-[18px] tracking-widest text-[#885200] font-extralight mb-5 flex items-center gap-2 ${
        align === 'center' ? 'justify-center' : ''
      }`}
    >
      <svg width="10" height="14" viewBox="0 0 10 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
        <path d="M5 0L10 7L5 14L0 7L5 0Z" fill="#885200"/>
      </svg>
      {text}
    </div>
  );
};
