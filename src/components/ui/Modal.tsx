import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, children, className }: ModalProps) {
  // Prevent body scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={cn("bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]", className)}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function ModalHeader({ children, className, onClose }: { children: React.ReactNode, className?: string, onClose?: () => void }) {
  return (
    <div className={cn("p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50/50 shrink-0", className)}>
      <div className="flex items-center gap-3 w-full">
        {children}
      </div>
      {onClose && (
        <button onClick={onClose} className="p-2 hover:bg-stone-200 rounded-full transition-colors shrink-0 ml-4">
          <X size={20} className="text-stone-400" />
        </button>
      )}
    </div>
  );
}

export function ModalTitle({ children, className }: { children: React.ReactNode, className?: string }) {
  return <h2 className={cn("text-xl font-bold text-stone-900", className)}>{children}</h2>;
}

export function ModalContent({ children, className }: { children: React.ReactNode, className?: string }) {
  return <div className={cn("p-6 md:p-8 overflow-y-auto", className)}>{children}</div>;
}

export function ModalFooter({ children, className }: { children: React.ReactNode, className?: string }) {
  return <div className={cn("p-6 bg-stone-50/50 border-t border-stone-100 flex items-center justify-end gap-3 shrink-0", className)}>{children}</div>;
}
