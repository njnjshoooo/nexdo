import { Page, DEFAULT_MAJOR_ITEM_TEMPLATE } from '../../types/admin';
import { v4 as uuidv4 } from 'uuid';

export const homeSafetyPage: Page = {
  id: 'home-safety',
  slug: 'home-safety',
  title: '居住安全',
  template: 'MAJOR_ITEM',
  isPublished: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  content: {
    ...DEFAULT_MAJOR_ITEM_TEMPLATE,
    hero: {
      title: '居住安全，\n是給家人最好的承諾',
      description: '一次跌倒、滑倒或用電不慎，都可能改變全家的生活。我們結合專業職能治療師與工程團隊，為您提前把風險降到最低，讓家成為最安心的避風港。',
      backgroundImage: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=1200',
      mainButton: { text: '預約諮詢', type: 'FORM', value: '', isVisible: true },
      secondaryButton: { text: '查看案例', type: 'URL', value: '#cases', isVisible: true },
    },
    services: [
      {
        id: uuidv4(),
        title: '舊屋診斷',
        description: '老房子裝載了無數故事，也可能隱藏了需要修補的痕跡。我們陪您一起聽聽房子的聲音，找出讓生活更安穩的守護方式。',
        image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1200',
        items: ['資深專業診斷團隊陪伴', '實踐導向的環境安全建議', '透明清楚的修繕改善方案'],
        price: '1,000起',
        targetPageId: 'old-house-diagnosis'
      },
      {
        id: uuidv4(),
        title: '安全評估',
        description: '家是最放鬆的地方，不該有看不見的絆腳石。我們陪您走一遍家裡的每個角落，找出能讓您行走更穩、起居更輕鬆的貼心調整。',
        image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=1200',
        items: ['100 點居家安全細節巡檢', '物理治療師與空間顧問共同參與', '量身打造的輔具與修繕建議'],
        price: '2,500起',
        targetPageId: 'safety-assessment'
      },
      {
        id: uuidv4(),
        title: '衛浴裝修',
        description: '與您一起告別濕滑的隱憂，從地磚、扶手到動線微調，打造一個讓您進出更自在、洗得更踏實的安心沐浴空間。',
        image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=1200',
        items: ['防滑地磚鋪設', '安全扶手安裝', '無障礙淋浴拉門', '截水溝無障礙設計'],
        price: '依需求報價',
        targetPageId: 'bathroom-renovation'
      },
    ],
    cases: [
      {
        id: uuidv4(),
        title: '85歲獨居陳奶奶的浴室改造',
        description: '陳奶奶因浴室門檻過高跌倒過一次，我們協助拆除門檻並安裝一字型扶手，現在她能安心地自己洗澡了。',
        image: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&q=80&w=1200',
        tag: '衛浴改善'
      },
      {
        id: uuidv4(),
        title: '老舊公寓的動線優化',
        description: '針對30年老公寓走道狹窄昏暗的問題，我們重新規劃照明並安裝感應燈，讓半夜起床上廁所不再心驚膽跳。',
        image: 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?auto=format&fit=crop&q=80&w=1200',
        tag: '照明改善'
      },
      {
        id: uuidv4(),
        title: '全室防滑地板施工',
        description: '林爺爺喜歡在家裡穿襪子走路，我們為全室更換了高係數防滑木紋磚，兼具美觀與安全性。',
        image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&q=80&w=1200',
        tag: '地板防滑'
      },
    ]
  }
};
