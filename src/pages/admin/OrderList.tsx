import React, { useState, useEffect, useMemo } from 'react';
import { orderService } from '../../services/orderService';
import { Order } from '../../types/admin';
import { vendorService } from '../../services/vendorService';
import { Vendor } from '../../types/vendor';
import { RefreshCw, AlertCircle, Clock, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminTable from '../../components/admin/AdminTable';
import { OrderStatus } from '../../constants/orderStatus';
import OrderStatusBadge from '../../components/admin/OrderStatusBadge';
import AdminSearchBar from '../../components/admin/search/AdminSearchBar';
import AdminSearchInput from '../../components/admin/search/AdminSearchInput';
import AdminFilterSelect from '../../components/admin/search/AdminFilterSelect';
import ConfirmModal from '../../components/ConfirmModal';
import { Pagination } from '../../components/ui/Pagination';

export default function OrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>(() => vendorService.getAll());
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string[]>(['ALL']);
  const [searchTerm, setSearchTerm] = useState('');
  const [productFilter, setProductFilter] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadOrders();
    loadVendors();
  }, []);

  const loadVendors = () => {
    const stored = vendorService.getAll();
    setVendors(stored);
  };

  const loadOrders = async () => {
    setLoading(true);
    const allOrders = await orderService.getAll();
    setOrders(allOrders);
    setLoading(false);
  };

  const filters = [
    { label: '全部', value: 'ALL' },
    { label: '待派案', value: 'PENDING' },
    { label: '需重新派案', value: 'UNAVAILABLE' },
    { label: '已媒合', value: 'ACTIVE' },
    { label: '待收尾款', value: 'WAITING_BALANCE' },
    { label: '已付尾款', value: 'BALANCE_PAID' },
    { label: '已完成', value: 'COMPLETED' },
    { label: '待廠商申請撥款', value: 'PAYOUT_REQUEST' },
    { label: '待撥款給廠商', value: 'PENDING_PAYMENT' },
    { label: '已撥款結案', value: 'PAID' },
    { label: '待退款處理', value: 'REFUND_PENDING' },
    { label: '已退款', value: 'REFUNDED' },
    { label: '已取消', value: 'CANCELLED' },
  ];

  const handleFilterToggle = (value: string) => {
    if (value === 'ALL') {
      setStatusFilter(['ALL']);
      return;
    }

    setStatusFilter(prev => {
      const newFilters = prev.filter(f => f !== 'ALL');
      if (newFilters.includes(value)) {
        const removed = newFilters.filter(f => f !== value);
        return removed.length === 0 ? ['ALL'] : removed;
      } else {
        return [...newFilters, value];
      }
    });
  };

  const filteredOrders = orders.filter(order => {
    // 排除成交前的狀態，這些狀態留在「預約管理」處理
    const isAppointmentStatus = ['NEW_QUOTE', 'QUOTING', 'QUOTE_REVIEW', 'UNPAID'].includes(order.status);
    if (isAppointmentStatus) return false;

    // Status Filter
    let statusMatch = false;
    if (statusFilter.includes('ALL')) {
      const excludedStatuses = ['PAID', 'CANCELLED', 'REFUNDED'];
      statusMatch = !excludedStatuses.includes(order.status);
    } else {
      statusMatch = statusFilter.includes(order.status);
    }

    // Search Filter
    const searchMatch = searchTerm === '' || 
      order.customerInfo.name.includes(searchTerm) || 
      order.customerInfo.phone.includes(searchTerm);

    // Product Filter
    const productMatch = productFilter === '' || 
      order.items.some(item => item.name === productFilter);

    return statusMatch && searchMatch && productMatch;
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchTerm, productFilter]);

  const stats = useMemo(() => {
    return {
      pending: orders.filter(o => o.status === 'PENDING').length,
      unavailable: orders.filter(o => o.status === 'UNAVAILABLE').length,
      pendingPayment: orders.filter(o => o.status === 'PENDING_PAYMENT').length,
    };
  }, [orders]);

  const productOptions = useMemo(() => {
    const products = new Set<string>();
    orders.forEach(order => order.items.forEach(item => products.add(item.name)));
    return Array.from(products).map(p => ({ label: p, value: p }));
  }, [orders]);

  const handleDelete = (orderId: string) => {
    setOrderToDelete(orderId);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (orderToDelete) {
      await orderService.delete(orderToDelete);
      await loadOrders();
      setOrderToDelete(null);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-stone-900 mb-2">訂單管理</h1>
          <p className="text-stone-500 mt-1">管理所有標價產品 (FIXED) 的訂單</p>
        </div>
        <button 
          onClick={loadOrders}
          className="p-2 text-stone-400 hover:text-primary transition-colors"
          title="重新整理"
        >
          <RefreshCw size={20} />
        </button>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div 
          onClick={() => setStatusFilter(['PENDING'])}
          className="p-6 rounded-2xl border border-blue-200 bg-blue-50 hover:border-blue-400 hover:shadow-md cursor-pointer transition-all"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-bold text-blue-800 mb-1">待派案</p>
              <h3 className="text-3xl font-bold text-blue-600">{stats.pending}</h3>
            </div>
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <Clock size={24} />
            </div>
          </div>
        </div>

        <div 
          onClick={() => setStatusFilter(['UNAVAILABLE'])}
          className={`p-6 rounded-2xl border cursor-pointer transition-all ${
            stats.unavailable > 0 
              ? 'bg-red-50 border-red-200 hover:border-red-400 hover:shadow-md' 
              : 'bg-blue-50 border-blue-200 hover:border-blue-400 hover:shadow-sm'
          }`}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className={`text-sm font-bold mb-1 ${stats.unavailable > 0 ? 'text-red-800' : 'text-blue-800'}`}>需重新派案</p>
              <h3 className={`text-3xl font-bold ${stats.unavailable > 0 ? 'text-red-600' : 'text-blue-600'}`}>{stats.unavailable}</h3>
            </div>
            <div className={`p-3 rounded-full ${stats.unavailable > 0 ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
              <AlertCircle size={24} />
            </div>
          </div>
        </div>

        <div 
          onClick={() => setStatusFilter(['PENDING_PAYMENT'])}
          className="p-6 rounded-2xl border border-blue-200 bg-blue-50 hover:border-blue-400 hover:shadow-md cursor-pointer transition-all"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-bold text-blue-800 mb-1">待撥款給廠商</p>
              <h3 className="text-3xl font-bold text-blue-600">{stats.pendingPayment}</h3>
            </div>
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <DollarSign size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {filters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => handleFilterToggle(filter.value)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
              statusFilter.includes(filter.value)
                ? 'bg-primary text-white shadow-md'
                : 'bg-white text-stone-500 border border-stone-200 hover:border-primary/50'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <AdminSearchBar>
        <AdminSearchInput
          placeholder="搜尋客戶姓名或電話..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <AdminFilterSelect
          value={productFilter}
          onChange={(e) => setProductFilter(e.target.value)}
          options={[{ label: '所有產品', value: '' }, ...productOptions]}
          className="min-w-[200px]"
        />
        <button
          onClick={() => {
            setSearchTerm('');
            setProductFilter('');
          }}
          className="px-4 py-2 text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors font-medium whitespace-nowrap"
        >
          清除過濾
        </button>
      </AdminSearchBar>

      <AdminTable.Container>
        <AdminTable.Main>
          <AdminTable.Head>
            <tr>
              <AdminTable.Th>訂單編號</AdminTable.Th>
              <AdminTable.Th>用戶名稱</AdminTable.Th>
              <AdminTable.Th>產品名稱</AdminTable.Th>
              <AdminTable.Th>總金額</AdminTable.Th>
              <AdminTable.Th>狀態</AdminTable.Th>
              <AdminTable.Th>指派廠商</AdminTable.Th>
              <AdminTable.Th>下單時間</AdminTable.Th>
              <AdminTable.Th className="text-right">操作</AdminTable.Th>
            </tr>
          </AdminTable.Head>
          <AdminTable.Body>
            {paginatedOrders.map((order) => (
              <AdminTable.Row key={order.id}>
                <AdminTable.Td className="font-mono text-sm">
                  <Link to={`/admin/orders/${order.id}`} className="text-primary hover:text-primary-dark font-bold underline decoration-primary/30 underline-offset-4">
                    {order.id}
                  </Link>
                </AdminTable.Td>
                <AdminTable.Td className="text-sm text-stone-900 font-medium">{order.customerInfo.name}</AdminTable.Td>
                <AdminTable.Td className="text-sm text-stone-600">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="mb-2 last:mb-0">
                      <span className="font-medium text-stone-900">{item.name}</span>
                      {item.selectedVariant && (
                        <span className="ml-2 text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                          {item.selectedVariant.name}
                        </span>
                      )}
                      <div className="text-xs text-stone-500 mt-1 space-y-0.5">
                        {item.expectedDates && item.expectedDates.length > 0 && (
                          <p>日期: {item.expectedDates}</p>
                        )}
                        {item.expectedTime && (
                          <p>時段: {item.expectedTime}</p>
                        )}
                        {item.notes && (
                          <p className="truncate max-w-[200px]" title={item.notes}>備註: {item.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </AdminTable.Td>
                <AdminTable.Td className="font-bold text-stone-900">NT$ {order.totalAmount.toLocaleString()}</AdminTable.Td>
                <AdminTable.Td>
                  <OrderStatusBadge status={order.status} />
                </AdminTable.Td>
                <AdminTable.Td>
                  {order.vendorId ? (
                    <span className="text-sm font-medium text-stone-900">
                      {vendors.find(v => v.id === order.vendorId)?.name || '未知廠商'}
                    </span>
                  ) : (
                    <span className="text-sm text-stone-400">尚未指派</span>
                  )}
                </AdminTable.Td>
                <AdminTable.Td className="text-sm text-stone-500">{new Date(order.createdAt).toLocaleString()}</AdminTable.Td>
                <AdminTable.Td className="text-right">
                  <AdminTable.Actions>
                    <AdminTable.Delete onClick={() => handleDelete(order.id)} />
                  </AdminTable.Actions>
                </AdminTable.Td>
              </AdminTable.Row>
            ))}
            {paginatedOrders.length === 0 && !loading && (
              <AdminTable.Empty colSpan={7}>
                目前尚無訂單資料
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

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="確認刪除訂單"
        message="您確定要刪除這筆訂單嗎？此動作無法復原。"
        variant="danger"
        confirmText="刪除"
      />
    </div>
  );
}
