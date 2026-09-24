import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';

import OrganizingRequest from '../features/consultation/OrganizingRequest';
import { ORGANIZING_GOALS, ORGANIZING_PURPOSES } from '../features/consultation/organizing';
export { ORGANIZING_GOALS, ORGANIZING_PURPOSES } from '../features/consultation/organizing';

/** 適合誰：先讓訪客對號入座，再往下看服務內容。照片皆為情境示意。 */
const SITUATIONS: { title: string; text: string; img: string; alt: string }[] = [
  { title: '想把家住得更輕鬆', text: '走道被物品佔住、常用的東西找不到，希望日常動線順一點，也降低跌倒的機會。', img: '/images/customers/scene-368.webp', alt: '走道兩側堆滿紙箱與收納箱，長輩側身通過，情境示意' },
  { title: '想先安排重要的物品', text: '證件、保單、印章與紀念物散在各處，想趁自己還做得動時，先整理成家人找得到的樣子。', img: '/images/customers/scene-369.webp', alt: '長輩在桌前翻閱證件、印章與文件，情境示意' },
  { title: '正在面對生活轉換', text: '退休、換屋、與子女同住，或家中剛有成員離開，需要有人陪著一起決定物品的去留。', img: '/images/customers/scene-103.webp', alt: '客廳堆放搬家紙箱，屋主站在一旁思考，情境示意' },
  { title: '家人住得遠，想幫忙安排', text: '子女不在身邊，想先了解服務方式與費用，再與長輩討論要不要進行。', img: '/images/customers/scene-31.webp', alt: '好齡居顧問透過視訊與家屬說明服務，情境示意' },
];

/** 服務內容：四個階段，各自說明實際會做的事。 */
const STEPS: { title: string; text: string; img: string; alt: string; items: string[] }[] = [
  {
    title: '生活與物品盤點',
    text: '先聽您說平常怎麼生活，從最想改善的地方開始。',
    img: '/images/customers/scene-32.webp', alt: '好齡居顧問與長輩夫妻在餐桌前討論整理範圍，情境示意',
    items: ['了解作息、身體狀況與使用習慣', '確認這次要整理的範圍與時間', '找出最影響日常的空間，先排順序'],
  },
  {
    title: '陪伴分類與取捨',
    text: '把物品分成「留、傳、贈、離」，一件一件確認。',
    img: '/images/customers/scene-9.webp', alt: '整理人員與屋主一起把物品分類裝入標示捐贈的紙箱，情境示意',
    items: ['不確定的物品先留下，不會替您決定', '重要文件、證件與保單集中收放', '要送出或處理的物品，先經您或家人同意'],
  },
  {
    title: '紀念物與重要物整理',
    text: '照片、手寫信與紀念品，另外留時間慢慢看。',
    img: '/images/customers/scene-7.webp', alt: '整理人員陪長輩翻看相簿與紀念物，情境示意',
    items: ['紀念物可拍照建檔，留下物品背後的故事', '體積大的紀念物，討論保存或替代方式', '需要長期保存的物品，說明合適的收納條件'],
  },
  {
    title: '收納配置與後續安排',
    text: '常用的東西放回順手的位置，再一起核對一次。',
    img: '/images/customers/scene-8.webp', alt: '整理人員與屋主一起把餐具收回順手取用的層架，情境示意',
    items: ['依身高與慣用手安排取用高度', '標示收納位置，家人也找得到', '需要清運、清潔或搬家時，另外說明範圍與費用'],
  },
];

/** 兩種節奏：同一項服務，差別在陪伴的深度與時程。 */
const PACES: { label: string; title: string; text: string; img: string; alt: string; items: string[] }[] = [
  {
    label: 'WITH YOU',
    title: '陪伴型',
    text: '想慢慢回顧，就逐件聊、分次整理。',
    img: '/images/customers/scene-104.webp', alt: '家人與整理人員一起翻看照片、慢慢決定去留，情境示意',
    items: ['適合還在考慮物品去留、想邊回憶邊決定', '可分成多次進行，每次處理一個區域', '家人可一起參與，討論後再決定'],
  },
  {
    label: 'WITH A CLEAR PLAN',
    title: '效率型',
    text: '方向已經決定，就依清單分類、集中處理。',
    img: '/images/customers/scene-96.webp', alt: '整理人員向屋主說明分類計畫，現場已備妥紙箱，情境示意',
    items: ['適合已確定要保留與處理的範圍', '依約定時程執行，減少往返次數', '遇到清單外或不確定的物品，仍會先問過您'],
  },
];

