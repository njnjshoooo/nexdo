import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, FileText, CheckCircle, XCircle } from 'lucide-react';
import { Page, TemplateType } from '../../types/admin';
import { pageService } from '../../services/pageService';
import CreateButton from '../../components/admin/CreateButton';
import DeleteConfirmModal from '../../components/admin/DeleteConfirmModal';
import AdminSearchBar from '../../components/admin/search/AdminSearchBar';
import AdminSearchInput from '../../components/admin/search/AdminSearchInput';
import AdminFilterSelect from '../../components/admin/search/AdminFilterSelect';
import AdminTable from '../../components/admin/AdminTable';
import { Pagination } from '../../components/ui/Pagination';

export default function PageList() {
  const [pages, setPages] = useState<Page[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTemplate, setFilterTemplate] = useState<TemplateType | 'ALL'>('ALL');
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string | null }>({
    isOpen: false,
    id: null
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setPages(pageService.getAll());
  }, []);

  const filteredPages = useMemo(() => {
    return pages.filter(page => {
      const matchesSearch = 
        page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        page.slug.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = 
        filterTemplate === 'ALL' || page.template === filterTemplate;

      return matchesSearch && matchesFilter;
    });
  }, [pages, searchTerm, filterTemplate]);

  const totalPages = Math.ceil(filteredPages.length / itemsPerPage);
  const paginatedPages = filteredPages.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterTemplate]);

  const handleDelete = (id: string) => {
    setDeleteModal({ isOpen: true, id });
  };

  const confirmDelete = () => {
    if (deleteModal.id && pageService.delete(deleteModal.id)) {
      setPages(pageService.getAll());
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-stone-900 mb-2">頁面管理</h1>
          <p className="text-stone-500">管理網站的所有頁面內容與架構</p>
        </div>
        <Link to="/admin/pages/new">
          <CreateButton text="新增頁面" icon={Plus} />
        </Link>
      </div>

      {/* Search and Filter Bar */}
      <AdminSearchBar>
        <AdminSearchInput
          placeholder="搜尋頁面標題或 Slug..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <AdminFilterSelect
          value={filterTemplate}
          onChange={(e) => setFilterTemplate(e.target.value as TemplateType | 'ALL')}
          options={[
            { label: '全部模板', value: 'ALL' },
            { label: '首頁模板', value: 'HOME' },
            { label: '大項目模板', value: 'MAJOR_ITEM' },
            { label: '子項目模板', value: 'SUB_ITEM' },
            { label: '部落格模板', value: 'BLOG' },
            { label: '通用模板', value: 'GENERAL' },
          ]}
          className="min-w-[200px]"
        />
      </AdminSearchBar>

      <AdminTable.Container>
        <AdminTable.Main>
          <AdminTable.Head>
            <tr>
              <AdminTable.Th>頁面名稱</AdminTable.Th>
              <AdminTable.Th>模板類型</AdminTable.Th>
              <AdminTable.Th>狀態</AdminTable.Th>
              <AdminTable.Th>最後更新</AdminTable.Th>
              <AdminTable.Th className="text-right">操作</AdminTable.Th>
            </tr>
          </AdminTable.Head>
          <AdminTable.Body>
            {paginatedPages.map((page) => (
              <AdminTable.Row key={page.id}>
                <AdminTable.Td className="whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center text-stone-400">
                      <FileText size={20} />
                    </div>
                    <div>
                      <div className="font-bold text-stone-900">{page.title}</div>
                      <div className="text-xs text-stone-400">/{page.slug}</div>
                    </div>
                  </div>
                </AdminTable.Td>
                <AdminTable.Td className="whitespace-nowrap">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-stone-100 text-stone-600">
                    {page.template === 'HOME' ? '首頁模板' : 
                     page.template === 'MAJOR_ITEM' ? '大項目模板' : 
                     page.template === 'SUB_ITEM' ? '子項目模板' : 
                     page.template === 'BLOG' ? '部落格模板' : 
                     page.template === 'GENERAL' ? '通用模板' : '未知模板'}
                  </span>
                </AdminTable.Td>
                <AdminTable.Td className="whitespace-nowrap">
                  {page.isPublished ? (
                    <span className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
                      <CheckCircle size={14} />
                      已發布
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-stone-400 text-sm font-medium">
                      <XCircle size={14} />
                      草稿
                    </span>
                  )}
                </AdminTable.Td>
                <AdminTable.Td className="whitespace-nowrap text-sm text-stone-500">
                  {new Date(page.updatedAt).toLocaleDateString('zh-TW')}
                </AdminTable.Td>
                <AdminTable.Td className="whitespace-nowrap text-right">
                  <AdminTable.Actions>
                    <AdminTable.Preview href={`/${page.slug}`} />
                    <AdminTable.Edit href={`/admin/pages/${page.slug}`} />
                    <AdminTable.Delete onClick={() => handleDelete(page.id)} />
                  </AdminTable.Actions>
                </AdminTable.Td>
              </AdminTable.Row>
            ))}
            {paginatedPages.length === 0 && (
              <AdminTable.Empty colSpan={5}>
                {pages.length === 0 ? '目前沒有任何頁面，請點擊右上角新增。' : '找不到符合條件的頁面。'}
              </AdminTable.Empty>
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
        title="刪除頁面"
        message="確定要刪除此頁面嗎？此動作無法復原，且所有關聯的內容都將消失。"
      />
    </div>
  );
}
