import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, FileText, CheckCircle, XCircle, Search, Filter } from 'lucide-react';
import { Page, TemplateType } from '../../types/admin';
import { pageService } from '../../services/pageService';

export default function PageList() {
  const [pages, setPages] = useState<Page[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTemplate, setFilterTemplate] = useState<TemplateType | 'ALL'>('ALL');

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

  const handleDelete = async (id: string) => {
    if (window.confirm('確定要刪除此頁面嗎？此動作無法復原。')) {
      try {
        if (await pageService.delete(id)) {
          setPages(pageService.getAll());
        }
      } catch (error) {
        console.error('刪除頁面失敗:', error);
        alert('操作失敗');
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-stone-900 mb-2">頁面管理</h1>
          <p className="text-stone-500">管理網站的所有頁面內容與架構</p>
        </div>
        <Link
          to="/admin/pages/new"
          className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-colors shadow-lg shadow-primary/20"
        >
          <Plus size={20} />
          新增頁面
        </Link>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
          <input
            type="text"
            placeholder="搜尋頁面標題或 Slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
          />
        </div>
        <div className="relative min-w-[200px]">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
          <select
            value={filterTemplate}
            onChange={(e) => setFilterTemplate(e.target.value as TemplateType | 'ALL')}
            className="w-full pl-10 pr-10 py-2.5 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none cursor-pointer"
          >
            <option value="ALL">全部模板</option>
            <option value="HOME">首頁模板</option>
            <option value="MAJOR_ITEM">大項目模板</option>
            <option value="SUB_ITEM">子項目模板</option>
            <option value="BLOG">部落格模板</option>
            <option value="GENERAL">通用模板</option>
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-stone-600 uppercase tracking-wider">頁面名稱</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-stone-600 uppercase tracking-wider">模板類型</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-stone-600 uppercase tracking-wider">狀態</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-stone-600 uppercase tracking-wider">最後更新</th>
                <th className="px-6 py-4 text-right text-sm font-bold text-stone-600 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredPages.map((page) => (
                <tr key={page.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center text-stone-400">
                        <FileText size={20} />
                      </div>
                      <div>
                        <div className="font-bold text-stone-900">{page.title}</div>
                        <div className="text-xs text-stone-400">/{page.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-stone-100 text-stone-600">
                      {page.template === 'HOME' ? '首頁模板' : 
                       page.template === 'MAJOR_ITEM' ? '大項目模板' : 
                       page.template === 'SUB_ITEM' ? '子項目模板' : 
                       page.template === 'BLOG' ? '部落格模板' : 
                       page.template === 'GENERAL' ? '通用模板' : '未知模板'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
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
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500">
                    {new Date(page.updatedAt).toLocaleDateString('zh-TW')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/${page.slug}`}
                        target="_blank"
                        className="p-2 text-stone-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title="預覽"
                      >
                        <Eye size={18} />
                      </Link>
                      <Link
                        to={`/admin/pages/${page.slug}`}
                        className="p-2 text-stone-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="編輯"
                      >
                        <Edit size={18} />
                      </Link>
                      <button
                        onClick={() => handleDelete(page.id)}
                        className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="刪除"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPages.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-stone-400">
                    {pages.length === 0 ? '目前沒有任何頁面，請點擊右上角新增。' : '找不到符合條件的頁面。'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
