import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AdminPageHeaderProps {
  title: string;
  subtitle?: string | React.ReactNode;
  statusIndicator?: React.ReactNode;
  backTo: string;
  actionButtons?: React.ReactNode;
}

export default function AdminPageHeader({ title, subtitle, statusIndicator, backTo, actionButtons }: AdminPageHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="sticky top-0 z-20 bg-stone-50/80 backdrop-blur-md border-b border-stone-200 -mx-4 px-4 py-4 mb-8 sm:-mx-8 sm:px-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <button 
            type="button" 
            onClick={() => navigate(backTo)} 
            className="p-2 hover:bg-stone-200 rounded-full transition-colors text-stone-600"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-stone-900">{title}</h1>
            {statusIndicator && (
              <div className="flex items-center gap-2 mt-1">
                {statusIndicator}
              </div>
            )}
            {subtitle && (
              typeof subtitle === 'string' 
                ? <p className="text-stone-500 text-sm mt-1">{subtitle}</p>
                : subtitle
            )}
          </div>
        </div>
        
        {actionButtons && (
          <div className="flex items-center gap-3">
            {actionButtons}
          </div>
        )}
      </div>
    </div>
  );
}
