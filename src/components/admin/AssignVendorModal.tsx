import React, { useState } from 'react';
import { Vendor } from '../../types/vendor';
import { Modal, ModalContent, ModalFooter, ModalHeader, ModalTitle } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Label } from '../ui/Label';

interface AssignVendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (vendorId: string) => void;
  vendors: Vendor[];
  currentVendorId?: string;
  isReassign?: boolean;
}

export default function AssignVendorModal({ isOpen, onClose, onAssign, vendors, currentVendorId, isReassign }: AssignVendorModalProps) {
  const [selectedVendorId, setSelectedVendorId] = useState(currentVendorId || '');

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader onClose={onClose}>
        <ModalTitle>{isReassign ? '重新指派廠商' : '指派廠商'}</ModalTitle>
      </ModalHeader>

      <ModalContent className="space-y-6">
        <div>
          <Label className="mb-2">選擇廠商</Label>
          <Select
            value={selectedVendorId}
            onChange={(e) => setSelectedVendorId(e.target.value)}
          >
            <option value="">請選擇廠商</option>
            {vendors.map(v => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </Select>
          {isReassign && (
            <p className="text-xs text-stone-500 mt-2">
              提示：因為預約時間可能已更改，您可以再次選擇原本退回該案的廠商。
            </p>
          )}
        </div>
      </ModalContent>

      <ModalFooter>
        <Button
          variant="secondary"
          onClick={onClose}
          className="flex-1"
        >
          取消
        </Button>
        <Button
          onClick={() => onAssign(selectedVendorId)}
          disabled={!selectedVendorId}
          className="flex-1"
        >
          確認指派
        </Button>
      </ModalFooter>
    </Modal>
  );
}
