import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { pageService } from '../services/pageService';
import { productService } from '../services/productService';
import { articleService } from '../services/articleService';
import { Article } from '../types/article';
import { DEFAULT_BLOG_TEMPLATE } from '../types/admin';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function Blog() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<string[]>(['全部']);
  const [activeCategory, setActiveCategory] = useState('全部');
  const [currentPage, setCurrentPage] = useState(1);

  const page = pageService.getBySlug('blog');
  const blogConfig = page?.content?.blog || DEFAULT_BLOG_TEMPLATE;
  const postsPerPage = blogConfig.postsPerPage || 9;

  useEffect(() => {
    const allArticles = articleService.getAll().filter(a => a.isPublished);
    // Sort by date descending
    allArticles.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    setArticles(allArticles);

    // Dynamic categories from articles
    const articleCategories = Array.from(new Set(allArticles.map(a => a.categoryId).filter(Boolean)));
    
    // Use configured categories if showCategoryNav is true
    if (blogConfig.showCategoryNav) {
      // navCategories is the authoritative list for display and order
      const allowedCategories = blogConfig.navCategories || blogConfig.categories || [];
      
      // Only keep categories that are in the allowed list AND have at least one article
      const finalCats = allowedCategories.filter(cat => articleCategories.includes(cat));

      setCategories(['全部', ...finalCats]);
    } else {
      setCategories([]);
    }
  }, [blogConfig.showCategoryNav, blogConfig.categories, blogConfig.navCategories]);

  // Reset page when category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory]);

  const filteredArticles = activeCategory === '全部' 
    ? articles 
    : articles.filter(a => a.categoryId === activeCategory);

  let featuredPost = null;
  if (blogConfig.featuredPostId && blogConfig.featuredPostId !== 'latest') {
    featuredPost = articles.find(a => a.id === blogConfig.featuredPostId);
  }
  if (!featuredPost && articles.length > 0) {
    featuredPost = articles[0];
  }

  // Get interested posts
  const interestedPosts = blogConfig.interestedPostIds
    ?.map(id => articles.find(a => a.id === id))
    .filter((a): a is Article => !!a) || [];

  // If not enough interested posts, fallback to recent posts
  const sidebarPosts = interestedPosts.length > 0 
    ? interestedPosts.slice(0, 3)
    : articles.filter(a => a.id !== featuredPost?.id).slice(0, 3);

  // Pagination logic
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const displayPosts = filteredArticles.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredArticles.length / postsPerPage);

  // Get recommended services
  const recommendedServices = blogConfig.recommendedServiceIds
    ?.map(id => pageService.getById(id))
    .filter(p => !!p) || [];

  return (
    <div className="pt-20"> {/* Add pt-20 to avoid overlapping with Header */}
      {/* Hero Section */}
      <div className="relative h-[40vh] min-h-[300px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={blogConfig.heroImage} 
            alt="Blog Hero" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-stone-900/40" />
        </div>
        <div className="relative z-10 text-center px-6">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{blogConfig.heroTitle}</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Category Pill Navigation */}
        {blogConfig.showCategoryNav && categories.length > 1 && (
          <div className="flex gap-3 mb-12 overflow-x-auto pb-4 scrollbar-hide">
            {categories.map((cat) => (
              <button 
                key={cat} 
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 ${
                  activeCategory === cat 
                    ? 'bg-stone-900 text-white shadow-md transform scale-105' 
                    : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50 hover:border-stone-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
        
        {/* 70/30 Layout for Featured and Interested */}
        {activeCategory === '全部' && (
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 mb-16">
            {/* Left 70%: Featured Post */}
            <div className="lg:col-span-7">
              {featuredPost && (
                <Link to={`/blog/${featuredPost.slug}`} className="block group h-full">
                  <div className="bg-white rounded-[2rem] shadow-sm border border-stone-200 overflow-hidden transition-all hover:shadow-md h-full flex flex-col">
                    <div className="aspect-[2/1] overflow-hidden">
                      <img 
                        src={featuredPost.coverImage || 'https://picsum.photos/seed/blog/1200/600'} 
                        alt={featuredPost.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="p-8 flex flex-col flex-grow">
                      {featuredPost.categoryId && (
                        <span className="text-[#8B5E34] text-sm font-bold tracking-wider mb-2">{featuredPost.categoryId}</span>
                      )}
                      <h2 className="text-3xl font-bold text-stone-900 mb-4 group-hover:text-[#8B5E34] transition-colors">{featuredPost.title}</h2>
                      <p className="text-stone-600 line-clamp-3 mb-6 flex-grow">{featuredPost.summary || featuredPost.content.substring(0, 150)}</p>
                      <div className="text-sm text-stone-400 font-medium mt-auto">
                        {new Date(featuredPost.updatedAt).toLocaleDateString('zh-TW')}
                      </div>
                    </div>
                  </div>
                </Link>
              )}
            </div>
            
            {/* Right 30%: Interested Posts */}
            <div className="lg:col-span-3">
              <div className="bg-white p-6 rounded-[2rem] border border-stone-200 shadow-sm h-full flex flex-col">
                <h3 className="font-bold text-stone-900 mb-6 text-xl border-b border-stone-100 pb-4">
                  你可能有興趣
                </h3>
                <div className="space-y-6 flex-grow">
                  {sidebarPosts.map(post => (
                    <Link key={post.id} to={`/blog/${post.slug}`} className="flex gap-4 group">
                      <div className="w-24 h-24 bg-stone-100 rounded-xl flex-shrink-0 overflow-hidden">
                        <img 
                          src={post.coverImage || 'https://picsum.photos/seed/blog/200/200'} 
                          alt={post.title} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex flex-col justify-center">
                        {post.categoryId && (
                          <span className="text-[#8B5E34] text-[10px] font-bold tracking-wider mb-1">{post.categoryId}</span>
                        )}
                        <h4 className="font-bold text-sm text-stone-900 group-hover:text-[#8B5E34] transition-colors line-clamp-2">{post.title}</h4>
                        <p className="text-xs text-stone-400 mt-2 font-medium">{new Date(post.updatedAt).toLocaleDateString('zh-TW')}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3-Column Post Grid */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-stone-900 mb-8">
            {activeCategory === '全部' ? '所有文章' : `${activeCategory} 相關文章`}
          </h3>
          
          {displayPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayPosts.map(post => (
                <Link key={post.id} to={`/blog/${post.slug}`} className="block group">
                  <div className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden transition-all hover:shadow-md h-full flex flex-col">
                    <div className="aspect-[3/2] overflow-hidden">
                      <img 
                        src={post.coverImage || 'https://picsum.photos/seed/blog/600/400'} 
                        alt={post.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="p-6 flex flex-col flex-grow">
                      {post.categoryId && (
                        <span className="text-[#8B5E34] text-xs font-bold tracking-wider mb-2">{post.categoryId}</span>
                      )}
                      <h3 className="text-xl font-bold text-stone-900 mb-3 group-hover:text-[#8B5E34] transition-colors line-clamp-2">{post.title}</h3>
                      <p className="text-stone-600 text-sm line-clamp-2 mb-4 flex-grow">{post.summary || post.content.substring(0, 100)}</p>
                      <div className="text-xs text-stone-400 font-medium mt-auto">
                        {new Date(post.updatedAt).toLocaleDateString('zh-TW')}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-stone-50 rounded-3xl border border-stone-200 border-dashed">
              <p className="text-stone-500">此分類目前沒有文章</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mb-20">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-full border border-stone-200 text-stone-600 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-10 h-10 rounded-full font-bold text-sm transition-colors ${
                  currentPage === i + 1 
                    ? 'bg-stone-900 text-white' 
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                {i + 1}
              </button>
            ))}
            
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-full border border-stone-200 text-stone-600 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}

        {/* Recommended Services Module */}
        {recommendedServices.length > 0 && (
          <section className="mt-20 border-t border-stone-200 pt-16">
            <h2 className="text-3xl font-bold text-stone-900 mb-8">好鄰居的貼心推薦</h2>
            <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-x-auto md:overflow-x-visible snap-x snap-mandatory scrollbar-hide pb-4 md:pb-0 -mx-6 px-6 md:mx-0 md:px-0">
              {recommendedServices.map(page => (
                <motion.div
                  key={page.id}
                  className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col border border-stone-100 min-w-[83%] md:min-w-0 snap-start flex-shrink-0"
                  whileHover={{ y: -5 }}
                >
                  <div className="w-full h-48 bg-stone-200 rounded-xl mb-6 overflow-hidden">
                    <img 
                      src={(page.content.subItem?.productId ? productService.getById(page.content.subItem.productId)?.image : undefined) || page.content.hero.backgroundImage || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=2070&auto=format&fit=crop'} 
                      alt={page.title} 
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  
                  <h3 className="text-xl font-bold text-stone-900 mb-3">{page.title}</h3>
                  <p className="text-stone-600 text-sm leading-relaxed mb-8 flex-grow line-clamp-3">
                    {(page.content.subItem?.productId ? productService.getById(page.content.subItem.productId)?.description : undefined) || page.content.hero.description}
                  </p>
                  
                  <div className="flex justify-end mt-auto">
                    <Link 
                      to={`/${page.slug}`}
                      className="inline-flex items-center gap-1 bg-[#885200] hover:bg-[#663D00] text-white text-sm font-medium px-5 py-2 rounded-full transition-colors"
                    >
                      服務介紹
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
