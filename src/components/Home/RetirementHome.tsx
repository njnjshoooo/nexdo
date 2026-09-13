import React, { useEffect, useState } from 'react';
import { productService } from '../../services/productService';
import type { Product } from '../../types/admin';
import { Helmet } from 'react-helmet-async';
import { pageService } from '../../services/pageService';
import { ArrowRight, House, ShieldCheck, Calculator, MoveRight, Leaf, HeartHandshake, KeyRound, Armchair, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { organizingProducts } from '../../data/organizingCatalog';
import { HAOHAO_FAQ } from '../../data/haohaoFAQ';

export function RetirementHero() {
  return <section className="retirement-hero">
    <div className="retirement-container hero-grid">
      <div className="hero-copy">
        <p className="eyebrow"><span /> 好齡居 NEXDO ・ 退休居家生活顧問</p>
        <h1>把家安排好，<br />退休更自在。</h1>
        <p className="hero-description">從整理、居家改善到房屋出租需求，<br className="desktop-break" />安心顧問陪您釐清想法，依您的習慣，一步步安排。</p>
        <div className="hero-actions"><Link className="brand-button" to="/consultant">安心顧問諮詢 <ArrowRight size={20} /></Link><a className="brand-button secondary" href="#services">查看服務項目</a></div>
        <p className="hero-note">先聊聊您想改善的地方，從一個空間開始也可以。</p>
      </div>
      <div className="hero-scene">
        <img className="home-photo" src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=85" alt="自然採光的客廳，沙發旁留有寬敞動線，情境示意" fetchPriority="high" />
        <div className="scene-caption"><House size={20} /><span>熟悉的家，新的生活安排。</span></div>
        <img className="hero-mascot" src="/images/mascot/haohao-wave-2.png" alt="好好陪您安排退休生活" />
        <span className="scene-label">情境示意</span>
      </div>
    </div>
    <div className="retirement-container hero-principles"><span>依您的習慣</span><span>分階段安排</span><span>先說明費用</span><span>本人同意後執行</span></div>
  </section>;
}

export function HomeTools() {
  return <section className="retirement-section tools-section"><div className="retirement-container">
    <div className="section-heading tools-heading"><img src="/images/mascot/haohao-wave-3.png" alt="好好陪您了解居家需求" width="80" height="80" /><p className="eyebrow">先了解，再決定</p><h2>動手看看，先了解您的家</h2><p>不用急著做決定。兩個小工具，幫您找到與顧問聊聊的起點。</p></div>
    <div className="tools-grid">
      <a className="tool-card" href="https://www.nexdo.tw/minigame/#/safety"><ShieldCheck size={40} strokeWidth={1.3} /><span className="eyebrow">01 ／ 居住安全</span><h3>一分鐘居家安全檢測</h3><p>從每天走的動線、浴室到照明，看看哪些地方值得留意。將觀察帶給顧問，一起討論改善順序。</p><span className="card-link">開始檢測 <ArrowRight size={20} /></span></a>
      <a className="tool-card" href="https://www.nexdo.tw/minigame/#/relocation"><Calculator size={40} strokeWidth={1.3} /><span className="eyebrow">02 ／ 房屋出租</span><h3>代租代管租金試算</h3><p>試著了解房屋出租的收支安排，為下一步討論做準備。試算僅供參考，實際租金依屋況與出租條件評估。</p><span className="card-link">開始試算 <ArrowRight size={20} /></span></a>
    </div>
  </div></section>;
}

export function OrganizingSection({ standalone = false }: { standalone?: boolean }) {
  return <section id="organizing" className={`retirement-section organizing-section ${standalone ? 'standalone-section' : ''}`}><div className="retirement-container">
    <div className="section-heading"><p className="eyebrow">老前整理</p>{standalone ? <h1>老前整理，從您希望的節奏開始</h1> : <h2>老前整理，從您希望的節奏開始</h2>}<p>留下重要的，安排接下來的生活。無論是為自己，或與家人一起，都可以慢慢來。</p></div>
    <div className="organizing-grid">{organizingProducts.slice(0, 3).map((p, i) => <Link key={p.id} to={`/services/${p.id}`} className="organizing-card"><span className="service-number">0{i + 1}</span><h3>{p.name}</h3><p>{p.description}。先與安心顧問確認想整理的範圍，再依您的步調安排。</p><p className="service-price">{p.externalLinkConfig?.priceText}</p><span className="card-link">了解服務 <MoveRight size={22} /></span></Link>)}</div>
    <div className="pace-note"><div><strong>陪伴型</strong><span>慢慢做，家人一起</span></div><div><strong>效率型</strong><span>您已決定，我們協助執行</span></div><p>先評估再報價，第一次到府免費</p></div>
    {standalone && <Link to="/consultant" className="brand-button">安心顧問諮詢 <ArrowRight size={20} /></Link>}
  </div></section>;
}

export function ServiceDirectory({ cmsItems = [] }: { cmsItems?: {pageId?: string; title?: string; description?: string; image?: string}[] }) {
 const categories = [
  { title:'居住安全', to:'/home-safety', icon:ShieldCheck, text:'先了解走道、浴室與日常使用情況。依您的習慣討論扶手、照明與居家改善的順序。' },
  { title:'居家裝潢', to:'/renovation', icon:Armchair, text:'從現有空間開始，評估修繕與配置需求。先確認範圍與預算，再安排適合的改善方式。' },
  { title:'收納清潔', to:'/cleaning', icon:Sparkles, text:'從常用的物品與空間著手，整理出方便取用的日常。也可依家庭需求安排清潔服務。' },
  { title:'樂齡健康', to:'/services/health', icon:HeartHandshake, text:'了解退休後的生活照顧與活動需求。由顧問介紹合適服務，醫療問題交由專業人員判斷。' },
  { title:'房屋出租', to:'/services/rental', pageId:'rent-and-move', icon:KeyRound, text:'有閒置住宅，可以先評估屋況與出租條件。從空屋整理到代租代管，分階段討論安排。' },
  { title:'安心顧問諮詢', to:'/consultant', icon:Leaf, text:'還不確定從哪裡開始，也可以先聊聊。顧問會聽您說明需求，再介紹合適的服務。' },
 ];
 const entries = categories.map(category => {
   const item = cmsItems.find(item => item.pageId === (category.pageId || category.to.slice(1)));
   return { ...category, title: item?.title || category.title, text: item?.description || category.text, image: item?.image };
 });
 for (const item of cmsItems) {
   if (!item.pageId || entries.some(c => c.to === '/' + item.pageId)) continue;
   const page = pageService.getById(item.pageId);
   if (page?.isPublished) entries.push({ title: item.title || page.title, to: '/' + page.slug, icon:House, text:item.description || '先與安心顧問聊聊您的需求。確認服務範圍與費用後，再一起安排。', image:item.image });
 }
 return <section id="services" className="retirement-section"><div className="retirement-container"><div className="section-heading"><p className="eyebrow">依需求，找到合適的協助</p><h2>把生活的每一件事，慢慢安排好</h2><p>所有服務都從安心顧問了解需求開始，您可以先看，再聊聊。</p></div><div className="service-directory">{entries.map(c=><Link key={c.to} to={c.to}>{c.image ? <img className="directory-image" src={c.image} alt="" loading="lazy" /> : <c.icon size={32} strokeWidth={1.4}/>}<h3>{c.title}</h3><p>{c.text}</p><span className="card-link">查看服務 <ArrowRight size={20}/></span></Link>)}</div><div className="rental-extension">{organizingProducts.slice(3).map(p=><Link to={`/services/${p.id}`} key={p.id}><span><strong>{p.name}</strong><span>{p.description}。先確認現場條件，選擇需要的服務範圍。</span></span><ArrowRight size={24}/></Link>)}</div></div></section>;
}

export function HomeFAQ() {
 return <section id="haohao-faq" className="retirement-section faq-section"><div className="retirement-container faq-layout"><div className="section-heading"><p className="eyebrow">好好答</p><h2>您可能想先問問</h2><p>整理之前的疑問，我們一起釐清。也可以點選右下角的好好，繼續了解。</p><Link className="brand-button secondary" to="/consultant">先聊聊您的需求 <ArrowRight size={20}/></Link></div><div>{HAOHAO_FAQ.slice(0,5).map(f=><details key={f.id}><summary>{f.question}</summary><p>{f.answer}</p></details>)}</div></div></section>;
}


export function ServiceGroupPage({ kind }: { kind: 'health' | 'rental' }) {
 const [pages, setPages] = useState(() => pageService.getAll());
 const [products, setProducts] = useState<Product[]>([]);
 useEffect(() => {
   let active = true;
   const update = () => { setPages(pageService.getAll()); productService.getAll().then(items => { if (active) setProducts(items); }); };
   update();
   window.addEventListener('pages_refreshed', update);
   window.addEventListener('products_updated', update);
   return () => { active = false; window.removeEventListener('pages_refreshed', update); window.removeEventListener('products_updated', update); };
 }, []);
 const ids = kind === 'health' ? ['health-fitness','short-term-care','home-dentist','medical-companion','nutrition-consulting'] : ['vacant-property','removal','rental-management','rental-customization'];
 const title = kind === 'health' ? '樂齡健康' : '房屋出租';
 const description = kind === 'health' ? '從日常活動到生活照顧，先了解您需要的支持。安心顧問會介紹合適的服務；醫療問題請由醫療專業人員判斷。' : '讓閒置的住宅有新的安排。從空屋整理、清運到代租代管，先確認屋況、出租條件與費用，再由您決定下一步。';
 return <section className="retirement-section standalone-section"><Helmet><title>{title} | 好齡居 NEXDO</title><meta name="description" content={description} /></Helmet><div className="retirement-container"><div className="section-heading"><p className="eyebrow">好齡居服務</p><h1>{title}</h1><p>{description}</p></div><div className="service-directory">{ids.map(id => {
   const page = pages.find(page => page.isPublished && page.content.subItem?.productId === id);
   if (!page) return null;
   const product = products.find(product => product.id === id);
   return <Link to={'/' + page.slug} key={id}><h3>{product?.name || page.title}</h3><p>{product?.description || '先了解您的需求，再依服務範圍安排。顧問會先向您說明費用。'}</p><span className="card-link">了解服務 <ArrowRight size={20} /></span></Link>;
 })}</div><div className="group-consultation"><p>先聊聊您想改善的地方，由安心顧問陪您確認。</p><Link to="/consultant" className="brand-button">安心顧問諮詢 <ArrowRight size={20} /></Link></div></div></section>;
}
