import React, { useState, useEffect } from 'react';
import { Order, OrderStatusUpdate } from '../../../types/admin';
import { Vendor, Staff } from '../../../types/vendor';
import { orderService } from '../../../services/orderService';
import { staffService } from '../../../services/staffService';
import { submissionService } from '../../../services/submissionService';
import { Clock, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import OrderStatusBadge from '../../../components/admin/OrderStatusBadge';
import SaveButton from '../../../components/admin/SaveButton';
import AdminTable from '../../../components/admin/AdminTable';

interface NewOrdersProps {
  vendor: Vendor;
}

export default function NewOrders({ vendor }: NewOrdersProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  
  // Form state for accepting order
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  
  // Form state for rejecting order
  const [rejectReason, setRejectReason] = useState('');

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
    // In a real app, we'd filter by vendorId and status='PENDING'
    const allOrders = await orderService.getAll();
    const newOrders = allOrders.filter(o => o.status === 'PENDING' && o.vendorId === vendor.id);
    setOrders(newOrders);
    
    setStaffList(staffService.getAll(vendor.id));
  };

  const handleAccept = async () => {
    if (!selectedOrder || !selectedDate || !selectedTime || !selectedStaffId) {
      setFeedback({ type: 'error', message: '請填寫完整資訊' });
      return;
    }

    const staff = staffList.find(s => s.id === selectedStaffId);
    if (!staff) return;

    const newUpdate: OrderStatusUpdate = {
      status: 'ACTIVE',
      timestamp: new Date().toISOString(),
      staffName: staff.name,
      staffPhone: staff.phone,
      assignedDate: selectedDate,
      assignedTime: selectedTime
    };

    const updates = {
      status: 'ACTIVE' as const,
      vendorId: vendor.id,
      assignedStaffId: selectedStaffId,
      assignedDate: selectedDate,
      assignedTime: selectedTime,
      statusUpdates: [...(selectedOrder.statusUpdates || []), newUpdate]
    };

    await orderService.update(selectedOrder.id, updates);

    // Update associated submission to ACTIVE
    if (selectedOrder.submissionId) {
      await submissionService.updateStatus(selectedOrder.submissionId, 'ACTIVE');
    }

    setSelectedOrder(null);
    await loadData();
    setFeedback({ type: 'success', message: '已成功接案！' });
  };

  const autoSelectOptions = (order: Order) => {
    if (order.items.length > 0) {
      const firstItem = order.items[0];
      
      // Auto select time if available
      if (firstItem.expectedTime) {
        setSelectedTime(firstItem.expectedTime.split(',')[0].trim());
      }

      // Auto select date only if there's exactly one option
      if (firstItem.expectedDates) {
        const dates = firstItem.expectedDates.split(',').map(d => d.trim());
        if (dates.length === 1) {
          setSelectedDate(dates[0]);
        }
      }
    }
    
    const staff = staffService.getAll(vendor.id);
    if (staff.length === 1) {
      setSelectedStaffId(staff[0].id);
    }
  };

  const handleReject = async () => {
    if (!selectedOrder || !rejectReason) {
      setFeedback({ type: 'error', message: '請填寫無法配合原因' });
      return;
    }

    const newUpdate: OrderStatusUpdate = {
      status: 'UNAVAILABLE',
      timestamp: new Date().toISOString(),
      note: `廠商無法配合：${rejectReason}`
    };

    const updates = {
      status: 'UNAVAILABLE' as const,
      vendorNotes: rejectReason,
      statusUpdates: [...(selectedOrder.statusUpdates || []), newUpdate]
    };

    await orderService.update(selectedOrder.id, updates);
    setSelectedOrder(null);
    await loadData();
    setFeedback({ type: 'success', message: '已送出無法配合原因' });
  };

  const maskPhone = (phone: string) => {
    if (!phone || phone.length < 10) return phone;
    return `${phone.substring(0, 4)}***${phone.substring(7)}`;
  };

  if (selectedOrder) {
    const item = selectedOrder.items[0]; // Assuming 1 item for simplicity, or we can show all
    
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
        <div className="flex justify-between items-center mb-6 border-b border-stone-100 pb-4">
          <h2 className="text-xl font-bold text-stone-900">訂單詳情 #{selectedOrder.id}</h2>
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
              <p><span className="text-stone-500 w-24 inline-block">聯絡電話：</span>{maskPhone(selectedOrder.customerInfo.phone)}</p>
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
          <div className="bg-stone-50 rounded-xl p-4 space-y-4">
            {selectedOrder.items.map((it, idx) => (
              <div key={idx} className="border-b border-stone-200 last:border-0 pb-4 last:pb-0">
                <p className="font-bold text-stone-900 mb-2">{it.name} {it.selectedVariant ? `(${it.selectedVariant.name})` : ''}</p>
                
                {it.expectedDates && it.expectedDates.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm text-stone-500 mb-2">期望日期 (請勾選一個)：</p>
                    <div className="flex flex-wrap gap-2">
                      {it.expectedDates.split(',').map(date => date.trim()).map((date, i) => (
                        <label key={i} className={`px-3 py-1.5 rounded-lg border text-sm cursor-pointer transition-colors ${selectedDate === date ? 'bg-primary/10 border-primary text-primary font-bold' : 'bg-white border-stone-200 text-stone-600 hover:border-primary/50'}`}>
                          <input type="radio" name={`date-${idx}`} value={date} checked={selectedDate === date} onChange={(e) => setSelectedDate(e.target.value)} className="sr-only" />
                          {date}
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {selectedDate && it.expectedTime && (
                  <div className="mb-3">
                    <p className="text-sm text-stone-500 mb-2">期望時段 (請勾選一個)：</p>
                    <div className="flex flex-wrap gap-2">
                      {it.expectedTime.split(',').map(time => time.trim()).map((time, i) => (
                        <label key={i} className={`px-3 py-1.5 rounded-lg border text-sm cursor-pointer transition-colors ${selectedTime === time ? 'bg-primary/10 border-primary text-primary font-bold' : 'bg-white border-stone-200 text-stone-600 hover:border-primary/50'}`}>
                          <input type="radio" name={`time-${idx}`} value={time} checked={selectedTime === time} onChange={(e) => setSelectedTime(e.target.value)} className="sr-only" />
                          {time} (可執行)
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-stone-100 pt-6">
          <div className="bg-red-50 p-4 rounded-xl border border-red-100">
            <h4 className="font-bold text-red-800 mb-2">無法配合</h4>
            <textarea 
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="請填寫原因，例如：時間皆無法配合，提議新時段..."
              className="w-full h-20 px-3 py-2 border border-red-200 rounded-lg text-sm mb-3 outline-none focus:ring-2 focus:ring-red-500/20 resize-none"
            />
            <SaveButton 
              status="idle"
              onClick={handleReject}
              disabled={!rejectReason}
              label="送出無法配合原因"
              className="w-full py-2 !bg-red-600 !text-white hover:!bg-red-700 shadow-red-100/50"
            />
          </div>

          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
            <h4 className="font-bold text-emerald-800 mb-2">立即接案</h4>
            <div className="mb-3">
              <label className="block text-sm text-emerald-700 mb-1">指派服務人員</label>
              {staffList.length > 0 ? (
                <select 
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="w-full px-3 py-2 border border-emerald-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white"
                >
                  <option value="">請選擇服務人員</option>
                  {staffList.map(staff => (
                    <option key={staff.id} value={staff.id}>{staff.name}</option>
                  ))}
                </select>
              ) : (
                <div className="p-3 bg-white border border-red-200 rounded-lg text-sm text-red-600 flex items-center gap-2">
                  <AlertCircle size={16} />
                  目前尚無服務人員，請先至「人員管理」新增。
                </div>
              )}
            </div>
            {selectedStaffId && (
              <p className="text-sm text-emerald-600 mb-3">
                人員電話：{staffList.find(s => s.id === selectedStaffId)?.phone}
              </p>
            )}
            <SaveButton 
              status="idle"
              onClick={handleAccept}
              label="確認接案"
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100/50"
            />
          </div>
        </div>

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
    <div className="relative min-h-[400px]">
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="p-6 border-b border-stone-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            新案列表
            {orders.length > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{orders.length}</span>
            )}
          </h2>
        </div>
        
        <AdminTable.Container>
          <AdminTable.Main>
            <AdminTable.Head>
              <tr>
                <AdminTable.Th>訂單編號</AdminTable.Th>
                <AdminTable.Th>客戶姓名</AdminTable.Th>
                <AdminTable.Th>客戶電話</AdminTable.Th>
                <AdminTable.Th>服務地址</AdminTable.Th>
                <AdminTable.Th>狀態</AdminTable.Th>
              </tr>
            </AdminTable.Head>
            <AdminTable.Body>
              {orders.map(order => (
                <AdminTable.Row key={order.id}>
                  <AdminTable.Td>
                    <button 
                      onClick={() => {
                        setSelectedOrder(order);
                        setSelectedDate('');
                        setSelectedTime('');
                        setSelectedStaffId('');
                        setRejectReason('');
                        autoSelectOptions(order);
                      }}
                      className="font-mono text-sm font-bold text-primary hover:underline"
                    >
                      {order.id}
                    </button>
                  </AdminTable.Td>
                  <AdminTable.Td className="text-sm text-stone-900">{order.customerInfo.name}</AdminTable.Td>
                  <AdminTable.Td className="text-sm text-stone-500">{maskPhone(order.customerInfo.phone)}</AdminTable.Td>
                  <AdminTable.Td className="text-sm text-stone-500 truncate max-w-[200px]">{order.customerInfo.address}</AdminTable.Td>
                  <AdminTable.Td>
                    <OrderStatusBadge status={order.status} role="vendor" />
                  </AdminTable.Td>
                </AdminTable.Row>
              ))}
              {orders.length === 0 && (
                <AdminTable.Empty colSpan={5}>
                  目前沒有新派案
                </AdminTable.Empty>
              )}
            </AdminTable.Body>
          </AdminTable.Main>
        </AdminTable.Container>
      </div>

      {/* Feedback Toast for list view */}
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
