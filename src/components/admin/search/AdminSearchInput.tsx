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
        className="pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:border-stone-900 focus:bg-white outline-none transition-all w-full text-sm placeholder:text-stone-400"
      />
    </div>
  );
}
