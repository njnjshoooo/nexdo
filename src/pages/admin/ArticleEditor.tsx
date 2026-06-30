import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Article } from '../../types/article';
import { articleService } from '../../services/articleService';
import { pageService } from '../../services/pageService';
import { formService } from '../../services/formService';
import { Form } from '../../types/form';
import { 
  ArrowLeft, BookOpen, Image as ImageIcon, Tag, 
  Link as LinkIcon, Heading2, Bold, Italic, Minus, Quote, List,
  MessageSquare
} from 'lucide-react';
import AdminMarkdownEditor from '../../components/admin/AdminMarkdownEditor';
import SaveButton from '../../components/admin/SaveButton';
import ImageUploader from '../../components/admin/ImageUploader';
import AdminPageHeader from '../../components/admin/ui/AdminPageHeader';

export default function ArticleEditor() {
  const { slug: urlSlug } = useParams<{ slug: string }>();
  const isNew = urlSlug === 'new' || window.location.pathname.endsWith('/new');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [subItems, setSubItems] = useState<any[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [availableForms, setAvailableForms] = useState<Form[]>([]);
  const [newCategory, setNewCategory] = useState('');

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<Article>({
    defaultValues: {
      id: '',
      title: '',
      slug: '',
      summary: '',
      content: '',
      coverImage: '',
      categoryId: '',
      seoKeywords: [],
      relatedServiceIds: [],
      showForm: false,
      formId: 'default-contact',
      isPublished: false,
    }
  });


  const isPublished = watch('isPublished');
  const showForm = watch('showForm');

  useEffect(() => {
    setSubItems(pageService.getAll().filter(p => p.template === 'SUB_ITEM'));
    setAvailableForms(formService.getAll());
    
    // Get unique categories from existing articles
    const allArts = articleService.getAll();
    const uniqueCategories = Array.from(new Set(allArts.map(a => a.categoryId).filter(Boolean)));
    setAvailableCategories(uniqueCategories);
    
    if (isNew) {
      setLoading(false);
      return;
    }

    if (urlSlug) {
      const article = articleService.getBySlug(urlSlug);
      if (article) {
        reset(article);
        setLoading(false);
      } else {
        navigate('/admin/articles');
      }
    }
  }, [urlSlug, isNew, reset, navigate]);

  const handleCreateCategory = () => {
    if (!newCategory.trim()) return;
    const cat = newCategory.trim();
    
    if (!availableCategories.includes(cat)) {
      setAvailableCategories([...availableCategories, cat]);
    }
    
    setValue('categoryId', cat);
    setNewCategory('');
  };

  const onSubmit = async (data: Article) => {
    setSaveStatus('saving');
    try {
      // Auto-generate slug if empty
      if (!data.slug || data.slug.trim() === '') {
        data.slug = data.title ? data.title.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-').replace(/(^-|-$)/g, '') : `article-${Date.now()}`;
        setValue('slug', data.slug);
      }
      
      if (isNew) {
        const newArticle = await articleService.create(data);
        navigate(`/admin/articles/${newArticle.slug}`, { replace: true });
      } else {
        await articleService.update(data.id, data);
        if (urlSlug !== data.slug) {
          navigate(`/admin/articles/${data.slug}`, { replace: true });
        }
      }
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('idle');
      console.error("儲存失敗:", error);
      alert("儲存失敗：" + (error instanceof Error ? error.message : String(error)));
    }
  };

  const onInvalid = (errors: any) => {
    console.log("Validation errors:", errors);
    alert("請檢查表單，有未填寫的必填欄位 (例如：標題或網址代稱)");
  };

  if (loading) return <div className="p-20 text-center">載入中...</div>;

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="max-w-7xl mx-auto pb-20">
      <input type="hidden" {...register('id')} />
      <AdminPageHeader
        title={isNew ? '新建文章' : '編輯文章'}
        backTo="/admin/articles"
        statusIndicator={
          <>
            <span className={`w-2 h-2 rounded-full ${isPublished ? 'bg-green-500' : 'bg-stone-300'}`} />
            <span className="text-xs text-stone-500 font-medium">{isPublished ? '已發布' : '草稿'}</span>
          </>
        }
        actionButtons={
          <>
            <button
              type="button"
              onClick={() => {
                setValue('isPublished', !isPublished);
                setTimeout(() => handleSubmit(onSubmit, onInvalid)(), 0);
              }}
              className={`px-4 py-2 rounded-xl text-sm font-bold border transition-colors ${
                isPublished 
                  ? 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50' 
                  : 'bg-primary text-white border-primary hover:bg-primary-light shadow-sm'
              }`}
            >
              {isPublished ? '切換為草稿' : '發布文章'}
            </button>
            <SaveButton status={saveStatus} />
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-[2rem] shadow-sm border border-stone-200 space-y-6">
          <div>
            <label className="block text-sm font-bold text-stone-700 mb-2">文章標題 <span className="text-red-500">*</span></label>
            <input {...register('title', { required: '請輸入文章標題' })} className={`w-full border p-3 rounded-xl text-lg font-bold outline-none transition-colors ${errors.title ? 'border-red-500 bg-red-50 focus:border-red-600' : 'border-stone-200 focus:border-primary'}`} placeholder="輸入文章標題..." />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-bold text-stone-700 mb-2">摘要 (Summary)</label>
            <textarea {...register('summary')} className="w-full border border-stone-200 p-3 rounded-xl h-24 outline-none focus:border-primary" placeholder="輸入文章摘要..." />
          </div>
          <div>
            <div className="mb-2">
              <label className="block text-sm font-bold text-stone-700">內容 (Markdown)</label>
            </div>
            <AdminMarkdownEditor 
              {...register('content')}
              className="w-full border border-stone-200 p-4 rounded-xl h-96 outline-none focus:border-primary font-mono text-sm leading-relaxed bg-white" 
              placeholder="使用 Markdown 語法輸入文章內容..." 
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-stone-200 space-y-5">
            <h3 className="font-bold text-stone-900 border-b border-stone-50 pb-3">基本設定</h3>
            <div>
              <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 ml-1">網址代稱 (Slug) <span className="text-red-500">*</span></label>
              <input {...register('slug', { required: '請輸入網址代稱' })} className={`w-full border p-3 rounded-xl text-sm font-mono outline-none transition-colors ${errors.slug ? 'border-red-500 bg-red-50 focus:border-red-600' : 'border-stone-200 focus:border-primary'}`} placeholder="例如：how-to-clean-bathroom" />
              {errors.slug && <p className="text-red-500 text-xs mt-1 ml-1">{errors.slug.message}</p>}
            </div>
            <div>
              <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 ml-1">分類 (Category)</label>
              <select {...register('categoryId')} className="w-full border border-stone-200 p-3 rounded-xl text-sm bg-white outline-none focus:border-primary mb-2">
                <option value="">-- 選擇分類 --</option>
                {availableCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleCreateCategory())}
                  className="flex-1 border border-stone-200 p-2 rounded-xl text-sm outline-none focus:border-primary" 
                  placeholder="輸入新分類..." 
                />
                <button 
                  type="button"
                  onClick={handleCreateCategory}
                  className="px-4 py-2 bg-stone-900 text-white rounded-xl text-sm font-bold hover:bg-stone-800 transition-colors whitespace-nowrap"
                >
                  建立
                </button>
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 ml-1">封面圖</label>
              <ImageUploader value={watch('coverImage')} onChange={(val) => setValue('coverImage', val)} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-stone-200 space-y-5">
            <h3 className="font-bold text-stone-900 border-b border-stone-50 pb-3">關聯服務</h3>
            <div>
              <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 ml-1">關聯服務 1</label>
              <select {...register('relatedServiceIds.0')} className="w-full border border-stone-200 p-3 rounded-xl text-sm bg-white outline-none focus:border-primary mb-3">
                <option value="">-- 無 --</option>
                {subItems.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}
              </select>
              
              <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 ml-1">關聯服務 2</label>
              <select {...register('relatedServiceIds.1')} className="w-full border border-stone-200 p-3 rounded-xl text-sm bg-white outline-none focus:border-primary mb-3">
                <option value="">-- 無 --</option>
                {subItems.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}
              </select>
              
              <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 ml-1">關聯服務 3</label>
              <select {...register('relatedServiceIds.2')} className="w-full border border-stone-200 p-3 rounded-xl text-sm bg-white outline-none focus:border-primary">
                <option value="">-- 無 --</option>
                {subItems.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}
              </select>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-stone-200 space-y-5">
            <h3 className="font-bold text-stone-900 border-b border-stone-50 pb-3 flex items-center gap-2">
              <MessageSquare size={18} className="text-[#8B5E34]" />
              行動呼籲設定 (CTA)
            </h3>
            <div className="space-y-4">
              <label className="flex items-center gap-3 p-3 rounded-xl border border-stone-100 hover:bg-stone-50 transition-colors cursor-pointer">
                <input 
                  type="checkbox" 
                  {...register('showForm')} 
                  className="w-5 h-5 rounded border-stone-300 text-[#8B5E34] focus:ring-[#8B5E34]"
                />
                <span className="text-sm font-bold text-stone-700">在文章末尾顯示表單</span>
              </label>

              {showForm && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 ml-1">選擇表單</label>
                  <select 
                    {...register('formId')} 
                    className="w-full border border-stone-200 p-3 rounded-xl text-sm bg-white outline-none focus:border-primary"
                  >
                    {availableForms.map(form => (
                      <option key={form.id} value={form.formId}>{form.name}</option>
                    ))}
                  </select>
                  <p className="text-[10px] text-stone-400 mt-2 ml-1 italic">
                    * 讀者提交表單後，您可以在「表單提交」中查看內容。
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
