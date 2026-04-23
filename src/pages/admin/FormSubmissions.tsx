import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FormSubmission, Form } from '../../types/form';
import { submissionService } from '../../services/submissionService';
import { formService } from '../../services/formService';
import { Trash2, Eye, X, ArrowLeft, FilterX } from 'lucide-react';
import AdminTable from '../../components/admin/AdminTable';

export default function FormSubmissions() {
  const [searchParams, setSearchParams] = useSearchParams();
  const formIdFilter = searchParams.get('formId');
  
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [forms, setForms] = useState<Record<string, Form>>({});
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<FormSubmission | null>(null);
  const [loading, setLoading] = useState(true);

  // 初始化讀取資料
  useEffect(() => {
    loadData();

    // Listen for storage changes from other tabs
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, [formIdFilter]);

  // 核心邏輯：從 Service 抓取資料並同步狀態
  const loadData = async () => {
    setLoading(true);
    try {
      // 1. 抓取所有提交紀錄（確保使用 await）
      let allSubmissions = await submissionService.getAll();
      
      // 如果有 formId 過濾器，則過濾
      if (formIdFilter) {
        allSubmissions = allSubmissions.filter(s => s.formId === formIdFilter);
      }
      
      // 按時間排序：最新的在上面
      const sortedSubmissions = [...allSubmissions].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setSubmissions(sortedSubmissions);

      // 2. 抓取所有表單定義，建立對照表（Map）以便快速查詢表單名稱
      const allForms = formService.getAll();
      const formMap: Record<string, Form> = {};
      allForms.forEach(form => {
        formMap[form.id] = form;
      });
      setForms(formMap);
    } catch (error) {
      console.error('載入資料失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilter = () => {
    setSearchParams({});
  };

  // 刪除紀錄邏輯
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
      await loadData(); // 重新整理列表
    } catch (error) {
      console.error('刪除失敗:', error);
      alert('刪除失敗，請稍後再試');
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

  // 渲染詳情彈窗中的動態欄位
  const renderSubmissionData = (submission: FormSubmission) => {
    const form = forms[submission.formId];
    if (!form) return <div className="text-stone-500 italic">對應表單已刪除或不存在</div>;

    return (
      <div className="space-y-4">
        {form.fields.filter(f => f.type !== 'hidden').map(field => {
          const value = submission.data[field.id];
          return (
            <div key={field.id} className="border-b border-stone-100 pb-3 last:border-0 last:pb-0">
              <div className="text-sm font-medium text-stone-500 mb-1">{field.label}</div>
              <div className="text-stone-900 font-medium">
                {field.type === 'file' ? (
                  Array.isArray(value) ? (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {value.map((url, idx) => (
                        <a key={idx} href={url} target="_blank" rel="noreferrer" className="block w-20 h-20 rounded-lg overflow-hidden border border-stone-200 hover:border-primary transition-colors">
                          <img src={url} alt={`Upload ${idx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </a>
                      ))}
                    </div>
                  ) : value && typeof value === 'string' && value.startsWith('http') ? (
                    <a href={value} target="_blank" rel="noreferrer" className="block w-20 h-20 rounded-lg overflow-hidden border border-stone-200 hover:border-primary transition-colors mt-2">
                      <img src={value} alt="Upload" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </a>
                  ) : (
                    <span className="text-stone-400 italic">{value || '未上傳'}</span>
                  )
                ) : Array.isArray(value) ? (
                  value.join(', ')
                ) : (
                  value || '-'
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return <div className="p-8 text-center text-stone-500">載入紀錄中...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          {formIdFilter && (
            <Link
              to="/admin/forms"
              className="p-2 hover:bg-stone-100 rounded-full transition-colors"
            >
              <ArrowLeft size={24} className="text-stone-600" />
            </Link>
          )}
          <div>
            <h1 className="text-3xl font-bold text-stone-900 mb-2">
              {formIdFilter && forms[formIdFilter] ? `「${forms[formIdFilter].name}」填表紀錄` : '預約紀錄管理'}
            </h1>
            <p className="text-stone-500 mt-1">
              {formIdFilter ? `正在查看特定表單的提交紀錄` : '檢視與管理所有來自前台表單的預約與諮詢紀錄'}
            </p>
          </div>
        </div>
        {formIdFilter && (
          <button
            onClick={clearFilter}
            className="flex items-center gap-2 px-4 py-2 bg-stone-100 text-stone-600 rounded-lg hover:bg-stone-200 transition-colors font-medium"
          >
            <FilterX size={18} />
            清除過濾
          </button>
        )}
      </div>

      <AdminTable.Container>
        <AdminTable.Main>
          <AdminTable.Head>
            <tr>
              <AdminTable.Th>狀態</AdminTable.Th>
              <AdminTable.Th>提交日期</AdminTable.Th>
              <AdminTable.Th>來源頁面</AdminTable.Th>
              <AdminTable.Th>表單名稱</AdminTable.Th>
              <AdminTable.Th>內容摘要</AdminTable.Th>
              <AdminTable.Th className="text-right">操作</AdminTable.Th>
            </tr>
          </AdminTable.Head>
          <AdminTable.Body>
            {submissions.length === 0 ? (
              <AdminTable.Empty colSpan={6}>
                目前還沒有任何預約紀錄
              </AdminTable.Empty>
            ) : (
              submissions.map(submission => {
                const form = forms[submission.formId];
                const firstField = form?.fields?.find(f => f.type !== 'hidden');
                const summary = firstField ? submission.data[firstField.id] : '';
                const isProcessed = submission.status === 'PROCESSED';

                return (
                  <AdminTable.Row key={submission.id}>
                    <AdminTable.Td className="whitespace-nowrap">
                      {isProcessed ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          已處理
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          待報價
                        </span>
                      )}
                    </AdminTable.Td>
                    <AdminTable.Td className="text-sm text-stone-900 whitespace-nowrap">
                      {formatDate(submission.createdAt)}
                    </AdminTable.Td>
                    <AdminTable.Td>
                      <div className="text-sm font-medium text-stone-900">{submission.pageTitle}</div>
                      <div className="text-xs text-stone-500">{submission.pageSlug}</div>
                    </AdminTable.Td>
                    <AdminTable.Td className="text-sm text-stone-900">
                      {form ? form.name : <span className="text-stone-400 italic">未知表單</span>}
                    </AdminTable.Td>
                    <AdminTable.Td className="text-sm text-stone-600 max-w-xs truncate">
                      {Array.isArray(summary) ? summary.join(', ') : summary}
                    </AdminTable.Td>
                    <AdminTable.Td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedSubmission(submission)}
                          className="p-2 text-stone-400 hover:text-primary transition-colors"
                          title="查看完整內容"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(submission.id)}
                          className="p-2 text-stone-400 hover:text-red-500 transition-colors"
                          title="刪除紀錄"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </AdminTable.Td>
                  </AdminTable.Row>
                );
              })
            )}
          </AdminTable.Body>
        </AdminTable.Main>
      </AdminTable.Container>

      {/* 詳情 Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="p-6 border-b border-stone-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-stone-900">預約紀錄詳情</h2>
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
              </div>
            </div>
            
            <div className="p-6 border-t border-stone-100 flex justify-end">
              <button
                onClick={() => setSelectedSubmission(null)}
                className="px-6 py-2.5 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors font-medium shadow-sm"
              >
                關閉視窗
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
              <h2 className="text-xl font-bold">確認刪除紀錄</h2>
            </div>
            <div className="p-6">
              <p className="text-stone-600 mb-2">
                您確定要刪除這筆紀錄嗎？
              </p>
              <p className="text-sm text-stone-400">
                此動作無法復原，相關的填表資訊將會永久移除。
              </p>
              {itemToDelete && (
                <div className="mt-4 p-3 bg-stone-50 rounded-lg border border-stone-100">
                  <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">提交客戶</p>
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
    </div>
  );
}