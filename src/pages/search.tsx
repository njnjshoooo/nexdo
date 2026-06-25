import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { allInitialPages } from '../data/pages';
import { ALL_ARTICLES } from '../data/articles';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<{type: '服務項目' | '精選文章', title: string, description: string, url: string}[]>([]);

  useEffect(() => {
    if (!query) return;

    const lowerQuery = query.toLowerCase();

    const pageResults = allInitialPages
      .filter(page => 
        page.title.toLowerCase().includes(lowerQuery) || 
        (page.content.hero?.description && page.content.hero.description.toLowerCase().includes(lowerQuery))
      )
      .map(page => ({
        type: '服務項目' as const,
        title: page.title,
        description: page.content.hero?.description || '',
        url: `/${page.slug}`
      }));

    const articleResults = ALL_ARTICLES
      .filter(article => 
        article.title.toLowerCase().includes(lowerQuery) || 
        (article.summary && article.summary.toLowerCase().includes(lowerQuery))
      )
      .map(article => ({
        type: '精選文章' as const,
        title: article.title,
        description: article.summary || '',
        url: `/blog/${article.id}`
      }));

    setResults([...pageResults, ...articleResults]);
  }, [query]);

  return (
    <div className="pt-24 pb-16 px-4 max-w-4xl mx-auto">
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
      ) : (
        <div className="text-center py-16">
          <p className="text-stone-500 mb-6">抱歉，找不到符合「{query}」的結果。</p>
          <Link to="/" className="px-6 py-3 bg-primary text-white rounded-lg font-medium">返回首頁</Link>
        </div>
      )}
    </div>
  );
}
