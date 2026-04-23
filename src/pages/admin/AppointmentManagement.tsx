import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FormSubmission, Form } from '../../types/form';
import { Vendor } from '../../types/vendor';
import { submissionService } from '../../services/submissionService';
import { formService } from '../../services/formService';
import { pageService } from '../../services/pageService';
import { productService } from '../../services/productService';
import { orderService } from '../../services/orderService';
import { vendorService } from '../../services/vendorService';
import { Order, Product } from '../../types/admin';
import { Trash2, Eye, X, ArrowLeft, UserPlus, CheckCircle2, Clock, DollarSign, Link as LinkIcon, Copy, Check, FileText } from 'lucide-react';
import AdminSearchBar from '../../components/admin/search/AdminSearchBar';
import AdminSearchInput from '../../components/admin/search/AdminSearchInput';
import AdminFilterSelect from '../../components/admin/search/AdminFilterSelect';
import AdminTable from '../../components/admin/AdminTable';
import OrderStatusBadge from '../../components/admin/OrderStatusBadge';
import { OrderStatus } from '../../constants/orderStatus';
import { Pagination } from '../../components/ui/Pagination';

export default function AppointmentManagement() {
  const [searchParams, setSearchParams] = useSearchParams();
  const formNameFilter = searchParams.get('formName');
  
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [ordersMap, setOrdersMap] = useState<Record<string, Order>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [forms, setForms] = useState<Record<string, Form>>({});
  const [vendors, setVendors] = useState<Vendor[]>(() => vendorService.getAll());
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string[]>(['ALL']);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigningSubmission, setAssigningSubmission] = useState<FormSubmission | null>(null);
  const [selectedVendorId, setSelectedVendorId] = useState<string>('');
  const [showPaymentLinkModal, setShowPaymentLinkModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<FormSubmission | null>(null);
  const [itemToConfirmPayment, setItemToConfirmPayment] = useState<FormSubmission | null>(null);
  const [paymentLink, setPaymentLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadData();
    loadVendors();
    
    const handleStorage = () => {
      loadData();
      loadVendors();
    };
    
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [formNameFilter]);

  const loadVendors = () => {
    setVendors(vendorService.getAll());
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const allSubmissions = await submissionService.getAll();
      const allOrders = await orderService.getAll();
      const allForms = formService.getAll();
      const allProducts = await productService.getAll();
      setProducts(allProducts);
      
      const formMap: Record<string, Form> = {};
      allForms.forEach(form => {
        formMap[form.id] = form;
      });
      setForms(formMap);

      const orderMap: Record<string, Order> = {};
      allOrders.forEach(order => {
        if (order.submissionId) {
          orderMap[order.submissionId] = order;
        }
      });
      setOrdersMap(orderMap);

      // Filter by purpose 'BOOKING'
      let filtered = allSubmissions.filter(s => {
        const form = formMap[s.formId];
        if (form?.purpose !== 'BOOKING') return false;
        if (s.status === 'PROCESSED') return false;

        const order = orderMap[s.id];
        if (order) {
          return ['NEW_QUOTE', 'QUOTING', 'QUOTE_REVIEW', 'UNPAID'].includes(order.status);
        }
        
        return true;
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
    setSearchTerm('');
    setStatusFilter(['ALL']);
  };

  const handleDelete = (id: string) => {
    const item = submissions.find(s => s.id === id);
    if (item) {
      setItemToDelete(item);
      setShowDeleteConfirm(true);
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    
    try {
      await submissionService.delete(itemToDelete.id);
      setShowDeleteConfirm(false);
      setItemToDelete(null);
      await loadData();
    } catch (error) {
      console.error('刪除失敗:', error);
      alert('刪除失敗');
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
      
      // Create a "Demand Order" (QUOTING)
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
      if (assigningSubmission.data['preferredTimeSlot']) {
        const timeVal = assigningSubmission.data['preferredTimeSlot'];
        extractedTime = Array.isArray(timeVal) ? timeVal.join(', ') : String(timeVal);
      }

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
            if (!extractedTime) extractedTime = Array.isArray(val) ? val.join(', ') : String(val);
          }
        });
      }

      // Find linked product to get correct order ID format
      const allPages = pageService.getAll();
      let page = allPages.find(p => p.slug === assigningSubmission.pageSlug);
      if (!page && assigningSubmission.formId) {
        page = allPages.find(p => p.content?.formId === assigningSubmission.formId);
      }
      
      // Use new Booking ID format: BK-[FORM]-[YYMMDD]-[SEQ]
      const newOrderId = assigningSubmission.bookingId || await submissionService.generateBookingId(assigningSubmission.formId);

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
        status: 'QUOTING',
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
            status: 'QUOTING',
            timestamp: new Date().toISOString(),
            note: '管理員指派廠商，等待報價'
          }
        ]
      };

      await orderService.create(newOrder);
      
      alert('已成功轉為需求單並指派！');
      
      setShowAssignModal(false);
      setAssigningSubmission(null);
      setSelectedVendorId('');
      await loadData();
    } catch (error) {
      alert('操作失敗');
    }
  };

  const handleConfirmPayment = (submission: FormSubmission) => {
    setItemToConfirmPayment(submission);
    setShowPaymentConfirm(true);
  };

  const confirmPayment = async () => {
    if (!itemToConfirmPayment) return;

    try {
      // 1. Update submission status to PROCESSED
      await submissionService.updateStatus(itemToConfirmPayment.id, 'PROCESSED');

      // 2. Find associated order and update its status to PENDING (waiting for vendor acceptance)
      const order = ordersMap[itemToConfirmPayment.id];
      if (order) {
        // Generate formal Order ID upon payment confirmation
        const allPages = pageService.getAll();
        let page = allPages.find(p => p.slug === itemToConfirmPayment.pageSlug);
        if (!page && itemToConfirmPayment.formId) {
          page = allPages.find(p => p.content?.formId === itemToConfirmPayment.formId);
        }
        const productId = page?.content?.subItem?.linkedProductId || page?.content?.subItem?.productId;
        const formalOrderId = await orderService.generateOrderId(productId || '');

        await orderService.update(order.id, {
          id: formalOrderId,
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

      setShowPaymentConfirm(false);
      setItemToConfirmPayment(null);
      setSelectedSubmission(null);
      await loadData();
      alert('已確認付款，預約已轉為正式訂單！');
    } catch (error) {
      console.error('確認付款失敗:', error);
      alert('操作失敗，請稍後再試');
    }
  };

  const handleGeneratePaymentLink = (submission: FormSubmission) => {
    const order = ordersMap[submission.id];
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
          
          let displayValue;
          if (field.type === 'file') {
            const urls = Array.isArray(value) ? value : (value ? [value] : []);
            displayValue = urls.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 mt-2">
                {urls.map((url, idx) => (
                  <img 
                    key={idx} 
                    src={url} 
                    alt={`${field.label} ${idx + 1}`} 
                    className="w-full h-24 object-cover rounded-lg border border-stone-200"
                    referrerPolicy="no-referrer"
                  />
                ))}
              </div>
            ) : '-';
          } else {
            displayValue = Array.isArray(value) ? value.join(', ') : (value || '-');
          }

          return (
            <div key={field.id} className="border-b border-stone-100 pb-3 last:border-0 last:pb-0">
              <div className="text-sm font-medium text-stone-500 mb-1">{field.label}</div>
              <div className="text-stone-900 font-medium">
                {displayValue}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderQuoteInfo = (submission: FormSubmission) => {
    const order = ordersMap[submission.id];
    if (!order || (order.status !== 'QUOTE_REVIEW' && order.status !== 'PENDING' && order.status !== 'ACTIVE' && order.status !== 'UNPAID')) return null;

    const vendor = vendors.find(v => v.id === order.vendorId);
    
    // Find linked product to check deposit settings
    const allPages = pageService.getAll();
    let page = allPages.find(p => p.slug === submission.pageSlug);
    
    // Fallback: if page not found by slug, try to find a page that uses this form
    if (!page) {
      page = allPages.find(p => p.content?.formId === submission.formId);
    }

    const productId = page?.content?.subItem?.linkedProductId || page?.content?.subItem?.productId;
    let product = products.find(p => p.id === productId || p.id === submission.pageSlug);

    // Fallback: find product by formId if not found by ID or slug
    if (!product && submission.formId) {
      product = products.find(p => 
        p.internalFormConfig?.formId === submission.formId
      );
    }

    const quotedAmount = order.quotedAmount || 0;
    let depositAmount = 0;
    let balanceAmount = quotedAmount;
    let isDepositMode = false;

    if (product && quotedAmount > 0) {
      // Check current mode config first
      const currentConfig = product.orderMode === 'FIXED' ? product.fixedConfig : 
                           (product.orderMode === 'INTERNAL_FORM' ? product.internalFormConfig : product.externalLinkConfig);
      
      // Also check other configs as fallback in case of data inconsistency
      const hasDeposit = currentConfig?.enableDeposit || 
                        product.internalFormConfig?.enableDeposit || 
                        product.fixedConfig?.enableDeposit || 
                        product.externalLinkConfig?.enableDeposit;
      
      const ratio = currentConfig?.depositRatio || 
                   product.internalFormConfig?.depositRatio || 
                   product.fixedConfig?.depositRatio || 
                   product.externalLinkConfig?.depositRatio;

      if (hasDeposit && ratio) {
        isDepositMode = true;
        depositAmount = Math.round(quotedAmount * (ratio / 100));
        balanceAmount = quotedAmount - depositAmount;
      }
    }

    return (
      <div className="mt-8 pt-8 border-t border-stone-200">
        <h3 className="text-lg font-bold text-stone-900 mb-4 flex items-center gap-2">
          <div className="w-1 h-5 bg-purple-500 rounded-full"></div>
          廠商報價資訊
        </h3>
        <div className="bg-purple-50 p-5 rounded-xl border border-purple-100 space-y-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-1">承接廠商</div>
              <div className="text-stone-900 font-bold">{vendor?.name || '未知廠商'}</div>
            </div>
            <div>
              <div className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-1">報價金額</div>
              <div className="text-purple-700 font-bold text-xl">NT$ {quotedAmount.toLocaleString() || '未提供'}</div>
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

        <h3 className="text-lg font-bold text-stone-900 mb-4 flex items-center gap-2">
          <div className="w-1 h-5 bg-emerald-500 rounded-full"></div>
          客戶應付金額
        </h3>
        <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-100">
          {isDepositMode ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-stone-600 font-medium">訂金應付：</span>
                <span className="text-emerald-700 font-black text-xl">NT$ {depositAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-emerald-200/50">
                <span className="text-stone-600 font-medium">尾款應付：</span>
                <span className="text-stone-900 font-bold">NT$ {balanceAmount.toLocaleString()}</span>
              </div>
              <div className="text-[10px] text-emerald-600/70 mt-1 italic">
                * 根據產品設定之訂金比例計算
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <span className="text-stone-600 font-medium">應付總額 (全額)：</span>
              <span className="text-emerald-700 font-black text-xl">NT$ {quotedAmount.toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const handleFilterToggle = (value: string) => {
    if (value === 'ALL') {
      setStatusFilter(['ALL']);
      return;
    }

    setStatusFilter(prev => {
      const newFilters = prev.filter(f => f !== 'ALL');
      if (newFilters.includes(value)) {
        const removed = newFilters.filter(f => f !== value);
        return removed.length === 0 ? ['ALL'] : removed;
      } else {
        return [...newFilters, value];
      }
    });
  };

  const filteredSubmissions = submissions.filter(s => {
    const customerName = (s.data['name'] || s.data['姓名'] || '').toLowerCase();
    const customerPhone = (s.data['phone'] || s.data['電話'] || '').toLowerCase();
    const matchesSearch = customerName.includes(searchTerm.toLowerCase()) || 
                         customerPhone.includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    const order = ordersMap[s.id];
    const status = order ? order.status : 'NEW_QUOTE';

    if (statusFilter.includes('ALL')) {
      // ALL includes NEW_QUOTE, QUOTING, QUOTE_REVIEW, UNPAID
      return ['NEW_QUOTE', 'QUOTING', 'QUOTE_REVIEW', 'UNPAID'].includes(status);
    }

    return statusFilter.includes(status);
  });

  const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage);
  const paginatedSubmissions = filteredSubmissions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, formNameFilter]);

  const stats = useMemo(() => {
    return {
      newQuote: submissions.filter(s => {
        const order = ordersMap[s.id];
        // If no order exists, it's a new submission (NEW_QUOTE)
        return !order || order.status === 'NEW_QUOTE';
      }).length,
      quoteReview: submissions.filter(s => {
        const order = ordersMap[s.id];
        return order && order.status === 'QUOTE_REVIEW';
      }).length,
    };
  }, [submissions, ordersMap]);

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
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div 
          onClick={() => setStatusFilter(['NEW_QUOTE'])}
          className="p-6 rounded-2xl border border-yellow-200 bg-yellow-50 cursor-pointer transition-all hover:border-yellow-400 hover:shadow-md"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-bold mb-1 text-yellow-800">新預約</p>
              <h3 className="text-3xl font-bold text-yellow-600">{stats.newQuote}</h3>
            </div>
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <Clock size={24} />
            </div>
          </div>
        </div>

        <div 
          onClick={() => setStatusFilter(['QUOTE_REVIEW'])}
          className="p-6 rounded-2xl border border-yellow-200 bg-yellow-50 cursor-pointer transition-all hover:border-yellow-400 hover:shadow-md"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-bold mb-1 text-yellow-800">待核向客戶報價</p>
              <h3 className="text-3xl font-bold text-yellow-600">{stats.quoteReview}</h3>
            </div>
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <FileText size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Pill Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { label: '全部', value: 'ALL' },
          { label: '新預約', value: 'NEW_QUOTE' },
          { label: '待廠商報價', value: 'QUOTING' },
          { label: '待核向客戶報價', value: 'QUOTE_REVIEW' },
          { label: '待付款', value: 'UNPAID' },
        ].map((filter) => (
          <button
            key={filter.value}
            onClick={() => handleFilterToggle(filter.value)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
              statusFilter.includes(filter.value)
                ? 'bg-primary text-white shadow-md'
                : 'bg-white text-stone-500 border border-stone-200 hover:border-primary/50'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <AdminSearchBar>
        <AdminSearchInput
          placeholder="搜尋客戶姓名或電話..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <AdminFilterSelect
          value={formNameFilter || ''}
          onChange={(e) => {
            if (e.target.value === '') {
              setSearchParams({});
            } else {
              setSearchParams({ formName: e.target.value });
            }
          }}
          options={[
            { label: '所有表單', value: '' },
            ...Object.values(forms)
              .filter(f => f.purpose === 'BOOKING')
              .map(f => ({ label: f.name, value: f.name }))
          ]}
          className="min-w-[200px]"
        />
        <button
          onClick={clearFilter}
          className="px-4 py-2 text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors font-medium whitespace-nowrap"
        >
          清除過濾
        </button>
      </AdminSearchBar>

      <AdminTable.Container>
        <AdminTable.Main>
          <AdminTable.Head>
            <tr>
              <AdminTable.Th>預約單號</AdminTable.Th>
              <AdminTable.Th>提交日期</AdminTable.Th>
              <AdminTable.Th>表單名稱</AdminTable.Th>
              <AdminTable.Th>用戶名稱</AdminTable.Th>
              <AdminTable.Th>狀態</AdminTable.Th>
              <AdminTable.Th className="text-right">操作</AdminTable.Th>
            </tr>
          </AdminTable.Head>
          <AdminTable.Body>
            {paginatedSubmissions.length === 0 ? (
              <AdminTable.Empty colSpan={6}>
                {submissions.length === 0 ? '目前沒有預約紀錄' : '找不到符合條件的預約。'}
              </AdminTable.Empty>
            ) : (
              paginatedSubmissions.map(submission => {
                const form = forms[submission.formId];
                const order = ordersMap[submission.id];
                const displayStatus: OrderStatus = order ? order.status : 'NEW_QUOTE';
                const customerName = submission.data['name'] || submission.data['姓名'] || '-';

                return (
                  <AdminTable.Row key={submission.id}>
                    <AdminTable.Td className="whitespace-nowrap">
                      <button 
                        className="font-mono text-sm font-bold text-primary cursor-pointer hover:underline text-left" 
                        onClick={() => setSelectedSubmission(submission)}
                      >
                        {submission.bookingId || (order ? order.id : `預約-${submission.id.slice(-6)}`)}
                      </button>
                    </AdminTable.Td>
                    <AdminTable.Td className="text-sm text-stone-900 whitespace-nowrap">
                      {formatDate(submission.createdAt)}
                    </AdminTable.Td>
                    <AdminTable.Td className="text-sm text-stone-900">
                      {form ? form.name : <span className="text-stone-400 italic">未知表單</span>}
                    </AdminTable.Td>
                    <AdminTable.Td className="text-sm text-stone-900 font-medium">
                      {customerName}
                    </AdminTable.Td>
                    <AdminTable.Td>
                      <OrderStatusBadge status={displayStatus} role="admin" />
                    </AdminTable.Td>
                    <AdminTable.Td className="text-right">
                      <AdminTable.Actions>
                        <AdminTable.Delete onClick={() => handleDelete(submission.id)} />
                      </AdminTable.Actions>
                    </AdminTable.Td>
                  </AdminTable.Row>
                );
              })
            )}
          </AdminTable.Body>
        </AdminTable.Main>
      </AdminTable.Container>

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={setCurrentPage} 
          />
        </div>
      )}

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

      {/* 刪除確認 Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[80] p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-stone-100 flex items-center gap-3 text-red-600">
              <Trash2 size={24} />
              <h2 className="text-xl font-bold">確認刪除預約</h2>
            </div>
            <div className="p-6">
              <p className="text-stone-600 mb-2">
                您確定要刪除這筆預約紀錄嗎？
              </p>
              <p className="text-sm text-stone-400">
                此動作無法復原，相關的預約資訊將會永久移除。
              </p>
              {itemToDelete && (
                <div className="mt-4 p-3 bg-stone-50 rounded-lg border border-stone-100">
                  <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">預約客戶</p>
                  <p className="text-stone-800 font-bold">
                    {itemToDelete.data['name'] || itemToDelete.data['姓名'] || '未知客戶'}
                  </p>
                </div>
              )}
            </div>
            <div className="p-6 bg-stone-50 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setItemToDelete(null);
                }}
                className="px-4 py-2 text-stone-600 hover:text-stone-800 font-medium"
              >
                取消
              </button>
              <button
                onClick={confirmDelete}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-bold shadow-sm"
              >
                確認刪除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 付款確認 Modal */}
      {showPaymentConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[80] p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-stone-100 flex items-center gap-3 text-emerald-600">
              <DollarSign size={24} />
              <h2 className="text-xl font-bold">確認收到款項</h2>
            </div>
            <div className="p-6">
              <p className="text-stone-600 mb-2">
                確定已收到款項並將此預約轉為正式訂單嗎？
              </p>
              <p className="text-sm text-stone-400">
                此動作將會正式成立訂單，並通知服務人員。
              </p>
              {itemToConfirmPayment && (
                <div className="mt-4 p-3 bg-stone-50 rounded-lg border border-stone-100">
                  <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">預約客戶</p>
                  <p className="text-stone-800 font-bold">
                    {itemToConfirmPayment.data['name'] || itemToConfirmPayment.data['姓名'] || '未知客戶'}
                  </p>
                </div>
              )}
            </div>
            <div className="p-6 bg-stone-50 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowPaymentConfirm(false);
                  setItemToConfirmPayment(null);
                }}
                className="px-4 py-2 text-stone-600 hover:text-stone-800 font-medium"
              >
                取消
              </button>
              <button
                onClick={confirmPayment}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-bold shadow-sm"
              >
                確認付款
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
