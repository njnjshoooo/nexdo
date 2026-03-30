import React, { useState, useEffect } from 'react';
import { Order } from '../../../types/admin';
import { Vendor } from '../../../types/vendor';
import { orderService } from '../../../services/orderService';
import { submissionService } from '../../../services/submissionService';
import { Eye, Clock, DollarSign, CheckCircle, XCircle, FileText, Camera } from 'lucide-react';

interface PendingQuoteListProps {
  vendor: Vendor;
}

export default function PendingQuoteList({ vendor }: PendingQuoteListProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [quoteAmount, setQuoteAmount] = useState<string>('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    loadData();
  }, [vendor.id]);

  const loadData = () => {
    const allOrders = orderService.getAll();
    const pendingQuotes = allOrders.filter(o => 
      (o.status === 'QUOTE_PENDING' || o.status === 'QUOTED') && 
      o.vendorId === vendor.id
    );
    setOrders(pendingQuotes);
  };

  const handleSubmitQuote = () => {
    if (!selectedOrder || !quoteAmount || isNaN(Number(quoteAmount))) {
      setFeedback({ type: 'error', message: '請輸入有效的預估金額' });
      return;
    }

    const amount = Number(quoteAmount);
    const updates = {
      quotedAmount: amount,
      totalAmount: amount, // Also update totalAmount for display
      status: 'QUOTED' as const, // Move to quoted status
      statusUpdates: [
        ...(selectedOrder.statusUpdates || []),
        {
          status: 'QUOTED' as const,
          timestamp: new Date().toISOString(),
          note: `廠商已回報預估金額: NT$ ${amount.toLocaleString()}`
        }
      ]
    };

    orderService.update(selectedOrder.id, updates);
    
    // Also update the original submission status to QUOTED
    if (selectedOrder.submissionId) {
      submissionService.updateStatus(selectedOrder.submissionId, 'QUOTED');
    }

    setSelectedOrder(null);
    setQuoteAmount('');
    loadData();
    setFeedback({ type: 'success', message: '報價已成功送出！' });
  };

  const parseNotes = (notes?: string) => {
    if (!notes) return {};
    try {
      return JSON.parse(notes);
    } catch (e) {
      return { note: notes };
    }
  };

  if (selectedOrder) {
    const formData = parseNotes(selectedOrder.items[0].notes);
    
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
        <div className="flex justify-between items-center mb-6 border-b border-stone-100 pb-4">
          <h2 className="text-xl font-bold text-stone-900">需求單詳情 #{selectedOrder.id}</h2>
          <button onClick={() => setSelectedOrder(null)} className="text-stone-500 hover:text-stone-700">返回列表</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-stone-900 mb-4 flex items-center gap-2">
              <FileText className="text-primary" size={20} />
              需求內容
            </h3>
            <div className="bg-stone-50 rounded-xl p-4 space-y-3 text-sm">
              {selectedOrder.items.map((item, idx) => (
                <div key={idx} className="space-y-2">
                  {item.expectedDates && (
                    <div className="flex border-b border-stone-200 pb-2">
                      <span className="text-stone-500 w-32 shrink-0 font-bold text-primary">期望日期：</span>
                      <span className="text-stone-900 font-bold">{item.expectedDates}</span>
                    </div>
                  )}
                  {item.expectedTime && (
                    <div className="flex border-b border-stone-200 pb-2">
                      <span className="text-stone-500 w-32 shrink-0 font-bold text-primary">期望時段：</span>
                      <span className="text-stone-900 font-bold">{item.expectedTime}</span>
                    </div>
                  )}
                </div>
              ))}
              {Object.entries(formData).map(([key, value]) => {
                if (key === 'photos' || key === '照片' || (typeof value === 'string' && value.startsWith('http') && (value.match(/\.(jpg|jpeg|png|gif|webp)$/i)))) {
                  return null; // Handle photos separately
                }
                return (
                  <div key={key} className="flex border-b border-stone-200 last:border-0 pb-2 last:pb-0">
                    <span className="text-stone-500 w-32 shrink-0">{key}：</span>
                    <span className="text-stone-900 font-medium">{Array.isArray(value) ? value.join(', ') : String(value)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-stone-900 mb-4 flex items-center gap-2">
              <Camera className="text-primary" size={20} />
              需求照片
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(formData).filter(([key, value]) => 
                key === 'photos' || key === '照片' || (typeof value === 'string' && value.startsWith('http') && (value.match(/\.(jpg|jpeg|png|gif|webp)$/i)))
              ).map(([key, value], idx) => {
                const urls = Array.isArray(value) ? value : [value];
                return urls.map((url, i) => (
                  <div key={`${idx}-${i}`} className="aspect-square rounded-xl overflow-hidden border border-stone-200">
                    <img src={url} alt="需求照片" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                ));
              })}
              {Object.entries(formData).filter(([key, value]) => 
                key === 'photos' || key === '照片' || (typeof value === 'string' && value.startsWith('http') && (value.match(/\.(jpg|jpeg|png|gif|webp)$/i)))
              ).length === 0 && (
                <div className="col-span-2 py-8 text-center text-stone-400 bg-stone-50 rounded-xl border border-dashed border-stone-200">
                  無照片附件
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
          <h3 className="font-bold text-primary mb-4 flex items-center gap-2">
            <DollarSign size={20} />
            {selectedOrder.status === 'QUOTED' ? '已填寫報價' : '填寫預估報價'}
          </h3>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-stone-700 mb-1">總預估金額 (NT$)</label>
              <input 
                type="number"
                value={quoteAmount || (selectedOrder.quotedAmount?.toString() || '')}
                onChange={(e) => setQuoteAmount(e.target.value)}
                placeholder="請輸入預估總金額..."
                className="w-full px-4 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>
            <button 
              onClick={handleSubmitQuote}
              className="w-full md:w-auto px-8 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-colors shadow-sm"
            >
              {selectedOrder.status === 'QUOTED' ? '更新報價' : '送出報價'}
            </button>
          </div>
          <p className="text-xs text-stone-500 mt-3 italic">* 此金額為初步預估，實際金額以現場評估後為準。</p>
        </div>

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
      <div className="p-6 border-b border-stone-100 flex justify-between items-center">
        <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
          待報價列表
          {orders.length > 0 && (
            <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">{orders.length}</span>
          )}
        </h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-stone-50 text-stone-500 text-xs uppercase font-bold">
            <tr>
              <th className="px-6 py-4">需求單編號</th>
              <th className="px-6 py-4">客戶姓名</th>
              <th className="px-6 py-4">服務地址</th>
              <th className="px-6 py-4">指派時間</th>
              <th className="px-6 py-4">狀態</th>
              <th className="px-6 py-4 text-center">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {orders.map(order => (
              <tr key={order.id} className="hover:bg-stone-50/50 transition-colors">
                <td className="px-6 py-4 font-mono text-sm font-bold text-stone-900">{order.id}</td>
                <td className="px-6 py-4 text-sm text-stone-900">{order.customerInfo.name}</td>
                <td className="px-6 py-4 text-sm text-stone-500 truncate max-w-[200px]">{order.customerInfo.address}</td>
                <td className="px-6 py-4 text-sm text-stone-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  {order.status === 'QUOTE_PENDING' ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary">
                      <Clock size={14} /> 待報價
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-600">
                      <CheckCircle size={14} /> 已報價
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  <button 
                    onClick={() => {
                      setSelectedOrder(order);
                      setQuoteAmount('');
                    }}
                    className="p-2 text-stone-400 hover:text-primary transition-colors inline-flex"
                    title="查看詳情並報價"
                  >
                    <Eye size={20} />
                  </button>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-stone-400">
                  目前沒有待報價的需求單
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
