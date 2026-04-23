import React, { useState, useEffect } from 'react';
import { Order } from '../../../types/admin';
import { Vendor } from '../../../types/vendor';
import { orderService } from '../../../services/orderService';
import { submissionService } from '../../../services/submissionService';
import { Clock, DollarSign, CheckCircle, XCircle, FileText, Camera } from 'lucide-react';
import OrderStatusBadge from '../../../components/admin/OrderStatusBadge';
import SaveButton from '../../../components/admin/SaveButton';
import AdminTable from '../../../components/admin/AdminTable';
import { Pagination } from '../../../components/ui/Pagination';

interface PendingQuoteListProps {
  vendor: Vendor;
}

export default function PendingQuoteList({ vendor }: PendingQuoteListProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [quoteAmount, setQuoteAmount] = useState<string>('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadData();
  }, [vendor.id]);

  const loadData = async () => {
    const allOrders = await orderService.getAll();
    const pendingQuotes = allOrders.filter(o => 
      (o.status === 'NEW_QUOTE' || o.status === 'QUOTING' || o.status === 'QUOTE_REVIEW') && 
      o.vendorId === vendor.id
    );
    setOrders(pendingQuotes);
  };

  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const paginatedOrders = orders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSubmitQuote = async () => {
    if (!selectedOrder || !quoteAmount || isNaN(Number(quoteAmount))) {
      setFeedback({ type: 'error', message: '請輸入有效的預估金額' });
      return;
    }

    const amount = Number(quoteAmount);
    const updates = {
      quotedAmount: amount,
      totalAmount: amount, // Also update totalAmount for display
      status: 'QUOTE_REVIEW' as const, // Move to quoted status
      statusUpdates: [
        ...(selectedOrder.statusUpdates || []),
        {
          status: 'QUOTE_REVIEW' as const,
          timestamp: new Date().toISOString(),
          note: `廠商已回報預估金額: NT$ ${amount.toLocaleString()}`
        }
      ]
    };

    await orderService.update(selectedOrder.id, updates);
    
    // Also update the original submission status to QUOTED
    if (selectedOrder.submissionId) {
      await submissionService.updateStatus(selectedOrder.submissionId, 'QUOTED');
    }

    setSelectedOrder(null);
    setQuoteAmount('');
    await loadData();
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
            {selectedOrder.status === 'QUOTE_REVIEW' ? '已填寫報價' : '填寫預估報價'}
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
            <SaveButton 
              status="idle"
              onClick={handleSubmitQuote}
              label={selectedOrder.status === 'QUOTE_REVIEW' ? '更新報價' : '送出報價'}
              className="w-full md:w-auto px-8 py-2"
            />
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
        <AdminTable.Main>
          <AdminTable.Head>
            <tr>
              <AdminTable.Th>需求單編號</AdminTable.Th>
              <AdminTable.Th>客戶姓名</AdminTable.Th>
              <AdminTable.Th>服務地址</AdminTable.Th>
              <AdminTable.Th>指派時間</AdminTable.Th>
              <AdminTable.Th>狀態</AdminTable.Th>
            </tr>
          </AdminTable.Head>
          <AdminTable.Body>
            {paginatedOrders.map(order => (
              <AdminTable.Row key={order.id}>
                <AdminTable.Td>
                  <button 
                    onClick={() => {
                      setSelectedOrder(order);
                      setQuoteAmount('');
                    }}
                    className="font-mono text-sm font-bold text-primary hover:underline"
                  >
                    {order.id}
                  </button>
                </AdminTable.Td>
                <AdminTable.Td className="text-sm text-stone-900">{order.customerInfo.name}</AdminTable.Td>
                <AdminTable.Td className="text-sm text-stone-500 truncate max-w-[200px]">{order.customerInfo.address}</AdminTable.Td>
                <AdminTable.Td className="text-sm text-stone-500">{new Date(order.createdAt).toLocaleDateString()}</AdminTable.Td>
                <AdminTable.Td>
                  <OrderStatusBadge status={order.status} role="vendor" />
                </AdminTable.Td>
              </AdminTable.Row>
            ))}
            {paginatedOrders.length === 0 && (
              <AdminTable.Empty colSpan={5}>
                目前沒有待報價的需求單
              </AdminTable.Empty>
            )}
          </AdminTable.Body>
        </AdminTable.Main>
      </div>

      {totalPages > 1 && (
        <div className="p-6 border-t border-stone-100 flex justify-center">
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
