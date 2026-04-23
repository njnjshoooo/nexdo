import React, { useState, useEffect } from 'react';
import { Order, Statement } from '../../../types/admin';
import { Vendor } from '../../../types/vendor';
import { orderService } from '../../../services/orderService';
import { statementService } from '../../../services/statementService';
import { CheckCircle, Calendar } from 'lucide-react';
import OrderStatusBadge from '../../../components/admin/OrderStatusBadge';
import ConfirmModal from '../../../components/ConfirmModal';
import AdminTable from '../../../components/admin/AdminTable';

interface PendingClosureOrdersProps {
  vendor: Vendor;
}

export default function PendingClosureOrders({ vendor }: PendingClosureOrdersProps) {
  const [groupedOrders, setGroupedOrders] = useState<Record<string, Order[]>>({});
  const [activeMonth, setActiveMonth] = useState<string>('');
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    month: string;
    orders: Order[];
  }>({ isOpen: false, month: '', orders: [] });

  useEffect(() => {
    loadData();
  }, [vendor.id]);

  const getMonthKey = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  const loadData = async () => {
    const allOrders = await orderService.getAll();
    // Include PAYOUT_REQUEST, PENDING_PAYMENT, PAID for grouping
    // but only display PAYOUT_REQUEST as "unsubmitted"
    const relevantOrders = allOrders.filter(o => 
      o.vendorId === vendor.id && 
      ['PAYOUT_REQUEST', 'PENDING_PAYMENT', 'PAID'].includes(o.status)
    );
    
    const grouped = relevantOrders.reduce((acc, order) => {
      // Use completedAt/reviewedAt if available, otherwise createdAt
      // Let's check statusUpdates for COMPLETED
      const completedUpdate = order.statusUpdates?.find(u => u.status === 'COMPLETED');
      const dateToUse = completedUpdate ? completedUpdate.timestamp : order.createdAt;
      const monthKey = getMonthKey(dateToUse);
      
      if (!acc[monthKey]) {
        acc[monthKey] = [];
      }
      acc[monthKey].push(order);
      return acc;
    }, {} as Record<string, Order[]>);

    // Sort months descending
    const sortedMonths = Object.keys(grouped).sort((a, b) => b.localeCompare(a));
    const sortedGrouped = sortedMonths.reduce((acc, key) => {
      acc[key] = grouped[key];
      return acc;
    }, {} as Record<string, Order[]>);

    setGroupedOrders(sortedGrouped);

    // Set active month if not set or if current active month is gone
    if (sortedMonths.length > 0) {
      const currentMonthKey = getMonthKey(new Date().toISOString());
      if (!activeMonth || !sortedMonths.includes(activeMonth)) {
        if (sortedMonths.includes(currentMonthKey)) {
          setActiveMonth(currentMonthKey);
        } else {
          setActiveMonth(sortedMonths[0]);
        }
      }
    }
  };

  const handleRequestPayout = (month: string, orders: Order[]) => {
    const payoutRequestOrders = orders.filter(o => o.status === 'PAYOUT_REQUEST');
    setConfirmModal({ isOpen: true, month, orders: payoutRequestOrders });
  };

  const executeRequestPayout = async () => {
    const { month, orders } = confirmModal;
    if (orders.length === 0) return;

    const totalAmount = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const commissionRate = vendor.commissionRate || 100;
    const payoutAmount = Math.round(totalAmount * (commissionRate / 100));
    
    const statementId = `${month.replace('-', '')}-Statement-${vendor.id}-${Date.now().toString().slice(-4)}`;
    
    const newStatement: Statement = {
      id: statementId,
      vendorId: vendor.id,
      month,
      totalOrders: orders.length,
      totalAmount,
      payoutAmount,
      status: 'SUBMITTED',
      createdAt: new Date().toISOString()
    };

    statementService.create(newStatement);

    for (const order of orders) {
      await orderService.update(order.id, { 
        statementId,
        status: 'PENDING_PAYMENT' as const,
        statusUpdates: [...(order.statusUpdates || []), {
          status: 'PENDING_PAYMENT' as const,
          timestamp: new Date().toISOString(),
          note: `廠商申請 ${month} 月份撥款`
        }]
      });
    }

    setConfirmModal({ ...confirmModal, isOpen: false });
    await loadData();
  };

  const months = Object.keys(groupedOrders);
  const currentOrders = activeMonth ? groupedOrders[activeMonth] || [] : [];
  const payoutRequestOrders = currentOrders.filter(o => o.status === 'PAYOUT_REQUEST');
  const hasPayoutRequest = payoutRequestOrders.length > 0;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
        <h2 className="text-xl font-bold text-stone-900 mb-2">財務結算列表</h2>
        <p className="text-sm text-stone-500">已由好齡居後台核准結案，等待您申請撥款的訂單。</p>
      </div>

      {months.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-12 text-center text-stone-500">
          目前沒有任何月份的結算資料
        </div>
      ) : (
        <>
          {/* Month Tabs */}
          <div className="flex flex-wrap gap-2 mb-4">
            {months.map(month => (
              <button
                key={month}
                onClick={() => setActiveMonth(month)}
                className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                  activeMonth === month
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                }`}
              >
                {month.split('-')[0]}年{month.split('-')[1]}月
              </button>
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
            <div className="p-4 bg-stone-50 border-b border-stone-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="text-primary" size={20} />
                <h3 className="font-bold text-stone-900">{activeMonth.split('-')[0]}年{activeMonth.split('-')[1]}月 結算明細</h3>
                <span className="text-sm text-stone-500 ml-2">({currentOrders.length} 筆訂單)</span>
              </div>
              {hasPayoutRequest ? (
                <button
                  onClick={() => handleRequestPayout(activeMonth, currentOrders)}
                  className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
                >
                  一鍵申請 {activeMonth.split('-')[1]} 月份撥款
                </button>
              ) : currentOrders.some(o => ['PENDING_PAYMENT', 'PAID'].includes(o.status)) ? (
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-bold rounded-full flex items-center gap-1">
                  <CheckCircle size={14} />
                  已申請 / 已結案
                </span>
              ) : null}
            </div>
            
            <div className="overflow-x-auto">
              <AdminTable.Main>
                <AdminTable.Head>
                  <tr>
                    <AdminTable.Th>訂單編號</AdminTable.Th>
                    <AdminTable.Th>客戶姓名</AdminTable.Th>
                    <AdminTable.Th>服務項目</AdminTable.Th>
                    <AdminTable.Th>完成時間</AdminTable.Th>
                    <AdminTable.Th>狀態</AdminTable.Th>
                  </tr>
                </AdminTable.Head>
                <AdminTable.Body>
                  {currentOrders.length === 0 ? (
                    <AdminTable.Empty colSpan={5}>
                      本月尚無結算資料
                    </AdminTable.Empty>
                  ) : (
                    currentOrders.map(order => {
                      const completedUpdate = order.statusUpdates?.find(u => u.status === 'COMPLETED');
                      
                      return (
                        <AdminTable.Row key={order.id}>
                          <AdminTable.Td className="font-mono text-sm font-bold text-stone-900">{order.id}</AdminTable.Td>
                          <AdminTable.Td className="text-sm text-stone-900">{order.customerInfo.name}</AdminTable.Td>
                          <AdminTable.Td className="text-sm text-stone-500 truncate max-w-[150px]">
                            {order.items.map(i => i.name).join(', ')}
                          </AdminTable.Td>
                          <AdminTable.Td className="text-sm text-stone-500">
                            {completedUpdate ? new Date(completedUpdate.timestamp).toLocaleString() : '-'}
                          </AdminTable.Td>
                          <AdminTable.Td>
                            <OrderStatusBadge status={order.status} role="vendor" />
                          </AdminTable.Td>
                        </AdminTable.Row>
                      );
                    })
                  )}
                </AdminTable.Body>
              </AdminTable.Main>
            </div>
          </div>
        </>
      )}

      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={executeRequestPayout}
        title="申請撥款確認"
        message={`確定要申請 ${confirmModal.month.split('-')[1]} 月份的撥款嗎？系統將會彙整該月份所有待結案訂單。`}
        confirmText="確定申請"
        variant="primary"
      />
    </div>
  );
}
