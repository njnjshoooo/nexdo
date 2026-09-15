import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { LINE_QUOTE_URL } from '../data/organizingCatalog';

export const ORGANIZING_GOALS = ['退休整理', '老前整理', '遺物整理', '搬家整理'];
export const ORGANIZING_PURPOSES = ['空間調整', '搬家', '出租房屋', '出售房屋'];

export default function OrganizingPage() {
  const [params, setParams] = useSearchParams();
  const goal = ORGANIZING_GOALS.includes(params.get('goal') || '') ? params.get('goal')! : '';
  const purpose = ORGANIZING_PURPOSES.includes(params.get('purpose') || '') ? params.get('purpose')! : '';
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const summary = `您好，我想了解好齡居「老前整理」服務。\n本次目標：${goal || '尚未決定'}\n整理的目的：${purpose || '尚未決定'}\n希望先和安心顧問討論整理範圍與報價。`;
  function choose(key: string, value: string) {
    const next = new URLSearchParams(params); next.set(key, value); setParams(next, { replace: true }); setCopied(false); setCopyError(false);
  }
  async function copy() {
    try { await navigator.clipboard.writeText(summary); setCopied(true); setCopyError(false); }
    catch { setCopyError(true); }
  }
  return <div className="organizing-product">
    <Helmet><title>老前整理｜在人生的重要時刻，為生活留出空間｜好齡居 NEXDO</title><meta name="description" content="退休、老前、遺物與搬家整理，同一項整理服務、相同計價方式。選擇這次的目標與目的，由安心顧問陪您確認範圍，先評估再報價。" /><link rel="canonical" href="https://www.nexdo.tw/services/organizing" /></Helmet>
    <section className="retirement-section"><div className="retirement-container organizing-product-grid">
      <div><p className="eyebrow">老前整理</p><h1>在人生的重要時刻，<br />為生活留出空間。</h1><p className="organizing-lead">退休，為新生活重新安排日常；走到人生下半場，回看一路珍藏的物品；家人離世後，透過整理，留下與他的珍貴回憶。</p><p>每一次整理，起點可能不同。我們都陪您釐清「想留下什麼、接下來怎麼生活」，依您的步調安排。</p><img className="organizing-product-photo" src="/images/customers/scene-94.webp" alt="穿著好齡居制服的整理人員，陪長輩整理照片與紀念物，情境示意" /><p className="image-note">情境示意</p></div>
      <div className="organizing-request" id="organizing-request"><p className="eyebrow">先說說，這次想怎麼整理</p><h2>同一項服務，從您的需要開始</h2><p>以下選擇幫助顧問了解您的需求，使用相同計價方式；費用依整理範圍、物品量、人力與時程評估，不因目標名稱不同而另訂一套價格。</p>
        {[{ key: 'goal', title: '1. 本次目標', values: ORGANIZING_GOALS, selected: goal }, { key: 'purpose', title: '2. 整理的目的', values: ORGANIZING_PURPOSES, selected: purpose }].map(group => <fieldset key={group.key}><legend>{group.title}</legend><div className="organizing-options">{group.values.map(value => <label key={value}><input type="radio" name={group.key} value={value} checked={group.selected === value} onChange={() => choose(group.key, value)} /><span>{value}</span></label>)}</div></fieldset>)}
        <div className="organizing-price"><strong>依整理範圍評估報價</strong><p>第一次到府評估免費。先確認服務內容與費用，再由您決定是否安排。</p></div>
        <label className="request-summary-label" htmlFor="organizing-summary">您的需求摘要</label><textarea id="organizing-summary" readOnly value={summary} rows={5} />
        <p>先複製摘要，再開啟 LINE 貼給安心顧問；尚未確定的項目，也可以一起聊聊。</p>
        <button type="button" className="brand-button secondary" onClick={copy}>{copied ? <><Check size={20} /> 已複製需求摘要</> : '1. 複製需求摘要'}</button>
        <p role="status" className="copy-status">{copyError ? '無法自動複製，請選取上方摘要文字後複製。' : copied ? '已複製，開啟 LINE 後貼上即可。' : ''}</p>
        <a className="brand-button" href={LINE_QUOTE_URL} target="_blank" rel="noopener noreferrer">2. 開啟 LINE 諮詢 <ArrowRight size={20} /></a>
      </div>
    </div></section>
    <section className="retirement-section organizing-section"><div className="retirement-container"><div className="section-heading"><p className="eyebrow">留下重要的，安排接下來的生活</p><h2>整理的是空間，也照顧每一份心意</h2></div><div className="organizing-steps">{[['一起確認範圍','從一個抽屜、一個房間，或整個家開始，先聽您說想改善的地方。'],['說明內容與報價','依物品量、範圍、人力與時程評估，確認後才安排執行。'],['依您的步調整理','分類、收納與紀念物保存；物品如何處理，由您或家人同意後再進行。'],['一起確認下一步','確認整理結果，視需求銜接搬家、清運或房屋出租等後續服務，另外說明範圍與費用。']].map(([title,text],i)=><article key={title}><span className="service-number">0{i+1}</span><h3>{title}</h3><p>{text}</p></article>)}</div><div className="pace-note"><div><strong>陪伴型</strong><span>邊回憶、邊討論，慢慢決定</span></div><div><strong>效率型</strong><span>您已決定方向，我們協助執行</span></div><p>兩種節奏，都尊重您的選擇。</p></div></div></section>
  </div>;
}
