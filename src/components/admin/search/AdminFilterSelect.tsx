import React from 'react';
import { Filter, ChevronDown } from 'lucide-react';

interface AdminFilterSelectProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
  className?: string;
}

export default function AdminFilterSelect({
  value,
  onChange,
  options,
  placeholder = "篩選...",
  className = ""
}: AdminFilterSelectProps) {
  return (
    <div className={`relative ${className}`}>
      <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
      <select
        value={value}
        onChange={onChange}
        className="w-full pl-10 pr-10 py-2.5 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all h-11 appearance-none cursor-pointer"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
        <ChevronDown size={18} />
      </div>
    </div>
  );
}
