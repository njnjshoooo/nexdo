import React, { useState, useEffect } from 'react';
import { Vendor } from '../../../types/vendor';
import { CreditCard, Download, FileText, Search } from 'lucide-react';
import VendorIconButton from '../../../components/vendor/VendorIconButton';
import { orderService } from '../../../services/orderService';
import { Order } from '../../../types/admin';
import OrderStatusBadge from '../../../components/admin/OrderStatusBadge';
import AdminTable from '../../../components/admin/AdminTable';
import { Pagination } from '../../../components/ui/Pagination';

interface BillingProps {
  vendor: Vendor;
}

export default function Billing({ vendor }: BillingProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadData();
  }, [vendor.id]);

  const loadData = async () => {
    setLoading(true);
    const allOrders = await orderService.getAll();
    const vendorFinanceOrders = allOrders.filter(o => 
      o.vendorId === vendor.id && 
      (o.status === 'PAYOUT_REQUEST' || o.status === 'PAID' || o.status === 'PENDING_PAYMENT')
    );
    setOrders(vendorFinanceOrders);
    setLoading(false);
  };

  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerInfo.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalEstimatedPayout = orders
    .filter(o => o.status === 'PAYOUT_REQUEST' || o.status === 'PENDING_PAYMENT')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const totalPaidAmount = orders
    .filter(o => o.status === 'PAID')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
        <h2 className="text-xl font-bold text-stone-900 mb-6 flex items-center gap-2">
          <CreditCard className="text-primary" size={24} />
          財務中心
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-stone-50 rounded-xl p-6 border border-stone-100">
            <p className="text-sm font-bold text-stone-500 mb-2">待撥款總額</p>
            <p className="text-3xl font-black text-stone-900">NT$ {totalEstimatedPayout.toLocaleString()}</p>
            <p className="text-xs text-stone-400 mt-2">包含待申請與處理中訂單</p>
          </div>
          <div className="bg-stone-50 rounded-xl p-6 border border-stone-100">
            <p className="text-sm font-bold text-stone-500 mb-2">累計已撥款金額</p>
            <p className="text-3xl font-black text-stone-900">NT$ {totalPaidAmount.toLocaleString()}</p>
            <p className="text-xs text-stone-400 mt-2">所有已結案訂單總計</p>
          </div>
          <div className="bg-stone-50 rounded-xl p-6 border border-stone-100">
            <p className="text-sm font-bold text-stone-500 mb-2">撥款帳戶</p>
            <p className="text-lg font-bold text-stone-900">
              {vendor.bankInfo ? `${vendor.bankInfo.bank} ${vendor.bankInfo.bankName}` : vendor.account}
            </p>
            {vendor.bankInfo && (
              <p className="text-sm font-mono text-stone-600 mt-1">{vendor.bankInfo.accountNumber}</p>
            )}
            <p className="text-xs text-stone-400 mt-2">結算週期：{vendor.settlementCycle === 'Monthly' ? '月結' : vendor.settlementCycle === 'Bi-weekly' ? '半月結' : '週結'}</p>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-stone-900 flex items-center gap-2">
            <FileText className="text-stone-400" size={20} />
            財務結算列表
          </h3>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input 
              type="text"
              placeholder="搜尋訂單編號、姓名..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-stone-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <AdminTable.Container>
          <AdminTable.Main>
            <AdminTable.Head>
              <tr>
                <AdminTable.Th>訂單編號</AdminTable.Th>
                <AdminTable.Th>客戶姓名</AdminTable.Th>
                <AdminTable.Th>結算金額</AdminTable.Th>
                <AdminTable.Th>狀態</AdminTable.Th>
                <AdminTable.Th>更新時間</AdminTable.Th>
                <AdminTable.Th className="text-center">操作</AdminTable.Th>
              </tr>
            </AdminTable.Head>
            <AdminTable.Body>
              {paginatedOrders.map(order => (
                <AdminTable.Row key={order.id}>
                  <AdminTable.Td className="font-mono text-sm font-bold text-stone-900">{order.id}</AdminTable.Td>
                  <AdminTable.Td className="text-sm text-stone-600">{order.customerInfo.name}</AdminTable.Td>
                  <AdminTable.Td className="text-sm font-bold text-stone-900">NT$ {(order.totalAmount || 0).toLocaleString()}</AdminTable.Td>
                  <AdminTable.Td>
                    <OrderStatusBadge status={order.status} role="vendor" />
                  </AdminTable.Td>
                  <AdminTable.Td className="text-sm text-stone-500">
                    {new Date(order.statusUpdates?.[order.statusUpdates.length - 1]?.timestamp || order.createdAt).toLocaleDateString()}
                  </AdminTable.Td>
                  <AdminTable.Td className="text-center">
                    <VendorIconButton 
                      icon={Download}
                      onClick={() => alert('下載結算明細')}
                      title="下載明細"
                    />
                  </AdminTable.Td>
                </AdminTable.Row>
              ))}
              {paginatedOrders.length === 0 && (
                <AdminTable.Empty colSpan={6}>
                  尚無相關結算紀錄
                </AdminTable.Empty>
              )}
            </AdminTable.Body>
          </AdminTable.Main>
        </AdminTable.Container>

        {totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={setCurrentPage} 
            />
          </div>
        )}
      </div>
    </div>
  );
}
