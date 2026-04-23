import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { articleService } from '../services/articleService';
import { pageService } from '../services/pageService';
import { productService } from '../services/productService';
import { formService } from '../services/formService';
import { Article } from '../types/article';
import { Page } from '../types/admin';
import { Form } from '../types/form';
import Markdown from 'react-markdown';
import { ArrowLeft, Calendar, Tag, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import DynamicForm from '../components/form/DynamicForm';

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [ctaForm, setCtaForm] = useState<Form | null>(null);
  const [loadedRelatedServices, setLoadedRelatedServices] = useState<any[]>([]);

  useEffect(() => {
    const loadRelated = async () => {
      if (slug) {
        const foundArticle = articleService.getBySlug(slug);
        if (foundArticle && foundArticle.isPublished) {
          setArticle(foundArticle);
          
          // Fetch related services
          if (foundArticle.relatedServiceIds && foundArticle.relatedServiceIds.length > 0) {
            const services = await Promise.all(foundArticle.relatedServiceIds.map(async id => {
              const p = pageService.getById(id);
              if (!p) return null;

              let image = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=2070&auto=format&fit=crop';
              let description = '';

              if (p.content.subItem?.productId) {
                const product = await productService.getById(p.content.subItem.productId);
                if (product) {
                  if (product.image) image = product.image;
                  if (product.description) description = product.description;
                }
              }

              return {
                id: p.id,
                slug: p.slug,
                title: p.title,
                image,
                description
              };
            }));
            setLoadedRelatedServices(services.filter(Boolean));
          } else {
            setLoadedRelatedServices([]);
          }

          // Fetch CTA form
          if (foundArticle.showForm && foundArticle.formId) {
            const form = formService.getByFormId(foundArticle.formId);
            if (form) {
              setCtaForm(form);
            }
          }
        } else {
          navigate('/blog');
        }
      }
    };
    loadRelated();
  }, [slug, navigate]);

  if (!article) return <div className="p-20 text-center">載入中...</div>;

  return (
    <div className="bg-stone-50 min-h-screen pb-20 pt-20">
      {/* Hero Section */}
      <div className="relative h-[50vh] min-h-[400px] flex items-end justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={article.coverImage || 'https://picsum.photos/seed/blog/1920/1080'} 
            alt={article.title} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-stone-900/40 to-transparent" />
        </div>
        <div className="relative z-10 w-full max-w-4xl mx-auto px-6 pb-16">
          <button 
            onClick={() => navigate('/blog')} 
            className="flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            返回好齡居誌
          </button>
          
          {article.categoryId && (
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#8B5E34] text-white text-sm font-bold tracking-wider mb-6">
              {article.categoryId}
            </span>
          )}
          
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
            {article.title}
          </h1>
          
          <div className="flex items-center gap-6 text-white/80 text-sm font-medium">
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              {new Date(article.updatedAt).toLocaleDateString('zh-TW')}
            </div>
            {article.seoKeywords && article.seoKeywords.length > 0 && (
              <div className="flex items-center gap-2">
                <Tag size={16} />
                {article.seoKeywords.join(', ')}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-3xl mx-auto px-6 py-24 relative z-20">
        <div className="mb-20">
          {article.summary && (
            <div className="text-lg italic text-stone-500 leading-relaxed mb-16 pb-16 border-b border-stone-200">
              {article.summary}
            </div>
          )}
          
          <div className="prose prose-stone prose-lg max-w-none prose-h2:text-2xl prose-h2:font-bold prose-h2:text-[#4A5D3B] prose-h2:mb-3 prose-headings:text-stone-900 prose-p:text-stone-700 prose-p:leading-relaxed prose-strong:text-stone-900 prose-blockquote:border-[#8B5E34] prose-blockquote:bg-stone-100/50 prose-blockquote:p-8 prose-blockquote:rounded-2xl prose-blockquote:not-italic">
            <Markdown>{article.content}</Markdown>
          </div>
        </div>

        {/* CTA Form Section */}
        {article.showForm && ctaForm && (
          <section className="mt-16 mb-20 bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-stone-200">
            <div className="max-w-xl mx-auto">
              <div className="text-center mb-10">
                <h2 className="text-2xl font-bold text-stone-900 mb-3">對此主題感興趣嗎？</h2>
                <p className="text-stone-500">歡迎填寫下方表單，我們將由專人為您提供進一步諮詢服務。</p>
              </div>
              <DynamicForm 
                form={ctaForm} 
                pageSlug={article.slug} 
                pageTitle={article.title}
              />
            </div>
          </section>
        )}

        {/* Related Services Module */}
        {loadedRelatedServices.length > 0 && (
          <section className="mt-20 border-t border-stone-200 pt-16">
            <h2 className="text-3xl font-bold text-stone-900 mb-8 text-center">好鄰居的貼心推薦</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loadedRelatedServices.map(service => (
                <motion.div
                  key={service.id}
                  className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col border border-stone-100"
                  whileHover={{ y: -5 }}
                >
                  <div className="w-full h-48 bg-stone-200 rounded-xl mb-6 overflow-hidden">
                    <img 
                      src={service.image} 
                      alt={service.title} 
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  
                  <h3 className="text-xl font-bold text-stone-900 mb-3">{service.title}</h3>
                  <p className="text-stone-600 text-sm leading-relaxed mb-8 flex-grow line-clamp-3">
                    {service.description}
                  </p>
                  
                  <div className="flex justify-end mt-auto">
                    <Link 
                      to={`/${service.slug}`}
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
