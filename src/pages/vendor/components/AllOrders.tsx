import React, { useState, useEffect } from 'react';
import { Order, OrderStatusUpdate } from '../../../types/admin';
import { Vendor } from '../../../types/vendor';
import { orderService } from '../../../services/orderService';
import { Clock, AlertCircle, PlayCircle, CheckCircle, XCircle, Search, Upload, Copy, QrCode, CreditCard } from 'lucide-react';
import { OrderStatus, getOrderStatusDisplay } from '../../../constants/orderStatus';
import OrderStatusBadge from '../../../components/admin/OrderStatusBadge';
import SaveButton from '../../../components/admin/SaveButton';
import VendorImageUploader from '../../../components/vendor/VendorImageUploader';
import { QRCodeSVG } from 'qrcode.react';
import AdminTable from '../../../components/admin/AdminTable';
import { Pagination } from '../../../components/ui/Pagination';

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
  const [receiptPhotoUrl, setReceiptPhotoUrl] = useState('');
  const [paymentProofUrl, setPaymentProofUrl] = useState('');
  const [showQRCode, setShowQRCode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  useEffect(() => {
    loadData();
  }, [vendor.id]);

  const loadData = async () => {
    const allOrders = await orderService.getAll();
    const vendorOrders = allOrders.filter(o => 
      o.vendorId === vendor.id && 
      o.status !== 'QUOTING' && 
      o.status !== 'QUOTE_REVIEW' &&
      o.status !== 'PENDING' &&
      o.status !== 'PENDING_PAYMENT' &&
      o.status !== 'PAYOUT_REQUEST' &&
      o.status !== 'PAID'
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

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const maskPhone = (phone: string, status: string) => {
    if (status === 'PENDING') {
      if (!phone || phone.length < 10) return phone;
      return `${phone.substring(0, 4)}***${phone.substring(7)}`;
    }
    return phone;
  };

  const handleComplete = async () => {
    if (!selectedOrder || !photoUrl || !receiptPhotoUrl) {
      alert('請上傳服務完成照片與簽收單');
      return;
    }

    const hasBalance = selectedOrder.balanceAmount !== undefined && selectedOrder.balanceAmount > 0;
    const requiresPaymentProof = hasBalance && (selectedOrder.status === 'ACTIVE' || selectedOrder.status === 'WAITING_BALANCE' || selectedOrder.status === 'BALANCE_PAID');

    if (requiresPaymentProof && !paymentProofUrl) {
      alert('請上傳支付憑證截圖');
      return;
    }

    const targetStatus = 'COMPLETED';

    const newUpdate: OrderStatusUpdate = {
      status: targetStatus,
      timestamp: new Date().toISOString(),
      photoUrl,
      receiptPhotoUrl,
      paymentProofPhotoUrl: paymentProofUrl
    };

    const updates = {
      status: targetStatus as any,
      servicePhotoUrl: photoUrl,
      receiptPhotoUrl: receiptPhotoUrl,
      paymentProofPhotoUrl: paymentProofUrl,
      statusUpdates: [...(selectedOrder.statusUpdates || []), newUpdate]
    };

    await orderService.update(selectedOrder.id, updates);
    setSelectedOrder(null);
    await loadData();
    setFeedback({ type: 'success', message: requiresPaymentProof ? '已提交完工回報與支付憑證，等待審核中。' : '已完成服務！' });
  };

  const handleCancel = async () => {
    if (!selectedOrder || !cancelReason) {
      setFeedback({ type: 'error', message: '請填寫取消原因' });
      return;
    }

    const newUpdate: OrderStatusUpdate = {
      status: 'REFUND_PENDING',
      timestamp: new Date().toISOString(),
      note: cancelReason
    };

    const updates = {
      status: 'REFUND_PENDING' as const,
      cancelReason,
      statusUpdates: [...(selectedOrder.statusUpdates || []), newUpdate]
    };

    await orderService.update(selectedOrder.id, updates);
    setSelectedOrder(null);
    await loadData();
    setFeedback({ type: 'success', message: '已申請取消訂單，請等待後台審核。' });
  };

  if (selectedOrder) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
        <div className="flex justify-between items-center mb-6 border-b border-stone-100 pb-4">
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-3">
            訂單詳情 #{selectedOrder.id}
            <OrderStatusBadge status={selectedOrder.status} role="vendor" />
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
                  <p className="font-bold text-stone-900 mb-1">{getOrderStatusDisplay(update.status, 'vendor') || update.status}</p>
                  {update.note && <p className="text-stone-600">{update.note}</p>}
                  
                  {update.status === 'ACTIVE' && (
                    <p>媒合成功，服務人員：{update.staffName} ({update.staffPhone})，確定的服務日期：{update.assignedDate} {update.assignedTime}</p>
                  )}
                  {update.status === 'COMPLETED' && (
                    <div className="space-y-4 mt-2">
                      <p>完成服務，並上傳服務完成照與簽收單。</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {update.photoUrl && (
                          <div>
                            <p className="text-xs text-stone-500 mb-1">服務完成照</p>
                            <img src={update.photoUrl} alt="服務完成照" className="rounded-lg w-full aspect-video object-cover border border-stone-200" />
                          </div>
                        )}
                        {update.receiptPhotoUrl && (
                          <div>
                            <p className="text-xs text-stone-500 mb-1">簽收單</p>
                            <img src={update.receiptPhotoUrl} alt="簽收單" className="rounded-lg w-full aspect-video object-cover border border-stone-200" />
                          </div>
                        )}
                      </div>
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

        {(selectedOrder.status === 'ACTIVE' || selectedOrder.status === 'WAITING_BALANCE' || selectedOrder.status === 'BALANCE_PAID') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-stone-100 pt-6">
            <div className="space-y-6">
              {(() => {
                const hasBalance = selectedOrder.balanceAmount !== undefined && selectedOrder.balanceAmount > 0;
                const showBalanceSection = hasBalance && (selectedOrder.status === 'ACTIVE' || selectedOrder.status === 'WAITING_BALANCE' || selectedOrder.status === 'BALANCE_PAID');
                
                if (!showBalanceSection) return null;
                
                return (
                  <div className="bg-primary/5 p-6 rounded-2xl border border-primary/20">
                    <h4 className="font-bold text-primary mb-4 flex items-center gap-2">
                      <CreditCard size={20} />
                      結清尾款
                    </h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-2 border-b border-primary/10">
                        <span className="text-stone-600">待收尾款金額</span>
                        <span className="text-xl font-black text-primary">
                          NT$ {selectedOrder.balanceAmount?.toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="flex flex-col gap-3">
                        <button 
                          onClick={() => setShowQRCode(!showQRCode)}
                          className="w-full py-3 bg-white border border-primary text-primary rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/5 transition-colors"
                        >
                          <QrCode size={20} />
                          {showQRCode ? '隱藏收款 QR Code' : '顯示收款 QR Code'}
                        </button>
                        
                        {showQRCode && (
                          <div className="flex flex-col items-center p-4 bg-white rounded-xl border border-stone-100 shadow-inner animate-in fade-in zoom-in duration-200">
                            <QRCodeSVG 
                              value={`${window.location.origin}/payment/${selectedOrder.id}`}
                              size={180}
                              level="H"
                              includeMargin={true}
                            />
                            <p className="text-[10px] text-stone-400 mt-2">請客戶掃描上方 QR Code 進行支付</p>
                          </div>
                        )}

                        <button 
                          onClick={() => {
                            const url = `${window.location.origin}/payment/${selectedOrder.id}`;
                            navigator.clipboard.writeText(url);
                            setFeedback({ type: 'success', message: '支付連結已複製！' });
                          }}
                          className="w-full py-3 bg-stone-100 text-stone-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-stone-200 transition-colors"
                        >
                          <Copy size={20} />
                          複製支付連結
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                <h4 className="font-bold text-red-800 mb-2">申請取消</h4>
                <textarea 
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="請填寫取消原因..."
                  className="w-full h-20 px-3 py-2 border border-red-200 rounded-lg text-sm mb-3 outline-none focus:ring-2 focus:ring-red-500/20 resize-none"
                />
                <SaveButton 
                  status="idle"
                  onClick={handleCancel}
                  disabled={!cancelReason}
                  label="送出取消申請"
                  className="w-full py-2 bg-red-600 text-white border border-red-600 hover:bg-red-700 shadow-red-100/50"
                />
              </div>
            </div>

            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
              <h4 className="font-bold text-emerald-800 mb-4">服務完成回報</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-emerald-700 mb-2">1. 上傳服務完成照片</label>
                  <VendorImageUploader 
                    value={photoUrl} 
                    onChange={setPhotoUrl} 
                    placeholder="點擊上傳服務完成照片"
                    label=""
                    aspectRatio="video"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-emerald-700 mb-2">2. 上傳簽收單照片</label>
                  <VendorImageUploader 
                    value={receiptPhotoUrl} 
                    onChange={setReceiptPhotoUrl} 
                    placeholder="點擊上傳簽收單照片"
                    label=""
                    aspectRatio="video"
                  />
                </div>
                {(() => {
                  const hasBalance = selectedOrder.balanceAmount !== undefined && selectedOrder.balanceAmount > 0;
                  const showBalanceSection = hasBalance && (selectedOrder.status === 'ACTIVE' || selectedOrder.status === 'WAITING_BALANCE' || selectedOrder.status === 'BALANCE_PAID');
                  
                  if (!showBalanceSection) return null;
                  
                  return (
                    <div>
                      <label className="block text-sm font-bold text-emerald-700 mb-2">3. 上傳支付憑證截圖 <span className="text-red-500">*</span></label>
                      <VendorImageUploader 
                        value={paymentProofUrl} 
                        onChange={setPaymentProofUrl} 
                        placeholder="點擊上傳支付憑證截圖"
                        label=""
                        aspectRatio="video"
                      />
                    </div>
                  );
                })()}
              </div>
              <SaveButton 
                status="idle"
                onClick={handleComplete}
                disabled={
                  !photoUrl || 
                  !receiptPhotoUrl || 
                  ((selectedOrder.balanceAmount !== undefined && selectedOrder.balanceAmount > 0 && (selectedOrder.status === 'ACTIVE' || selectedOrder.status === 'WAITING_BALANCE' || selectedOrder.status === 'BALANCE_PAID')) && !paymentProofUrl)
                }
                label="提交回報"
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100/50 mt-6"
              />
            </div>
          </div>
        )}

        {selectedOrder.status === 'COMPLETED' && (
          <div className="border-t border-stone-100 pt-6">
            <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10 flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h4 className="font-bold text-stone-900 mb-1">服務已完成</h4>
                <p className="text-sm text-stone-500">您已上傳照片並標記服務完成。請等待管理員核准結案以進行後續撥款流程。</p>
              </div>
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
            {['ALL', 'ACTIVE', 'WAITING_BALANCE', 'COMPLETED', 'PAID', 'REFUND_PENDING', 'REFUNDED', 'CANCELLED'].map(status => {
              const label = status === 'ALL' ? '全部' : getOrderStatusDisplay(status as OrderStatus, 'vendor');
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
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <AdminTable.Main>
          <AdminTable.Head>
            <tr>
              <AdminTable.Th>訂單編號</AdminTable.Th>
              <AdminTable.Th>客戶姓名</AdminTable.Th>
              <AdminTable.Th>客戶電話</AdminTable.Th>
              <AdminTable.Th>服務地址</AdminTable.Th>
              <AdminTable.Th>狀態</AdminTable.Th>
              <AdminTable.Th>服務人員</AdminTable.Th>
            </tr>
          </AdminTable.Head>
          <AdminTable.Body>
            {paginatedOrders.map(order => (
              <AdminTable.Row key={order.id}>
                <AdminTable.Td>
                  <button 
                    onClick={() => {
                      setSelectedOrder(order);
                      setCancelReason('');
                      setPhotoUrl('');
                      setReceiptPhotoUrl('');
                      setPaymentProofUrl('');
                      setShowQRCode(false);
                    }}
                    className="font-mono text-sm font-bold text-primary hover:underline"
                  >
                    {order.id}
                  </button>
                </AdminTable.Td>
                <AdminTable.Td className="text-sm text-stone-900">{order.customerInfo.name}</AdminTable.Td>
                <AdminTable.Td className="text-sm text-stone-500">{maskPhone(order.customerInfo.phone, order.status)}</AdminTable.Td>
                <AdminTable.Td className="text-sm text-stone-500 truncate max-w-[150px]">{order.customerInfo.address}</AdminTable.Td>
                <AdminTable.Td>
                  <OrderStatusBadge status={order.status} role="vendor" />
                </AdminTable.Td>
                <AdminTable.Td className="text-sm text-stone-500">
                  {order.status !== 'PENDING' ? order.statusUpdates?.find(u => u.status === 'ACTIVE')?.staffName || '-' : '-'}
                </AdminTable.Td>
              </AdminTable.Row>
            ))}
            {paginatedOrders.length === 0 && (
              <AdminTable.Empty colSpan={6}>
                找不到符合條件的訂單
              </AdminTable.Empty>
            )}
          </AdminTable.Body>
        </AdminTable.Main>
      </div>

      {totalPages > 1 && (
        <div className="p-6 border-t border-stone-100 flex justify-center bg-white">
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={setCurrentPage} 
          />
        </div>
      )}
    </div>
  );
}
