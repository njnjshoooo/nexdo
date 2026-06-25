import { Page, DEFAULT_MAJOR_ITEM_TEMPLATE, DEFAULT_SUB_ITEM_TEMPLATE } from '../../types/admin';
import { v4 as uuidv4 } from 'uuid';

export const oldHouseDiagnosisPage: Page = {
  id: 'old-house-diagnosis',
  slug: 'old-house-diagnosis',
  title: '舊屋診斷',
  template: 'SUB_ITEM',
  isPublished: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  content: {
    ...DEFAULT_MAJOR_ITEM_TEMPLATE,
    subItem: {
      productId: 'old-house-diagnosis',
      ...DEFAULT_SUB_ITEM_TEMPLATE,
      coreServicesSectionTitle: '老屋診斷，我們陪您一起守護這個家',
      coreServices: [
        {
          title: '環境評估',
          content: '每個家都有它的個性。我們想先了解您住在這裡的日常感受，陪您看看哪些角落是您最在意、最想變得更舒心的。'
        },
        {
          title: '結構觀察',
          content: '根據多年經驗，我們會仔細查看牆體、管線與結構，清楚告訴您房子的真實狀況。'
        },
        {
          title: '改善建議',
          content: '針對發現的小問題，我們會提供實踐過的改善做法，您可以按需求自由選擇要調整的部分。'
        },
        {
          title: '長期守護夥伴',
          content: '診斷不是結束，而是安心的開始！我們像好鄰居一樣隨時在側，支持您維持一個安全、自在的居住環境。'
        }
      ],
      partners: [
        {
          title: '安全守護顧問',
          description: '我們不只是技師，更是守護您資產與居住尊嚴的夥伴。'
        },
        {
          title: '安心保證',
          description: '過程透明可靠，給予具體且實在的專業意見，不誇大問題。'
        }
      ],
      cases: [
        {
          id: uuidv4(),
          title: '李老師的漏水排解',
          description: '住在老公寓的李老師，擔心牆面滲水影響結構。我們陪她一起找出滲水點，用簡單穩妥的方式補強，讓她不用擔心下雨天。',
          image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=2073&auto=format&fit=crop',
          tag: '漏水排解'
        },
        {
          id: uuidv4(),
          title: '謝爺爺的管線體檢',
          description: '電線老舊讓謝爺爺很焦慮。我們陪著他一一檢查，確認用電安全，並微調了插座位置，讓生活變得更方便、更踏實。',
          image: 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?q=80&w=2070&auto=format&fit=crop',
          tag: '管線體檢'
        },
        {
          id: uuidv4(),
          title: '張阿姨的採光微調',
          description: '老屋採光不足。透過診斷建議，我們陪阿姨調整了隔間與照明，讓陽光重新照進家裡，心情也跟著亮了起來。',
          image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop',
          tag: '採光微調'
        }
      ],
      additionalServices: ['safety-assessment', 'elderly-housing-exchange']
    }
  }
};
