import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FormSubmission, Form } from '../../types/form';
import { Vendor } from '../../types/vendor';
import { submissionService } from '../../services/submissionService';
import { formService } from '../../services/formService';
import { pageService } from '../../services/pageService';
import { productService } from '../../services/productService';
import { orderService } from '../../services/orderService';
import { Order } from '../../types/admin';
import { Trash2, Eye, X, ArrowLeft, FilterX, UserPlus, CheckCircle2, Clock, DollarSign, Link as LinkIcon, Copy, Check } from 'lucide-react';

export default function AppointmentManagement() {
  const [searchParams, setSearchParams] = useSearchParams();
  const formNameFilter = searchParams.get('formName');
  
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [forms, setForms] = useState<Record<string, Form>>({});
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigningSubmission, setAssigningSubmission] = useState<FormSubmission | null>(null);
  const [selectedVendorId, setSelectedVendorId] = useState<string>('');
  const [showPaymentLinkModal, setShowPaymentLinkModal] = useState(false);
  const [paymentLink, setPaymentLink] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadData();
    loadVendors();
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, [formNameFilter]);

  const loadVendors = () => {
    const stored = localStorage.getItem('vendors');
    if (stored) {
      setVendors(JSON.parse(stored));
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const allSubmissions = await submissionService.getAll();
      const allForms = formService.getAll();
      const formMap: Record<string, Form> = {};
      allForms.forEach(form => {
        formMap[form.id] = form;
      });
      setForms(formMap);

      // Filter by purpose 'BOOKING'
      let filtered = allSubmissions.filter(s => {
        const form = formMap[s.formId];
        return form?.purpose === 'BOOKING';
      });

      // Filter by form name if provided
      if (formNameFilter) {
        filtered = filtered.filter(s => {
          const form = formMap[s.formId];
          return form?.name === formNameFilter;
        });
      }
      
      const sorted = [...filtered].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setSubmissions(sorted);
    } catch (error) {
      console.error('載入資料失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilter = () => {
    setSearchParams({});
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('確定要刪除這筆預約嗎？此動作無法復原。')) {
      try {
        await submissionService.delete(id);
        await loadData();
      } catch (error) {
        alert('刪除失敗');
      }
    }
  };

  const handleConvertToRequest = (submission: FormSubmission) => {
    setAssigningSubmission(submission);
    setShowAssignModal(true);
  };

  const confirmAssignment = async () => {
    if (!assigningSubmission || !selectedVendorId) {
      alert('請選擇廠商');
      return;
    }
    
    try {
      // Mark as assigned (not processed yet)
      await submissionService.updateStatus(assigningSubmission.id, 'ASSIGNED');
      
      // Create a "Demand Order" (QUOTE_PENDING)
      const form = forms[assigningSubmission.formId];
      const customerName = assigningSubmission.data['name'] || assigningSubmission.data['姓名'] || '未知客戶';
      const customerPhone = assigningSubmission.data['phone'] || assigningSubmission.data['電話'] || '';
      const customerEmail = assigningSubmission.data['email'] || assigningSubmission.data['電子郵件'] || '';
      const customerAddress = assigningSubmission.data['address'] || assigningSubmission.data['地址'] || '';

      // Extract dates and times from submission data
      const extractedDates: string[] = [];
      let extractedTime = '';

      // 1. Try specific IDs from default forms
      if (assigningSubmission.data['preferredDate1']) extractedDates.push(assigningSubmission.data['preferredDate1']);
      if (assigningSubmission.data['preferredDate2']) extractedDates.push(assigningSubmission.data['preferredDate2']);
      if (assigningSubmission.data['preferredDate3']) extractedDates.push(assigningSubmission.data['preferredDate3']);
      if (assigningSubmission.data['preferredTimeSlot']) extractedTime = assigningSubmission.data['preferredTimeSlot'];

      // 2. Fallback: Search by field labels if not found by IDs
      if (extractedDates.length === 0 || !extractedTime) {
        form?.fields.forEach(field => {
          const val = assigningSubmission.data[field.id];
          if (!val) return;

          if (field.label.includes('日期') && !extractedDates.includes(val)) {
            if (Array.isArray(val)) {
              val.forEach(v => { if (typeof v === 'string') extractedDates.push(v); });
            } else if (typeof val === 'string') {
              extractedDates.push(val);
            }
          }
          if (field.label.includes('時段') || field.label.includes('時間')) {
            if (!extractedTime) extractedTime = String(val);
          }
        });
      }

      // Find linked product to get correct order ID format
      const allPages = pageService.getAll();
      const page = allPages.find(p => p.slug === assigningSubmission.pageSlug);
      const productId = page?.content?.subItem?.linkedProductId || page?.content?.subItem?.productId;
      
      const newOrderId = orderService.generateOrderId(productId || '');

      const newOrder: Order = {
        id: newOrderId,
        userId: assigningSubmission.userId || 'GUEST',
        items: [
          {
            id: 'item-1',
            pageId: assigningSubmission.pageSlug,
            name: `預約需求: ${form?.name || '未知表單'}`,
            price: 0,
            unit: '件',
            quantity: 1,
            expectedDates: extractedDates.join(', '),
            expectedTime: extractedTime,
            notes: JSON.stringify(assigningSubmission.data)
          }
        ],
        totalAmount: 0,
        status: 'QUOTE_PENDING',
        customerInfo: {
          name: customerName,
          phone: customerPhone,
          address: customerAddress,
          email: customerEmail
        },
        paymentMethod: 'PENDING',
        createdAt: new Date().toISOString(),
        vendorId: selectedVendorId,
        submissionId: assigningSubmission.id,
        statusUpdates: [
          {
            status: 'QUOTE_PENDING',
            timestamp: new Date().toISOString(),
            note: '管理員指派廠商，等待報價'
          }
        ]
      };

      orderService.create(newOrder);
      
      alert('已成功轉為需求單並指派！');
      
      setShowAssignModal(false);
      setAssigningSubmission(null);
      setSelectedVendorId('');
      await loadData();
    } catch (error) {
      alert('操作失敗');
    }
  };

  const handleConfirmPayment = async (submission: FormSubmission) => {
    if (!window.confirm('確定已收到款項並將此預約轉為正式訂單嗎？')) {
      return;
    }

    try {
      // 1. Update submission status to PROCESSED
      await submissionService.updateStatus(submission.id, 'PROCESSED');

      // 2. Find associated order and update its status to PENDING (waiting for vendor acceptance)
      const order = orderService.getBySubmissionId(submission.id);
      if (order) {
        orderService.update(order.id, {
          status: 'PENDING',
          paidAt: new Date().toISOString(),
          statusUpdates: [
            ...(order.statusUpdates || []),
            {
              status: 'PENDING',
              timestamp: new Date().toISOString(),
              note: '管理員已確認付款，訂單正式成立'
            }
          ]
        });
      }

      setSelectedSubmission(null);
      await loadData();
      alert('已確認付款，預約已轉為正式訂單！');
    } catch (error) {
      console.error('確認付款失敗:', error);
      alert('操作失敗，請稍後再試');
    }
  };

  const handleGeneratePaymentLink = (submission: FormSubmission) => {
    const order = orderService.getBySubmissionId(submission.id);
    if (order) {
      const link = `${window.location.origin}/payment/${order.id}`;
      setPaymentLink(link);
      setShowPaymentLinkModal(true);
    } else {
      alert('找不到關聯訂單，請先指派廠商。');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(paymentLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderSubmissionData = (submission: FormSubmission) => {
    const form = forms[submission.formId];
    if (!form) return <div className="text-stone-500 italic">對應表單已刪除</div>;

    return (
      <div className="space-y-4">
        {form.fields.filter(f => f.type !== 'hidden').map(field => {
          const value = submission.data[field.id];
          return (
            <div key={field.id} className="border-b border-stone-100 pb-3 last:border-0 last:pb-0">
              <div className="text-sm font-medium text-stone-500 mb-1">{field.label}</div>
              <div className="text-stone-900 font-medium">
                {Array.isArray(value) ? value.join(', ') : (value || '-')}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderQuoteInfo = (submission: FormSubmission) => {
    const order = orderService.getBySubmissionId(submission.id);
    if (!order || (order.status !== 'QUOTED' && order.status !== 'PROCESSED' && order.status !== 'PENDING' && order.status !== 'ACTIVE')) return null;

    const vendor = vendors.find(v => v.id === order.vendorId);

    return (
      <div className="mt-8 pt-8 border-t border-stone-200">
        <h3 className="text-lg font-bold text-stone-900 mb-4 flex items-center gap-2">
          <div className="w-1 h-5 bg-purple-500 rounded-full"></div>
          廠商報價資訊
        </h3>
        <div className="bg-purple-50 p-5 rounded-xl border border-purple-100 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-1">承接廠商</div>
              <div className="text-stone-900 font-bold">{vendor?.name || '未知廠商'}</div>
            </div>
            <div>
              <div className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-1">報價金額</div>
              <div className="text-purple-700 font-bold text-xl">NT$ {order.quotedAmount?.toLocaleString() || '未提供'}</div>
            </div>
          </div>
          
          {order.items && order.items.length > 0 && (
            <div>
              <div className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-2">報價明細</div>
              <div className="space-y-2">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm bg-white/50 p-2 rounded-lg">
                    <span className="text-stone-700">{item.name} x {item.quantity}</span>
                    <span className="font-bold text-stone-900">NT$ {(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {order.vendorNotes && (
            <div>
              <div className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-1">廠商備註</div>
              <div className="text-stone-700 text-sm whitespace-pre-wrap">{order.vendorNotes}</div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="p-8 text-center text-stone-500">載入預約中...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-stone-900 mb-2">預約管理</h1>
          <p className="text-stone-500 mt-1">
            {formNameFilter ? `正在查看「${formNameFilter}」的預約` : '匯總所有表單的預約申請，由新到舊排列'}
          </p>
        </div>
        {formNameFilter && (
          <button
            onClick={clearFilter}
            className="flex items-center gap-2 px-4 py-2 bg-stone-100 text-stone-600 rounded-lg hover:bg-stone-200 transition-colors font-medium"
          >
            <FilterX size={18} />
            清除過濾
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>
                <th className="px-6 py-4 text-sm font-medium text-stone-500">狀態</th>
                <th className="px-6 py-4 text-sm font-medium text-stone-500">提交日期</th>
                <th className="px-6 py-4 text-sm font-medium text-stone-500">表單名稱</th>
                <th className="px-6 py-4 text-sm font-medium text-stone-500">內容摘要</th>
                <th className="px-6 py-4 text-sm font-medium text-stone-500 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-stone-500">
                    目前沒有預約紀錄
                  </td>
                </tr>
              ) : (
                submissions.map(submission => {
                  const form = forms[submission.formId];
                  const firstField = form?.fields?.find(f => f.type !== 'hidden');
                  const summary = firstField ? submission.data[firstField.id] : '';
                  const status = submission.status || 'PENDING';
                  const order = orderService.getBySubmissionId(submission.id);
                  const quotedAmount = order?.quotedAmount;

                  const getStatusBadge = (status: string) => {
                    switch (status) {
                      case 'PROCESSED':
                        return (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                            <DollarSign size={12} />
                            已付款
                          </span>
                        );
                      case 'ACTIVE':
                        return (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            <CheckCircle2 size={12} />
                            已媒合
                          </span>
                        );
                      case 'ASSIGNED':
                        return (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            <UserPlus size={12} />
                            已指派
                          </span>
                        );
                      case 'QUOTED':
                        return (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                            <CheckCircle2 size={12} />
                            已報價
                          </span>
                        );
                      default:
                        return (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                            <Clock size={12} />
                            待處理
                          </span>
                        );
                    }
                  };

                  return (
                    <tr key={submission.id} className={`hover:bg-stone-50 transition-colors ${status === 'PENDING' ? 'bg-amber-50/30' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(status)}
                      </td>
                      <td className="px-6 py-4 text-sm text-stone-900 whitespace-nowrap">
                        {formatDate(submission.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-sm text-stone-900">
                        {form ? form.name : <span className="text-stone-400 italic">未知表單</span>}
                      </td>
                      <td className="px-6 py-4 text-sm text-stone-600 max-w-xs">
                        <div className="flex flex-col">
                          <span className="truncate">{Array.isArray(summary) ? summary.join(', ') : summary}</span>
                          {quotedAmount && (
                            <span className="text-xs font-bold text-purple-600 mt-1">
                              報價：NT$ {quotedAmount.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedSubmission(submission)}
                            className="p-2 text-stone-400 hover:text-stone-600 transition-colors"
                            title="查看詳情"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(submission.id)}
                            className="p-2 text-stone-400 hover:text-red-500 transition-colors"
                            title="刪除"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 詳情 Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="p-6 border-b border-stone-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-stone-900">預約詳情</h2>
              <button 
                onClick={() => setSelectedSubmission(null)}
                className="p-2 text-stone-400 hover:text-stone-600 rounded-full hover:bg-stone-100 transition-all"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 bg-stone-50 p-5 rounded-xl border border-stone-100">
                <div>
                  <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">提交時間</div>
                  <div className="text-stone-900">{formatDate(selectedSubmission.createdAt)}</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">來源頁面</div>
                  <div className="text-stone-900">{selectedSubmission.pageTitle}</div>
                </div>
                <div className="md:col-span-2">
                  <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">對應表單</div>
                  <div className="text-stone-900">{forms[selectedSubmission.formId]?.name || '未知表單'}</div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-stone-900 mb-4 flex items-center gap-2">
                  <div className="w-1 h-5 bg-primary rounded-full"></div>
                  填寫內容
                </h3>
                {renderSubmissionData(selectedSubmission)}
                {renderQuoteInfo(selectedSubmission)}
              </div>
            </div>
            
            <div className="p-6 border-t border-stone-100 flex justify-end gap-3">
              {selectedSubmission.status === 'QUOTED' && (
                <>
                  <button
                    onClick={() => handleGeneratePaymentLink(selectedSubmission)}
                    className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium shadow-sm flex items-center gap-2"
                  >
                    <LinkIcon size={18} />
                    生成付款連結
                  </button>
                  <button
                    onClick={() => handleConfirmPayment(selectedSubmission)}
                    className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium shadow-sm flex items-center gap-2"
                  >
                    <DollarSign size={18} />
                    手動確認付款
                  </button>
                </>
              )}
              {selectedSubmission.status !== 'PROCESSED' && selectedSubmission.status !== 'QUOTED' && selectedSubmission.status !== 'ASSIGNED' && (
                <button
                  onClick={() => {
                    handleConvertToRequest(selectedSubmission);
                    setSelectedSubmission(null);
                  }}
                  className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium shadow-sm flex items-center gap-2"
                >
                  <UserPlus size={18} />
                  轉為需求單並指派
                </button>
              )}
              <button
                onClick={() => setSelectedSubmission(null)}
                className="px-6 py-2.5 bg-stone-100 text-stone-600 rounded-lg hover:bg-stone-200 transition-colors font-medium"
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 付款連結 Modal */}
      {showPaymentLinkModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-stone-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-stone-900">專屬付款連結</h2>
              <button onClick={() => setShowPaymentLinkModal(false)} className="text-stone-400 hover:text-stone-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-stone-600 mb-4">
                請將下方連結傳送給客戶，客戶開啟後即可看到報價明細並進行訂金支付。
              </p>
              
              <div className="flex gap-2">
                <input 
                  type="text" 
                  readOnly 
                  value={paymentLink}
                  className="flex-1 px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm font-mono outline-none"
                />
                <button 
                  onClick={copyToClipboard}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${copied ? 'bg-emerald-600 text-white' : 'bg-stone-900 text-white hover:bg-stone-800'}`}
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                  {copied ? '已複製' : '複製'}
                </button>
              </div>
            </div>
            <div className="p-6 bg-stone-50 flex justify-end">
              <button
                onClick={() => setShowPaymentLinkModal(false)}
                className="px-6 py-2 bg-stone-200 text-stone-700 rounded-lg hover:bg-stone-300 font-bold"
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 付款連結 Modal */}
      {showPaymentLinkModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-stone-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-stone-900">專屬付款連結</h2>
              <button onClick={() => setShowPaymentLinkModal(false)} className="text-stone-400 hover:text-stone-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-stone-600 mb-4">
                請將下方連結傳送給客戶，客戶開啟後即可看到報價明細並進行訂金支付。
              </p>
              
              <div className="flex gap-2">
                <input 
                  type="text" 
                  readOnly 
                  value={paymentLink}
                  className="flex-1 px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm font-mono outline-none"
                />
                <button 
                  onClick={copyToClipboard}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${copied ? 'bg-emerald-600 text-white' : 'bg-stone-900 text-white hover:bg-stone-800'}`}
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                  {copied ? '已複製' : '複製'}
                </button>
              </div>
            </div>
            <div className="p-6 bg-stone-50 flex justify-end">
              <button
                onClick={() => setShowPaymentLinkModal(false)}
                className="px-6 py-2 bg-stone-200 text-stone-700 rounded-lg hover:bg-stone-300 font-bold"
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 指派 Modal (簡化版) */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-stone-100">
              <h2 className="text-xl font-bold text-stone-900">指派廠商</h2>
            </div>
            <div className="p-6">
              <p className="text-stone-600 mb-6">
                將此預約轉為正式需求單，並指派給合作廠商進行後續跟進。
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">選擇廠商</label>
                  <select 
                    value={selectedVendorId}
                    onChange={(e) => setSelectedVendorId(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  >
                    <option value="">尚未指派</option>
                    {vendors.map(v => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="p-6 bg-stone-50 flex justify-end gap-3">
              <button
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 text-stone-600 hover:text-stone-800 font-medium"
              >
                取消
              </button>
              <button
                onClick={confirmAssignment}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-bold shadow-sm"
              >
                確認指派
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
