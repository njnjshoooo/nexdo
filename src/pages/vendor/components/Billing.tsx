import React from 'react';
import { Vendor } from '../../../types/vendor';
import { CreditCard, Download, FileText } from 'lucide-react';

interface BillingProps {
  vendor: Vendor;
}

export default function Billing({ vendor }: BillingProps) {
  // Mock data for billing history
  const billingHistory = [
    { id: 'INV-2026-03', period: '2026年3月', amount: 45000, status: 'PENDING', date: '2026-04-05' },
    { id: 'INV-2026-02', period: '2026年2月', amount: 38500, status: 'PAID', date: '2026-03-05' },
    { id: 'INV-2026-01', period: '2026年1月', amount: 42000, status: 'PAID', date: '2026-02-05' },
  ];

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
        <h2 className="text-xl font-bold text-stone-900 mb-6 flex items-center gap-2">
          <CreditCard className="text-primary" size={24} />
          財務中心
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-stone-50 rounded-xl p-6 border border-stone-100">
            <p className="text-sm font-bold text-stone-500 mb-2">本月預估撥款金額</p>
            <p className="text-3xl font-black text-stone-900">NT$ 45,000</p>
            <p className="text-xs text-stone-400 mt-2">結算至 2026/03/31</p>
          </div>
          <div className="bg-stone-50 rounded-xl p-6 border border-stone-100">
            <p className="text-sm font-bold text-stone-500 mb-2">上月已撥款金額</p>
            <p className="text-3xl font-black text-stone-900">NT$ 38,500</p>
            <p className="text-xs text-stone-400 mt-2">撥款日期 2026/03/05</p>
          </div>
          <div className="bg-stone-50 rounded-xl p-6 border border-stone-100">
            <p className="text-sm font-bold text-stone-500 mb-2">撥款帳戶</p>
            <p className="text-lg font-bold text-stone-900">{vendor.account}</p>
            <p className="text-xs text-stone-400 mt-2">結帳週期：{vendor.billingCycle === 'monthly' ? '月結' : '現金'}</p>
          </div>
        </div>

        <h3 className="font-bold text-stone-900 mb-4 flex items-center gap-2">
          <FileText className="text-stone-400" size={20} />
          歷史帳單
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-stone-50 text-stone-500 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">帳單編號</th>
                <th className="px-6 py-4">結算區間</th>
                <th className="px-6 py-4">撥款金額</th>
                <th className="px-6 py-4">狀態</th>
                <th className="px-6 py-4">預計/實際撥款日</th>
                <th className="px-6 py-4 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {billingHistory.map(bill => (
                <tr key={bill.id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm font-bold text-stone-900">{bill.id}</td>
                  <td className="px-6 py-4 text-sm text-stone-600">{bill.period}</td>
                  <td className="px-6 py-4 text-sm font-bold text-stone-900">NT$ {bill.amount.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    {bill.status === 'PAID' ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600">
                        已撥款
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-600">
                        處理中
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-stone-500">{bill.date}</td>
                  <td className="px-6 py-4 text-center">
                    <button className="p-2 text-stone-400 hover:text-primary transition-colors inline-flex" title="下載明細">
                      <Download size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
