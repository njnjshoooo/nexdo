import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import { submissionService } from '../../services/submissionService';
import { Order } from '../../types/admin';
import { CheckCircle, CreditCard, ShieldCheck, Clock, MapPin, User, Phone, FileText } from 'lucide-react';
import { motion } from 'motion/react';

export default function PaymentPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    if (orderId) {
      const foundOrder = orderService.getById(orderId);
      if (foundOrder) {
        setOrder(foundOrder);
      }
      setLoading(false);
    }
  }, [orderId]);

  const handlePayment = async () => {
    if (!order) return;
    
    setIsPaying(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update order status to PENDING (New Order for Vendor)
    const updates = {
      status: 'PENDING' as const,
      paidAt: new Date().toISOString(),
      statusUpdates: [
        ...(order.statusUpdates || []),
        {
          status: 'PENDING' as const,
          timestamp: new Date().toISOString(),
          note: '客戶已完成訂金支付，訂單正式成立。'
        }
      ]
    };
    
    orderService.update(order.id, updates);
    
    // Update associated submission to PROCESSED
    if (order.submissionId) {
      submissionService.updateStatus(order.submissionId, 'PROCESSED');
    }
    
    setIsPaying(false);
    setPaymentSuccess(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-200 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock size={32} />
          </div>
          <h1 className="text-2xl font-bold text-stone-900 mb-2">連結已失效</h1>
          <p className="text-stone-500 mb-6">找不到此訂單資訊，或該連結已過期。請聯繫客服人員。</p>
          <button 
            onClick={() => navigate('/')}
            className="w-full py-3 bg-stone-900 text-white rounded-xl font-bold hover:bg-stone-800 transition-colors"
          >
            返回首頁
          </button>
        </div>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-3xl shadow-sm border border-stone-200 text-center max-w-md w-full"
        >
          <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={48} />
          </div>
          <h1 className="text-2xl font-bold text-stone-900 mb-2">支付成功！</h1>
          <p className="text-stone-500 mb-8">
            我們已收到您的訂金。系統已自動為您媒合服務廠商，廠商將於 24 小時內與您聯繫確認服務細節。
          </p>
          <div className="space-y-3">
            <div className="bg-stone-50 p-4 rounded-2xl text-left border border-stone-100">
              <div className="text-xs text-stone-400 uppercase font-bold mb-1">訂單編號</div>
              <div className="font-mono font-bold text-stone-900">{order.id}</div>
            </div>
          </div>
          <button 
            onClick={() => navigate('/')}
            className="w-full mt-8 py-3 bg-stone-900 text-white rounded-xl font-bold hover:bg-stone-800 transition-colors"
          >
            返回首頁
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-sm">
            <ShieldCheck className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-stone-900">好齡居專屬付款頁面</h1>
            <p className="text-sm text-stone-500">安全支付保障，讓您更放心</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Order Summary */}
          <div className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden">
            <div className="p-6 border-b border-stone-100 bg-stone-50/50">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">訂單編號</div>
                  <div className="font-mono font-bold text-stone-900">{order.id}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">狀態</div>
                  <div className="text-primary font-bold">待支付訂金</div>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-8">
              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center shrink-0">
                    <User className="text-stone-500" size={20} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-stone-400 uppercase mb-1">聯絡人</div>
                    <div className="text-stone-900 font-medium">{order.customerInfo.name}</div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center shrink-0">
                    <Phone className="text-stone-500" size={20} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-stone-400 uppercase mb-1">電話</div>
                    <div className="text-stone-900 font-medium">{order.customerInfo.phone}</div>
                  </div>
                </div>
                <div className="flex gap-3 md:col-span-2">
                  <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center shrink-0">
                    <MapPin className="text-stone-500" size={20} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-stone-400 uppercase mb-1">服務地址</div>
                    <div className="text-stone-900 font-medium">{order.customerInfo.address}</div>
                  </div>
                </div>
              </div>

              {/* Service Details */}
              <div>
                <h3 className="font-bold text-stone-900 mb-4 flex items-center gap-2">
                  <FileText className="text-primary" size={20} />
                  服務明細
                </h3>
                <div className="bg-stone-50 rounded-2xl p-4 space-y-4">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <div>
                        <div className="font-bold text-stone-900">{item.name}</div>
                        {item.selectedVariant && (
                          <div className="text-xs text-stone-500">{item.selectedVariant.name}</div>
                        )}
                      </div>
                      <div className="text-stone-900 font-medium">x {item.quantity}</div>
                    </div>
                  ))}
                  {order.items.some(i => i.expectedDates || i.expectedTime) && (
                    <div className="border-t border-stone-200 pt-3 mt-3 space-y-2">
                      {order.items.map((item, idx) => (
                        <React.Fragment key={idx}>
                          {item.expectedDates && (
                            <div className="flex gap-2 text-xs">
                              <span className="text-stone-400 w-20 shrink-0">期望日期:</span>
                              <span className="text-stone-700 font-medium">{item.expectedDates}</span>
                            </div>
                          )}
                          {item.expectedTime && (
                            <div className="flex gap-2 text-xs">
                              <span className="text-stone-400 w-20 shrink-0">期望時段:</span>
                              <span className="text-stone-700 font-medium">{item.expectedTime}</span>
                            </div>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Price */}
              <div className="border-t border-stone-100 pt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-stone-500">服務總預估金額</span>
                  <span className="text-stone-900 font-medium">NT$ {order.quotedAmount?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-900 font-bold text-lg">應付訂金 (30%)</span>
                  <span className="text-primary font-black text-2xl">NT$ {Math.round((order.quotedAmount || 0) * 0.3).toLocaleString()}</span>
                </div>
                <p className="text-xs text-stone-400 mt-4 italic">
                  * 支付訂金後即啟動媒合流程。剩餘款項將於服務完成後支付。
                </p>
              </div>
            </div>

            <div className="p-6 bg-stone-900">
              <button 
                onClick={handlePayment}
                disabled={isPaying}
                className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isPaying ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    處理中...
                  </>
                ) : (
                  <>
                    <CreditCard size={24} />
                    立即支付訂金
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 text-stone-400">
            <div className="flex items-center gap-1 text-xs">
              <ShieldCheck size={14} />
              SSL 加密傳輸
            </div>
            <div className="flex items-center gap-1 text-xs">
              <ShieldCheck size={14} />
              第三方支付保障
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
