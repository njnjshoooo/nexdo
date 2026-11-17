import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, Check, Monitor, Heart, Home, CreditCard, BookOpen, PackageCheck } from 'lucide-react';
import { courseOffering as offering, curriculum, coursePriceLabel } from './courseContent';
import './course.css';

const pictures = { hero: '/images/course/course-hero-young.png', method: '/images/course/course-method-young.png', online: '/images/course/course-online-young.png' };
const sections = [['course-intro','課程介紹'], ['course-learning','學習內容'], ['course-curriculum','課程大綱'], ['course-purchase','課程方案']];
const faqs = [
 ['這堂課適合什麼人？','想整理自己或家人的老屋、處理親人留下的物品，或想朝遺物整理師發展，都可以從這堂課建立整理方法。'],
 ['課程費用是多少？','學費為 NT$10,200，採線上課程。課程準備中，尚未開放購買與付款。'],
 ['需要留下姓名、電話，等待專人聯繫嗎？','不需要。規劃採直接選購、線上付款的方式，不經過諮詢或通知登記；購課時使用必要的學習帳號資訊。'],
 ['是直播還是錄影？有幾章、幾小時？','已確定採線上課程。直播或錄影形式、影片單元與總時數仍在規劃，確認後會直接列在本頁。'],
 ['買完後如何上課？','規劃流程為付款成功後取得上課入口。實際使用的平台、開通時間與觀看方式，會在正式販售前確認並公布。'],
 ['有證書、觀看期限或退費辦法嗎？','結業與證書規則、觀看期限及退費辦法尚待確認，會在正式販售前公布。']
];
function goTo(id: string) { const el=document.getElementById(id); el?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'}); el?.querySelector<HTMLElement>('h2')?.focus({preventScroll:true}); }

export default function CourseLanding() {
 const [active,setActive]=useState('course-intro');
 useEffect(()=>{const observer=new IntersectionObserver(entries=>{const first=entries.filter(e=>e.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top)[0];if(first)setActive(first.target.id);},{rootMargin:'-185px 0px -45% 0px'});sections.forEach(([id])=>{const el=document.getElementById(id);if(el)observer.observe(el)});return()=>observer.disconnect();},[]);
 const Buy=({label='查看課程方案',pending=false}:{label?:string;pending?:boolean})=><button type="button" className="nx-button" disabled={pending} onClick={()=>goTo('course-purchase')}>{pending?'即將開放購買':label}{!pending&&<ArrowRight size={20} aria-hidden="true" />}</button>;
 return <div className="np-course">
  <Helmet><title>遺物整理師培訓課｜NT$10,200 線上課程｜好齡居 Nexdo</title><meta name="description" content="學習老屋整理、遺物分類與家屬溝通，為自己或家人的老屋找到方法。好齡居遺物整理師培訓課，線上課程 NT$10,200。" /></Helmet>
  <div className="np-preview-label">課程準備中｜學費 NT$10,200，付款與上課功能將於後續開放</div>
  <section id="course-intro" className="nx-container np-cover">
   <div className="np-cover-copy"><p className="nx-kicker"><span />好齡居線上課程</p><h1>遺物整理師<br /><em>培訓課</em></h1><p className="np-cover-tagline">整理一個家，<br />也照顧一份心意。</p><p className="np-cover-desc">從老屋整理、物品分類到家屬溝通，<br />學會為生活騰出空間的方法。</p><div className="np-cover-purchase"><span>線上課程</span><strong>{coursePriceLabel}</strong><Buy /></div><p className="np-caption">章節、總時數與開課安排規劃中。</p></div>
   <figure className="np-cover-photo"><img src={pictures.hero} alt="兩位年輕整理人員神情平靜愉悅，一起整理老照片的課程情境示意" fetchPriority="high" /><figcaption>把重要的留下，為下一段生活留白。</figcaption></figure>
  </section>
  <nav className="np-nav" aria-label="課程產品頁導覽"><div className="nx-container"><div>{sections.map(([id,label])=><button type="button" key={id} aria-current={active===id?'location':undefined} onClick={()=>{setActive(id);goTo(id)}}>{label}</button>)}</div><Buy label="課程方案" /></div></nav>
  <section id="course-learning" className="nx-container np-story np-section">
   <figure><img src={pictures.method} loading="lazy" alt="兩位年輕整理人員將舊照片放進保存套，桌面分門別類的情境示意" /><figcaption>物品有去向，心裡也有方向。</figcaption></figure>
   <div className="np-story-copy"><p className="nx-kicker">不只把東西收好</p><h2 tabIndex={-1}>把一屋子的回憶，<br />整理成安心的下一步。</h2><p>重要的文件、捨不得的照片、<br />不知道怎麼處理的家具。<br />先有方法，再慢慢做決定。</p><ul className="np-checklist"><li><Check size={21} />看懂空間與物品的現況</li><li><Check size={21} />安排保留、傳承、送出與清運</li><li><Check size={21} />和家人說清楚，再開始整理</li></ul><button type="button" className="nx-text-link" onClick={()=>goTo('course-curriculum')}>看看這堂課怎麼教 <ArrowRight size={20} /></button></div>
  </section>
  <section className="np-direction-section"><div className="nx-container np-direction-grid"><div><p className="nx-kicker">一堂課，兩個方向</p><h2>為自己的家而學，<br />也能朝整理師發展。</h2><div className="np-direction"><Home size={27} /><div><h3>想整理自己的老屋</h3><p>從盤點、分類到安排物品去向，<br />為自己與家人找到開始的方法。</p></div></div><div className="np-direction"><Heart size={27} /><div><h3>想學習遺物整理服務</h3><p>認識現場評估、家屬溝通與交付流程，<br />學習陪伴一個需要協助的家庭。</p></div></div></div><figure><img src={pictures.online} loading="lazy" alt="年輕學員在明亮空間輕鬆使用筆電學習整理課程的情境示意" /><figcaption>把學到的方法，帶回自己的生活。</figcaption></figure></div></section>
  <section id="course-curriculum" className="nx-container np-section np-curriculum-section"><div className="np-section-title"><p className="nx-kicker">從理解，到動手，再到交付</p><h2 tabIndex={-1}>一套有順序的整理方法。</h2><p>六個規劃主題，串起老屋與遺物整理的全流程。</p></div><div className="np-module-grid">{[{image:pictures.hero,title:'先理解，再開始',indices:[0,1]},{image:pictures.method,title:'讓物品與心意有去向',indices:[2,3]},{image:pictures.online,title:'把整理規劃成一份工作',indices:[4,5]}].map((group,i)=><article className="np-module" key={group.title}><div className="np-module-image"><img src={group.image} loading="lazy" alt="" /><span>學習階段 0{i+1}</span></div><div className="np-module-body"><h3>{group.title}</h3>{group.indices.map(index=><details key={index}><summary><span>0{index+1}</span><strong>{curriculum[index].title}</strong><b aria-hidden="true">＋</b></summary><ul>{curriculum[index].topics.map(topic=><li key={topic}>{topic}</li>)}</ul></details>)}</div></article>)}</div><p className="np-caption">以上為課綱規劃方向；影片單元、總時數與實作安排確認後公布。所有圖片皆為 AI 課程情境示意。</p></section>
  <section id="course-purchase" className="np-purchase-section"><div className="nx-container np-purchase-layout"><div className="np-purchase-copy"><p className="nx-kicker">把學習，變成照顧生活的能力</p><h2 tabIndex={-1}>從整理自己的家，<br />開始一段新的學習。</h2><p>好齡居・遺物整理師培訓課</p><div className="np-purchase-steps">{[[BookOpen,'選購課程','確認課程與學習帳號'],[CreditCard,'線上付款','依可用方式完成付款'],[PackageCheck,'取得上課入口','依開通安排開始學習']].map(([Icon,title,desc])=>{const StepIcon=Icon as typeof BookOpen;return <div key={String(title)}><StepIcon size={25} /><strong>{String(title)}</strong><span>{String(desc)}</span></div>})}</div><p className="np-caption">上方為規劃的自動購課流程，教材平台與開通安排尚待確認。</p></div><article className="np-price-card"><p className="np-product-type"><Monitor size={19} />線上課程</p><h3>{offering.name}</h3><strong className="np-price-number">NT$ 10,200</strong><p>一堂課・老屋整理 × 遺物整理</p><ul className="np-checklist"><li><Check size={19} />物品盤點與分類觀念</li><li><Check size={19} />家屬溝通與工作規劃</li><li><Check size={19} />案例思考與交付流程</li></ul><Buy pending /><p className="np-caption">付款、觀看期限及結業規則<br />確認後開放正式販售。</p></article></div></section>
  <section className="nx-container np-section np-faq"><div className="np-section-title"><p className="nx-kicker">購買前，先了解</p><h2>課程常見問題</h2></div><div className="nx-faq">{faqs.map(([q,a])=><details key={q}><summary>{q}<span aria-hidden="true">＋</span></summary><p>{a}</p></details>)}</div></section>
  <div className="np-mobile-buy"><div><span>遺物整理師培訓課</span><strong>NT$ 10,200</strong></div><Buy /></div>
 </div>;
}
