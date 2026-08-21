import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { pageService } from '../services/pageService';
import { articleService } from '../services/articleService';
import { Page } from '../types/admin';
import { Article } from '../types/article';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<{type: '服務項目' | '精選文章' | '頁面', title: string, description: string, url: string}[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (!query) return;

    const lowerQuery = query.toLowerCase();

    // Helper to recursively extract all string values from an object for deep searching
    const extractText = (obj: any): string => {
      if (typeof obj === 'string') return obj.toLowerCase();
      if (Array.isArray(obj)) return obj.map(extractText).join(' ');
      if (typeof obj === 'object' && obj !== null) {
        return Object.values(obj).map(extractText).join(' ');
      }
      return '';
    };

    // Fetch dynamic content from services
    const allPages = pageService.getAll().filter(p => p.isPublished !== false); // Default to true if undefined
    const allArticles = articleService.getAll().filter(a => a.isPublished !== false);

    const pageResults = allPages
      .filter(page => {
        const titleMatch = page.title.toLowerCase().includes(lowerQuery);
        const contentMatch = extractText(page.content).includes(lowerQuery);
        return titleMatch || contentMatch;
      })
      .map(page => ({
        type: (page.template === 'SUB_ITEM' || page.template === 'MAJOR_ITEM') ? '服務項目' as const : '頁面' as const,
        title: page.title,
        description: page.content.hero?.description || page.content.general?.blocks?.[0]?.hero2?.description || '點擊查看詳細內容',
        url: `/${page.slug}`
      }));

    const articleResults = allArticles
      .filter(article => {
        const titleMatch = article.title.toLowerCase().includes(lowerQuery);
        const summaryMatch = article.summary?.toLowerCase().includes(lowerQuery);
        const contentMatch = article.content?.toLowerCase().includes(lowerQuery);
        return titleMatch || summaryMatch || contentMatch;
      })
      .map(article => ({
        type: '精選文章' as const,
        title: article.title,
        description: article.summary || '',
        url: `/blog/${article.slug || article.id}`
      }));

    const finalResults = [...pageResults, ...articleResults];
    setResults(finalResults);
    setHasSearched(true);

    // GTM: Push dataLayer event when search yields 0 results
    if (finalResults.length === 0 && query.trim() !== '') {
      if (typeof window !== 'undefined' && (window as any).dataLayer) {
        (window as any).dataLayer.push({
          event: 'search_no_results',
          search_term: query
        });
      }
    } else if (finalResults.length > 0 && query.trim() !== '') {
        // GTM: Optional, push search success
      if (typeof window !== 'undefined' && (window as any).dataLayer) {
        (window as any).dataLayer.push({
          event: 'search_success',
          search_term: query,
          result_count: finalResults.length
        });
      }
    }
  }, [query]);

  return (
    <div className="pt-24 pb-16 px-4 max-w-4xl mx-auto min-h-[60vh]">
      <h1 className="text-3xl font-bold mb-8">關於「{query}」的搜尋結果</h1>
      
      {results.length > 0 ? (
        <div className="grid gap-6">
          {results.map((result, idx) => (
            <Link to={result.url} key={idx} className="block p-6 bg-white rounded-xl shadow-sm border border-stone-200 hover:border-primary transition-colors">
              <span className="inline-block px-2 py-1 bg-stone-100 text-stone-600 text-xs font-medium rounded mb-2">{result.type}</span>
              <h2 className="text-xl font-bold mb-2">{result.title}</h2>
              <p className="text-stone-600 text-sm line-clamp-2">{result.description}</p>
            </Link>
          ))}
        </div>
      ) : hasSearched ? (
        <div className="text-center py-16 bg-stone-50 rounded-2xl">
          <p className="text-stone-500 mb-6 text-lg">抱歉，找不到符合「<span className="font-bold text-stone-700">{query}</span>」的結果。</p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
             <Link to="/" className="px-6 py-3 bg-primary text-white rounded-full font-medium hover:bg-primary/90 transition-colors">返回首頁</Link>
             <Link to="/#contact" className="px-6 py-3 bg-white text-primary border border-primary rounded-full font-medium hover:bg-stone-50 transition-colors">聯絡我們協助尋找</Link>
          </div>
        </div>
      ) : (
         <div className="text-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
         </div>
      )}
    </div>
  );
}
