import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, BookOpen, CheckCircle, XCircle } from 'lucide-react';
import { Article } from '../../types/article';
import { articleService } from '../../services/articleService';
import CreateButton from '../../components/admin/CreateButton';
import DeleteConfirmModal from '../../components/admin/DeleteConfirmModal';
import AdminSearchBar from '../../components/admin/search/AdminSearchBar';
import AdminSearchInput from '../../components/admin/search/AdminSearchInput';
import AdminFilterSelect from '../../components/admin/search/AdminFilterSelect';
import AdminTable from '../../components/admin/AdminTable';
import { Pagination } from '../../components/ui/Pagination';

export default function ArticleList() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string | null }>({
    isOpen: false,
    id: null
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setArticles(articleService.getAll());
  }, []);

  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           article.slug.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'ALL' || 
                           (filterStatus === 'PUBLISHED' && article.isPublished) ||
                           (filterStatus === 'DRAFT' && !article.isPublished);
      return matchesSearch && matchesStatus;
    });
  }, [articles, searchTerm, filterStatus]);

  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);
  const paginatedArticles = filteredArticles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  const handleDelete = (id: string) => {
    setDeleteModal({ isOpen: true, id });
  };

  const confirmDelete = () => {
    if (deleteModal.id && articleService.delete(deleteModal.id)) {
      setArticles(articleService.getAll());
    }
  };

  return (
    <div>
      <div className="sticky top-0 z-20 bg-stone-50/80 backdrop-blur-md border-b border-stone-200 -mx-4 px-4 py-4 mb-8 sm:-mx-8 sm:px-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-stone-900 mb-2">文章管理</h1>
            <p className="text-stone-500">管理部落格的所有文章內容</p>
          </div>
          <Link to="/admin/articles/new">
            <CreateButton text="新增文章" icon={Plus} />
          </Link>
        </div>
      </div>

      <AdminSearchBar>
        <AdminSearchInput
          placeholder="搜尋文章標題或 Slug..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <AdminFilterSelect
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          options={[
            { label: '全部狀態', value: 'ALL' },
            { label: '已發布', value: 'PUBLISHED' },
            { label: '草稿', value: 'DRAFT' },
          ]}
          className="min-w-[200px]"
        />
      </AdminSearchBar>

      <AdminTable.Container>
        <AdminTable.Main>
          <AdminTable.Head>
            <tr>
              <AdminTable.Th>文章標題</AdminTable.Th>
              <AdminTable.Th>狀態</AdminTable.Th>
              <AdminTable.Th>最後更新</AdminTable.Th>
              <AdminTable.Th className="text-right">操作</AdminTable.Th>
            </tr>
          </AdminTable.Head>
          <AdminTable.Body>
            {paginatedArticles.length === 0 ? (
              <AdminTable.Empty colSpan={4}>
                {articles.length === 0 ? '目前沒有任何文章，請點擊右上角新增。' : '找不到符合條件的文章。'}
              </AdminTable.Empty>
            ) : (
              paginatedArticles.map((article) => (
                <AdminTable.Row key={article.id}>
                  <AdminTable.Td className="whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center text-stone-400">
                        <BookOpen size={20} />
                      </div>
                      <div>
                        <div className="font-bold text-stone-900">{article.title}</div>
                        <div className="text-xs text-stone-400">/{article.slug}</div>
                      </div>
                    </div>
                  </AdminTable.Td>
                  <AdminTable.Td className="whitespace-nowrap">
                    {article.isPublished ? (
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
                    {new Date(article.updatedAt).toLocaleDateString('zh-TW')}
                  </AdminTable.Td>
                  <AdminTable.Td className="whitespace-nowrap text-right">
                    <AdminTable.Actions>
                      <AdminTable.Preview href={`/blog/${article.slug}`} />
                      <AdminTable.Edit href={`/admin/articles/${article.slug}`} />
                      <AdminTable.Delete onClick={() => handleDelete(article.id)} />
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
        title="刪除文章"
        message="確定要刪除此文章嗎？此動作無法復原。"
      />
    </div>
  );
}
