import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Users, Link as LinkIcon, Check, Copy } from 'lucide-react';
import { formService } from '../../services/formService';
import { submissionService } from '../../services/submissionService';
import { Form, FormSubmission } from '../../types/form';

export default function FormList() {
  const [forms, setForms] = useState<Form[]>([]);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    setForms(formService.getAll());
    loadSubmissions();

    // Listen for storage changes from other tabs
    window.addEventListener('storage', loadSubmissions);
    return () => window.removeEventListener('storage', loadSubmissions);
  }, []);

  const loadSubmissions = async () => {
    const all = await submissionService.getAll();
    setSubmissions(all);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('確定要刪除此表單嗎？刪除後無法復原。')) {
      try {
        await formService.delete(id);
        setForms(formService.getAll());
      } catch (error) {
        console.error('刪除表單失敗:', error);
        alert('操作失敗');
      }
    }
  };

  const getSubmissionCount = (formId: string) => {
    return submissions.filter(s => s.formId === formId).length;
  };

  const copyToClipboard = (formId: string) => {
    const url = `${window.location.origin}/forms/${formId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(formId);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-stone-900 mb-2">表單管理</h1>
          <p className="text-stone-500 mt-1">管理網站中的所有表單與欄位設定</p>
        </div>
        <Link
          to="/admin/forms/new"
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus size={20} />
          新增表單
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="px-6 py-4 font-medium text-stone-600">表單名稱</th>
              <th className="px-6 py-4 font-medium text-stone-600">目的</th>
              <th className="px-6 py-4 font-medium text-stone-600">表單連結</th>
              <th className="px-6 py-4 font-medium text-stone-600">填表人數</th>
              <th className="px-6 py-4 font-medium text-stone-600">描述</th>
              <th className="px-6 py-4 font-medium text-stone-600">欄位數量</th>
              <th className="px-6 py-4 font-medium text-stone-600">最後更新</th>
              <th className="px-6 py-4 font-medium text-stone-600 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200">
            {forms.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-stone-500">
                  目前還沒有任何表單，點擊右上角「新增表單」開始建立。
                </td>
              </tr>
            ) : (
              forms.map((form) => (
                <tr key={form.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-stone-900">{form.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      form.purpose === 'BOOKING' 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      {form.purpose === 'BOOKING' ? '預約' : '諮詢'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyToClipboard(form.formId)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          copiedId === form.formId 
                            ? 'bg-green-50 text-green-600' 
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                        }`}
                        title="複製表單網址"
                      >
                        {copiedId === form.formId ? (
                          <>
                            <Check size={14} />
                            已複製
                          </>
                        ) : (
                          <>
                            <Copy size={14} />
                            複製連結
                          </>
                        )}
                      </button>
                      <a
                        href={`/forms/${form.formId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-stone-400 hover:text-primary transition-colors"
                        title="在新視窗開啟"
                      >
                        <LinkIcon size={16} />
                      </a>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Link 
                      to={form.purpose === 'BOOKING' 
                        ? `/admin/appointments?formName=${encodeURIComponent(form.name)}` 
                        : `/admin/consultations?formName=${encodeURIComponent(form.name)}`
                      }
                      className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 text-primary hover:bg-primary/10 rounded-lg font-bold transition-colors"
                    >
                      <Users size={14} />
                      {getSubmissionCount(form.id)} 人
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-stone-600">
                    <div className="truncate max-w-xs">{form.description}</div>
                  </td>
                  <td className="px-6 py-4 text-stone-600">
                    {form.fields.length} 個欄位
                  </td>
                  <td className="px-6 py-4 text-stone-500">
                    {new Date(form.updatedAt).toLocaleDateString('zh-TW')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        to={`/admin/forms/${form.id}`}
                        className="p-2 text-stone-400 hover:text-primary transition-colors"
                        title="編輯"
                      >
                        <Edit size={18} />
                      </Link>
                      <button
                        onClick={() => handleDelete(form.id)}
                        className="p-2 text-stone-400 hover:text-red-500 transition-colors"
                        title="刪除"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
