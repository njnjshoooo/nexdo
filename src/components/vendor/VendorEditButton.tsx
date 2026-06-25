import React from 'react';
import { Eye } from 'lucide-react';
import VendorIconButton from './VendorIconButton';

interface VendorEditButtonProps {
  onClick: () => void;
  title?: string;
  className?: string;
}

export default function VendorEditButton({ 
  onClick, 
  title = "檢視/編輯", 
  className = "" 
}: VendorEditButtonProps) {
  return (
    <VendorIconButton 
      icon={Eye}
      onClick={onClick}
      title={title}
      variant="primary"
      className={className}
    />
  );
}
