import { Page, DEFAULT_MAJOR_ITEM_TEMPLATE } from '../../types/admin';
import { v4 as uuidv4 } from 'uuid';

export const rentMovePage: Page = {
  id: 'rent-and-move',
  slug: 'rent-and-move',
  title: '租房搬家',
  template: 'MAJOR_ITEM',
  isPublished: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  content: {
    ...DEFAULT_MAJOR_ITEM_TEMPLATE,
    hero: {
      title: '租房搬家，\n開啟樂齡新生活',
      description: '從代租代管到適老換屋，我們提供一站式的租房搬家服務，讓您輕鬆轉換生活環境，享受更適合的居住空間。',
      backgroundImage: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop',
      mainButton: { text: '預約諮詢', type: 'FORM', value: '', isVisible: true },
      secondaryButton: { text: '查看案例', type: 'URL', value: '#cases', isVisible: true },
    },
    services: [
      {
        id: uuidv4(),
        title: '代租代管',
        description: '租務繁瑣，不該是您退休生活的負擔。我們陪您打理從篩選房客到房屋修繕的每一處細節，讓您的資產成為最穩固的支持。',
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop',
        items: ['租客篩選與管理', '修繕通報與專業維護', '透明租金管理與法律顧問支持'],
        price: '依專案報價',
        targetPageId: 'rental-management'
      },
      {
        id: uuidv4(),
        title: '適老換屋',
        description: '老屋的樓梯不應成為生活的阻礙。透過「活化、代管、改裝、尋新」四步曲，在熟悉的記憶與舒適的空間中取得平衡 。',
        image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop',
        items: ['資產活化評估', '全效代租代管', '適老輕裝修', '代尋適老新屋'],
        price: '依需求報價',
        targetPageId: 'elderly-housing-exchange'
      },
      {
        id: uuidv4(),
        title: '安心移居',
        description: '不只是物品的移動，更是生活空間的溫柔轉移。專業、細心、透明化，讓搬家不再是體力與心理的負擔。',
        image: 'https://images.unsplash.com/photo-1574689211272-bc15e6406241?q=80&w=2070&auto=format&fit=crop',
        items: ['貼近心靈的斷捨離引導', '100% 物品定位還原技術', '搬遷全程專業督導隨行'],
        price: '依物品量報價',
        targetPageId: 'safe-moving'
      },
      {
        id: uuidv4(),
        title: '房屋仲介',
        description: '不只是買賣房子，更是為您的老後資產尋找最優解。我們結合法律、財務與建築評估，確保每一筆交易都能換取更安穩的晚年生活。',
        image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=2073&auto=format&fit=crop',
        items: ['高齡適居房屋篩選', '嚴防房產詐騙', '財務估算建議'],
        price: '法定服務費',
        targetPageId: 'real-estate'
      },
    ],
    cases: [
      {
        id: uuidv4(),
        title: '王伯伯的換屋故事',
        description: '從老公寓換到電梯大樓，不用再爬樓梯，生活品質大幅提升，出門也更方便了。',
        image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop',
        tag: '適老換屋'
      },
      {
        id: uuidv4(),
        title: '林太太的代管經驗',
        description: '交給專業團隊管理，每月準時收租，房屋修繕也有專人處理，省心又省力。',
        image: 'https://images.unsplash.com/photo-1554469384-e58fac16e23a?q=80&w=2070&auto=format&fit=crop',
        tag: '代租代管'
      },
      {
        id: uuidv4(),
        title: '張先生的搬家心得',
        description: '全程免動手，連易碎品都包裝得很好，搬家就像去旅行一樣輕鬆，當天就能入住新家。',
        image: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?q=80&w=2070&auto=format&fit=crop',
        tag: '安心搬家'
      },
    ]
  }
};
