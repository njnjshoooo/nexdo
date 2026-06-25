import React from 'react';

// 欄位小標題 (label)
export function FieldLabel({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <label className={`block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 ml-1 ${className}`}>{children}</label>;
}

// 區塊中標 (section title)
export function SectionTitle({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <h3 className={`font-bold text-stone-900 flex items-center gap-2 border-b border-stone-50 pb-3 ${className}`}>{children}</h3>;
}

// 頁面大標 (page main title)
export function PageMainTitle({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <h2 className={`text-xl font-bold text-stone-900 tracking-tight ${className}`}>{children}</h2>;
}

// 區塊底色（白）與框線 (card container)
export function BlockContainer({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <div className={`bg-white p-6 rounded-xl shadow-sm border border-stone-200 ${className}`}>{children}</div>;
}

// 內部子區塊（如列表項目等底色）
export function InnerBlockContainer({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <div className={`bg-white p-6 rounded-xl shadow-sm border border-stone-200 relative ${className}`}>{children}</div>;
}

// 統一的文字輸入框
export const InputClass = "w-full border border-stone-200 bg-stone-50 p-3 rounded-xl text-sm focus:border-stone-900 focus:bg-white outline-none transition-all";
export const DisabledInputClass = "w-full border border-stone-200 p-3 rounded-xl text-sm bg-stone-50 text-stone-400 outline-none cursor-not-allowed transition-all";
export const PrimaryBtnClass = "bg-stone-900 hover:bg-stone-800 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-sm";
export const SecondaryBtnClass = "bg-white hover:bg-stone-50 border border-stone-200 text-stone-600 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap";
