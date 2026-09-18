import React, { useEffect, useState } from 'react';
import { productService } from '../../services/productService';
import type { Product } from '../../types/admin';
import { Helmet } from 'react-helmet-async';
import { pageService } from '../../services/pageService';
import { ArrowRight, House, ShieldCheck, Calculator, Leaf, HeartHandshake, KeyRound, Armchair, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
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
      <a className="tool-card" href="/tools/home-safety"><ShieldCheck size={40} strokeWidth={1.3} /><span className="eyebrow">01 ／ 居住安全</span><h3>一分鐘居家安全檢測</h3><p>從每天走的動線、浴室到照明，看看哪些地方值得留意。將觀察帶給顧問，一起討論改善順序。</p><span className="card-link">開始檢測 <ArrowRight size={20} /></span></a>
      <a className="tool-card" href="/tools/rental"><Calculator size={40} strokeWidth={1.3} /><span className="eyebrow">02 ／ 房屋出租</span><h3>代租代管租金試算</h3><p>試著了解房屋出租的收支安排，為下一步討論做準備。試算僅供參考，實際租金依屋況與出租條件評估。</p><span className="card-link">開始試算 <ArrowRight size={20} /></span></a>
    </div>
  </div></section>;
}

export function OrganizingSection() {
 const moments = [
  ['退休，迎接新的日常', '把工作多年的生活節奏放慢，重新安排喜歡的活動，也讓常用物品更順手。'],
  ['人生下半場，回看一路珍藏', '60 歲前後，給自己一段時間，回看生活軌跡，親手選擇想留下與傳承的物品。'],
  ['家人離世，讓回憶好好留下', '不急著告別每一件物品。陪家人一起整理，保存與他有關的珍貴回憶。'],
 ];
 return <section id="organizing" className="retirement-section organizing-section"><div className="retirement-container">
  <div className="organizing-story"><div className="section-heading"><p className="eyebrow">老前整理 ・ 一項服務，不同人生時刻</p><h2>留下重要的，<br />為下一段生活留出空間。</h2><p>人的一生，在重要時刻總需要重新整理空間。退休、新生活的開始，或與家人一起整理回憶——起點不同，我們都陪您慢慢安排。</p></div><img src="/images/customers/scene-94.webp" alt="好齡居陪長輩整理照片、保存珍貴回憶，情境示意" loading="lazy" /></div>
  <div className="organizing-grid">{moments.map(([title,text],i)=><article className="organizing-card" key={title}><span className="service-number">0{i+1}</span><h3>{title}</h3><p>{text}</p></article>)}</div>
  <div className="organizing-unified-cta"><div><strong>同一項整理服務，相同計價方式</strong><p>退休整理、老前整理、遺物整理或搬家整理，依實際範圍評估報價。先聊目標，再一起確認安排。</p></div><Link to="/services/organizing" className="brand-button">了解老前整理 <ArrowRight size={20} /></Link></div>
 </div></section>;
}

export function ServiceDirectory({ cmsItems = [] }: { cmsItems?: {pageId?: string; title?: string; description?: string; image?: string}[] }) {
 const categories = [
  { image:'/images/customers/scene-41.webp', title:'居住安全', to:'/home-safety', icon:ShieldCheck, text:'先了解走道、浴室與日常使用情況。依您的習慣討論扶手、照明與居家改善的順序。' },
  { image:'/images/services/renovation.webp', title:'居家裝潢', to:'/renovation', icon:Armchair, text:'從現有空間開始，評估修繕與配置需求。先確認範圍與預算，再安排適合的改善方式。' },
  { image:'/images/uniforms/scene-98.webp', title:'收納清潔', to:'/cleaning', icon:Sparkles, text:'從常用的物品與空間著手，整理出方便取用的日常。也可依家庭需求安排清潔服務。' },
  { image:'/images/customers/scene-27.webp', title:'樂齡健康', to:'/services/health', icon:HeartHandshake, text:'了解退休後的生活照顧與活動需求。由顧問介紹合適服務，醫療問題交由專業人員判斷。' },
  { image:'/images/services/rental.webp', title:'房屋出租', to:'/services/rental', pageId:'rent-and-move', icon:KeyRound, text:'有閒置住宅，可以先評估屋況與出租條件。從空屋整理到代租代管，分階段討論安排。' },
  { image:'/images/customers/scene-96.webp', title:'安心顧問諮詢', to:'/consultant', icon:Leaf, text:'還不確定從哪裡開始，也可以先聊聊。顧問會聽您說明需求，再介紹合適的服務。' },
 ];
 const entries = categories.map(category => {
   const item = cmsItems.find(item => item.pageId === (category.pageId || category.to.slice(1)));
   return { ...category, title: item?.title || category.title, text: item?.description || category.text, image: category.image };
 });
 entries.push(
   { title:'空屋整理', to:'/services/vacant-property', icon:House, text:'為空下來的家安排下一步。依需求確認整理、修繕與清潔範圍，讓出租或重新入住更有方向。', image:'/images/services/vacant.webp' },
   { title:'清運', to:'/services/removal', icon:House, text:'把已決定不再保留的物品妥善處理。先確認物品、搬運動線與車次，說明費用後再安排。', image:'/images/uniforms/scene-100.webp' },
 );
 return <section id="services" className="retirement-section"><div className="retirement-container"><div className="section-heading"><p className="eyebrow">依需求，找到合適的協助</p><h2>把生活的每一件事，慢慢安排好</h2><p>所有服務都從安心顧問了解需求開始，您可以先看，再聊聊。</p></div><div className="service-directory">{entries.map(c=><Link key={c.to} to={c.to}>{c.image ? <img className="directory-image" src={c.image} alt="" loading="lazy" /> : <c.icon size={32} strokeWidth={1.4}/>}<h3>{c.title}</h3><p>{c.text}</p><span className="card-link">查看服務 <ArrowRight size={20}/></span></Link>)}</div></div></section>;
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
