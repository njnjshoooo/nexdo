import React, { useState, useEffect } from 'react';
import { UseFormRegister, Control, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { Page } from '../../../types/admin';
import { Article } from '../../../types/article';
import { articleService } from '../../../services/articleService';
import { pageService } from '../../../services/pageService';
import ImageUploader from '../../../components/admin/ImageUploader';
import { Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

interface BlogEditorProps {
  register: UseFormRegister<Page>;
  control: Control<Page>;
  activeTab: string;
  watch: UseFormWatch<Page>;
  setValue: UseFormSetValue<Page>;
}

export default function BlogEditor({ register, activeTab, watch, setValue }: BlogEditorProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [subItems, setSubItems] = useState<Page[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>([]);

  useEffect(() => {
    const allArts = articleService.getAll();
    setArticles(allArts.filter(a => a.isPublished));
    setSubItems(pageService.getAll().filter(p => p.template === 'SUB_ITEM'));
    
    // Get all unique categories from existing articles
    const uniqueCategories = Array.from(new Set(allArts.map(a => a.categoryId).filter(Boolean)));
    setAllCategories(uniqueCategories);
  }, []);

  const navCategories = watch('content.blog.navCategories') || [];
  const oldCategories = watch('content.blog.categories');
  const interestedPostIds = watch('content.blog.interestedPostIds') || [];
  const recommendedServiceIds = watch('content.blog.recommendedServiceIds') || ['', '', ''];

  useEffect(() => {
    if (watch('content.blog.navCategories') === undefined && oldCategories) {
      setValue('content.blog.navCategories', oldCategories);
    }
  }, [oldCategories, setValue, watch]);

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newCats = [...navCategories];
    [newCats[index - 1], newCats[index]] = [newCats[index], newCats[index - 1]];
    setValue('content.blog.navCategories', newCats);
  };

  const handleMoveDown = (index: number) => {
    if (index === navCategories.length - 1) return;
    const newCats = [...navCategories];
    [newCats[index], newCats[index + 1]] = [newCats[index + 1], newCats[index]];
    setValue('content.blog.navCategories', newCats);
  };

  const handleRemoveNavCategory = (cat: string) => {
    setValue('content.blog.navCategories', navCategories.filter(c => c !== cat));
  };

  const handleAddNavCategory = (cat: string) => {
    setValue('content.blog.navCategories', [...navCategories, cat]);
  };

  if (activeTab === 'blog_hero') {
    return (
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-stone-200">
        <h2 className="text-2xl font-bold text-stone-900 mb-6">HERO區塊</h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-stone-700 mb-2">列表頁大標 (Hero Title)</label>
            <input 
              {...register('content.blog.heroTitle')} 
              className="w-full border border-stone-200 p-3 rounded-xl outline-none focus:border-primary"
              placeholder="例如：好齡居誌"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-stone-700 mb-2">Hero 區塊背景圖</label>
            <ImageUploader 
              value={watch('content.blog.heroImage') || ''} 
              onChange={(val) => setValue('content.blog.heroImage', val)} 
            />
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'blog_category') {
    const unselectedCategories = allCategories.filter(cat => !navCategories.includes(cat));

    return (
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-stone-200">
        <h2 className="text-2xl font-bold text-stone-900 mb-6">分類導覽列表</h2>
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <input 
              type="checkbox" 
              id="showCategoryNav"
              {...register('content.blog.showCategoryNav')} 
              className="w-5 h-5 rounded border-stone-300 text-primary focus:ring-primary"
            />
            <label htmlFor="showCategoryNav" className="text-sm font-bold text-stone-700">顯示分類導覽</label>
          </div>

          <div>
            <label className="block text-sm font-bold text-stone-700 mb-4">已選分類 (前台顯示)</label>
            <div className="space-y-2">
              {navCategories.map((cat, idx) => (
                <div key={cat} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="font-medium text-stone-700">{cat}</span>
                  <div className="flex items-center gap-1">
                    <button 
                      type="button"
                      onClick={() => handleMoveUp(idx)}
                      disabled={idx === 0}
                      className="p-2 text-stone-400 hover:bg-stone-200 hover:text-stone-700 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                    >
                      <ArrowUp size={18} />
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleMoveDown(idx)}
                      disabled={idx === navCategories.length - 1}
                      className="p-2 text-stone-400 hover:bg-stone-200 hover:text-stone-700 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                    >
                      <ArrowDown size={18} />
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleRemoveNavCategory(cat)}
                      className="p-2 text-stone-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors ml-2"
                      title="隱藏此分類"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
              {navCategories.length === 0 && (
                <p className="text-sm text-stone-500 text-center py-4 bg-stone-50 rounded-xl border border-stone-200 border-dashed">目前沒有選擇任何分類</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-stone-700 mb-4">未顯示之分類</label>
            <div className="space-y-2">
              {unselectedCategories.map((cat) => (
                <div key={cat} className="flex items-center justify-between p-3 bg-white rounded-xl border border-stone-200 opacity-70 hover:opacity-100 transition-opacity">
                  <span className="font-medium text-stone-600">{cat}</span>
                  <button 
                    type="button"
                    onClick={() => handleAddNavCategory(cat)}
                    className="p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-900 rounded-lg transition-colors"
                    title="加入導覽列"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              ))}
              {unselectedCategories.length === 0 && (
                <p className="text-sm text-stone-500 text-center py-4 bg-stone-50 rounded-xl border border-stone-200 border-dashed">沒有其他可選分類</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'blog_featured') {
    return (
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-stone-200">
        <h2 className="text-2xl font-bold text-stone-900 mb-6">主推文章</h2>
        <div className="space-y-8">
          <div>
            <label className="block text-sm font-bold text-stone-700 mb-2">超級推薦 (Hero Post)</label>
            <select 
              {...register('content.blog.featuredPostId')} 
              className="w-full border border-stone-200 p-3 rounded-xl bg-white outline-none focus:border-primary"
            >
              <option value="latest">自動抓取最新文章</option>
              {articles.map(article => (
                <option key={article.id} value={article.id}>{article.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-stone-700 mb-2">你可能有興趣 (推薦文章)</label>
            <p className="text-xs text-stone-500 mb-4">請選擇要顯示在側邊欄或底部的推薦文章</p>
            <div className="space-y-3">
              {[0, 1, 2].map((index) => (
                <select 
                  key={index}
                  value={interestedPostIds[index] || ''}
                  onChange={(e) => {
                    const newIds = [...interestedPostIds];
                    newIds[index] = e.target.value;
                    setValue('content.blog.interestedPostIds', newIds);
                  }}
                  className="w-full border border-stone-200 p-3 rounded-xl bg-white outline-none focus:border-primary"
                >
                  <option value="">-- 選擇文章 --</option>
                  {articles.map(article => (
                    <option key={article.id} value={article.id}>{article.title}</option>
                  ))}
                </select>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'blog_popular') {
    return (
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-stone-200">
        <h2 className="text-2xl font-bold text-stone-900 mb-6">熱門文章列表</h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-stone-700 mb-2">每頁顯示篇數</label>
            <input 
              type="number"
              min="1"
              max="50"
              {...register('content.blog.postsPerPage', { valueAsNumber: true })} 
              className="w-full border border-stone-200 p-3 rounded-xl outline-none focus:border-primary"
            />
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'blog_services') {
    return (
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-stone-200">
        <h2 className="text-2xl font-bold text-stone-900 mb-6">推薦服務</h2>
        <p className="text-sm text-stone-500 mb-6">請從現有的子項目 (SubItems) 中挑選 3 個推薦服務顯示於部落格中。</p>
        <div className="space-y-4">
          {[0, 1, 2].map((index) => (
            <div key={index}>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">推薦服務 {index + 1}</label>
              <select 
                value={recommendedServiceIds[index] || ''}
                onChange={(e) => {
                  const newIds = [...recommendedServiceIds];
                  newIds[index] = e.target.value;
                  setValue('content.blog.recommendedServiceIds', newIds);
                }}
                className="w-full border border-stone-200 p-3 rounded-xl bg-white outline-none focus:border-primary"
              >
                <option value="">-- 選擇服務 --</option>
                {subItems.map(item => (
                  <option key={item.id} value={item.id}>{item.title}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