/** 預約到交接，讓訪客知道送出表單之後會發生什麼事。 */
const FLOW: [string, string][] = [
  ['先聊需求', '顧問會依您留的電話聯繫，了解現況與最想先處理的地方。'],
  ['評估與報價', '確認範圍、物品量、人力與時段後說明費用，第一次到府評估免費。'],
  ['確認後整理', '您同意費用與時段才安排。過程中遇到不確定的物品，會先問過您。'],
  ['一起交接', '核對重要物品與收納位置，說明後續待辦，這次整理才算完成。'],
];

const PREPARE: string[] = [
  '想先處理的空間，例如臥室、廚房或儲藏室',
  '哪些物品或區域這次先不要動',
  '家中是否有需要避開的時段，例如午休或外出就醫',
  '有沒有希望一起參與的家人',
  '大型家具或家電是否需要一併處理',
];

const FAQS: [string, string][] = [
  ['一定要年紀大了才需要整理嗎？', '不用。很多人是在退休、換屋、與家人同住前，先把空間和物品安排好。只要您覺得現在的生活可以更順一點，就是合適的時間點。'],
  ['我還不想丟東西，也可以請你們來嗎？', '可以。整理不等於丟東西。我們會陪您把物品分類、找到合適的位置，不確定的先留著；要不要處理，決定權在您。'],
  ['子女可以替父母預約嗎？', '可以，但實際整理時仍以長輩本人的意願為準。建議在初談時讓長輩一起參與，或先由顧問說明服務方式，再由家人討論。'],
  ['照片、手寫信這類紀念物怎麼處理？', '紀念物會另外留時間整理，可以拍照建檔、記錄物品的故事，再討論保留的方式與數量。'],
  ['一定要一次整理整個家嗎？', '不用。可以從一個抽屜、一個房間開始，之後再決定要不要繼續。範圍在評估時一起確認。'],
  ['整理出來的物品可以幫忙載走嗎？', '可以協助安排清運或回收，屬於另外計價的項目，會在報價時一併說明，經您同意後才進行。'],
  ['費用怎麼計算？', '依整理範圍、物品量、需要的人力與時程評估後報價。第一次到府評估免費，確認費用與時段後才安排服務。'],
];

