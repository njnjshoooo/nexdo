import React from 'react';
import { ChevronLeft, ChevronRight, Trash2, Eye, EyeOff } from 'lucide-react';

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

// 統一的卡片控制標頭元件 (含上下移、刪除、眼睛顯示/隱藏、編號)
interface EditorCardHeaderProps {
  index: number;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDelete: () => void;
  onToggleVisible?: () => void;
  isVisible?: boolean;
  title?: string | React.ReactNode;
  badgeLabel?: string;
}

export function EditorCardHeader({
  index,
  canMoveUp = true,
  canMoveDown = true,
  onMoveUp,
  onMoveDown,
  onDelete,
  onToggleVisible,
  isVisible = true,
  title,
  badgeLabel
}: EditorCardHeaderProps) {
  return (
    <>
      <div className="absolute top-4 right-4 flex items-center gap-1">
        {onToggleVisible && (
          <button
            type="button"
            onClick={onToggleVisible}
            className="p-1.5 text-stone-400 hover:text-primary transition-colors"
            title={isVisible ? "停用此區塊" : "啟用此區塊"}
          >
            {isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
        )}
        {onMoveUp && (
          <button
            type="button"
            onClick={onMoveUp}
            disabled={!canMoveUp}
            className="p-1.5 text-stone-400 hover:text-primary disabled:opacity-30 transition-colors"
            title="向上移動"
          >
            <ChevronLeft className="rotate-90" size={16} />
          </button>
        )}
        {onMoveDown && (
          <button
            type="button"
            onClick={onMoveDown}
            disabled={!canMoveDown}
            className="p-1.5 text-stone-400 hover:text-primary disabled:opacity-30 transition-colors"
            title="向下移動"
          >
            <ChevronRight className="rotate-90" size={16} />
          </button>
        )}
        {(onMoveUp || onMoveDown || onToggleVisible) && (
          <div className="w-px h-4 bg-stone-200 mx-1"></div>
        )}
        <button
          type="button"
          onClick={onDelete}
          className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          title="刪除"
        >
          <Trash2 size={16} />
        </button>
      </div>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-6 h-6 bg-stone-200 rounded text-[10px] font-bold text-stone-500 flex items-center justify-center">
          {index + 1}
        </div>
        {title && (
          <div>
            {badgeLabel && (
              <span className="text-[10px] font-black text-primary uppercase tracking-widest block leading-none mb-0.5">
                {badgeLabel}
              </span>
            )}
            <h3 className="font-bold text-stone-900 text-sm leading-tight">
              {title}
            </h3>
          </div>
        )}
      </div>
    </>
  );
}
