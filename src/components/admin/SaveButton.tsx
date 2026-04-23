import React from 'react';
import { Check } from 'lucide-react';
import { Button } from '../ui/Button';

interface SaveButtonProps {
  status: 'idle' | 'saving' | 'saved';
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  className?: string;
  label?: string;
}

export default function SaveButton({ 
  status, 
  onClick, 
  type = 'submit', 
  disabled = false,
  className = '',
  label = '儲存設定'
}: SaveButtonProps) {
  const isSaving = status === 'saving';
  const isSaved = status === 'saved';

  return (
    <Button
      type={type}
      onClick={onClick}
      disabled={disabled || isSaving}
      isLoading={isSaving}
      variant={isSaved ? 'success' : 'default'}
      className={className}
    >
      {isSaved && <Check size={18} />}
      
      <span>
        {status === 'idle' && label}
        {status === 'saving' && '儲存中...'}
        {status === 'saved' && '已儲存'}
      </span>
    </Button>
  );
}