const RELATED: [string, string][] = [
  ['退休整理', '退休後重新安排日常，把空間調整成接下來好住的樣子。'],
  ['遺物整理', '家人離開後，陪您以自己的步調整理遺物與回憶。'],
  ['搬家整理', '搬家前先分類打包，搬入後再安排順手的收納位置。'],
];

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
      <div><p className="eyebrow">老前整理</p><h1>在人生的重要時刻，<br />為生活留出空間。</h1><p className="organizing-lead">退休，為新生活重新安排日常；走到人生下半場，回看一路珍藏的物品；家人離世後，透過整理，留下與他的珍貴回憶。</p><p>每一次整理，起點可能不同。我們都陪您釐清「想留下什麼、接下來怎麼生活」，依您的步調安排。</p><p className="organizing-meta">先評估再報價・第一次到府評估免費・確認後才安排</p><a className="brand-button organizing-jump" href="#organizing-request">填寫整理需求 ↓</a><img className="organizing-product-photo" src="/images/customers/scene-94.webp" alt="穿著好齡居制服的整理人員，陪長輩整理照片與紀念物，情境示意" /><p className="image-note">情境示意</p></div>
      <div className="organizing-request" id="organizing-request"><OrganizingRequest goal={goal} purpose={purpose} choose={choose} /></div>
    </div></section>

    <section className="retirement-section"><div className="retirement-container">
      <div className="section-heading"><p className="eyebrow">適合誰</p><h2>不用先整理好，<br />我們先聽您說。</h2><p>不必一次整理整個家，也不用先說服自己放下。從一個抽屜、一疊照片，或一件一直掛心的事開始都可以。</p><p className="image-note">本頁照片為服務情境示意，非實際客戶或成果紀錄。</p></div>
      <div className="organizing-cards">{SITUATIONS.map(s => <article className="organizing-card" key={s.title}><img className="organizing-card-photo" src={s.img} alt={s.alt} loading="lazy" /><h3>{s.title}</h3><p>{s.text}</p></article>)}</div>
    </div></section>

    <section className="retirement-section organizing-section"><div className="retirement-container">
      <div className="section-heading"><p className="eyebrow">服務內容</p><h2>整理的是空間，也照顧每一份心意</h2><p>以下是一次完整整理會經過的四個階段。實際範圍依現場評估調整，確認報價後才開始。</p></div>
      <div className="organizing-steps">{STEPS.map((step, i) => <article key={step.title}><img className="organizing-card-photo" src={step.img} alt={step.alt} loading="lazy" /><span className="service-number">0{i + 1}</span><h3>{step.title}</h3><p>{step.text}</p><ul className="organizing-list">{step.items.map(item => <li key={item}>{item}</li>)}</ul></article>)}</div>
    </div></section>

    <section className="retirement-section"><div className="retirement-container">
      <div className="section-heading"><p className="eyebrow">整理方式</p><h2>想慢慢選，或快一點完成，<br />都有合適的做法。</h2></div>
      <div className="organizing-pace-grid">{PACES.map(pace => <article className="organizing-card" key={pace.title}><img className="organizing-card-photo" src={pace.img} alt={pace.alt} loading="lazy" /><p className="eyebrow">{pace.label}</p><h3>{pace.title}</h3><p>{pace.text}</p><ul className="organizing-list">{pace.items.map(item => <li key={item}>{item}</li>)}</ul></article>)}</div>
      <p className="organizing-footnote">兩種方式可以搭配。紀念物會另外留時間；清運、寄倉、特殊保存、清潔與搬家屬於另外計價的項目，會在報價時一併說明。</p>
    </div></section>

    <section className="retirement-section organizing-section"><div className="retirement-container">
      <div className="section-heading"><p className="eyebrow">流程與費用</p><h2>從第一次聯繫，<br />到最後一起確認。</h2></div>
      <div className="organizing-steps">{FLOW.map(([title, text], i) => <article key={title}><span className="service-number">0{i + 1}</span><h3>{title}</h3><p>{text}</p></article>)}</div>
      <div className="organizing-prepare">
        <div>
          <h3>初談前，可以先想想這些</h3>
          <p>不必先準備得很完整，想到多少說多少，其餘顧問會一起釐清。</p>
          <ul className="organizing-list">{PREPARE.map(item => <li key={item}>{item}</li>)}</ul>
        </div>
        <div className="organizing-note-card">
          <img className="organizing-card-photo" src="/images/customers/scene-99.webp" alt="顧問到府記錄空間狀況與收納需求，情境示意" loading="lazy" />
          <h3>費用與確認方式</h3>
          <p>第一次到府評估免費。整理費用依範圍、物品量、人力與時程評估後報價，經您確認費用與時段才安排服務；未經確認不會處理任何物品。</p>
          <p>物品的去留以本人意願及家人同意為前提。整理服務不代擬遺囑、不判斷繼承或財產分配，也不取代法律、稅務、醫療或心理專業；有這方面的需求時，建議另外諮詢相關專業人員。</p>
          <a className="brand-button" href="#organizing-request">先取得需求評估 ↑</a>
        </div>
      </div>
    </div></section>

    <section className="retirement-section faq-section"><div className="retirement-container faq-layout">
      <div className="section-heading"><p className="eyebrow">常見問題</p><h2>您可能還想知道。</h2><p>還有其他想問的，填單時寫在需求說明，顧問聯繫時會一起回覆。</p></div>
      <div>{FAQS.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div>
    </div></section>

    <section className="retirement-section"><div className="retirement-container">
      <div className="section-heading"><p className="eyebrow">其他人生階段</p><h2>不同的時刻，都有合適的陪伴。</h2><p>都是同一項整理服務、相同的計價方式，差別在這次想先處理的事。</p></div>
      <div className="organizing-cards">{RELATED.map(([title, text]) => <a className="organizing-card" key={title} href={`/services/organizing?goal=${encodeURIComponent(title)}#organizing-request`}><h3>{title}</h3><p>{text}</p><span className="organizing-card-link">看這個目標的整理 →</span></a>)}</div>
    </div></section>
  </div>;
}
