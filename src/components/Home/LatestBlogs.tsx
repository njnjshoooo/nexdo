import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock } from 'lucide-react';
import { articleService } from '../../services/articleService';
import { Article } from '../../types/article';

export default function LatestBlogs({ data }: { data: any }) {
  const [articles, setArticles] = useState<Article[]>([]);
  
  const title = data?.title || '好齡居誌';
  const limit = data?.limit || 6;

  useEffect(() => {
    const allArticles = articleService.getAll().filter(a => a.isPublished);
    // Sort by date descending
    allArticles.sort((a, b) => new Date(b.publishedAt || b.updatedAt).getTime() - new Date(a.publishedAt || a.updatedAt).getTime());
    
    // Prioritize recommended, then latest
    const recommended = allArticles.filter(a => a.isRecommended);
    const others = allArticles.filter(a => !a.isRecommended);
    
    setArticles([...recommended, ...others].slice(0, limit));
  }, [limit]);

  if (articles.length === 0) return null;

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-stone-900 tracking-tight mb-6">{title}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {articles.map((article, index) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link 
                to={`/blog/${article.slug || article.id}`}
                className="group flex flex-col h-full bg-white rounded-[2rem] border border-stone-200 overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
                  {article.coverImage ? (
                    <img 
                      src={article.coverImage} 
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-300">
                      <span className="font-medium">No Image</span>
                    </div>
                  )}
                  {article.categoryId && (
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-bold text-stone-800 shadow-sm">
                      {article.categoryId}
                    </div>
                  )}
                </div>

                <div className="p-8 flex flex-col flex-1">
                  <div className="flex items-center gap-4 text-sm text-stone-500 mb-4 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Clock size={16} />
                      {new Date(article.publishedAt || article.updatedAt).toLocaleDateString('zh-TW')}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-stone-900 mb-4 group-hover:text-primary transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-stone-600 mb-6 line-clamp-3 leading-relaxed">
                    {article.summary}
                  </p>
                  
                  <div className="mt-auto pt-6 border-t border-stone-100 flex items-center justify-between text-primary font-bold">
                    <span>閱讀全文</span>
                    <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center">
          <Link 
            to="/blog"
            className="inline-flex items-center gap-3 bg-stone-900 text-white px-8 py-4 rounded-full font-bold hover:bg-stone-800 transition-all shadow-sm hover:shadow-md"
          >
            前往好齡居誌
            <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </section>
  );
}
