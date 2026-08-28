import React, { useState } from 'react';
import { Printer } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Order } from '../../types/admin';
import { orderService } from '../../services/orderService';
import { Modal, ModalContent, ModalHeader, ModalTitle } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';

interface RefundRequestModalProps {
  order: Order;
  onClose: () => void;
  onSave?: () => void;
}

export default function RefundRequestModal({ order, onClose, onSave }: RefundRequestModalProps) {
  const [payee, setPayee] = useState(order.refundInfo?.payee || order.customerInfo.name);
  const [bankInfo, setBankInfo] = useState({
    bankCode: order.refundInfo?.bankCode || '',
    bankName: order.refundInfo?.bankName || '',
    bankBranch: order.refundInfo?.bankBranch || '',
    accountNumber: order.refundInfo?.accountNumber || '',
    accountName: order.refundInfo?.accountName || ''
  });
  const [isPreview, setIsPreview] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handlePreview = async () => {
    setIsSaving(true);
    try {
      await orderService.update(order.id, {
        refundInfo: {
          payee,
          ...bankInfo
        }
      });
      if (onSave) onSave();
      setIsPreview(true);
    } catch (error) {
      console.error('Failed to save refund info', error);
      alert('儲存退款資訊失敗');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('refund-pdf-template');
    if (!element) return;

    setIsGeneratingPDF(true);
    try {
      const canvas = await html2canvas(element, { 
        scale: 2, 
        useCORS: true, 
        logging: false,
        onclone: (clonedDoc) => {
          const allElements = clonedDoc.getElementsByTagName('*');
          for (let i = 0; i < allElements.length; i++) {
            allElements[i].removeAttribute('class');
          }
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
      pdf.save(`Refund_${order.id}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Failed to generate PDF', error);
      alert('產生 PDF 失敗，請稍後再試');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} className="max-w-2xl">
      <ModalHeader onClose={onClose}>
        <ModalTitle>退款申請單</ModalTitle>
      </ModalHeader>

      <ModalContent>
        {!isPreview ? (
          <div className="space-y-4">
            <div>
              <Label className="mb-1">支付對象</Label>
              <Input type="text" value={payee} onChange={e => setPayee(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-1">銀行代碼</Label>
                <Input type="text" value={bankInfo.bankCode} onChange={e => setBankInfo({...bankInfo, bankCode: e.target.value})} />
              </div>
              <div>
                <Label className="mb-1">銀行名稱</Label>
                <Input type="text" value={bankInfo.bankName} onChange={e => setBankInfo({...bankInfo, bankName: e.target.value})} />
              </div>
              <div>
                <Label className="mb-1">分行名稱</Label>
                <Input type="text" value={bankInfo.bankBranch} onChange={e => setBankInfo({...bankInfo, bankBranch: e.target.value})} />
              </div>
              <div>
                <Label className="mb-1">帳號</Label>
                <Input type="text" value={bankInfo.accountNumber} onChange={e => setBankInfo({...bankInfo, accountNumber: e.target.value})} />
              </div>
              <div className="col-span-2">
                <Label className="mb-1">戶名</Label>
                <Input type="text" value={bankInfo.accountName} onChange={e => setBankInfo({...bankInfo, accountName: e.target.value})} />
              </div>
            </div>
            <Button onClick={handlePreview} disabled={isSaving} className="w-full mt-4">
              {isSaving ? '儲存中...' : '確認並預覽'}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center bg-stone-200 p-6 -mx-6 -mb-6 rounded-b-[2rem]">
            <div className="w-full max-w-[794px] flex justify-end mb-6">
              <Button onClick={handleDownloadPDF} disabled={isGeneratingPDF} className="flex items-center gap-2 shadow-lg">
                <Printer size={20} /> {isGeneratingPDF ? '產生中...' : '🖨️ 列印 / 另存 PDF'}
              </Button>
            </div>
            <div id="refund-pdf-template" style={{ width: '794px', minHeight: '1123px', padding: '80px 60px', backgroundColor: 'white', color: 'black', fontFamily: 'sans-serif', transform: 'scale(0.7)', transformOrigin: 'top center' }}>
              <h1 style={{ textAlign: 'center', fontSize: '28px', fontWeight: 'bold', marginBottom: '10px' }}>好齡居</h1>
              <h2 style={{ textAlign: 'center', fontSize: '22px', fontWeight: 'bold', borderBottom: '2px solid black', paddingBottom: '15px', marginBottom: '30px' }}>退款 申請單</h2>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', fontSize: '15px' }}>
                <div>
                  <p>申請單號：{order.id}</p>
                  <p>申請人：好齡居管理員</p>
                </div>
                <div>
                  <p>申請日期：{new Date().toLocaleDateString()}</p>
                </div>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px', fontSize: '15px' }}>
                <thead>
                  <tr>
                    <th style={{ border: '1px solid black', padding: '12px', textAlign: 'left', backgroundColor: '#f8f9fa' }}>摘要</th>
                    <th style={{ border: '1px solid black', padding: '12px', textAlign: 'left', backgroundColor: '#f8f9fa' }}>支付對象與銀行</th>
                    <th style={{ border: '1px solid black', padding: '12px', textAlign: 'right', backgroundColor: '#f8f9fa' }}>金額</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ border: '1px solid black', padding: '12px' }}>{new Date().toISOString().slice(0, 7)} 退款費用</td>
                    <td style={{ border: '1px solid black', padding: '12px', lineHeight: '1.6' }}>
                      <p style={{ fontWeight: 'bold' }}>{payee}</p>
                      <p>{bankInfo.bankCode} {bankInfo.bankName}</p>
                      <p>分行：{bankInfo.bankBranch}</p>
                      <p>帳號：{bankInfo.accountNumber}</p>
                      <p>戶名：{bankInfo.accountName}</p>
                    </td>
                    <td style={{ border: '1px solid black', padding: '12px', textAlign: 'right' }}>NT$ {order.totalAmount.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td colSpan={2} style={{ border: '1px solid black', padding: '12px', textAlign: 'right' }}>含稅總額</td>
                    <td style={{ border: '1px solid black', padding: '12px', textAlign: 'right' }}>NT$ {order.totalAmount.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td colSpan={2} style={{ border: '1px solid black', padding: '12px', textAlign: 'right' }}>稅額 (5%)</td>
                    <td style={{ border: '1px solid black', padding: '12px', textAlign: 'right' }}>NT$ {Math.round(order.totalAmount * 0.05).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td colSpan={2} style={{ border: '1px solid black', padding: '12px', textAlign: 'right' }}>未稅金額</td>
                    <td style={{ border: '1px solid black', padding: '12px', textAlign: 'right' }}>NT$ {Math.round(order.totalAmount * 0.95).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td colSpan={2} style={{ border: '1px solid black', padding: '12px', textAlign: 'right', fontWeight: 'bold', fontSize: '16px' }}>總計</td>
                    <td style={{ border: '1px solid black', padding: '12px', textAlign: 'right', fontWeight: 'bold', fontSize: '16px' }}>NT$ {order.totalAmount.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
              <div style={{ marginTop: '60px', display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ width: '200px', borderTop: '1px solid black', paddingTop: '10px', textAlign: 'center' }}>主管簽核</div>
              </div>
            </div>
          </div>
        )}
      </ModalContent>
    </Modal>
  );
}
