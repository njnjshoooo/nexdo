import React from 'react';
import { Trash2 } from 'lucide-react';
import VendorIconButton from './VendorIconButton';

interface VendorDeleteButtonProps {
  onClick: () => void;
  title?: string;
  className?: string;
}

export default function VendorDeleteButton({ 
  onClick, 
  title = "刪除", 
  className = "" 
}: VendorDeleteButtonProps) {
  return (
    <VendorIconButton 
      icon={Trash2}
      onClick={onClick}
      title={title}
      variant="danger"
      className={className}
    />
  );
}
