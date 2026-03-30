import { Page, DEFAULT_SUB_ITEM_TEMPLATE, DEFAULT_MAJOR_ITEM_TEMPLATE } from '../../types/admin';
import { v4 as uuidv4 } from 'uuid';

export const lightRenovationPage: Page = {
  id: 'light-renovation',
  slug: 'light-renovation',
  title: '樂齡輕裝修',
  template: 'SUB_ITEM',
  parentId: 'renovation',
  isPublished: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  content: {
    ...DEFAULT_MAJOR_ITEM_TEMPLATE,
    subItem: {
      ...DEFAULT_SUB_ITEM_TEMPLATE,
      productId: 'light-renovation',
      coreServicesSectionTitle: '樂齡輕裝修，小改變大舒適，擁有的新生活',
      coreServices: [
        {
          title: '全屋平整化工程',
          content: '消除室內高低差與門檻，打造輔具友善的無礙動線，讓居家行走成為一種享受而非挑戰。'
        },
        {
          title: '光感守護照明系統',
          content: '結合感應科技與高亮度演色燈光，精準配置夜間動線引導燈，為視力衰退的雙眼照亮每一吋安全路徑。'
        },
        {
          title: '機能設施高度調教',
          content: '插座移位、櫥櫃降改、扶手預埋。不需更換心愛家具，僅需微調高度與位置，就能大幅降低腰椎負擔。'
        },
        {
          title: '微氣候環境優化',
          content: '針對呼吸道與睡眠品質，整合靜音窗、通風設備與防塵塗料，創造最適合長輩休養的純淨呼吸空間。'
        }
      ],
      partners: [
        {
          title: '安全守護顧問',
          description: '國家考試合格室內設計師與專案工程團隊'
        },
        {
          title: '安心保證',
          description: '全案採用環保建材，施工期間室內空品嚴格監控，確保長輩呼吸道安全。'
        }
      ],
      cases: [
        {
          id: uuidv4(),
          title: '張爺爺的全屋優化',
          description: '我們在不更換地板的情況下，利用兩天時間消除全屋門檻，並在走廊嵌入地腳感應燈。張爺爺說：「晚上上廁所不用找開關，走路也不怕踢到腳！」',
          image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=2069&auto=format&fit=crop',
          tag: '動線優化'
        },
        {
          id: uuidv4(),
          title: '王老師的方便生活',
          description: '透過輕裝修手法，將全屋插座上移至 90 公分，並更換高演色性照明與防眩光燈具。現在王老師讀報不再流眼淚，使用電器也不用再辛苦彎腰。',
          image: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?q=80&w=2070&auto=format&fit=crop',
          tag: '照明改善'
        },
        {
          id: uuidv4(),
          title: '林伯伯的快樂廚房',
          description: '我們透過加裝「下拉式拉籃」與「感應式龍頭」，不必拆除整套舊廚具就讓廚房變好用了。林伯伯笑說：「這才是真正懂老人家需要的裝修！」',
          image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=2070&auto=format&fit=crop',
          tag: '機能微調'
        }
      ],
      additionalServices: ['decor-design', 'safety-assessment']
    }
  }
};
