import { WidgetRenderer } from '../components/widgets';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { pageService } from '../services/pageService';
import { formService } from '../services/formService';
import { useForm } from '../hooks/useForm';
import { Page, GeneralBlock } from '../types/admin';

// Helper component to load form data using the hook
function FormBlock({ formId, pageSlug, pageTitle, blockId }: { formId: string, pageSlug: string, pageTitle: string, blockId: string }) {
  const form = useForm(formId);
  if (!form) return null;
  return (
    <section key={blockId} id={blockId} className="py-16 bg-[#FDF8F3]">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-xl">
          <DynamicForm form={form} pageSlug={pageSlug} pageTitle={pageTitle} />
        </div>
      </div>
    </section>
  );
}
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { motion } from 'framer-motion'; // 確保你的專案是用 framer-motion 或 motion
import { 
  ArrowUpRight,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import DynamicForm from '../components/form/DynamicForm';

// 圖示對照表：確保後台選的圖示能正確顯示
// (已移除)

export default function GeneralPage({ page: propPage }: { page?: Page | null }) {
  const { slug, category } = useParams<{ slug: string, category: string }>();
  const navigate = useNavigate();

  // 1. 直接判斷：決定要顯示哪一頁
  const currentSlug = slug || 'home';
  const fullSlug = category ? `${category}/${currentSlug}` : currentSlug;
  const currentPage = propPage || pageService.getBySlug(fullSlug);

  // 2. 避免白屏：如果真的找不到資料，顯示錯誤提示
  if (!currentPage || !currentPage.content.general) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4 bg-stone-50">
        <h1 className="text-2xl font-bold text-stone-900">找不到頁面</h1>
        <p className="text-stone-500">此頁面可能尚未建立或路徑不正確 (Slug: {currentSlug})。</p>
        <button 
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-stone-800 text-white rounded-lg hover:bg-stone-700 transition-colors"
        >
          回到首頁
        </button>
      </div>
    );
  }

  const { blocks } = currentPage.content.general;

  return (
    <div className="min-h-screen bg-white pb-20">
      {blocks?.filter((b: GeneralBlock) => b.enabled !== false).map((block: GeneralBlock, index: number) => {
        const isFirstBlock = index === 0;
        // 處理錨點捲動
        const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, link?: string, type?: string) => {
          if (type === 'FORM') {
            e.preventDefault();
            const form = formService.getById(link || '');
            if (form) {
              const element = document.getElementById(form.formId);
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
                return;
              }
            }
          }

          if (link?.startsWith('#')) {
            e.preventDefault();
            const element = document.getElementById(link.substring(1));
            if (element) {
              element.scrollIntoView({ behavior: 'smooth' });
            }
          }
        };

        return (
          <WidgetRenderer 
            key={block.id} 
            block={block} 
            isFirstBlock={isFirstBlock} 
            navigate={navigate} 
            handleAnchorClick={handleAnchorClick} 
            currentPage={currentPage} 
          />
        );
})}
</div>
);
}

