import ServiceCarousel from '../components/ServiceCarousel';
import { RetirementHero, HomeTools, OrganizingSection, ServiceDirectory, HomeFAQ } from '../components/Home/RetirementHome';
// src/pages/HomePage.tsx
import React from 'react';
import { Page } from '../types/admin';
import LatestBlogs from '../components/Home/LatestBlogs';
import DynamicForm from '../components/form/DynamicForm';
import { useForm } from '../hooks/useForm';

export default function Home({ page }: { page: Page }) {
  const blocks = page.content.home?.blocks || [];
  const serviceBlock = blocks.find(block => block.type === 'SERVICES');
  const cmsItems = Array.isArray(serviceBlock?.services) ? serviceBlock.services : serviceBlock?.services?.items || [];
  const moreServices = blocks.find(block => block.type === 'MORE_SERVICES')?.moreServices;
  const showForm = page?.content?.showForm;
  const formId = page?.content?.formId;
  const selectedForm = useForm(formId);

  return (
    <div className="min-h-screen bg-white">
      <RetirementHero />
      <HomeTools />
      <OrganizingSection />
      <ServiceDirectory cmsItems={cmsItems} />
      {!!moreServices?.pageIds?.length && <section className="retirement-section"><div className="retirement-container"><div className="section-heading"><p className="eyebrow">更多居家協助</p><h2>{moreServices.title || '我們還提供'}</h2><p>您也可以從以下服務開始了解。顧問會依您的需求，協助確認合適的安排。</p></div><ServiceCarousel services={moreServices.pageIds.map(id => ({ id, targetPageId: id }))} desktopColumns={3} /></div></section>}
      <LatestBlogs data={{ title: '好齡居誌・生活裡的新提案', limit: 6 }} />
      <HomeFAQ />

      {/* 6. 底部預約表單 */}
      {showForm && selectedForm && (
        <div className="py-20 bg-stone-50">
          <div className="max-w-3xl mx-auto px-4 md:px-8">
            <div className="bg-white px-5 py-8 md:p-12 rounded-2xl shadow-xl border border-stone-100">
              <div className="[&>section]:border-none [&>section]:shadow-none [&>section]:p-0">
                <DynamicForm 
                  form={{ ...selectedForm, description: '先告訴我們您想改善的地方。安心顧問會與您聯繫，了解需求後，再一起討論服務與費用。' }}
                  pageSlug={page?.slug || 'home'} 
                  pageTitle={page?.title || '首頁'} 
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
