import { Page, DEFAULT_MAJOR_ITEM_TEMPLATE } from '../../types/admin';
import { v4 as uuidv4 } from 'uuid';

export const cleaningPage: Page = {
  id: 'cleaning',
  slug: 'cleaning',
  title: '收納清潔',
  template: 'MAJOR_ITEM',
  isPublished: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  content: {
    ...DEFAULT_MAJOR_ITEM_TEMPLATE,
    servicesSectionTitle: '全方位服務',
    hero: {
      ...DEFAULT_MAJOR_ITEM_TEMPLATE.hero,
      title: '收納清潔，陪您找回家的呼吸空間',
      description: '從專業的居家整聊到細心的空間規劃，我們提供溫暖的收納清潔服務，陪您梳理生活環境，讓家重新充滿輕盈與自在的氣息。',
      backgroundImage: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=1200',
    },
    services: [
      {
        id: 'service-1',
        title: '居家整聊',
        description: '生活不該被雜物佔據。透過「傾聽需求、篩選回憶、空間重塑」的過程，在熟悉的角落裡找回與空間的連結。',
        image: 'https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?auto=format&fit=crop&q=80&w=1200',
        items: ['專業整聊顧問陪伴', '情感導向的物資篩選', '實用導向的空間配置'],
        price: '依坪數報價',
        targetPageId: 'home-reorganization'
      },
      {
        id: 'service-2',
        title: '收納規劃',
        description: '家裡的物品，都是您精彩生活的印記。陪您重新理清生活動線，不強迫丟棄，而是透過專業的層次配置，讓每一件心愛的物品都有最順手的歸宿。',
        image: 'https://images.unsplash.com/photo-1594484208280-efa00f9e990c?auto=format&fit=crop&q=80&w=1200',
        items: ['預見未來十年的起居動線規劃', '針對體力限制設計的低負擔收納', '免除攀高蹲低的系統化分類'],
        price: '立即預約',
        targetPageId: 'organization-planning'
      },
      {
        id: uuidv4(),
        title: '定期清潔',
        description: '打理好那些最費心的角落，讓廚房的油垢與衛浴的積水不再成為負擔。現在就讓專業團隊，為您找回那份久執的居家品質。',
        image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=1200',
        items: ['廚房衛浴專業除污垢', '天然無毒除菌清潔', '過敏原深度除塵'],
        price: '600 / 小時',
        targetPageId: 'regular-cleaning'
      },
      {
        id: uuidv4(),
        title: '室內清運',
        description: '不管是搬家後的舊家具，還是堆積已久的雜物，我們陪您一次理清，找回居家環境最初的呼吸感。',
        image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=1200',
        items: ['大型家具專業拆解搬運', '環保合法清運流程', '施工後基礎環境清消'],
        price: '2000 / 車',
        targetPageId: 'home-clearance'
      }
    ],
    cases: [
      {
        id: uuidv4(),
        title: '讓回憶與空間和諧共處',
        description: '陳奶奶面對累積數十年的舊物感到負擔。我們陪她一起分類、聊聊過往，最後將珍貴的回憶妥善安放，讓客廳恢復了往日的寬敞與採光。',
        image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=1200',
        tag: '居家整聊'
      },
      {
        id: uuidv4(),
        title: '打造不再『卡卡』的廚房動線',
        description: '為了讓愛下廚的爸爸更輕鬆，我們重新梳理廚房的儲物邏輯。把沉重的鍋具移到好拿的位置，讓下廚不再是體力活，而是每日的樂趣。',
        image: 'https://images.unsplash.com/photo-1556910103-1c02745a872f?auto=format&fit=crop&q=80&w=1200',
        tag: '空間規劃'
      },
      {
        id: uuidv4(),
        title: '迎接陽光的臥室斷捨離',
        description: '林小姐的房間長期被包裹與舊衣佔據。透過整聊師的引導與篩選，我們陪她清出多餘物資並轉贈他人，讓臥室重新變回可以安心好眠的空間。',
        image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=1200',
        tag: '斷捨離'
      }
    ]
  }
};
