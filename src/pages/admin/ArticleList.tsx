import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, BookOpen, CheckCircle, XCircle } from 'lucide-react';
import { Article } from '../../types/article';
import { articleService } from '../../services/articleService';

export default function ArticleList() {
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    setArticles(articleService.getAll());
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('確定要刪除此文章嗎？此動作無法復原。')) {
      try {
        if (await articleService.delete(id)) {
          setArticles(articleService.getAll());
        }
      } catch (error) {
        console.error('刪除文章失敗:', error);
        alert('操作失敗');
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-stone-900 mb-2">文章管理</h1>
          <p className="text-stone-500">管理部落格的所有文章內容</p>
        </div>
        <Link
          to="/admin/articles/new"
          className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-colors shadow-lg shadow-primary/20"
        >
          <Plus size={20} />
          新增文章
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-stone-600 uppercase tracking-wider">文章標題</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-stone-600 uppercase tracking-wider">狀態</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-stone-600 uppercase tracking-wider">最後更新</th>
                <th className="px-6 py-4 text-right text-sm font-bold text-stone-600 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {articles.map((article) => (
                <tr key={article.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center text-stone-400">
                        <BookOpen size={20} />
                      </div>
                      <div>
                        <div className="font-bold text-stone-900">{article.title}</div>
                        <div className="text-xs text-stone-400">/{article.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
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
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500">
                    {new Date(article.updatedAt).toLocaleDateString('zh-TW')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/blog/${article.slug}`}
                        target="_blank"
                        className="p-2 text-stone-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title="預覽"
                      >
                        <Eye size={18} />
                      </Link>
                      <Link
                        to={`/admin/articles/${article.slug}`}
                        className="p-2 text-stone-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="編輯"
                      >
                        <Edit size={18} />
                      </Link>
                      <button
                        onClick={() => handleDelete(article.id)}
                        className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="刪除"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
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
