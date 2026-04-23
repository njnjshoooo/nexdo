import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Page, DEFAULT_MAJOR_ITEM_TEMPLATE, DEFAULT_HOME_TEMPLATE, DEFAULT_SUB_ITEM_TEMPLATE, DEFAULT_GENERAL_TEMPLATE } from '../../types/admin';
import { pageService } from '../../services/pageService';
import { formService } from '../../services/formService';
import { Form } from '../../types/form';
import { ArrowLeft, Globe, PanelsTopLeft } from 'lucide-react';
import SaveButton from '../../components/admin/SaveButton';

import HomeEditor from './editors/HomeEditor';
import MajorItemEditor from './editors/MajorItemEditor';
import SubItemEditor from './editors/SubItemEditor';
import GeneralEditor from './editors/GeneralEditor';
import BlogEditor from './editors/BlogEditor';
import { DEFAULT_BLOG_TEMPLATE } from '../../types/admin';

export default function PageEditor() {
  console.log('PageEditor rendered');
  // 💡 這裡必須跟 App.tsx 的 :slug 對應
  const { slug: urlSlug } = useParams<{ slug: string }>(); 
  const isNew = urlSlug === 'new' || window.location.pathname.endsWith('/new');
  console.log('PageEditor rendered, urlSlug:', urlSlug, 'pathname:', window.location.pathname, 'isNew:', isNew);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('');
  const [forms, setForms] = useState<Form[]>([]);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const { register, control, handleSubmit, setValue, watch, reset } = useForm<Page>({
    defaultValues: {
      id: '',
      template: 'MAJOR_ITEM',
      content: DEFAULT_MAJOR_ITEM_TEMPLATE,
      isPublished: false,
    }
  });

  const template = watch('template');
  const isPublished = watch('isPublished');
  const id = watch('id');

  // Update activeTab and content when template changes
  useEffect(() => {
    if (template === 'HOME') {
      setActiveTab('home_hero');
      if (urlSlug === 'new') setValue('content', { ...DEFAULT_MAJOR_ITEM_TEMPLATE, home: DEFAULT_HOME_TEMPLATE });
    } else if (template === 'MAJOR_ITEM') {
      setActiveTab('hero');
      if (urlSlug === 'new') setValue('content', DEFAULT_MAJOR_ITEM_TEMPLATE);
    } else if (template === 'SUB_ITEM') {
      setActiveTab('sub_product');
      if (urlSlug === 'new') setValue('content', { ...DEFAULT_MAJOR_ITEM_TEMPLATE, subItem: DEFAULT_SUB_ITEM_TEMPLATE });
    } else if (template === 'GENERAL') {
      setActiveTab('general_blocks');
      if (urlSlug === 'new') setValue('content', { ...DEFAULT_MAJOR_ITEM_TEMPLATE, general: DEFAULT_GENERAL_TEMPLATE });
    } else if (template === 'BLOG') {
      setActiveTab('blog_hero');
      if (urlSlug === 'new') setValue('content', { ...DEFAULT_MAJOR_ITEM_TEMPLATE, blog: DEFAULT_BLOG_TEMPLATE });
    }
  }, [template, urlSlug, setValue]);

  useEffect(() => {
    console.log('PageEditor useEffect urlSlug:', urlSlug, 'isNew:', isNew);
    setForms(formService.getAll());
    
    if (isNew) {
      console.log('PageEditor: isNew is true, setting loading false');
      setActiveTab('hero'); // Default for MAJOR_ITEM
      setLoading(false);
      return;
    }

    if (urlSlug) {
      setLoading(true);
      // 💡 關鍵：從 service 撈出所有頁面，用 slug 去比對
      const allPages = pageService.getAll();
      const page = allPages.find(p => p.slug === urlSlug);

      if (page) {
        reset(page); // 這裡會把 template 設進去，模板才會顯示
        
        // 根據 template 預設 activeTab
        if (page.template === 'HOME') setActiveTab('home_hero');
        else if (page.template === 'MAJOR_ITEM') setActiveTab('hero');
        else if (page.template === 'SUB_ITEM') setActiveTab('sub_product');
        else if (page.template === 'GENERAL') setActiveTab('general_blocks');
        else if (page.template === 'BLOG') setActiveTab('blog_hero');
        
        setLoading(false);
      } else {
        // 找不到 slug 就滾回列表
        console.error("找不到該 Slug 的頁面:", urlSlug);
        navigate('/admin/pages');
      }
    } else {
      console.log('PageEditor: urlSlug is undefined/null and not new');
      // 如果沒有 slug，可能是還沒載入，先不設 loading false
    }
  }, [urlSlug, isNew, reset, navigate]);

  // 檢查你的 pageService.update 是否有包含 slug
  const onSubmit = async (data: Page) => {
    setSaveStatus('saving');
    try {
      if (isNew) {
        // 💡 修正：新增頁面時呼叫 create
        const newPage = pageService.create(data.title, data.template);
        // 更新新頁面的內容
        pageService.update(newPage.id, { ...data, id: newPage.id });
        navigate(`/admin/pages/${newPage.slug}`, { replace: true });
      } else {
        pageService.update(data.id, data);
        if (urlSlug !== data.slug) {
          navigate(`/admin/pages/${data.slug}`, { replace: true });
        }
      }
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('idle');
      console.error("儲存失敗:", error);
    }
  };

  if (loading) return <div className="p-20 text-center">載入中...</div>;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-7xl mx-auto pb-20">
      {/* 頂部動作列 */}
      <div className="flex items-center justify-between mb-8 sticky top-0 bg-stone-50/90 backdrop-blur-md py-4 z-20 border-b border-stone-200">
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => navigate('/admin/pages')} className="p-2 hover:bg-stone-200 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-stone-900">{id ? '頁面編輯' : '新建頁面'}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`w-2 h-2 rounded-full ${isPublished ? 'bg-green-500' : 'bg-stone-300'}`} />
              <span className="text-xs text-stone-500 font-medium">{isPublished ? '已發布' : '草稿'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setValue('isPublished', !isPublished)}
            className="px-4 py-2 rounded-xl text-sm font-bold bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
          >
            {isPublished ? '切換為草稿' : '發布頁面'}
          </button>
          <SaveButton status={saveStatus} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* 左側：基本設定 (Slug 恢復) */}
        <div className="lg:sticky lg:top-24 space-y-6 self-start">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 space-y-5">
            <h3 className="font-bold text-stone-900 flex items-center gap-2 border-b border-stone-50 pb-3">
              <PanelsTopLeft size={18} className="text-stone-400" /> 基本設定
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 ml-1">頁面標題</label>
                <input {...register('title')} className="w-full border border-stone-200 p-3 rounded-xl text-sm focus:border-stone-900 outline-none" placeholder="例如：居住安全" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 ml-1">網址代稱 (Slug)</label>
                <input {...register('slug')} className="w-full border border-stone-200 p-3 rounded-xl text-sm font-mono focus:border-stone-900 outline-none" placeholder="home-safety" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 ml-1">模板類型</label>
                <select {...register('template')} disabled={!isNew} className={`w-full border border-stone-200 p-3 rounded-xl text-sm ${!isNew ? 'bg-stone-50 text-stone-400 cursor-not-allowed' : 'bg-white text-stone-900'}`}>
                  <option value="HOME">首頁模板</option>
                  <option value="MAJOR_ITEM">大項目模板</option>
                  <option value="SUB_ITEM">子項目模板</option>
                  <option value="GENERAL">通用模板</option>
                  <option value="BLOG">部落格模板</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
            <div className="p-4 bg-stone-50 border-b border-stone-200 font-bold text-[11px] text-stone-400 uppercase tracking-widest">內容區塊導覽</div>
            <nav className="flex flex-col">
              {template === 'HOME' && (
                <>
                  <TabButton active={activeTab === 'home_hero'} label="Hero 區塊" onClick={() => setActiveTab('home_hero')} />
                  <TabButton active={activeTab === 'home_secondary'} label="服務項目" onClick={() => setActiveTab('home_secondary')} />
                  <TabButton active={activeTab === 'home_more_services'} label="我們還提供" onClick={() => setActiveTab('home_more_services')} />
                  <TabButton active={activeTab === 'home_consultation'} label="預約流程" onClick={() => setActiveTab('home_consultation')} />
                  <TabButton active={activeTab === 'home_testimonials'} label="客戶心得" onClick={() => setActiveTab('home_testimonials')} />
                  <TabButton active={activeTab === 'home_form'} label="表單開關" onClick={() => setActiveTab('home_form')} />
                </>
              )}
              {template === 'MAJOR_ITEM' && (
                <>
                  <TabButton active={activeTab === 'hero'} label="Hero 區塊" onClick={() => setActiveTab('hero')} />
                  <TabButton active={activeTab === 'services'} label="服務清單" onClick={() => setActiveTab('services')} />
                  <TabButton active={activeTab === 'cases'} label="成功案例" onClick={() => setActiveTab('cases')} />
                  <TabButton active={activeTab === 'home_form'} label="表單開關" onClick={() => setActiveTab('home_form')} />
                </>
              )}
              {template === 'SUB_ITEM' && (
                <>
                  <TabButton active={activeTab === 'sub_product'} label="產品基本資訊" onClick={() => setActiveTab('sub_product')} />
                  <TabButton active={activeTab === 'sub_intro'} label="服務介紹" onClick={() => setActiveTab('sub_intro')} />
                  <TabButton active={activeTab === 'sub_partners'} label="專業夥伴" onClick={() => setActiveTab('sub_partners')} />
                  <TabButton active={activeTab === 'sub_cases'} label="真實案例" onClick={() => setActiveTab('sub_cases')} />
                  <TabButton active={activeTab === 'sub_core_services'} label="服務流程" onClick={() => setActiveTab('sub_core_services')} />
                  <TabButton active={activeTab === 'sub_faqs'} label="常見問題" onClick={() => setActiveTab('sub_faqs')} />
                  <TabButton active={activeTab === 'sub_related'} label="關聯服務" onClick={() => setActiveTab('sub_related')} />
                  <TabButton active={activeTab === 'home_form'} label="表單開關" onClick={() => setActiveTab('home_form')} />
                </>
              )}
              {template === 'GENERAL' && (
                <>
                  <TabButton active={activeTab === 'general_blocks'} label="內容區塊" onClick={() => setActiveTab('general_blocks')} />
                </>
              )}
              {template === 'BLOG' && (
                <>
                  <TabButton active={activeTab === 'blog_hero'} label="HERO區塊" onClick={() => setActiveTab('blog_hero')} />
                  <TabButton active={activeTab === 'blog_category'} label="分類導覽列表" onClick={() => setActiveTab('blog_category')} />
                  <TabButton active={activeTab === 'blog_featured'} label="主推文章" onClick={() => setActiveTab('blog_featured')} />
                  <TabButton active={activeTab === 'blog_popular'} label="熱門文章列表" onClick={() => setActiveTab('blog_popular')} />
                  <TabButton active={activeTab === 'blog_services'} label="推薦服務" onClick={() => setActiveTab('blog_services')} />
                </>
              )}
            </nav>
          </div>
        </div>

        {/* 右側：編輯內容 (傳遞必要參數) */}
        <div className="lg:col-span-3">
          {template === 'HOME' && <HomeEditor control={control} register={register} activeTab={activeTab} watch={watch} setValue={setValue} forms={forms} />}
          {template === 'MAJOR_ITEM' && <MajorItemEditor control={control} register={register} activeTab={activeTab} watch={watch} setValue={setValue} forms={forms} />}
          {template === 'SUB_ITEM' && <SubItemEditor control={control} register={register} activeTab={activeTab} watch={watch} setValue={setValue} forms={forms} />}
          {template === 'GENERAL' && <GeneralEditor control={control} register={register} activeTab={activeTab} watch={watch} setValue={setValue} forms={forms} />}
          {template === 'BLOG' && <BlogEditor control={control} register={register} activeTab={activeTab} watch={watch} setValue={setValue} />}
        </div>
      </div>
    </form>
  );
}

function TabButton({ active, label, onClick }: any) {
  return (
    <button type="button" onClick={onClick} className={`px-6 py-4 text-left text-sm transition-all border-l-4 ${active ? 'border-stone-900 bg-stone-50 text-stone-900 font-bold' : 'border-transparent text-stone-500 hover:bg-stone-50'}`}>
      {label}
    </button>
  );
}
