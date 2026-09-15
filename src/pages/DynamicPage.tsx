import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';
import { pageService } from '../services/pageService';
import { Page } from '../types/admin'; 
import SubItemPage from './SubItemPage';
import MajorItemPage from './MajorItemPage';
import GeneralPage from './GeneralPage';
import Home from './HomePage';
import { useAuth } from '../contexts/AuthContext'; // 
import Blog from './Blog'; // 

export default function DynamicPage() {
  const { slug: urlSlug, category } = useParams<{ slug: string, category: string }>();
  const [pageData, setPageData] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const loadPage = () => {
      // 1. 強制設定：如果沒有 slug，就是 'home'
      const currentSlug = urlSlug || 'home';
      
      // 2. 處理分類路徑
      const fullSlug = category ? `${category}/${currentSlug}` : currentSlug;
      
      console.log('--- 前台路由診斷 ---');
      console.log('網址請求的 Slug:', fullSlug);

      const allPages = pageService.getAll();
      
      // 💡 修正：優先嘗試完整路徑，若找不到且有分類，則嘗試單獨的 slug
      let found = allPages.find(p => p.slug?.toLowerCase() === fullSlug.toLowerCase());
      
      if (!found && category) {
        console.log('🔍 完整路徑找不到，嘗試單獨 Slug:', currentSlug);
        found = allPages.find(p => p.slug?.toLowerCase() === currentSlug.toLowerCase());
      }

      if (found) {
        console.log('✅ 成功找到資料:', found.title, '模板:', found.template);
        setPageData(found);
      } else {
        console.warn('❌ 找不到資料，可用 Slugs 有:', allPages.map(p => p.slug));
        setPageData(null);
      }

      setLoading(false);
    };

    loadPage();

    // Listen for pageService refresh so dynamic pages from DB can load correctly
    window.addEventListener('pages_refreshed', loadPage);
    return () => {
      window.removeEventListener('pages_refreshed', loadPage);
    };
  }, [urlSlug, category]);

  if (loading) return <div className="h-screen flex items-center justify-center text-stone-400">載入中...</div>;

  // 3. 如果沒找到資料，顯示 404 畫面
  if (!pageData || (!pageData.isPublished && user?.role !== 'admin')) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 px-4 text-center">
        <Helmet>
          <title>404 找不到頁面 | 好齡居</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <img src="/images/mascot/haohao-wave-3.png" alt="好好陪您找到方向" width="120" height="120" />
        <h1 className="text-4xl font-bold text-stone-800 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-stone-700 mb-4">找不到頁面</h2>
        <p className="text-stone-500 text-lg mb-8">抱歉，您尋找的網頁可能已被移除或網址有誤。</p>
        <button 
          onClick={() => window.location.href = '/'}
          className="px-8 py-3 bg-[#8B5E34] hover:bg-[#7a522d] transition-colors text-white rounded-full font-medium"
        >
          回到首頁
        </button>
      </div>
    );
  }

  // 4. 根據資料內的 template 決定去哪
  const { template } = pageData;

  // 💡 2. 加入首頁模板的判斷
  if (template === 'HOME') {
    return <Home page={pageData} />;
  }

  if (template === 'SUB_ITEM') {
    return <SubItemPage page={pageData} />;
  }
  
  if (template === 'MAJOR_ITEM') {
    return <MajorItemPage page={pageData} />;
  }

  if (template === 'BLOG') {
    return <Blog />;
  }
  
  // 預設走 GeneralPage
  return <GeneralPage page={pageData} />;
}
