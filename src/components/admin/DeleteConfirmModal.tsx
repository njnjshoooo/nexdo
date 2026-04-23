import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal, ModalContent, ModalFooter, ModalHeader, ModalTitle } from '../ui/Modal';
import { Button } from '../ui/Button';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message
}: DeleteConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader onClose={onClose}>
        <div className="flex items-center gap-3 text-red-600">
          <AlertTriangle size={24} />
          <ModalTitle className="text-red-600">{title}</ModalTitle>
        </div>
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
          取消
        </Button>
        <Button
          variant="destructive"
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          確定刪除
        </Button>
      </ModalFooter>
    </Modal>
  );
}
