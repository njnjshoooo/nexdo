import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '../ui/Button';

interface VendorIconButtonProps {
  icon: LucideIcon;
  onClick: () => void;
  title?: string;
  className?: string;
  variant?: 'primary' | 'danger' | 'neutral';
  size?: number;
}

export default function VendorIconButton({ 
  icon: Icon, 
  onClick, 
  title, 
  className = "", 
  variant = 'neutral',
  size = 18
}: VendorIconButtonProps) {
  const variantMap = {
    primary: 'ghost-primary',
    danger: 'ghost-destructive',
    neutral: 'ghost'
  } as const;

  return (
    <Button 
      onClick={onClick}
      variant={variantMap[variant]}
      size="icon"
      className={className}
      title={title}
    >
      <Icon size={size} />
    </Button>
  );
}
