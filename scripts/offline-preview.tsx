// Review-only entry. The production entry remains src/main.tsx.
import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { FocusedLayout, FocusedHome, FocusedServices, FocusedServiceDetail, FocusedCourses, FocusedFAQ, FocusedAbout, FocusedBooking } from '../src/features/focused/FocusedSite';
import { services, supportServices } from '../src/features/focused/catalog';
import ScrollToTop from '../src/components/ScrollToTop';
window.fetch = async () => new Response(JSON.stringify({error:'這是離線預覽，資料尚未送出。正式網站需連接後台後才能送出預約。'}), {status:503,headers:{'Content-Type':'application/json'}});
createRoot(document.getElementById('root')!).render(<HelmetProvider><HashRouter><ScrollToTop /><Routes><Route element={<FocusedLayout />}><Route path="/" element={<FocusedHome />} /><Route path="/services" element={<FocusedServices />} />{[...services,...supportServices].map(s=><Route path={'/services/'+s.slug} key={s.slug} element={<FocusedServiceDetail slug={s.slug} />} />)}<Route path="/courses" element={<FocusedCourses />} /><Route path="/faq" element={<FocusedFAQ />} /><Route path="/about" element={<FocusedAbout />} /><Route path="/book" element={<FocusedBooking />} /><Route path="/privacy" element={<div className="nx-container nx-section"><h1>隱私權政策</h1><p>離線預覽不會送出或保存您填寫的資料。正式網站沿用原站隱私權政策，請於上線環境確認。</p></div>} /><Route path="*" element={<Navigate to="/" replace />} /></Route></Routes></HashRouter></HelmetProvider>);
