import React, { useState, useEffect } from 'react';
import { DollarSign, Eye, CheckCircle, Printer, FileText, RefreshCw } from 'lucide-react';
import { Statement, Order } from '../../types/admin';
import { vendorService } from '../../services/vendorService';
import { Vendor } from '../../types/vendor';
import { statementService } from '../../services/statementService';
import { orderService } from '../../services/orderService';
import AdminTable from '../../components/admin/AdminTable';
import ConfirmModal from '../../components/ConfirmModal';
import OrderStatusBadge from '../../components/admin/OrderStatusBadge';
import RefundRequestModal from '../../components/admin/RefundRequestModal';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function FinanceManagement() {
  const [mainTab, setMainTab] = useState<'payouts' | 'refunds'>('payouts');
  const [statements, setStatements] = useState<Statement[]>([]);
  const [refundOrders, setRefundOrders] = useState<Order[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>(() => vendorService.getAll());
  const [selectedStatement, setSelectedStatement] = useState<Statement | null>(null);
  const [selectedRefundOrder, setSelectedRefundOrder] = useState<Order | null>(null);
  const [statementOrders, setStatementOrders] = useState<Order[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'invoice'>('details');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    statementId: string;
    actionType: 'APPROVE' | 'CONFIRM_PAYOUT' | 'CONFIRM_REFUND';
  }>({ isOpen: false, statementId: '', actionType: 'APPROVE' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setStatements(statementService.getAll().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    const storedVendors = vendorService.getAll();
    setVendors(storedVendors);
    
    const allOrders = await orderService.getAll();
    const refunds = allOrders.filter(o => o.status === 'REFUND_PENDING' || o.status === 'REFUNDED');
    setRefundOrders(refunds.sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()));
  };

  const getVendorName = (vendorId: string) => {
    const vendor = vendors.find(v => v.id === vendorId);
    return vendor ? vendor.name : vendorId;
  };

  const handleViewDetails = async (statement: Statement) => {
    const allOrders = await orderService.getAll();
    const orders = allOrders.filter(o => o.statementId === statement.id);
    setStatementOrders(orders);
    setSelectedStatement(statement);
    setActiveTab('details');
    setIsModalOpen(true);
  };

  const handleApprovePayout = (statementId: string) => {
    setConfirmModal({ isOpen: true, statementId, actionType: 'APPROVE' });
  };

  const handleConfirmPayoutComplete = (statementId: string) => {
    setConfirmModal({ isOpen: true, statementId, actionType: 'CONFIRM_PAYOUT' });
  };

  const handleConfirmRefundComplete = (orderId: string) => {
    setConfirmModal({ isOpen: true, statementId: orderId, actionType: 'CONFIRM_REFUND' });
  };

  const executeConfirmRefundComplete = async () => {
    const { statementId: orderId } = confirmModal;
    const order = refundOrders.find(o => o.id === orderId);
    if (!order) return;

    const newUpdate = {
      status: 'REFUNDED' as const,
      timestamp: new Date().toISOString(),
      note: '會計已完成退款匯出'
    };

    await orderService.update(order.id, {
      status: 'REFUNDED',
      statusUpdates: [...(order.statusUpdates || []), newUpdate]
    });

    loadData();
  };

  const executeApprovePayout = async () => {
    const { statementId } = confirmModal;
    // Update statement status
    statementService.update(statementId, { status: 'PAYOUT_PROCESSING', paidAt: new Date().toISOString() });
    
    // Update associated orders status
    const allOrders = await orderService.getAll();
    const ordersToUpdate = allOrders.filter(o => o.statementId === statementId);
    
    for (const order of ordersToUpdate) {
      const newUpdate = {
        status: 'PAYOUT_PROCESSING' as const,
        timestamp: new Date().toISOString(),
        note: '系統自動更新：行政已核准撥款，進入撥款處理中'
      };
      await orderService.update(order.id, {
        status: 'PAYOUT_PROCESSING',
        statusUpdates: [...(order.statusUpdates || []), newUpdate]
      });
    }

    loadData();
    if (isModalOpen && selectedStatement?.id === statementId) {
      setIsModalOpen(false);
    }
  };

  const executeConfirmPayoutComplete = async () => {
    const { statementId } = confirmModal;
    // Update statement status
    statementService.update(statementId, { status: 'PAID', paidAt: new Date().toISOString() });
    
    // Update associated orders status
    const allOrders = await orderService.getAll();
    const ordersToUpdate = allOrders.filter(o => o.statementId === statementId);
    
    for (const order of ordersToUpdate) {
      const newUpdate = {
        status: 'PAID' as const,
        timestamp: new Date().toISOString(),
        note: '系統自動更新：會計已完成匯款'
      };
      await orderService.update(order.id, {
        status: 'PAID',
        statusUpdates: [...(order.statusUpdates || []), newUpdate]
      });
    }

    loadData();
    if (isModalOpen && selectedStatement?.id === statementId) {
      setIsModalOpen(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!selectedStatement) return;
    const vendor = vendors.find(v => v.id === selectedStatement.vendorId);
    if (!vendor) return;

    const element = document.getElementById('pdf-template');
    if (!element) return;

    setIsGeneratingPDF(true);
    try {
      // html2canvas doesn't support oklch colors (used by Tailwind v4), so we need to
      // temporarily override or ignore elements that might cause issues if they aren't strictly needed for the PDF.
      // Since our PDF template uses inline styles with basic colors, it should be fine, but we'll add a catch.
      const canvas = await html2canvas(element, { 
        scale: 2, 
        useCORS: true, 
        logging: false,
        onclone: (clonedDoc) => {
          // html2canvas crashes when it encounters Tailwind v4's oklch() colors anywhere in the document.
          // We must strip ALL class attributes from the cloned document to prevent it from trying to parse them.
          // Since our PDF template relies entirely on inline styles, this is safe.
          const allElements = clonedDoc.getElementsByTagName('*');
          for (let i = 0; i < allElements.length; i++) {
            allElements[i].removeAttribute('class');
          }
          
          // Also remove all style and link tags to prevent html2canvas from parsing the global stylesheets
          const styles = clonedDoc.querySelectorAll('style, link[rel="stylesheet"]');
          styles.forEach(style => style.remove());
        }
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`請款單_${vendor.name}_${selectedStatement.month}.pdf`);
    } catch (error) {
      console.error('Failed to generate PDF', error);
      alert('產生 PDF 失敗，請稍後再試');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-stone-900">財務結算管理</h1>
        <button 
          onClick={loadData}
          className="p-2 text-stone-400 hover:text-primary transition-colors"
          title="重新整理"
        >
          <RefreshCw size={20} />
        </button>
      </div>

      <div className="flex border-b border-stone-200">
        <button
          onClick={() => setMainTab('payouts')}
          className={`px-6 py-3 font-bold text-sm transition-colors border-b-2 ${
            mainTab === 'payouts' ? 'border-primary text-primary' : 'border-transparent text-stone-500 hover:text-stone-700'
          }`}
        >
          廠商結算
        </button>
        <button
          onClick={() => setMainTab('refunds')}
          className={`px-6 py-3 font-bold text-sm transition-colors border-b-2 ${
            mainTab === 'refunds' ? 'border-primary text-primary' : 'border-transparent text-stone-500 hover:text-stone-700'
          }`}
        >
          退款管理
        </button>
      </div>

      {mainTab === 'payouts' ? (
        <AdminTable.Container>
          <AdminTable.Main>
            <AdminTable.Head>
              <tr>
                <AdminTable.Th>廠商名稱</AdminTable.Th>
                <AdminTable.Th>月份</AdminTable.Th>
                <AdminTable.Th>訂單總筆數</AdminTable.Th>
                <AdminTable.Th>總營業額</AdminTable.Th>
                <AdminTable.Th>應撥款總額</AdminTable.Th>
                <AdminTable.Th>申請狀態</AdminTable.Th>
                <AdminTable.Th className="text-right">操作</AdminTable.Th>
              </tr>
            </AdminTable.Head>
            <AdminTable.Body>
              {statements.map((statement) => (
                <AdminTable.Row key={statement.id}>
                  <AdminTable.Td>
                    <div className="font-bold text-stone-900">{getVendorName(statement.vendorId)}</div>
                    <div className="text-xs text-stone-500 font-mono">{statement.id}</div>
                  </AdminTable.Td>
                  <AdminTable.Td className="font-medium text-stone-900">{statement.month}</AdminTable.Td>
                  <AdminTable.Td className="text-stone-600">{statement.totalOrders} 筆</AdminTable.Td>
                  <AdminTable.Td className="font-mono text-stone-900">NT$ {statement.totalAmount.toLocaleString()}</AdminTable.Td>
                  <AdminTable.Td className="font-mono font-bold text-primary">NT$ {statement.payoutAmount.toLocaleString()}</AdminTable.Td>
                  <AdminTable.Td>
                    {statement.status === 'SUBMITTED' ? (
                      <span className="px-2.5 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold flex items-center gap-1 w-fit">
                        廠商已申請
                      </span>
                    ) : statement.status === 'PAYOUT_PROCESSING' ? (
                      <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold flex items-center gap-1 w-fit">
                        撥款處理中
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold flex items-center gap-1 w-fit">
                        <CheckCircle size={14} />
                        已撥款結案
                      </span>
                    )}
                  </AdminTable.Td>
                  <AdminTable.Td className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleViewDetails(statement)}
                        className="p-2 text-stone-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                        title="檢視明細"
                      >
                        <Eye size={18} />
                      </button>
                    </div>
                  </AdminTable.Td>
                </AdminTable.Row>
              ))}
              {statements.length === 0 && (
                <AdminTable.Empty colSpan={7}>
                  目前沒有任何財務結算申請
                </AdminTable.Empty>
              )}
            </AdminTable.Body>
          </AdminTable.Main>
        </AdminTable.Container>
      ) : (
        <AdminTable.Container>
          <AdminTable.Main>
            <AdminTable.Head>
              <tr>
                <AdminTable.Th>申請日期</AdminTable.Th>
                <AdminTable.Th>訂單編號</AdminTable.Th>
                <AdminTable.Th>客戶姓名</AdminTable.Th>
                <AdminTable.Th>應退總額</AdminTable.Th>
                <AdminTable.Th>狀態</AdminTable.Th>
                <AdminTable.Th className="text-right">操作</AdminTable.Th>
              </tr>
            </AdminTable.Head>
            <AdminTable.Body>
              {refundOrders.map((order) => {
                const refundUpdate = order.statusUpdates?.find(u => u.status === 'REFUND_PENDING');
                const requestDate = refundUpdate ? new Date(refundUpdate.timestamp).toLocaleDateString() : new Date(order.updatedAt || order.createdAt).toLocaleDateString();
                return (
                  <AdminTable.Row key={order.id}>
                    <AdminTable.Td className="text-sm text-stone-900">{requestDate}</AdminTable.Td>
                    <AdminTable.Td className="font-mono text-sm font-bold text-stone-900">{order.id}</AdminTable.Td>
                    <AdminTable.Td className="text-sm text-stone-900">{order.customerInfo.name}</AdminTable.Td>
                    <AdminTable.Td className="font-mono font-bold text-red-600">NT$ {order.totalAmount.toLocaleString()}</AdminTable.Td>
                    <AdminTable.Td>
                      <OrderStatusBadge status={order.status} role="admin" />
                    </AdminTable.Td>
                    <AdminTable.Td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedRefundOrder(order)}
                          className="px-3 py-1.5 bg-stone-100 text-stone-700 text-sm font-bold rounded-lg hover:bg-stone-200 transition-colors"
                        >
                          產生退款申請單
                        </button>
                        {order.status === 'REFUND_PENDING' && (
                          <button
                            onClick={() => handleConfirmRefundComplete(order.id)}
                            className="px-3 py-1.5 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-700 transition-colors"
                          >
                            確認退款匯出
                          </button>
                        )}
                      </div>
                    </AdminTable.Td>
                  </AdminTable.Row>
                );
              })}
              {refundOrders.length === 0 && (
                <AdminTable.Empty colSpan={6}>
                  目前沒有退款申請
                </AdminTable.Empty>
              )}
            </AdminTable.Body>
          </AdminTable.Main>
        </AdminTable.Container>
      )}

      {/* Details Modal */}
      {isModalOpen && selectedStatement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-stone-100">
              <div className="flex items-center gap-6">
                <div>
                  <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                    <DollarSign className="text-primary" />
                    財務結算預覽
                  </h2>
                  <p className="text-sm text-stone-500 mt-1 font-mono">{selectedStatement.id}</p>
                </div>
                <div className="flex bg-stone-100 p-1 rounded-lg">
                  <button
                    onClick={() => setActiveTab('details')}
                    className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${
                      activeTab === 'details' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'
                    }`}
                  >
                    對帳單明細
                  </button>
                  <button
                    onClick={() => setActiveTab('invoice')}
                    className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${
                      activeTab === 'invoice' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'
                    }`}
                  >
                    請款申請單
                  </button>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-stone-100 rounded-full transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className={`overflow-y-auto flex-1 ${activeTab === 'invoice' ? 'bg-stone-200 p-0' : 'p-6'}`}>
              {activeTab === 'details' ? (
                <>
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                      <p className="text-xs font-bold text-stone-500 mb-1">廠商名稱</p>
                      <p className="font-bold text-stone-900">{getVendorName(selectedStatement.vendorId)}</p>
                    </div>
                    <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                      <p className="text-xs font-bold text-stone-500 mb-1">申請日期</p>
                      <p className="font-bold text-stone-900">{new Date(selectedStatement.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                      <p className="text-xs font-bold text-stone-500 mb-1">總營業額</p>
                      <p className="font-bold text-stone-900">NT$ {selectedStatement.totalAmount.toLocaleString()}</p>
                    </div>
                    <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                      <p className="text-xs font-bold text-stone-500 mb-1">應撥款總額</p>
                      <p className="font-bold text-primary">NT$ {selectedStatement.payoutAmount.toLocaleString()}</p>
                    </div>
                  </div>

                  <h3 className="font-bold text-stone-900 mb-4">包含訂單 ({statementOrders.length} 筆)</h3>
                  <AdminTable.Container>
                    <AdminTable.Main>
                      <AdminTable.Head>
                        <tr>
                          <AdminTable.Th>訂單編號</AdminTable.Th>
                          <AdminTable.Th>客戶姓名</AdminTable.Th>
                          <AdminTable.Th>完成時間</AdminTable.Th>
                          <AdminTable.Th>訂單金額</AdminTable.Th>
                          <AdminTable.Th>狀態</AdminTable.Th>
                        </tr>
                      </AdminTable.Head>
                      <AdminTable.Body>
                        {statementOrders.map(order => {
                          const completedUpdate = order.statusUpdates?.find(u => u.status === 'COMPLETED');
                          return (
                            <AdminTable.Row key={order.id}>
                              <AdminTable.Td className="font-mono text-sm font-bold text-stone-900">{order.id}</AdminTable.Td>
                              <AdminTable.Td className="text-sm text-stone-900">{order.customerInfo.name}</AdminTable.Td>
                              <AdminTable.Td className="text-sm text-stone-500">
                                {completedUpdate ? new Date(completedUpdate.timestamp).toLocaleString() : '-'}
                              </AdminTable.Td>
                              <AdminTable.Td className="text-sm font-mono text-stone-900">NT$ {order.totalAmount.toLocaleString()}</AdminTable.Td>
                              <AdminTable.Td>
                                <OrderStatusBadge status={order.status} role="admin" />
                              </AdminTable.Td>
                            </AdminTable.Row>
                          );
                        })}
                      </AdminTable.Body>
                    </AdminTable.Main>
                  </AdminTable.Container>
                </>
              ) : (
                <div className="flex flex-col items-center py-8 px-4 min-h-full">
                  <div className="w-full max-w-[794px] flex justify-end mb-6">
                    <button
                      onClick={handleDownloadPDF}
                      disabled={isGeneratingPDF}
                      className="flex items-center gap-2 px-6 py-2.5 bg-stone-900 text-white font-bold rounded-xl hover:bg-stone-800 transition-colors shadow-lg shadow-stone-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Printer size={20} />
                      {isGeneratingPDF ? '產生中...' : '🖨️ 列印 / 另存 PDF'}
                    </button>
                  </div>
                  
                  {/* Visible PDF Template Preview */}
                  <div className="bg-white shadow-2xl" style={{ width: '794px', minHeight: '1123px' }}>
                    <div id="pdf-template" style={{ width: '794px', minHeight: '1123px', padding: '80px 60px', backgroundColor: 'white', color: 'black', fontFamily: 'sans-serif' }}>
                      <h1 style={{ textAlign: 'center', fontSize: '28px', fontWeight: 'bold', marginBottom: '10px', letterSpacing: '4px' }}>好齡居</h1>
                      <h2 style={{ textAlign: 'center', fontSize: '22px', fontWeight: 'bold', borderBottom: '2px solid black', paddingBottom: '15px', marginBottom: '30px', letterSpacing: '2px' }}>一般請款 申請單</h2>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', fontSize: '15px' }}>
                        <div style={{ lineHeight: '1.8' }}>
                          <p>申請單號：{selectedStatement.id}</p>
                          <p>申請人：好齡居管理員</p>
                        </div>
                        <div style={{ lineHeight: '1.8' }}>
                          <p>申請日期：{new Date().toLocaleDateString()}</p>
                        </div>
                      </div>

                      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px', fontSize: '15px' }}>
                        <thead>
                          <tr>
                            <th style={{ border: '1px solid black', padding: '12px', textAlign: 'left', backgroundColor: '#f8f9fa' }}>摘要</th>
                            <th style={{ border: '1px solid black', padding: '12px', textAlign: 'left', backgroundColor: '#f8f9fa' }}>支付對象</th>
                            <th style={{ border: '1px solid black', padding: '12px', textAlign: 'right', backgroundColor: '#f8f9fa' }}>金額</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td style={{ border: '1px solid black', padding: '12px', verticalAlign: 'top' }}>{selectedStatement.month} 服務費用</td>
                            <td style={{ border: '1px solid black', padding: '12px', verticalAlign: 'top', lineHeight: '1.6' }}>
                              {(() => {
                                const vendor = vendors.find(v => v.id === selectedStatement.vendorId);
                                if (!vendor) return '廠商資訊遺失';
                                return (
                                  <>
                                    <p style={{ fontWeight: 'bold', marginBottom: '4px' }}>{vendor.name}</p>
                                    {vendor.bankInfo?.bankCode && vendor.bankInfo?.bank && <p>{vendor.bankInfo.bankCode} {vendor.bankInfo.bank}</p>}
                                    {vendor.bankInfo?.bankName && <p>分行：{vendor.bankInfo.bankName}</p>}
                                    {vendor.bankInfo?.accountNumber && <p>帳號：{vendor.bankInfo.accountNumber}</p>}
                                    {vendor.bankInfo?.accountName && <p>戶名：{vendor.bankInfo.accountName}</p>}
                                  </>
                                );
                              })()}
                            </td>
                            <td style={{ border: '1px solid black', padding: '12px', textAlign: 'right', verticalAlign: 'top' }}>
                              NT$ {selectedStatement.payoutAmount.toLocaleString()}
                            </td>
                          </tr>
                          <tr>
                            <td colSpan={2} style={{ border: '1px solid black', padding: '12px', textAlign: 'right' }}>含稅總額</td>
                            <td style={{ border: '1px solid black', padding: '12px', textAlign: 'right' }}>NT$ {selectedStatement.payoutAmount.toLocaleString()}</td>
                          </tr>
                          <tr>
                            <td colSpan={2} style={{ border: '1px solid black', padding: '12px', textAlign: 'right' }}>稅額 (5%)</td>
                            <td style={{ border: '1px solid black', padding: '12px', textAlign: 'right' }}>NT$ {Math.round(selectedStatement.payoutAmount * 0.05).toLocaleString()}</td>
                          </tr>
                          <tr>
                            <td colSpan={2} style={{ border: '1px solid black', padding: '12px', textAlign: 'right' }}>未稅金額</td>
                            <td style={{ border: '1px solid black', padding: '12px', textAlign: 'right' }}>NT$ {Math.round(selectedStatement.payoutAmount * 0.95).toLocaleString()}</td>
                          </tr>
                          <tr>
                            <td colSpan={2} style={{ border: '1px solid black', padding: '12px', textAlign: 'right', fontWeight: 'bold', fontSize: '16px' }}>總計</td>
                            <td style={{ border: '1px solid black', padding: '12px', textAlign: 'right', fontWeight: 'bold', fontSize: '16px' }}>NT$ {selectedStatement.payoutAmount.toLocaleString()}</td>
                          </tr>
                        </tbody>
                      </table>
                      
                      <div style={{ marginTop: '60px', display: 'flex', justifyContent: 'flex-end' }}>
                        <div style={{ width: '200px', borderTop: '1px solid black', paddingTop: '10px', textAlign: 'center' }}>
                          主管簽核
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-stone-100 bg-stone-50 flex justify-end gap-3 rounded-b-2xl">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 text-stone-600 font-medium hover:bg-stone-200 rounded-xl transition-colors"
              >
                關閉
              </button>
              {selectedStatement.status === 'SUBMITTED' && (
                <button
                  onClick={() => handleApprovePayout(selectedStatement.id)}
                  className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors"
                >
                  核准撥款
                </button>
              )}
              {selectedStatement.status === 'PAYOUT_PROCESSING' && (
                <button
                  onClick={() => handleConfirmPayoutComplete(selectedStatement.id)}
                  className="px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors"
                >
                  確認匯款完成
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={
          confirmModal.actionType === 'APPROVE' ? executeApprovePayout : 
          confirmModal.actionType === 'CONFIRM_REFUND' ? executeConfirmRefundComplete : 
          executeConfirmPayoutComplete
        }
        title={
          confirmModal.actionType === 'APPROVE' ? "核准撥款確認" : 
          confirmModal.actionType === 'CONFIRM_REFUND' ? "確認退款匯出" : 
          "確認匯款完成"
        }
        message={
          confirmModal.actionType === 'APPROVE' ? "確定要核准撥款嗎？此操作將會把對帳單及相關訂單狀態改為「撥款處理中」。" : 
          confirmModal.actionType === 'CONFIRM_REFUND' ? "確定已完成退款匯出嗎？此操作將會把訂單狀態改為「已退款」。" : 
          "確定要確認匯款完成嗎？此操作將會把對帳單及相關訂單狀態改為「已撥款結案」。"
        }
        confirmText={
          confirmModal.actionType === 'APPROVE' ? "核准撥款" : 
          confirmModal.actionType === 'CONFIRM_REFUND' ? "確認退款匯出" : 
          "確認匯款完成"
        }
        variant="success"
      />

      {selectedRefundOrder && (
        <RefundRequestModal
          order={selectedRefundOrder}
          onClose={() => setSelectedRefundOrder(null)}
          onSave={loadData}
        />
      )}
    </div>
  );
}
