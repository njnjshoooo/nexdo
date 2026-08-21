import fs from 'fs';

const filePath = 'src/pages/DynamicPage.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const oldEffect = `  useEffect(() => {
    // 1. 強制設定：如果沒有 slug，就是 'home'
    const currentSlug = urlSlug || 'home';
    
    // 2. 處理分類路徑
    const fullSlug = category ? \`\${category}/\${currentSlug}\` : currentSlug;
    
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
  }, [urlSlug, category]);`;

const newEffect = `  useEffect(() => {
    const loadPage = () => {
      // 1. 強制設定：如果沒有 slug，就是 'home'
      const currentSlug = urlSlug || 'home';
      
      // 2. 處理分類路徑
      const fullSlug = category ? \`\${category}/\${currentSlug}\` : currentSlug;
      
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
  }, [urlSlug, category]);`;

if (content.includes('useEffect(() => {') && !content.includes('window.addEventListener(\'pages_refreshed\'')) {
    content = content.replace(oldEffect, newEffect);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Patched DynamicPage.tsx');
} else {
    console.log('Could not patch, content not found or already patched.');
}
