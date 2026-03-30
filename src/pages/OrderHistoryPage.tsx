import React, { useEffect, useState } from 'react';
import { Order } from '../types/admin';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'motion/react';
import { Package, Calendar, CreditCard, ChevronRight, ShoppingBag, Clock, AlertCircle, PlayCircle, CheckCircle, XCircle, ClipboardList } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../services/orderService';

export default function OrderHistoryPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const allOrders = orderService.getAll();
    // 模擬過濾該用戶的訂單
    const userOrders = allOrders.filter(o => o.userId === (user?.id || 'guest'));
    setOrders(userOrders);
  }, [user]);

  const getStatusDisplay = (status: Order['status']) => {
    switch (status) {
      case 'UNPAID': 
        return <span className="flex items-center gap-1.5 text-stone-500 bg-stone-100 px-3 py-1.5 rounded-full text-xs font-bold"><Clock size={14} /> 待付款</span>;
      case 'PENDING': 
        return <span className="flex items-center gap-1.5 text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full text-xs font-bold"><AlertCircle size={14} /> 待處理</span>;
      case 'ACTIVE': 
        return <span className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full text-xs font-bold"><PlayCircle size={14} /> 已媒合</span>;
      case 'COMPLETED': 
        return <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full text-xs font-bold"><CheckCircle size={14} /> 已完成</span>;
      case 'PENDING_PAYMENT':
        return <span className="flex items-center gap-1.5 text-purple-600 bg-purple-50 px-3 py-1.5 rounded-full text-xs font-bold"><Clock size={14} /> 待撥款</span>;
      case 'PAID':
        return <span className="flex items-center gap-1.5 text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full text-xs font-bold"><CheckCircle size={14} /> 已結案</span>;
      case 'QUOTE_PENDING':
        return <span className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full text-xs font-bold"><Clock size={14} /> 報價審核中</span>;
      case 'QUOTED':
        return <span className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full text-xs font-bold"><ClipboardList size={14} /> 已報價</span>;
      case 'CANCELLED': 
        return <span className="flex items-center gap-1.5 text-red-600 bg-red-50 px-3 py-1.5 rounded-full text-xs font-bold"><XCircle size={14} /> 已取消</span>;
    }
  };

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-stone-50 pt-32 pb-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <Package className="text-stone-400 w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold text-stone-900 mb-4">尚無訂單紀錄</h1>
          <p className="text-stone-500 mb-10">您還沒有建立過任何訂單。</p>
          <button 
            onClick={() => navigate('/')}
            className="bg-stone-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-black transition-all"
          >
            開始探索服務
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-stone-900 mb-10 flex items-center gap-3">
          <Package className="text-primary" />
          我的訂單紀錄
        </h1>

        <div className="space-y-6">
          {orders.map((order) => (
            <motion.div 
              key={order.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden"
            >
              <div className="p-6 border-b border-stone-50 flex flex-wrap justify-between items-center gap-4 bg-stone-50/50">
                <div className="flex items-center gap-4">
                  <div className="bg-white p-3 rounded-2xl shadow-sm">
                    <Package className="text-primary" size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">訂單編號</p>
                    <p className="text-lg font-mono font-bold text-stone-800">{order.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">下單時間</p>
                    <p className="text-sm font-bold text-stone-600 flex items-center gap-1">
                      <Calendar size={14} />
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {getStatusDisplay(order.status)}
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-4 mb-6">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-stone-100 rounded-xl overflow-hidden flex-shrink-0">
                        {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />}
                      </div>
                      <div className="flex-grow">
                        <p className="font-bold text-stone-800">{item.name}</p>
                        {item.selectedVariant && (
                          <p className="text-[10px] text-stone-400">規格: {item.selectedVariant.name}</p>
                        )}
                        {item.expectedDates && (
                          <p className="text-[10px] text-primary font-bold">期望日期: {item.expectedDates}</p>
                        )}
                        {item.expectedTime && (
                          <p className="text-[10px] text-primary font-bold">期望時段: {item.expectedTime}</p>
                        )}
                        <p className="text-xs text-stone-500">NT$ {item.price.toLocaleString()} x {item.quantity}</p>
                      </div>
                      <p className="font-bold text-stone-900">NT$ {(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  ))}
                </div>

                <div className="pt-6 border-t border-stone-50 flex justify-between items-end">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-stone-400">
                      <CreditCard size={14} />
                      <span>付款方式：{order.paymentMethod === 'CREDIT_CARD' ? '信用卡' : '銀行轉帳'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-stone-400">
                      <ShoppingBag size={14} />
                      <span>收件人：{order.customerInfo.name}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-stone-400 uppercase mb-1">總計金額</p>
                    <p className="text-2xl font-black text-primary">NT$ {order.totalAmount.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
