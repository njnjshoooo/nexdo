import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Modal, ModalContent, ModalFooter, ModalHeader, ModalTitle } from './ui/Modal';
import { Button } from './ui/Button';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'primary' | 'danger' | 'success';
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = '確定',
  cancelText = '取消',
  variant = 'primary'
}: ConfirmModalProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: <AlertCircle size={24} className="text-red-600" />,
          button: 'bg-red-600 hover:bg-red-700 shadow-red-200/50',
          title: 'text-red-600'
        };
      case 'success':
        return {
          icon: <CheckCircle2 size={24} className="text-emerald-600" />,
          button: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200/50',
          title: 'text-emerald-600'
        };
      default:
        return {
          icon: <AlertCircle size={24} className="text-primary" />,
          button: 'bg-primary hover:bg-primary/90 shadow-primary/20',
          title: 'text-stone-900'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader onClose={onClose}>
        {styles.icon}
        <ModalTitle className={styles.title}>{title}</ModalTitle>
      </ModalHeader>

      <ModalContent>
        <p className="text-stone-600 leading-relaxed">
          {message}
        </p>
      </ModalContent>

      <ModalFooter>
        <Button
          variant="secondary"
          onClick={onClose}
        >
          {cancelText}
        </Button>
        <Button
          variant={variant === 'danger' ? 'destructive' : 'default'}
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className={variant === 'success' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}
        >
          {confirmText}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
