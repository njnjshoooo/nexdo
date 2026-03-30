import React, { useState, useEffect } from 'react';
import { Order } from '../../../types/admin';
import { Vendor } from '../../../types/vendor';
import { orderService } from '../../../services/orderService';
import { Eye, CheckCircle } from 'lucide-react';

interface PendingClosureOrdersProps {
  vendor: Vendor;
}

export default function PendingClosureOrders({ vendor }: PendingClosureOrdersProps) {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    loadData();
  }, [vendor.id]);

  const loadData = () => {
    const allOrders = orderService.getAll();
    const completedOrders = allOrders.filter(o => o.vendorId === vendor.id && o.status === 'COMPLETED');
    setOrders(completedOrders);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
      <div className="p-6 border-b border-stone-100">
        <h2 className="text-xl font-bold text-stone-900 mb-2">待結案列表</h2>
        <p className="text-sm text-stone-500">已完成服務，等待好齡居後台確認結案與撥款的訂單。</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-stone-50 text-stone-500 text-xs uppercase font-bold">
            <tr>
              <th className="px-6 py-4">訂單編號</th>
              <th className="px-6 py-4">客戶姓名</th>
              <th className="px-6 py-4">服務項目</th>
              <th className="px-6 py-4">服務人員</th>
              <th className="px-6 py-4">完成時間</th>
              <th className="px-6 py-4">狀態</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {orders.map(order => {
              const completedUpdate = order.statusUpdates?.find(u => u.status === 'COMPLETED');
              const activeUpdate = order.statusUpdates?.find(u => u.status === 'ACTIVE');
              
              return (
                <tr key={order.id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm font-bold text-stone-900">{order.id}</td>
                  <td className="px-6 py-4 text-sm text-stone-900">{order.customerInfo.name}</td>
                  <td className="px-6 py-4 text-sm text-stone-500 truncate max-w-[150px]">
                    {order.items.map(i => i.name).join(', ')}
                  </td>
                  <td className="px-6 py-4 text-sm text-stone-500">
                    {activeUpdate?.staffName || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-stone-500">
                    {completedUpdate ? new Date(completedUpdate.timestamp).toLocaleString() : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600">
                      <CheckCircle size={14} /> 待結案
                    </span>
                  </td>
                </tr>
              );
            })}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-stone-400">
                  目前沒有待結案訂單
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
