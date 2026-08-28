import React from 'react';
import { OrderStatus, getOrderStatusDisplay, getOrderStatusColor } from '../../constants/orderStatus';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  role?: 'admin' | 'vendor' | 'customer';
  className?: string;
}

export default function OrderStatusBadge({ status, role = 'admin', className = '' }: OrderStatusBadgeProps) {
  const label = getOrderStatusDisplay(status, role);
  const colorClass = getOrderStatusColor(status);

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${colorClass} ${className}`}>
      {label}
    </span>
  );
}
