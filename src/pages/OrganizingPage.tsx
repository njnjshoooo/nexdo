import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';

import OrganizingRequest from '../features/consultation/OrganizingRequest';
import { ORGANIZING_GOALS, ORGANIZING_PURPOSES } from '../features/consultation/organizing';
export { ORGANIZING_GOALS, ORGANIZING_PURPOSES } from '../features/consultation/organizing';

export default function OrganizingPage() {
  const [params, setParams] = useSearchParams();
  const goal = ORGANIZING_GOALS.includes(params.get('goal') || '') ? params.get('goal')! : '';
  const purpose = ORGANIZING_PURPOSES.includes(params.get('purpose') || '') ? params.get('purpose')! : '';
  function choose(key: string, value: string) {
    const next = new URLSearchParams(params); next.set(key, value); setParams(next, { replace: true });
  }
  return <div className="organizing-product">
    <Helmet><title>老前整理｜在人生的重要時刻，為生活留出空間｜好齡居 NEXDO</title><meta name="description" content="退休、老前、遺物與搬家整理，同一項整理服務、相同計價方式。選擇這次的目標與目的，由安心顧問陪您確認範圍，先評估再報價。" /><link rel="canonical" href="https://www.nexdo.tw/services/organizing" /></Helmet>
    <section className="retirement-section"><div className="retirement-container organizing-product-grid">
      <div><p className="eyebrow">老前整理</p><h1>在人生的重要時刻，<br />為生活留出空間。</h1><p className="organizing-lead">退休，為新生活重新安排日常；走到人生下半場，回看一路珍藏的物品；家人離世後，透過整理，留下與他的珍貴回憶。</p><p>每一次整理，起點可能不同。我們都陪您釐清「想留下什麼、接下來怎麼生活」，依您的步調安排。</p><a className="brand-button organizing-jump" href="#organizing-request">填寫整理需求 ↓</a><img className="organizing-product-photo" src="/images/customers/scene-94.webp" alt="穿著好齡居制服的整理人員，陪長輩整理照片與紀念物，情境示意" /><p className="image-note">情境示意</p></div>
      <div className="organizing-request" id="organizing-request"><OrganizingRequest goal={goal} purpose={purpose} choose={choose} /></div>
    </div></section>
    <section className="retirement-section organizing-section"><div className="retirement-container"><div className="section-heading"><p className="eyebrow">留下重要的，安排接下來的生活</p><h2>整理的是空間，也照顧每一份心意</h2></div><div className="organizing-steps">{[['一起確認範圍','從一個抽屜、一個房間，或整個家開始，先聽您說想改善的地方。'],['說明內容與報價','依物品量、範圍、人力與時程評估，確認後才安排執行。'],['依您的步調整理','分類、收納與紀念物保存；物品如何處理，由您或家人同意後再進行。'],['一起確認下一步','確認整理結果，視需求銜接搬家、清運或房屋出租等後續服務，另外說明範圍與費用。']].map(([title,text],i)=><article key={title}><span className="service-number">0{i+1}</span><h3>{title}</h3><p>{text}</p></article>)}</div><div className="pace-note"><div><strong>陪伴型</strong><span>邊回憶、邊討論，慢慢決定</span></div><div><strong>效率型</strong><span>您已決定方向，我們協助執行</span></div><p>兩種節奏，都尊重您的選擇。</p></div></div></section>
  </div>;
}
