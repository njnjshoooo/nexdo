import React from 'react';
import { Search } from 'lucide-react';

interface AdminSearchInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
}

export default function AdminSearchInput({
  value,
  onChange,
  placeholder = "搜尋...",
  className = ""
}: AdminSearchInputProps) {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all h-11 w-full text-sm placeholder:text-stone-400 placeholder:text-sm"
      />
    </div>
  );
}
