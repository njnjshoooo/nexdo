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

  // 2. 精確提取資料並進行「防彈處理」
  const heroData = blocks.find(b => b.type === 'HERO_1')?.hero1;
  
  // 💡 修正點：確保 services 裡的 tags 永遠是陣列
  const rawServices = blocks.find(b => b.type === 'SERVICES')?.services || [];
  const servicesData = rawServices.map((s: any) => ({
    ...s,
    tags: typeof s.tags === 'string' ? s.tags.split(',').map((t: string) => t.trim()) : (Array.isArray(s.tags) ? s.tags : [])
  }));

  const rawAdditional = blocks.find(b => b.type === 'ADDITIONAL_SERVICES')?.additionalServices || [];
  const additionalData = rawAdditional.map((s: any) => ({
    ...s,
    tags: typeof s.tags === 'string' ? s.tags.split(',').map((t: string) => t.trim()) : (Array.isArray(s.tags) ? s.tags : [])
  }));

  const moreServicesData = blocks.find(b => b.type === 'MORE_SERVICES')?.moreServices;

  const processData = blocks.find(b => b.type === 'PROCESS')?.process;
  const testimonialsData = blocks.find(b => b.type === 'TESTIMONIALS')?.items;

  // 3. 表單邏輯
  const showForm = page?.content?.showForm;
  const formId = page?.content?.formId;
  const selectedForm = formId ? formService.getById(formId) : null;

  return (
    <div className="min-h-screen bg-white">
      {/* 1. 主視覺區 */}
      <Hero data={heroData} />
      
      {/* 2. 服務項目區 (已過濾過的資料) */}
      <Services data={servicesData} />
      
      {/* 3. 我們還提供 (已過濾過的資料) */}
      <AdditionalServices data={additionalData} />
      
      {/* 4. 更多服務 (子項目卡牌) */}
      <MoreServices data={moreServicesData} />
      
      {/* 5. 服務流程 */}
      <Process data={processData} />
      
      {/* 6. 客戶評論 */}
      <Testimonials data={testimonialsData} />

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
