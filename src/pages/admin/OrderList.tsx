import React, { useState, useEffect } from 'react';
import { orderService } from '../../services/orderService';
import { Order } from '../../types/admin';
import { Vendor } from '../../types/vendor';
import { RefreshCw, CheckCircle, AlertCircle, XCircle, Clock, PlayCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function OrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    loadOrders();
    loadVendors();
  }, []);

  const loadVendors = () => {
    const stored = localStorage.getItem('vendors');
    if (stored) {
      setVendors(JSON.parse(stored));
    }
  };

  const loadOrders = () => {
    setLoading(true);
    setOrders(orderService.getAll());
    setLoading(false);
  };

  const filters = [
    { label: '全部', value: 'ALL' },
    { label: '待報價', value: 'QUOTE_PENDING' },
    { label: '已報價', value: 'QUOTED' },
    { label: '待付款', value: 'UNPAID' },
    { label: '待處理', value: 'PENDING' },
    { label: '已媒合', value: 'ACTIVE' },
    { label: '已完成', value: 'COMPLETED' },
    { label: '待撥款', value: 'PENDING_PAYMENT' },
    { label: '已結案', value: 'PAID' },
    { label: '已取消', value: 'CANCELLED' },
  ];

  const filteredOrders = orders.filter(order => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'CANCELLED') return order.status === 'CANCELLED' || order.status === 'CANCELING';
    return order.status === statusFilter;
  });

  const pendingActions = orders.filter(o => o.status === 'CANCELING' || o.status === 'PENDING_PAYMENT');

  const getStatusDisplay = (status: Order['status']) => {
    switch (status) {
      case 'UNPAID': 
        return <span className="flex items-center gap-1.5 text-stone-500 bg-stone-100 px-2.5 py-1 rounded-full text-xs font-bold"><Clock size={14} /> 待付款</span>;
      case 'QUOTE_PENDING':
        return <span className="flex items-center gap-1.5 text-primary bg-primary/10 px-2.5 py-1 rounded-full text-xs font-bold"><Clock size={14} /> 需求報價中</span>;
      case 'QUOTED':
        return <span className="flex items-center gap-1.5 text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full text-xs font-bold"><CheckCircle size={14} /> 已報價(待付)</span>;
      case 'PENDING': 
        return <span className="flex items-center gap-1.5 text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full text-xs font-bold"><AlertCircle size={14} /> 待處理</span>;
      case 'ACTIVE': 
        return <span className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full text-xs font-bold"><PlayCircle size={14} /> 已媒合</span>;
      case 'COMPLETED': 
        return <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full text-xs font-bold"><CheckCircle size={14} /> 已完成</span>;
      case 'PENDING_PAYMENT':
        return <span className="flex items-center gap-1.5 text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full text-xs font-bold animate-pulse"><Clock size={14} /> 待結案審核</span>;
      case 'PAID':
        return <span className="flex items-center gap-1.5 text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full text-xs font-bold"><CheckCircle size={14} /> 已結案</span>;
      case 'CANCELING':
        return <span className="flex items-center gap-1.5 text-red-600 bg-red-50 px-2.5 py-1 rounded-full text-xs font-bold animate-pulse"><XCircle size={14} /> 申請取消中</span>;
      case 'CANCELLED': 
        return <span className="flex items-center gap-1.5 text-stone-500 bg-stone-100 px-2.5 py-1 rounded-full text-xs font-bold"><XCircle size={14} /> 已取消</span>;
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

      <div className="flex flex-wrap gap-2 mb-8">
        {filters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setStatusFilter(filter.value)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
              statusFilter === filter.value
                ? 'bg-primary text-white shadow-md'
                : 'bg-white text-stone-500 border border-stone-200 hover:border-primary/50'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {pendingActions.length > 0 && (
        <div className="mb-8 bg-orange-50 border border-orange-100 rounded-[2rem] p-6">
          <h2 className="text-lg font-bold text-orange-900 mb-4 flex items-center gap-2">
            <AlertCircle className="text-orange-600" size={20} />
            待處理事項 ({pendingActions.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingActions.map(order => (
              <Link 
                key={order.id}
                to={`/admin/orders/${order.id}`}
                className="bg-white p-4 rounded-2xl border border-orange-200 hover:border-orange-400 transition-all shadow-sm group"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-mono text-sm font-bold text-stone-900 group-hover:text-primary transition-colors">#{order.id}</span>
                  {getStatusDisplay(order.status)}
                </div>
                <p className="text-sm text-stone-600 mb-1">客戶: {order.customerInfo.name}</p>
                <p className="text-xs text-stone-400">
                  {order.status === 'CANCELING' ? '原因: ' + order.cancelReason : '廠商已上傳照片，等待結案'}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-[2rem] shadow-sm border border-stone-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-stone-50 text-stone-400 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">訂單編號</th>
                <th className="px-6 py-4">用戶名稱</th>
                <th className="px-6 py-4">產品名稱</th>
                <th className="px-6 py-4">總金額</th>
                <th className="px-6 py-4">狀態</th>
                <th className="px-6 py-4">指派廠商</th>
                <th className="px-6 py-4">下單時間</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm">
                    <Link to={`/admin/orders/${order.id}`} className="text-primary hover:text-primary-dark font-bold underline decoration-primary/30 underline-offset-4">
                      {order.id}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-stone-900 font-medium">{order.customerInfo.name}</td>
                  <td className="px-6 py-4 text-sm text-stone-600">
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
                  </td>
                  <td className="px-6 py-4 font-bold text-stone-900">NT$ {order.totalAmount.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    {getStatusDisplay(order.status)}
                  </td>
                  <td className="px-6 py-4">
                    {order.vendorId ? (
                      <span className="text-sm font-medium text-stone-900">
                        {vendors.find(v => v.id === order.vendorId)?.name || '未知廠商'}
                      </span>
                    ) : (
                      <span className="text-sm text-stone-400">尚未指派</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-stone-500">{new Date(order.createdAt).toLocaleString()}</td>
                </tr>
              ))}
              {filteredOrders.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-stone-400">
                    目前尚無訂單資料
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
