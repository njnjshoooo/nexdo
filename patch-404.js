import fs from 'fs';

const filePath = 'src/pages/DynamicPage.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Add import
if (!content.includes('react-helmet-async')) {
  content = content.replace(
    "import React, { useEffect, useState } from 'react';",
    "import React, { useEffect, useState } from 'react';\nimport { Helmet } from 'react-helmet-async';"
  );
}

// Replace the 404 block
const oldBlock = `  // 3. 如果沒找到資料，顯示 404 畫面
  if (!pageData) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-stone-50">
        <h1 className="text-2xl font-bold text-stone-800">找不到頁面</h1>
        <p className="text-stone-500 mt-2">嘗試搜尋的 Slug: {urlSlug || 'home'}</p>
        <button 
          onClick={() => window.location.href = '/'}
          className="mt-6 px-4 py-2 bg-orange-500 text-white rounded-full"
        >
          回到首頁
        </button>
      </div>
    );
  }`;

const newBlock = `  // 3. 如果沒找到資料，顯示 404 畫面
  if (!pageData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 px-4 text-center">
        <Helmet>
          <title>404 找不到頁面 | 好齡居</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
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
  }`;

content = content.replace(oldBlock, newBlock);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Patched DynamicPage.tsx');
