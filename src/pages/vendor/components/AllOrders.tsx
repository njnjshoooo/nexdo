import React, { useState, useEffect } from 'react';
import { Order, OrderStatusUpdate } from '../../../types/admin';
import { Vendor } from '../../../types/vendor';
import { orderService } from '../../../services/orderService';
import { Eye, Clock, AlertCircle, PlayCircle, CheckCircle, XCircle, Search, Upload } from 'lucide-react';
import ImageUploader from '../../../components/admin/ImageUploader';

interface AllOrdersProps {
  vendor: Vendor;
}

export default function AllOrders({ vendor }: AllOrdersProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>(['ALL']);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  
  // Form state for status updates
  const [cancelReason, setCancelReason] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  useEffect(() => {
    loadData();
  }, [vendor.id]);

  const loadData = () => {
    const allOrders = orderService.getAll();
    const vendorOrders = allOrders.filter(o => 
      o.vendorId === vendor.id && 
      o.status !== 'QUOTE_PENDING' && 
      o.status !== 'QUOTED'
    );
    setOrders(vendorOrders);
  };

  const handleStatusToggle = (status: string) => {
    if (status === 'ALL') {
      setStatusFilter(['ALL']);
    } else {
      const newFilters = statusFilter.includes('ALL') 
        ? [status] 
        : statusFilter.includes(status)
          ? statusFilter.filter(s => s !== status)
          : [...statusFilter, status];
      
      setStatusFilter(newFilters.length === 0 ? ['ALL'] : newFilters);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerInfo.phone.includes(searchTerm);
      
    const matchesStatus = statusFilter.includes('ALL') || statusFilter.includes(order.status);
    
    return matchesSearch && matchesStatus;
  });

  const maskPhone = (phone: string, status: string) => {
    if (status === 'PENDING') {
      if (!phone || phone.length < 10) return phone;
      return `${phone.substring(0, 4)}***${phone.substring(7)}`;
    }
    return phone;
  };

  const getStatusDisplay = (status: Order['status']) => {
    switch (status) {
      case 'UNPAID': 
        return <span className="flex items-center gap-1.5 text-stone-500 bg-stone-100 px-2.5 py-1 rounded-full text-xs font-bold"><Clock size={14} /> 待付款</span>;
      case 'QUOTE_PENDING':
        return <span className="flex items-center gap-1.5 text-primary bg-primary/10 px-2.5 py-1 rounded-full text-xs font-bold"><Clock size={14} /> 待報價</span>;
      case 'QUOTED':
        return <span className="flex items-center gap-1.5 text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full text-xs font-bold"><CheckCircle size={14} /> 已報價</span>;
      case 'PENDING': 
        return <span className="flex items-center gap-1.5 text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full text-xs font-bold"><AlertCircle size={14} /> 新派案</span>;
      case 'ACTIVE': 
        return <span className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full text-xs font-bold"><PlayCircle size={14} /> 媒合成功</span>;
      case 'COMPLETED': 
        return <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full text-xs font-bold"><CheckCircle size={14} /> 完成服務</span>;
      case 'PENDING_PAYMENT':
        return <span className="flex items-center gap-1.5 text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full text-xs font-bold"><Clock size={14} /> 申請結案中</span>;
      case 'PAID':
        return <span className="flex items-center gap-1.5 text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full text-xs font-bold"><CheckCircle size={14} /> 已結案</span>;
      case 'CANCELING':
        return <span className="flex items-center gap-1.5 text-red-600 bg-red-50 px-2.5 py-1 rounded-full text-xs font-bold animate-pulse"><XCircle size={14} /> 申請取消中</span>;
      case 'CANCELLED': 
        return <span className="flex items-center gap-1.5 text-stone-500 bg-stone-100 px-2.5 py-1 rounded-full text-xs font-bold"><XCircle size={14} /> 已取消</span>;
    }
  };

  const handleComplete = async () => {
    if (!selectedOrder || !photoUrl) {
      alert('請上傳服務完成照片');
      return;
    }

    const newUpdate: OrderStatusUpdate = {
      status: 'COMPLETED',
      timestamp: new Date().toISOString(),
      photoUrl
    };

    const updates = {
      status: 'COMPLETED' as const,
      servicePhotoUrl: photoUrl,
      statusUpdates: [...(selectedOrder.statusUpdates || []), newUpdate]
    };

    try {
      await orderService.update(selectedOrder.id, updates);
      setSelectedOrder(null);
      loadData();
      setFeedback({ type: 'success', message: '已完成服務！' });
    } catch (error) {
      console.error('Failed to complete order:', error);
      alert('操作失敗');
    }
  };

  const handleCancel = async () => {
    if (!selectedOrder || !cancelReason) {
      setFeedback({ type: 'error', message: '請填寫取消原因' });
      return;
    }

    const newUpdate: OrderStatusUpdate = {
      status: 'CANCELING',
      timestamp: new Date().toISOString(),
      note: cancelReason
    };

    const updates = {
      status: 'CANCELING' as const,
      cancelReason,
      statusUpdates: [...(selectedOrder.statusUpdates || []), newUpdate]
    };

    try {
      await orderService.update(selectedOrder.id, updates);
      setSelectedOrder(null);
      loadData();
      setFeedback({ type: 'success', message: '已申請取消訂單，請等待後台審核。' });
    } catch (error) {
      console.error('Failed to cancel order:', error);
      alert('操作失敗');
    }
  };

  const handleRequestClosure = async () => {
    if (!selectedOrder) return;

    const newUpdate: OrderStatusUpdate = {
      status: 'PENDING_PAYMENT',
      timestamp: new Date().toISOString(),
      note: '廠商申請結案'
    };

    const updates = {
      status: 'PENDING_PAYMENT' as const,
      statusUpdates: [...(selectedOrder.statusUpdates || []), newUpdate]
    };

    try {
      await orderService.update(selectedOrder.id, updates);
      setSelectedOrder(null);
      loadData();
      setFeedback({ type: 'success', message: '已申請結案，請等待後台審核。' });
    } catch (error) {
      console.error('Failed to request closure:', error);
      alert('操作失敗');
    }
  };

  if (selectedOrder) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
        <div className="flex justify-between items-center mb-6 border-b border-stone-100 pb-4">
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-3">
            訂單詳情 #{selectedOrder.id}
            {getStatusDisplay(selectedOrder.status)}
          </h2>
          <button onClick={() => setSelectedOrder(null)} className="text-stone-500 hover:text-stone-700">返回列表</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-stone-900 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              顧客資訊
            </h3>
            <div className="space-y-3 text-sm">
              <p><span className="text-stone-500 w-24 inline-block">姓名：</span>{selectedOrder.customerInfo.name}</p>
              <p><span className="text-stone-500 w-24 inline-block">聯絡電話：</span>{maskPhone(selectedOrder.customerInfo.phone, selectedOrder.status)}</p>
              <p><span className="text-stone-500 w-24 inline-block">電子郵件：</span>{selectedOrder.customerInfo.email}</p>
              <p><span className="text-stone-500 w-24 inline-block">服務地址：</span>{selectedOrder.customerInfo.address}</p>
              <p><span className="text-stone-500 w-24 inline-block">LINE ID：</span>{selectedOrder.customerInfo.lineId || '無'}</p>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-stone-900 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500"></span>
              其他需求
            </h3>
            <div className="space-y-3 text-sm">
              <p><span className="text-stone-500 w-24 inline-block">緊急聯絡人：</span>{selectedOrder.customerInfo.emergencyContactName || '無'}</p>
              <p><span className="text-stone-500 w-24 inline-block">緊急電話：</span>{selectedOrder.customerInfo.emergencyContactPhone || '無'}</p>
              <p><span className="text-stone-500 w-24 inline-block">特殊需求：</span>{selectedOrder.customerInfo.specialRequirements || '無'}</p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="font-bold text-stone-900 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            服務內容
          </h3>
          <div className="bg-stone-50 rounded-xl p-4 space-y-3 text-sm">
            <p><span className="text-stone-500 w-24 inline-block">服務項目：</span>{selectedOrder.items.map(i => `${i.name}${i.selectedVariant ? ` (${i.selectedVariant.name})` : ''}`).join(', ')}</p>
            {selectedOrder.status === 'PENDING' ? (
              <>
                <p><span className="text-stone-500 w-24 inline-block">期望日期：</span>{selectedOrder.items.map(i => i.expectedDates).filter(Boolean).join(', ') || '無'}</p>
                <p><span className="text-stone-500 w-24 inline-block">期望時間：</span>{selectedOrder.items.map(i => i.expectedTime).filter(Boolean).join(', ') || '無'}</p>
              </>
            ) : (
              <>
                <p><span className="text-stone-500 w-24 inline-block">服務日期：</span>{selectedOrder.assignedDate}</p>
                <p><span className="text-stone-500 w-24 inline-block">服務時段：</span>{selectedOrder.assignedTime}</p>
                <p><span className="text-stone-500 w-24 inline-block">服務人員：</span>{selectedOrder.statusUpdates?.find(u => u.status === 'ACTIVE')?.staffName}</p>
                <p><span className="text-stone-500 w-24 inline-block">人員電話：</span>{selectedOrder.statusUpdates?.find(u => u.status === 'ACTIVE')?.staffPhone}</p>
              </>
            )}
          </div>
        </div>

        <div className="mb-8">
          <h3 className="font-bold text-stone-900 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-stone-500"></span>
            狀態更新紀錄
          </h3>
          <div className="space-y-4">
            {selectedOrder.statusUpdates?.map((update, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="w-32 text-xs text-stone-500 pt-1">
                  {new Date(update.timestamp).toLocaleString()}
                </div>
                <div className="flex-1 bg-stone-50 p-3 rounded-lg text-sm">
                  {update.status === 'ACTIVE' && (
                    <p>媒合成功，服務人員：{update.staffName} ({update.staffPhone})，確定的服務日期：{update.assignedDate} {update.assignedTime}</p>
                  )}
                  {update.status === 'COMPLETED' && (
                    <div>
                      <p>完成服務，並上傳服務完成照。</p>
                      {update.photoUrl && (
                        <img src={update.photoUrl} alt="服務完成照" className="mt-2 rounded-lg max-w-xs" />
                      )}
                    </div>
                  )}
                  {update.status === 'CANCELLED' && (
                    <p>申請取消，原因為『{update.note}』，等待審核中。</p>
                  )}
                </div>
              </div>
            ))}
            {(!selectedOrder.statusUpdates || selectedOrder.statusUpdates.length === 0) && (
              <p className="text-sm text-stone-500">尚無更新紀錄</p>
            )}
          </div>
        </div>

        {selectedOrder.status === 'ACTIVE' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-stone-100 pt-6">
            <div className="bg-red-50 p-4 rounded-xl border border-red-100">
              <h4 className="font-bold text-red-800 mb-2">申請取消</h4>
              <textarea 
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="請填寫取消原因..."
                className="w-full h-20 px-3 py-2 border border-red-200 rounded-lg text-sm mb-3 outline-none focus:ring-2 focus:ring-red-500/20 resize-none"
              />
              <button 
                onClick={handleCancel}
                disabled={!cancelReason}
                className="w-full py-2 bg-white text-red-600 border border-red-200 rounded-lg font-bold hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                送出取消申請
              </button>
            </div>

            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
              <h4 className="font-bold text-emerald-800 mb-2">服務完成</h4>
              <div className="mb-3">
                <label className="block text-sm text-emerald-700 mb-2">上傳服務完成照片</label>
                <ImageUploader 
                  value={photoUrl} 
                  onChange={setPhotoUrl} 
                  placeholder="點擊上傳服務完成照片"
                />
              </div>
              <button 
                onClick={handleComplete}
                disabled={!photoUrl}
                className="w-full py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50 mt-4"
              >
                確認完成服務
              </button>
            </div>
          </div>
        )}

        {selectedOrder.status === 'COMPLETED' && (
          <div className="border-t border-stone-100 pt-6">
            <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10 flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h4 className="font-bold text-stone-900 mb-1">服務已完成</h4>
                <p className="text-sm text-stone-500">您已上傳照片並標記服務完成。現在可以申請結案以進行後續撥款流程。</p>
              </div>
              <button 
                onClick={handleRequestClosure}
                className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 whitespace-nowrap"
              >
                申請結案
              </button>
            </div>
          </div>
        )}

        {/* Feedback Toast */}
        {feedback && (
          <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl shadow-xl z-50 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-300 ${
            feedback.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
          }`}>
            {feedback.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
            <span className="font-bold">{feedback.message}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
      <div className="p-6 border-b border-stone-100">
        <h2 className="text-xl font-bold text-stone-900 mb-6">訂單總表</h2>
        
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input 
              type="text"
              placeholder="搜尋訂單編號、姓名、電話..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-stone-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            {['ALL', 'PENDING', 'ACTIVE', 'COMPLETED', 'PENDING_PAYMENT', 'PAID', 'CANCELING', 'CANCELLED'].map(status => {
              const labels: Record<string, string> = {
                'ALL': '全部',
                'PENDING': '新派案',
                'ACTIVE': '媒合成功',
                'COMPLETED': '完成服務',
                'PENDING_PAYMENT': '申請結案中',
                'PAID': '已結案',
                'CANCELING': '申請取消中',
                'CANCELLED': '已取消'
              };
              const isSelected = statusFilter.includes(status);
              return (
                <button
                  key={status}
                  onClick={() => handleStatusToggle(status)}
                  className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${
                    isSelected 
                      ? 'bg-primary text-white' 
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {labels[status]}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-stone-50 text-stone-500 text-xs uppercase font-bold">
            <tr>
              <th className="px-6 py-4">訂單編號</th>
              <th className="px-6 py-4">客戶姓名</th>
              <th className="px-6 py-4">客戶電話</th>
              <th className="px-6 py-4">服務地址</th>
              <th className="px-6 py-4">狀態</th>
              <th className="px-6 py-4">服務人員</th>
              <th className="px-6 py-4 text-center">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {filteredOrders.map(order => (
              <tr key={order.id} className="hover:bg-stone-50/50 transition-colors">
                <td className="px-6 py-4 font-mono text-sm font-bold text-stone-900">{order.id}</td>
                <td className="px-6 py-4 text-sm text-stone-900">{order.customerInfo.name}</td>
                <td className="px-6 py-4 text-sm text-stone-500">{maskPhone(order.customerInfo.phone, order.status)}</td>
                <td className="px-6 py-4 text-sm text-stone-500 truncate max-w-[150px]">{order.customerInfo.address}</td>
                <td className="px-6 py-4">
                  {getStatusDisplay(order.status)}
                </td>
                <td className="px-6 py-4 text-sm text-stone-500">
                  {order.status !== 'PENDING' ? order.statusUpdates?.find(u => u.status === 'ACTIVE')?.staffName || '-' : '-'}
                </td>
                <td className="px-6 py-4 text-center">
                  <button 
                    onClick={() => {
                      setSelectedOrder(order);
                      setCancelReason('');
                      setPhotoUrl('');
                    }}
                    className="p-2 text-stone-400 hover:text-primary transition-colors inline-flex"
                    title="顯示訂單詳情"
                  >
                    <Eye size={20} />
                  </button>
                </td>
              </tr>
            ))}
            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-stone-400">
                  找不到符合條件的訂單
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
