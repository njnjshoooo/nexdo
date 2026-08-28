import React, { useState, useEffect } from 'react';
import { Eye, Edit2, Trash2, Copy, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AdminTableProps {
  children: React.ReactNode;
}

export default function AdminTable({ children }: AdminTableProps) {
  return <>{children}</>;
}

AdminTable.Container = function AdminTableContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden overflow-x-auto">
      {children}
    </div>
  );
};

AdminTable.Main = function AdminTableMain({ children }: { children: React.ReactNode }) {
  return (
    <table className="w-full text-left border-collapse">
      {children}
    </table>
  );
};

AdminTable.Head = function AdminTableHead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="bg-stone-50 border-b border-stone-100">
      {children}
    </thead>
  );
};

AdminTable.Th = function AdminTableTh({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={`px-6 py-4 text-sm font-bold text-stone-600 ${className}`}>
      {children}
    </th>
  );
};

AdminTable.Body = function AdminTableBody({ children }: { children: React.ReactNode }) {
  return (
    <tbody className="divide-y divide-stone-50">
      {children}
    </tbody>
  );
};

AdminTable.Row = function AdminTableRow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <tr className={`hover:bg-stone-50/50 transition-colors ${className}`}>
      {children}
    </tr>
  );
};

AdminTable.Td = function AdminTableTd({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <td className={`px-6 py-4 text-stone-900 ${className}`}>
      {children}
    </td>
  );
};

AdminTable.Empty = function AdminTableEmpty({ colSpan, children }: { colSpan: number; children: React.ReactNode }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-12 text-center text-stone-400 text-sm">
        {children}
      </td>
    </tr>
  );
};

AdminTable.Actions = function AdminTableActions({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-end gap-1">
      {children}
    </div>
  );
};

AdminTable.Preview = function AdminTablePreview({ href, onClick }: { href?: string; onClick?: () => void }) {
  if (!href && !onClick) return null;
  
  const className = "p-2 rounded-lg transition-all duration-200 flex items-center justify-center text-stone-400 hover:text-primary hover:bg-primary/10";
  const title = "預覽";
  const icon = <Eye size={18} />;

  if (href) {
    return (
      <Link to={href} target="_blank" className={className} title={title}>
        {icon}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={className} title={title}>
      {icon}
    </button>
  );
};

AdminTable.Edit = function AdminTableEdit({ href, onClick }: { href?: string; onClick?: () => void }) {
  if (!href && !onClick) return null;
  
  const className = "p-2 rounded-lg transition-all duration-200 flex items-center justify-center text-stone-400 hover:text-blue-600 hover:bg-blue-50";
  const title = "編輯";
  const icon = <Edit2 size={18} />;

  if (href) {
    return (
      <Link to={href} className={className} title={title}>
        {icon}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={className} title={title}>
      {icon}
    </button>
  );
};

AdminTable.Copy = function AdminTableCopy({ value, title = "複製" }: { value: string; title?: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      // Optional: you could also trigger a global toast here if you have a toast system
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`p-2 rounded-lg transition-all duration-200 flex items-center justify-center ${
        copied 
          ? 'text-green-600 bg-green-50' 
          : 'text-stone-400 hover:text-stone-700 hover:bg-stone-100'
      }`}
      title={copied ? "已複製" : title}
    >
      {copied ? <Check size={18} /> : <Copy size={18} />}
    </button>
  );
};

AdminTable.Delete = function AdminTableDelete({ onClick }: { onClick?: () => void }) {
  if (!onClick) return null;
  return (
    <button
      onClick={onClick}
      className="p-2 rounded-lg transition-all duration-200 flex items-center justify-center text-stone-400 hover:text-red-600 hover:bg-red-50"
      title="刪除"
    >
      <Trash2 size={18} />
    </button>
  );
};
