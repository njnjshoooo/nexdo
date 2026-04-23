import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '../ui/Button';

interface CreateButtonProps {
  onClick?: () => void;
  text: string;
  icon?: LucideIcon;
  className?: string;
}

const CreateButton: React.FC<CreateButtonProps> = ({ onClick, text, icon: Icon, className = "" }) => {
  return (
    <Button
      onClick={onClick}
      type="button"
      className={className}
    >
      {Icon && <Icon size={20} />}
      <span>{text}</span>
    </Button>
  );
};

export default CreateButton;
