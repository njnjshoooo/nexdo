import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: 'success' | 'inactive' | 'info' | 'warning' | 'error' | 'default';
  icon?: 'check' | 'cross' | 'none';
  text: string;
}

export default function StatusBadge({ status, icon = 'none', text }: StatusBadgeProps) {
  let colorClass = '';
  switch (status) {
    case 'success':
      colorClass = 'text-green-600';
      break;
    case 'inactive':
      colorClass = 'text-stone-400';
      break;
    case 'info':
      colorClass = 'text-blue-600';
      break;
    case 'warning':
      colorClass = 'text-yellow-600';
      break;
    case 'error':
      colorClass = 'text-red-600';
      break;
    default:
      colorClass = 'text-stone-600';
  }

  return (
    <span className={`flex items-center gap-1.5 text-sm font-medium ${colorClass} whitespace-nowrap`}>
      {icon === 'check' && <CheckCircle size={14} />}
      {icon === 'cross' && <XCircle size={14} />}
      {text}
    </span>
  );
}
