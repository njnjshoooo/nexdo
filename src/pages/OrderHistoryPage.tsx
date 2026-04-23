import React, { useEffect, useState } from 'react';
import { Order } from '../types/admin';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'motion/react';
import { Package, Calendar, CreditCard, ChevronRight, ShoppingBag, Clock, AlertCircle, PlayCircle, CheckCircle, XCircle, ClipboardList } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../services/orderService';
import OrderStatusBadge from '../components/admin/OrderStatusBadge';
import { OrderStatus } from '../constants/orderStatus';

const IN_SERVICE_STATUSES: OrderStatus[] = ['PENDING', 'ACTIVE', 'WAITING_BALANCE', 'REFUND_PENDING'];
const HISTORY_ORDER_STATUSES: OrderStatus[] = ['BALANCE_PAID', 'COMPLETED', 'PAYOUT_REQUEST', 'PENDING_PAYMENT', 'PAID', 'CANCELLED', 'REFUNDED'];

export default function OrderHistoryPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'in-service' | 'history'>('in-service');
  const navigate = useNavigate();

  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      const allOrders = await orderService.getAll();
      const userOrders = allOrders.filter(o => o.userId === (user?.id || 'guest'));
      setOrders(userOrders);
    };
    
    fetchOrders();

    const handleUpdate = () => {
      fetchOrders();
    };

    window.addEventListener('orders_updated', handleUpdate);
    return () => {
      window.removeEventListener('orders_updated', handleUpdate);
    };
  }, [user]);

  const getPaidAmount = (order: Order) => {
    const paidStatuses: OrderStatus[] = ['PENDING', 'ACTIVE', 'WAITING_BALANCE', 'BALANCE_PAID', 'COMPLETED', 'PAYOUT_REQUEST', 'PENDING_PAYMENT', 'PAID'];
    if (paidStatuses.includes(order.status)) {
      if (['BALANCE_PAID', 'COMPLETED', 'PAYOUT_REQUEST', 'PENDING_PAYMENT', 'PAID'].includes(order.status)) {
        return order.totalAmount;
      }
      return order.depositAmount || order.totalAmount;
    }
    return 0;
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'in-service') {
      return IN_SERVICE_STATUSES.includes(order.status);
    } else {
      return HISTORY_ORDER_STATUSES.includes(order.status);
    }
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="min-h-screen bg-stone-50 pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-stone-900 mb-10 flex items-center gap-3">
          <Package className="text-primary" />
          我的訂單紀錄
        </h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-stone-200">
          <button
            onClick={() => setActiveTab('in-service')}
            className={`px-6 py-3 font-bold text-sm transition-all relative ${
              activeTab === 'in-service' ? 'text-primary' : 'text-stone-400 hover:text-stone-600'
            }`}
          >
            服務中
            {activeTab === 'in-service' && (
              <motion.div layoutId="orderTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 font-bold text-sm transition-all relative ${
              activeTab === 'history' ? 'text-primary' : 'text-stone-400 hover:text-stone-600'
            }`}
          >
            歷史訂單
            {activeTab === 'history' && (
              <motion.div layoutId="orderTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-stone-100 shadow-sm">
            <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="text-stone-300" size={32} />
            </div>
            <p className="text-stone-500 font-medium">尚無{activeTab === 'in-service' ? '服務中' : '歷史'}訂單紀錄</p>
            <button 
              onClick={() => navigate('/')}
              className="mt-6 text-primary font-bold hover:underline"
            >
              開始探索服務
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const isExpanded = expandedOrderId === order.id;
              const paidAmount = getPaidAmount(order);
              
              return (
                <motion.div 
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden"
                >
                  {/* Accordion Header */}
                  <button 
                    onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                    className="w-full text-left p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-stone-50/50 transition-colors"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-xl">
                          <ClipboardList className="text-primary" size={20} />
                        </div>
                        <h3 className="font-bold text-stone-900 text-lg">
                          預約需求: {order.items[0]?.name || '未知服務'}
                        </h3>
                      </div>
                      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-stone-500 ml-11">
                        <div className="flex items-center gap-1.5">
                          <Clock size={14} className="text-stone-400" />
                          <span>下單時間：{new Date(order.createdAt).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CreditCard size={14} className="text-stone-400" />
                          <span>訂單總計：<span className="font-bold text-stone-900">NT$ {order.totalAmount.toLocaleString()}</span></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CheckCircle size={14} className="text-emerald-500" />
                          <span>已付款金額：<span className="font-bold text-emerald-600">NT$ {paidAmount.toLocaleString()}</span></span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-4 md:pt-0">
                      <OrderStatusBadge status={order.status} role="customer" />
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronRight className="text-stone-300" />
                      </motion.div>
                    </div>
                  </button>

                  {/* Accordion Content */}
                  <motion.div
                    initial={false}
                    animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 border-t border-stone-50 pt-6 bg-stone-50/30">
                      <div className="space-y-6">
                        {/* Order Items */}
                        <div className="space-y-4">
                          <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">服務明細</p>
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-stone-100">
                              <div className="w-16 h-16 bg-stone-100 rounded-xl overflow-hidden flex-shrink-0">
                                {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />}
                              </div>
                              <div className="flex-grow">
                                <p className="font-bold text-stone-800">{item.name}</p>
                                {item.selectedVariant && (
                                  <p className="text-xs text-stone-400">規格: {item.selectedVariant.name}</p>
                                )}
                                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                                  {item.expectedDates && (
                                    <p className="text-[10px] text-primary font-bold flex items-center gap-1">
                                      <Calendar size={10} /> 期望日期: {item.expectedDates}
                                    </p>
                                  )}
                                  {item.expectedTime && (
                                    <p className="text-[10px] text-primary font-bold flex items-center gap-1">
                                      <Clock size={10} /> 期望時段: {item.expectedTime}
                                    </p>
                                  )}
                                </div>
                                <p className="text-xs text-stone-500 mt-1">NT$ {item.price.toLocaleString()} x {item.quantity}</p>
                              </div>
                              <p className="font-bold text-stone-900">NT$ {(item.price * item.quantity).toLocaleString()}</p>
                            </div>
                          ))}
                        </div>

                        {/* Customer Info & Payment */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-stone-100">
                          <div className="space-y-3">
                            <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">客戶資訊</p>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm text-stone-600">
                                <ShoppingBag size={14} className="text-stone-400" />
                                <span>收件人：{order.customerInfo.name}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-stone-600">
                                <CreditCard size={14} className="text-stone-400" />
                                <span>付款方式：{order.paymentMethod === 'CREDIT_CARD' ? '信用卡' : '銀行轉帳'}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-white p-4 rounded-2xl border border-stone-100 space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-stone-500">訂單總額</span>
                              <span className="font-bold text-stone-900">NT$ {order.totalAmount.toLocaleString()}</span>
                            </div>
                            {order.depositAmount && order.depositAmount > 0 && (
                              <>
                                <div className="flex justify-between text-sm">
                                  <span className="text-stone-500">應付訂金</span>
                                  <span className="font-bold text-emerald-600">NT$ {order.depositAmount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-stone-500">應付尾款</span>
                                  <span className="font-bold text-stone-600">NT$ {(order.totalAmount - order.depositAmount).toLocaleString()}</span>
                                </div>
                              </>
                            )}
                            <div className="pt-2 border-t border-stone-50 flex justify-between items-center">
                              <span className="text-sm font-bold text-stone-900">已付款金額</span>
                              <span className="text-xl font-black text-primary">NT$ {paidAmount.toLocaleString()}</span>
                            </div>
                            {order.paidAt && (
                              <p className="text-[10px] text-stone-400 text-right italic">最後付款時間: {new Date(order.paidAt).toLocaleString()}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
