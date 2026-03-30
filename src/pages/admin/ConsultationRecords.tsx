import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FormSubmission, Form } from '../../types/form';
import { submissionService } from '../../services/submissionService';
import { formService } from '../../services/formService';
import { Trash2, Eye, X, ArrowLeft, FilterX, MessageCircle } from 'lucide-react';

export default function ConsultationRecords() {
  const [searchParams, setSearchParams] = useSearchParams();
  const formNameFilter = searchParams.get('formName');
  
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [forms, setForms] = useState<Record<string, Form>>({});
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, [formNameFilter]);

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

      // Filter by purpose 'CONSULTATION'
      let filtered = allSubmissions.filter(s => {
        const form = formMap[s.formId];
        return form?.purpose === 'CONSULTATION';
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
    if (window.confirm('確定要刪除這筆諮詢紀錄嗎？此動作無法復原。')) {
      try {
        await submissionService.delete(id);
        await loadData();
      } catch (error) {
        alert('刪除失敗');
      }
    }
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

  if (loading) {
    return <div className="p-8 text-center text-stone-500">載入諮詢紀錄中...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-stone-900 mb-2">諮詢紀錄</h1>
          <p className="text-stone-500 mt-1">
            {formNameFilter ? `正在查看「${formNameFilter}」的諮詢` : '匯總所有表單的諮詢紀錄，由新到舊排列'}
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
                <th className="px-6 py-4 text-sm font-medium text-stone-500">諮詢日期</th>
                <th className="px-6 py-4 text-sm font-medium text-stone-500">表單名稱</th>
                <th className="px-6 py-4 text-sm font-medium text-stone-500">內容摘要</th>
                <th className="px-6 py-4 text-sm font-medium text-stone-500 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-stone-500">
                    目前沒有諮詢紀錄
                  </td>
                </tr>
              ) : (
                submissions.map(submission => {
                  const form = forms[submission.formId];
                  const firstField = form?.fields?.find(f => f.type !== 'hidden');
                  const summary = firstField ? submission.data[firstField.id] : '';

                  return (
                    <tr key={submission.id} className="hover:bg-stone-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-stone-900 whitespace-nowrap">
                        {formatDate(submission.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-sm text-stone-900">
                        {form ? form.name : <span className="text-stone-400 italic">未知表單</span>}
                      </td>
                      <td className="px-6 py-4 text-sm text-stone-600 max-w-xs truncate">
                        {Array.isArray(summary) ? summary.join(', ') : summary}
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
              <h2 className="text-xl font-bold text-stone-900">諮詢詳情</h2>
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
                  <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">諮詢時間</div>
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
              </div>
            </div>
            
            <div className="p-6 border-t border-stone-100 flex justify-end">
              <button
                onClick={() => setSelectedSubmission(null)}
                className="px-6 py-2.5 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors font-medium shadow-sm"
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
