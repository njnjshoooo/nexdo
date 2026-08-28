import React from 'react';

interface AdminSearchBarProps {
  children: React.ReactNode;
  className?: string;
}

export default function AdminSearchBar({ children, className = "" }: AdminSearchBarProps) {
  return (
    <div className={`flex flex-col md:flex-row gap-4 mb-6 ${className}`}>
      {children}
    </div>
  );
}
