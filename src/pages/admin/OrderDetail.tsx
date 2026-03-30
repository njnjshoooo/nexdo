import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import { Order } from '../../types/admin';
import { Vendor } from '../../types/vendor';
import { ArrowLeft, Save, User, Package, CreditCard, MessageSquare, Briefcase, Camera, XCircle, CheckCircle2, Clock } from 'lucide-react';

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Form state
  const [status, setStatus] = useState<Order['status']>('PENDING');
  const [vendorId, setVendorId] = useState<string>('');
  const [customerServiceNotes, setCustomerServiceNotes] = useState('');
  const [customerInfo, setCustomerInfo] = useState<Order['customerInfo']>({
    name: '',
    phone: '',
    address: '',
    email: '',
    lineId: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    specialRequirements: ''
  });

  useEffect(() => {
    // Load vendors
    const storedVendors = localStorage.getItem('vendors');
    if (storedVendors) {
      setVendors(JSON.parse(storedVendors));
    }

    if (id) {
      const foundOrder = orderService.getById(id);
      if (foundOrder) {
        setOrder(foundOrder);
        setStatus(foundOrder.status);
        setVendorId(foundOrder.vendorId || '');
        setCustomerServiceNotes(foundOrder.customerServiceNotes || '');
        setCustomerInfo(foundOrder.customerInfo);
      }
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const handleSave = async () => {
    if (!order) return;
    setSaving(true);

    try {
      // If status is changed to a paid status and paidAt is not set, set it
      let updatedPaidAt = order.paidAt;
      if (status !== 'UNPAID' && status !== 'CANCELLED' && !order.paidAt) {
        updatedPaidAt = new Date().toISOString();
      } else if (status === 'UNPAID') {
        updatedPaidAt = undefined;
      }

      await orderService.update(order.id, {
        customerServiceNotes,
        customerInfo,
        paidAt: updatedPaidAt
      });

      // Update local state to reflect changes immediately
      setOrder(prev => prev ? { ...prev, customerServiceNotes, customerInfo, paidAt: updatedPaidAt } : null);

      setFeedback({ type: 'success', message: '儲存成功' });
    } catch (error) {
      console.error('儲存訂單失敗:', error);
      setFeedback({ type: 'error', message: '操作失敗' });
    } finally {
      setSaving(false);
    }
  };

  const handleCustomerInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({ ...prev, [name]: value }));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}/${month}/${day} ${hours}:${minutes}`;
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'UNPAID': '待付款',
      'PENDING': '待處理',
      'ACTIVE': '已媒合',
      'COMPLETED': '已完成',
      'PENDING_PAYMENT': '待結案審核',
      'PAID': '已結案',
      'CANCELING': '申請取消中',
      'CANCELLED': '已取消'
    };
    return statusMap[status] || status;
  };

  const handleDispatch = async () => {
    if (!vendorId) {
      setFeedback({ type: 'error', message: '請先選擇要指派的廠商！' });
      return;
    }

    try {
      const newUpdate = {
        status: 'PENDING' as const,
        timestamp: new Date().toISOString(),
        note: `管理員指派廠商: ${vendors.find(v => v.id === vendorId)?.name || vendorId}`
      };

      const updates = {
        vendorId,
        status: 'PENDING' as const,
        statusUpdates: [...(order?.statusUpdates || []), newUpdate]
      };

      await orderService.update(order!.id, updates);
      setOrder(prev => prev ? { ...prev, ...updates } : null);
      setStatus('PENDING');
      setFeedback({ type: 'success', message: '任務已成功派發！' });
    } catch (error) {
      console.error('派發任務失敗:', error);
      setFeedback({ type: 'error', message: '操作失敗' });
    }
  };

  const handleApproveClosure = async () => {
    try {
      const newUpdate = {
        status: 'PAID' as const,
        timestamp: new Date().toISOString(),
        note: '管理員核准結案'
      };
      const updates = {
        status: 'PAID' as const,
        statusUpdates: [...(order?.statusUpdates || []), newUpdate]
      };
      await orderService.update(order!.id, updates);
      setOrder(prev => prev ? { ...prev, ...updates } : null);
      setStatus('PAID');
      setFeedback({ type: 'success', message: '已核准結案' });
    } catch (error) {
      console.error('核准結案失敗:', error);
      setFeedback({ type: 'error', message: '操作失敗' });
    }
  };

  const handleApproveCancel = async () => {
    try {
      const newUpdate = {
        status: 'CANCELLED' as const,
        timestamp: new Date().toISOString(),
        note: '管理員核准取消'
      };
      const updates = {
        status: 'CANCELLED' as const,
        statusUpdates: [...(order?.statusUpdates || []), newUpdate]
      };
      await orderService.update(order!.id, updates);
      setOrder(prev => prev ? { ...prev, ...updates } : null);
      setStatus('CANCELLED');
      setFeedback({ type: 'success', message: '已核准取消' });
    } catch (error) {
      console.error('核准取消失敗:', error);
      setFeedback({ type: 'error', message: '操作失敗' });
    }
  };

  const handleRejectCancel = async () => {
    try {
      const newUpdate = {
        status: 'ACTIVE' as const,
        timestamp: new Date().toISOString(),
        note: '管理員拒絕取消，恢復為已媒合'
      };
      const updates = {
        status: 'ACTIVE' as const,
        cancelReason: undefined,
        statusUpdates: [...(order?.statusUpdates || []), newUpdate]
      };
      await orderService.update(order!.id, updates);
      setOrder(prev => prev ? { ...prev, ...updates } : null);
      setStatus('ACTIVE');
      setFeedback({ type: 'success', message: '已拒絕取消' });
    } catch (error) {
      console.error('拒絕取消失敗:', error);
      setFeedback({ type: 'error', message: '操作失敗' });
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-stone-500">載入中...</div>;
  }

  if (!order) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-stone-900 mb-4">找不到訂單</h2>
        <button onClick={() => navigate('/admin/orders')} className="text-primary hover:underline">返回訂單列表</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/orders')}
            className="p-2 hover:bg-stone-100 rounded-full transition-colors"
          >
            <ArrowLeft size={24} className="text-stone-600" />
          </button>
          <h1 className="text-3xl font-bold text-stone-900">訂單詳情</h1>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl font-bold hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          <Save size={18} />
          {saving ? '儲存中...' : '儲存變更'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Order Info & Customer Info */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Order Info */}
          <section className="bg-white p-6 rounded-[2rem] shadow-sm border border-stone-100">
            <h2 className="text-lg font-bold text-stone-900 mb-6 flex items-center gap-2">
              <Package className="text-primary" size={20} />
              訂單資訊
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-bold text-stone-400 uppercase mb-1">訂單編號</p>
                <p className="font-mono font-bold text-stone-800">{order.id}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-stone-400 uppercase mb-1">建立日期</p>
                <p className="text-stone-800">{formatDate(order.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-stone-400 uppercase mb-1">付費日期</p>
                <p className="text-stone-800">{order.paidAt ? formatDate(order.paidAt) : '尚未付款'}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-stone-400 uppercase mb-1">狀態</p>
                <div className="flex items-center gap-3">
                  <div className="px-3 py-2 border border-stone-200 rounded-xl text-sm font-bold bg-stone-50 text-stone-700">
                    {getStatusText(status)}
                  </div>
                  {(status === 'COMPLETED' || status === 'PENDING_PAYMENT') && (
                    <button 
                      onClick={handleApproveClosure}
                      className="flex items-center gap-1.5 bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors"
                    >
                      <CheckCircle2 size={16} /> 核准結案
                    </button>
                  )}
                  {status === 'CANCELING' && (
                    <div className="flex gap-2">
                      <button 
                        onClick={handleApproveCancel}
                        className="bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-700 transition-colors"
                      >
                        核准取消
                      </button>
                      <button 
                        onClick={handleRejectCancel}
                        className="bg-stone-200 text-stone-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-stone-300 transition-colors"
                      >
                        拒絕取消
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Vendor Assignment */}
          <section className="bg-white p-6 rounded-[2rem] shadow-sm border border-stone-100">
            <h2 className="text-lg font-bold text-stone-900 mb-6 flex items-center gap-2">
              <Briefcase className="text-primary" size={20} />
              指派廠商
            </h2>
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <p className="text-xs font-bold text-stone-400 uppercase mb-1">選擇廠商</p>
                <select 
                  value={vendorId}
                  onChange={(e) => setVendorId(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">尚未指派</option>
                  {vendors.map(v => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleDispatch}
                disabled={!vendorId || order.vendorId === vendorId}
                className="bg-stone-900 text-white px-6 py-2 rounded-xl font-bold hover:bg-stone-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed h-[38px] whitespace-nowrap"
              >
                派發任務
              </button>
            </div>
          </section>

          {/* Actual Service Information */}
          {(order.assignedDate || order.assignedTime || order.assignedStaffId) && (
            <section className="bg-emerald-50 p-6 rounded-[2rem] shadow-sm border border-emerald-100">
              <h2 className="text-lg font-bold text-emerald-900 mb-6 flex items-center gap-2">
                <Clock className="text-emerald-600" size={20} />
                實際服務資訊
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-bold text-emerald-600/60 uppercase mb-1">服務日期</p>
                  <p className="font-bold text-emerald-900">{order.assignedDate || '未設定'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-600/60 uppercase mb-1">服務時段</p>
                  <p className="font-bold text-emerald-900">{order.assignedTime || '未設定'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs font-bold text-emerald-600/60 uppercase mb-1">服務人員</p>
                  <p className="font-bold text-emerald-900">
                    {order.statusUpdates?.find(u => u.status === 'ACTIVE')?.staffName || '未設定'} 
                    {order.statusUpdates?.find(u => u.status === 'ACTIVE')?.staffPhone && ` (${order.statusUpdates.find(u => u.status === 'ACTIVE')?.staffPhone})`}
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Customer Info */}
          <section className="bg-white p-6 rounded-[2rem] shadow-sm border border-stone-100">
            <h2 className="text-lg font-bold text-stone-900 mb-6 flex items-center gap-2">
              <User className="text-primary" size={20} />
              顧客資訊
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-bold text-stone-400 uppercase mb-1">姓名</p>
                <input 
                  type="text"
                  name="name"
                  value={customerInfo.name}
                  onChange={handleCustomerInfoChange}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <p className="text-xs font-bold text-stone-400 uppercase mb-1">聯絡電話</p>
                <input 
                  type="text"
                  name="phone"
                  value={customerInfo.phone}
                  onChange={handleCustomerInfoChange}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="col-span-2">
                <p className="text-xs font-bold text-stone-400 uppercase mb-1">電子郵件</p>
                <input 
                  type="email"
                  name="email"
                  value={customerInfo.email}
                  onChange={handleCustomerInfoChange}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="col-span-2">
                <p className="text-xs font-bold text-stone-400 uppercase mb-1">服務地址</p>
                <input 
                  type="text"
                  name="address"
                  value={customerInfo.address}
                  onChange={handleCustomerInfoChange}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <p className="text-xs font-bold text-stone-400 uppercase mb-1">LINE ID</p>
                <input 
                  type="text"
                  name="lineId"
                  value={customerInfo.lineId || ''}
                  onChange={handleCustomerInfoChange}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="col-span-2 border-t border-stone-100 pt-4 mt-2">
                <p className="text-sm font-bold text-stone-900 mb-4">其他需求</p>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs font-bold text-stone-400 uppercase mb-1">緊急聯絡人姓名</p>
                    <input 
                      type="text"
                      name="emergencyContactName"
                      value={customerInfo.emergencyContactName || ''}
                      onChange={handleCustomerInfoChange}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-400 uppercase mb-1">緊急聯絡人電話</p>
                    <input 
                      type="text"
                      name="emergencyContactPhone"
                      value={customerInfo.emergencyContactPhone || ''}
                      onChange={handleCustomerInfoChange}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs font-bold text-stone-400 uppercase mb-1">特殊需求</p>
                    <textarea 
                      name="specialRequirements"
                      value={customerInfo.specialRequirements || ''}
                      onChange={handleCustomerInfoChange}
                      className="w-full h-24 px-3 py-2 border border-stone-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Customer Service Notes */}
          <section className="bg-white p-6 rounded-[2rem] shadow-sm border border-stone-100">
            <h2 className="text-lg font-bold text-stone-900 mb-6 flex items-center gap-2">
              <MessageSquare className="text-primary" size={20} />
              客服紀錄
            </h2>
            <p className="text-xs text-stone-500 mb-3">供客服記錄取消原因（如：對陌生人焦慮感過重）或額外需求。</p>
            <textarea
              value={customerServiceNotes}
              onChange={(e) => setCustomerServiceNotes(e.target.value)}
              placeholder="請輸入客服紀錄..."
              className="w-full h-32 px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
            />
          </section>
        </div>

        {/* Right Column: Order Content, Feedback & History */}
        <div className="space-y-8">
          <section className="bg-white p-6 rounded-[2rem] shadow-sm border border-stone-100">
            <h2 className="text-lg font-bold text-stone-900 mb-6 flex items-center gap-2">
              <CreditCard className="text-primary" size={20} />
              訂單內容
            </h2>
            
            <div className="space-y-4 mb-6">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex flex-col gap-2 pb-4 border-b border-stone-50 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <p className="font-bold text-stone-800 text-sm flex items-center gap-2">
                        {item.name}
                        {item.selectedVariant && (
                          <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full font-medium">
                            {item.selectedVariant.name}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-stone-500 mt-1">NT$ {item.price.toLocaleString()} x {item.quantity}</p>
                    </div>
                    <p className="font-bold text-stone-900 text-sm">NT$ {(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                  
                  {(item.expectedDates?.length || item.expectedTime || item.notes) && (
                    <div className="bg-stone-50 rounded-xl p-3 text-xs space-y-1.5 mt-2">
                      {item.expectedDates && item.expectedDates.length > 0 && (
                        <div className="flex gap-2">
                          <span className="text-stone-400 font-medium min-w-[60px]">期望日期:</span>
                          <span className="text-stone-700">{item.expectedDates}</span>
                        </div>
                      )}
                      {item.expectedTime && (
                        <div className="flex gap-2">
                          <span className="text-stone-400 font-medium min-w-[60px]">期望時段:</span>
                          <span className="text-stone-700">{item.expectedTime}</span>
                        </div>
                      )}
                      {item.notes && (
                        <div className="flex gap-2">
                          <span className="text-stone-400 font-medium min-w-[60px]">備註需求:</span>
                          <span className="text-stone-700 whitespace-pre-wrap">{item.notes}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="border-t border-stone-100 pt-4 space-y-3 mb-6">
              <div className="flex justify-between text-stone-500 text-sm">
                <span>小計</span>
                <span>NT$ {order.totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="font-bold text-stone-900">訂單總額</span>
                <span className="text-2xl font-black text-primary">NT$ {order.totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-stone-50 p-4 rounded-2xl space-y-3 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-stone-500">付款方式</span>
                <span className="text-sm font-bold text-stone-800">
                  {order.paymentMethod === 'CREDIT_CARD' ? '信用卡' : '銀行轉帳'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-stone-500">付款狀態</span>
                <span className={`text-sm font-bold ${order.paidAt ? 'text-emerald-600' : 'text-orange-600'}`}>
                  {order.paidAt ? '已付款' : '尚未付款'}
                </span>
              </div>
            </div>

            <button 
              className="w-full py-3 bg-white border-2 border-red-100 text-red-600 rounded-xl font-bold hover:bg-red-50 transition-colors"
              onClick={() => {
                // Handle refund logic
                setFeedback({ type: 'success', message: '退款申請已送出' });
              }}
            >
              退款
            </button>
          </section>

          {/* Vendor Feedback Section */}
          {(order.cancelReason || order.servicePhotoUrl || order.vendorNotes) && (
            <section className="bg-white p-6 rounded-[2rem] shadow-sm border border-stone-100">
              <h2 className="text-lg font-bold text-stone-900 mb-6 flex items-center gap-2">
                <MessageSquare className="text-primary" size={20} />
                廠商回報資訊
              </h2>
              <div className="space-y-6">
                {status === 'PENDING_PAYMENT' && (
                  <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                    <div className="flex items-center gap-2 text-emerald-600 mb-2">
                      <CheckCircle2 size={18} />
                      <span className="text-sm font-bold">廠商申請結案</span>
                    </div>
                    <p className="text-sm text-emerald-800 font-medium">廠商已完成服務並正式提交結案申請，請審核服務內容與照片後進行結案。</p>
                  </div>
                )}
                {order.cancelReason && (
                  <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
                    <div className="flex items-center gap-2 text-red-600 mb-2">
                      <XCircle size={18} />
                      <span className="text-sm font-bold">廠商申請取消原因</span>
                    </div>
                    <p className="text-sm text-red-800 font-medium bg-white/50 p-3 rounded-xl border border-red-100/50">{order.cancelReason}</p>
                  </div>
                )}
                {order.servicePhotoUrl && (
                  <div>
                    <div className="flex items-center gap-2 text-stone-900 mb-3">
                      <Camera size={18} className="text-primary" />
                      <span className="text-sm font-bold uppercase">服務完成照片</span>
                    </div>
                    <div className="relative group">
                      <img 
                        src={order.servicePhotoUrl} 
                        alt="服務完成照片" 
                        className="rounded-2xl border border-stone-100 max-w-full h-auto shadow-sm"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors rounded-2xl pointer-events-none" />
                    </div>
                  </div>
                )}
                {order.vendorNotes && (
                  <div>
                    <p className="text-xs font-bold text-stone-400 uppercase mb-2">廠商備註</p>
                    <p className="text-sm text-stone-700 bg-stone-50 p-4 rounded-2xl border border-stone-100">{order.vendorNotes}</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Order History */}
          <section className="bg-white p-6 rounded-[2rem] shadow-sm border border-stone-100">
            <h2 className="text-lg font-bold text-stone-900 mb-6 flex items-center gap-2">
              <Clock className="text-primary" size={20} />
              訂單紀錄
            </h2>
            <div className="space-y-4">
              {order.statusUpdates?.slice().reverse().map((update, idx) => (
                <div key={idx} className="flex gap-4 relative pb-4 last:pb-0">
                  {idx !== (order.statusUpdates?.length || 0) - 1 && (
                    <div className="absolute left-[7px] top-4 bottom-0 w-0.5 bg-stone-100" />
                  )}
                  <div className="w-4 h-4 rounded-full bg-stone-200 border-4 border-white shadow-sm z-10 mt-1" />
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-bold text-stone-900 bg-stone-100 px-2 py-0.5 rounded-full">
                        {getStatusText(update.status)}
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono">
                        {formatDate(update.timestamp)}
                      </span>
                    </div>
                    {update.note && (
                      <p className="text-xs text-stone-600 bg-stone-50 p-2 rounded-lg border border-stone-100 mt-1">
                        {update.note}
                      </p>
                    )}
                    {update.staffName && (
                      <p className="text-[10px] text-stone-400 mt-1">
                        執行人員: {update.staffName}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {(!order.statusUpdates || order.statusUpdates.length === 0) && (
                <p className="text-sm text-stone-400 text-center py-4">尚無紀錄</p>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl shadow-xl z-50 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-300 ${
          feedback.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
          <span className="font-bold">{feedback.message}</span>
        </div>
      )}
    </div>
  );
}
