// src/pages/HomePage.tsx
import React from 'react';
import { Page } from '../types/admin';
import Hero from '../components/Home/Hero';
import Services from '../components/Home/Services';
import AdditionalServices from '../components/Home/AdditionalServices';
import MoreServices from '../components/Home/MoreServices';
import Process from '../components/Home/Process';
import Testimonials from '../components/Home/Testimonials';
import DynamicForm from '../components/form/DynamicForm';
import { formService } from '../services/formService';

export default function Home({ page }: { page: Page }) {
  // 1. 抓取 blocks
  const blocks = page?.content?.home?.blocks || [];

  // 2. 表單邏輯
  const showForm = page?.content?.showForm;
  const formId = page?.content?.formId;
  const selectedForm = formId ? formService.getById(formId) : null;

  return (
    <div className="min-h-screen bg-white">
      {/* 💡 動態渲染區塊：根據 blocks 陣列的順序與類型進行渲染 */}
      {blocks.map((block: any) => {
        switch (block.type) {
          case 'HERO_1':
            return <Hero key={block.id} data={block.hero1} />;
          
          case 'SERVICES': {
            const rawServices = Array.isArray(block.services) ? block.services : (block.services?.items || []);
            const servicesData = {
              subtitle: Array.isArray(block.services) ? undefined : block.services?.subtitle,
              title: Array.isArray(block.services) ? undefined : block.services?.title,
              items: rawServices.map((s: any) => ({
                ...s,
                tags: typeof s.tags === 'string' ? s.tags.split(',').map((t: string) => t.trim()) : (Array.isArray(s.tags) ? s.tags : [])
              }))
            };
            return <Services key={block.id} data={servicesData} />;
          }

          case 'ADDITIONAL_SERVICES':
            return <AdditionalServices key={block.id} data={block.additionalServices} />;

          case 'MORE_SERVICES':
            return <MoreServices key={block.id} data={block.moreServices} />;

          case 'PROCESS':
            return <Process key={block.id} data={block.process} />;

          case 'TESTIMONIALS': {
            const testimonialsBlock = block.testimonials;
            return (
              <Testimonials 
                key={block.id}
                data={testimonialsBlock?.items || []} 
                title={testimonialsBlock?.title} 
                description={testimonialsBlock?.description} 
              />
            );
          }

          default:
            return null;
        }
      })}

      {/* 6. 底部預約表單 */}
      {showForm && selectedForm && (
        <div className="py-20 bg-stone-50">
          <div className="max-w-3xl mx-auto px-4">
            <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-xl border border-stone-100">
              <DynamicForm 
                form={selectedForm} 
                pageSlug={page?.slug || 'home'} 
                pageTitle={page?.title || '首頁'} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
