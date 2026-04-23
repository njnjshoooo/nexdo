import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Users } from 'lucide-react';
import CreateButton from '../../components/admin/CreateButton';
import { formService } from '../../services/formService';
import { submissionService } from '../../services/submissionService';
import { Form, FormSubmission } from '../../types/form';
import DeleteConfirmModal from '../../components/admin/DeleteConfirmModal';
import AdminSearchBar from '../../components/admin/search/AdminSearchBar';
import AdminSearchInput from '../../components/admin/search/AdminSearchInput';
import AdminFilterSelect from '../../components/admin/search/AdminFilterSelect';
import AdminTable from '../../components/admin/AdminTable';
import { Pagination } from '../../components/ui/Pagination';

export default function FormList() {
  const navigate = useNavigate();
  const [forms, setForms] = useState<Form[]>([]);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPurpose, setFilterPurpose] = useState<string>('ALL');
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string | null }>({
    isOpen: false,
    id: null
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  const filteredForms = useMemo(() => {
    return forms.filter(form => {
      const matchesSearch = form.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           form.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPurpose = filterPurpose === 'ALL' || form.purpose === filterPurpose;
      return matchesSearch && matchesPurpose;
    });
  }, [forms, searchTerm, filterPurpose]);

  const totalPages = Math.ceil(filteredForms.length / itemsPerPage);
  const paginatedForms = filteredForms.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterPurpose]);

  const handleDelete = (id: string) => {
    setDeleteModal({ isOpen: true, id });
  };

  const confirmDelete = () => {
    if (deleteModal.id) {
      formService.delete(deleteModal.id);
      setForms(formService.getAll());
    }
  };

  const getSubmissionCount = (formId: string) => {
    return submissions.filter(s => s.formId === formId).length;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-stone-900 mb-2">表單管理</h1>
          <p className="text-stone-500 mt-1">管理網站中的所有表單與欄位設定</p>
        </div>
        <CreateButton
          onClick={() => navigate('/admin/forms/new')}
          text="新增表單"
          icon={Plus}
        />
      </div>

      <AdminSearchBar>
        <AdminSearchInput
          placeholder="搜尋表單名稱或描述..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <AdminFilterSelect
          value={filterPurpose}
          onChange={(e) => setFilterPurpose(e.target.value)}
          options={[
            { label: '全部目的', value: 'ALL' },
            { label: '預約', value: 'BOOKING' },
            { label: '諮詢', value: 'CONSULTATION' },
          ]}
          className="min-w-[200px]"
        />
      </AdminSearchBar>

      <AdminTable.Container>
        <AdminTable.Main>
          <AdminTable.Head>
            <tr>
              <AdminTable.Th>表單名稱</AdminTable.Th>
              <AdminTable.Th>目的</AdminTable.Th>
              <AdminTable.Th>填表人數</AdminTable.Th>
              <AdminTable.Th>描述</AdminTable.Th>
              <AdminTable.Th>欄位數量</AdminTable.Th>
              <AdminTable.Th>最後更新</AdminTable.Th>
              <AdminTable.Th className="text-right">操作</AdminTable.Th>
            </tr>
          </AdminTable.Head>
          <AdminTable.Body>
            {paginatedForms.length === 0 ? (
              <AdminTable.Empty colSpan={7}>
                {forms.length === 0 ? '目前還沒有任何表單，點擊右上角「新增表單」開始建立。' : '找不到符合條件的表單。'}
              </AdminTable.Empty>
            ) : (
              paginatedForms.map((form) => (
                <AdminTable.Row key={form.id}>
                  <AdminTable.Td>
                    <div className="font-medium text-stone-900">{form.name}</div>
                  </AdminTable.Td>
                  <AdminTable.Td>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      form.purpose === 'BOOKING' 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      {form.purpose === 'BOOKING' ? '預約' : '諮詢'}
                    </span>
                  </AdminTable.Td>
                  <AdminTable.Td>
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
                  </AdminTable.Td>
                  <AdminTable.Td className="text-stone-600">
                    <div className="truncate max-w-xs">{form.description}</div>
                  </AdminTable.Td>
                  <AdminTable.Td className="text-stone-600">
                    {form.fields.length} 個欄位
                  </AdminTable.Td>
                  <AdminTable.Td className="text-stone-500">
                    {new Date(form.updatedAt).toLocaleDateString('zh-TW')}
                  </AdminTable.Td>
                  <AdminTable.Td className="text-right">
                    <AdminTable.Actions>
                      <AdminTable.Preview href={`/forms/${form.formId}`} />
                      <AdminTable.Copy value={`${window.location.origin}/forms/${form.formId}`} title="複製連結" />
                      <AdminTable.Edit href={`/admin/forms/${form.id}`} />
                      <AdminTable.Delete onClick={() => handleDelete(form.id)} />
                    </AdminTable.Actions>
                  </AdminTable.Td>
                </AdminTable.Row>
              ))
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

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={confirmDelete}
        title="刪除表單"
        message="確定要刪除此表單嗎？刪除後無法復原，且所有已收到的填單資料也可能受到影響。"
      />
    </div>
  );
}
