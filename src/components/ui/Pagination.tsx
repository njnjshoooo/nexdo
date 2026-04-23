import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '../../lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ currentPage, totalPages, onPageChange, className }: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className={cn("flex items-center justify-center gap-1", className)}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg text-stone-500 hover:bg-stone-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft size={20} />
      </button>

      {getPageNumbers().map((page, index) => (
        <React.Fragment key={index}>
          {page === '...' ? (
            <div className="px-2 text-stone-400 flex items-center justify-center">
              <MoreHorizontal size={20} />
            </div>
          ) : (
            <button
              onClick={() => onPageChange(page as number)}
              className={cn(
                "min-w-[40px] h-10 px-4 rounded-lg font-bold text-sm transition-colors",
                currentPage === page
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "text-stone-600 hover:bg-stone-100"
              )}
            >
              {page}
            </button>
          )}
        </React.Fragment>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg text-stone-500 hover:bg-stone-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}
