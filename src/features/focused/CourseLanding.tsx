import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, ArrowUpRight, BookOpen, Check, CalendarDays, Clock3, MapPin, Monitor, Heart, ClipboardList, Home, MessageCircle, CheckCircle2 } from 'lucide-react';
import { courseOffering as offering, curriculum, courseQuestions, learningOutcomes } from './courseContent';
import { LINE_QUOTE_URL } from '../../data/organizingCatalog';
import './course.css';

const sections = [ ['course-overview', '課程介紹'], ['course-curriculum', '課程大綱'], ['course-instructor', '講師與開課'], ['course-faq', '常見問題'] ];
function jump(id: string) { const element = document.getElementById(id); element?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }); const heading = element?.querySelector<HTMLElement>('h2'); heading?.focus({ preventScroll: true }); }
function EnrollmentButton({ children = '登記開課通知', secondary = false }: { children?: React.ReactNode; secondary?: boolean }) { return <button type="button" className={'nx-button' + (secondary ? ' nx-secondary' : '')} onClick={() => jump('course-enrollment')}>{children}<ArrowRight size={20} aria-hidden="true" /></button>; }

function CourseRegistration() {
  const [step, setStep] = useState<'form' | 'review' | 'success'>('form');
  const [fields, setFields] = useState({ name: '', phone: '', email: '', area: '', purpose: '整理自己的家', note: '', consent: false });
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false); const [reference, setReference] = useState('');
  const requestId = useRef(crypto.randomUUID()); const sending = useRef(false); const statusHeading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { if (step !== 'form') statusHeading.current?.focus({ preventScroll: true }); }, [step]);
  const field = (key: keyof typeof fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setFields(prev => ({ ...prev, [key]: e.target.value }));
  async function submit() {
    if (sending.current) return;
    sending.current = true; setBusy(true); setError('');
    try {
      const response = await fetch('/api/organizing-request', { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(25000), body: JSON.stringify({ name: fields.name, phone: fields.phone, email: fields.email, area: fields.area, goal: offering.name, purpose: '課程學習', notes: `學習目的：${fields.purpose}${fields.note.trim() ? '\n' + fields.note.trim() : ''}`, consent: fields.consent, requestId: requestId.current }) });
      let result: { ok?: boolean; bookingId?: string; error?: string };
      try { result = await response.json(); } catch { throw new Error('目前連線異常，請稍後再試。'); }
      if (!response.ok || !result.ok || !result.bookingId) throw new Error(result.error || '目前無法確認送出結果，請稍後再試。');
      setReference(result.bookingId); setStep('success');
    } catch (e) { setError(e instanceof Error && e.name !== 'TimeoutError' ? e.message : '連線逾時，請稍後重試；重試不會重複登記。'); }
    finally { sending.current = false; setBusy(false); }
  }
  if (step === 'success') return <div className="nc-registration-success" role="status"><CheckCircle2 size={46} aria-hidden="true" /><h3 ref={statusHeading} tabIndex={-1}>已收到您的開課通知登記</h3><p>開課資訊確認後，我們將依您留下的聯絡方式通知。</p><p className="nc-reference">登記編號：{reference}</p><p className="nc-small">目前尚未付款，也尚未保留課程名額。</p><a className="nx-text-link" href={LINE_QUOTE_URL} target="_blank" rel="noopener noreferrer">透過 LINE 詢問課程 <ArrowUpRight size={19} /></a></div>;
  if (step === 'review') return <div className="nc-registration-review" aria-busy={busy}><h3 ref={statusHeading} tabIndex={-1}>確認資料，再送出。</h3><dl>{[['課程', offering.name], ['姓名', fields.name], ['電話', fields.phone], ['電子郵件', fields.email], ['居住地區', fields.area], ['學習目的', fields.purpose], ...(fields.note ? [['補充說明', fields.note]] : [])].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><p className="nc-small">本次為開課通知登記，不收費、不保留名額。</p><div className="nx-actions"><button type="button" className="nx-button" disabled={busy} onClick={submit}>{busy ? '送出中…' : '確認送出登記'}<ArrowRight size={20} /></button><button type="button" className="nx-button nx-secondary" disabled={busy} onClick={() => setStep('form')}>返回修改</button></div>{error && <div className="nc-form-error" role="alert">{error}<a href={LINE_QUOTE_URL} target="_blank" rel="noopener noreferrer">也可透過 LINE 詢問 ↗</a></div>}</div>;
  return <form className="nc-registration-form" onSubmit={e => { e.preventDefault(); setError(''); setStep('review'); }}>
    <div className="nc-form-grid"><label>姓名 <span>必填</span><input name="name" required autoComplete="name" maxLength={80} value={fields.name} onChange={field('name')} placeholder="怎麼稱呼您" /></label><label>聯絡電話 <span>必填</span><input name="phone" required type="tel" autoComplete="tel" minLength={8} maxLength={30} pattern="[+0-9 ()\-]{8,30}" value={fields.phone} onChange={field('phone')} placeholder="手機或含區碼的市話" /></label><label>電子郵件 <span>必填</span><input name="email" required type="email" autoComplete="email" maxLength={254} value={fields.email} onChange={field('email')} placeholder="接收課程資訊" /></label><label>居住縣市／地區 <span>必填</span><input name="area" required autoComplete="address-level2" maxLength={100} value={fields.area} onChange={field('area')} placeholder="例如：台北市信義區" /></label></div>
    <label>想學這堂課的原因 <span>選填</span><select name="learningPurpose" value={fields.purpose} onChange={field('purpose')}><option>整理自己的家</option><option>朝遺物整理師發展</option><option>兩個方向都想學</option></select></label>
    <label>想先詢問的事 <span>選填</span><textarea name="note" rows={2} maxLength={1500} value={fields.note} onChange={field('note')} placeholder="可以留下您想了解的課程問題" /></label>
    <label className="nc-consent"><input name="consent" type="checkbox" required checked={fields.consent} onChange={e => setFields(prev => ({ ...prev, consent: e.target.checked }))} /><span>我同意好齡居使用本次資料，聯繫並提供課程資訊。<Link to="/privacy" target="_blank" rel="noopener noreferrer">隱私權政策 ↗</Link></span></label>
    <button type="submit" className="nx-button">下一步，確認資料 <ArrowRight size={20} aria-hidden="true" /></button>
  </form>;
}

export default function CourseLanding() {
  const [active, setActive] = useState('course-overview');
  useEffect(() => {
    const observer = new IntersectionObserver(entries => { const visible = entries.filter(entry => entry.isIntersecting).sort((a,b) => a.boundingClientRect.top-b.boundingClientRect.top); if (visible[0]) setActive(visible[0].target.id); }, { rootMargin: '-190px 0px -45% 0px', threshold: 0 });
    sections.forEach(([id]) => { const section = document.getElementById(id); if (section) observer.observe(section); });
    return () => observer.disconnect();
  }, []);
  return <div className="nc-course">
    <Helmet><title>遺物整理師培訓課｜老屋整理與遺物整理｜好齡居 Nexdo</title><meta name="description" content="從老屋盤點、物品分類、家屬溝通到清運協作，學習整理自己的家，也朝遺物整理師發展。查看課程大綱與開課資訊。" /></Helmet>
    <div className="nx-container nc-breadcrumb"><Link to="/">首頁</Link><span aria-hidden="true">／</span><span>遺物整理師培訓課</span></div>
    <section className="nx-container nc-hero"><div className="nc-hero-copy"><p className="nx-kicker"><span />{offering.subtitle}</p><h1>遺物整理師<br /><em>培訓課</em></h1><p className="nc-tagline">把一屋子的物品，<br />整理成安心的下一步。</p><p className="nc-hero-description">學習整理自己的老屋，<br />也學習陪伴一個需要協助的家庭。</p><div className="nc-hero-actions"><EnrollmentButton /><button type="button" className="nx-text-link" onClick={() => jump('course-curriculum')}>先看課程大綱 <ArrowRight size={20} /></button></div><p className="nc-small">首期課程籌備中・開課資訊確認後通知</p></div><figure className="nc-hero-visual"><img src="/images/uniforms/scene-98.webp" alt="整理人員在明亮的家中分類相片、文件與家中物品的品牌情境示意" fetchPriority="high" /><figcaption><span>學會整理，也學會陪伴。</span><small>品牌情境示意</small></figcaption></figure></section>
    <nav className="nc-section-nav" aria-label="課程內容導覽"><div className="nx-container"><div className="nc-section-links">{sections.map(([id,label]) => <button type="button" key={id} aria-current={active === id ? 'location' : undefined} onClick={() => { setActive(id); jump(id); }}>{label}</button>)}</div><EnrollmentButton /></div></nav>
    <div className="nx-container nc-body-layout"><div className="nc-main-column">
      <section id="course-overview" className="nc-section"><p className="nx-kicker">為自己，也為需要幫助的人</p><h2 tabIndex={-1}>這堂課，適合這樣的您。</h2><div className="nc-audience"><article><Home size={28} aria-hidden="true" /><h3>想整理自己或家人的老屋</h3><p>面對累積多年的家具、文件與回憶，希望有方法地開始，不再只是把東西搬來搬去。</p></article><article><Heart size={28} aria-hidden="true" /><h3>想朝遺物整理師發展</h3><p>想了解如何評估現場、與家屬溝通，把整理規劃成一份有步驟、有交代的服務。</p></article></div>
        <div className="nc-outcomes"><p className="nx-kicker">學習目標</p><h2>從「不知道怎麼開始」，<br />到「知道下一步怎麼做」。</h2><div>{learningOutcomes.map((outcome,index) => <article key={outcome.title}><span>0{index+1}</span><div><h3>{outcome.title}</h3><p>{outcome.text}</p></div></article>)}</div></div>
      </section>
      <section id="course-curriculum" className="nc-section"><p className="nx-kicker">六個主題，串起整理的全流程</p><h2 tabIndex={-1}>課程大綱</h2><p className="nc-section-lead">從盤點、分類到溝通與交付，先建立方法，再理解現場。</p><div className="nc-curriculum">{curriculum.map((chapter,index) => <details key={chapter.title} open={index === 0}><summary><span className="nc-chapter-number">0{index+1}</span><span><strong>{chapter.title}</strong><small>{chapter.summary}</small></span><span className="nc-expand" aria-hidden="true">＋</span></summary><ul>{chapter.topics.map(topic => <li key={topic}><Check size={19} aria-hidden="true" />{topic}</li>)}</ul></details>)}</div><p className="nc-small">課綱為目前規劃方向，正式內容與實作安排將於開課前確認。</p></section>
      <section id="course-instructor" className="nc-section"><p className="nx-kicker">先把資訊說清楚，再決定報名</p><h2 tabIndex={-1}>講師與開課資訊</h2><dl className="nc-course-facts">{[[Monitor,'上課形式',offering.format],[CalendarDays,'上課日期',offering.schedule],[Clock3,'課程時數',offering.hours],[MapPin,'上課地點',offering.location]].map(([Icon,label,value]) => { const FactIcon = Icon as typeof Monitor; return <div key={String(label)}><dt><FactIcon size={21} aria-hidden="true" />{String(label)}</dt><dd>{String(value || '確認後公布')}</dd></div>; })}</dl><div className="nc-instructor"><div className="nc-instructor-symbol"><BookOpen size={32} aria-hidden="true" /></div><div><h3>{offering.instructor.name || '講師資訊確認中'}</h3><p>{offering.instructor.bio || '講師姓名、專長與授課經歷將在正式報名前公布。'}</p></div></div><div className="nc-policy"><h3>報名前，您會先知道</h3><ul><li><Check size={19} />課程費用與付款方式</li><li><Check size={19} />實作、評量與結業規則</li><li><Check size={19} />取消、改期及退費辦法</li></ul><p className="nc-small">以上資訊尚在確認中，目前登記不需付款。</p></div></section>
      <section id="course-faq" className="nc-section"><p className="nx-kicker">把疑問先說清楚</p><h2 tabIndex={-1}>課程常見問題</h2><div className="nx-faq">{courseQuestions.map(([q,a]) => <details key={q}><summary>{q}<span aria-hidden="true">＋</span></summary><p>{a}</p></details>)}</div></section>
    </div><aside className="nc-sidebar" aria-label="課程與登記摘要"><div className="nc-enrollment-card"><p className="nc-status"><span />首期課程籌備中</p><h2>{offering.name}</h2><p className="nc-price-label">課程費用</p><strong className="nc-price">費用待公布</strong><p>專注老屋整理與遺物整理，<br />一堂課，兩種學習方向。</p><ul><li><Check size={18} />為自己的老屋找到方法</li><li><Check size={18} />學習遺物整理的服務流程</li><li><Check size={18} />正式資訊確認後再決定</li></ul><EnrollmentButton /><p className="nc-small">登記不收費，也不保留名額。</p><a className="nc-line-link" href={LINE_QUOTE_URL} target="_blank" rel="noopener noreferrer"><MessageCircle size={19} />透過 LINE 詢問課程 <ArrowUpRight size={17} /></a></div></aside></div>
    <section id="course-enrollment" className="nc-enrollment-section"><div className="nx-container nc-enrollment-grid"><div><p className="nx-kicker">讓學習，從這裡開始</p><h2 tabIndex={-1}>想參加這堂課？<br />先收到開課通知。</h2><p>留下聯絡方式，開課資訊確認後，<br />我們會通知您，再由您決定是否報名。</p><ol className="nc-register-steps"><li><span>1</span>填寫聯絡資料</li><li><span>2</span>收到正式開課資訊</li><li><span>3</span>確認後報名與付款</li></ol><p className="nc-small">目前為通知登記，尚未開放付費報名。</p></div><div className="nc-enrollment-form-wrap"><p className="nc-form-title"><ClipboardList size={22} />開課通知登記</p><CourseRegistration /></div></div></section>
    <div className="nc-mobile-enroll"><div><span>遺物整理師培訓課</span><strong>費用待公布</strong></div><EnrollmentButton /></div>
  </div>;
}
