import { Page, DEFAULT_MAJOR_ITEM_TEMPLATE, DEFAULT_SUB_ITEM_TEMPLATE } from '../../types/admin';
import { v4 as uuidv4 } from 'uuid';

export const healthFitnessPage: Page = {
  id: 'health-fitness',
  slug: 'health-fitness',
  title: '到府體適能',
  template: 'SUB_ITEM',
  isPublished: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  content: {
    ...DEFAULT_MAJOR_ITEM_TEMPLATE,
    subItem: {
      productId: 'health-fitness',
      ...DEFAULT_SUB_ITEM_TEMPLATE,
      coreServicesSectionTitle: '到府體適能，我們陪您一起找回身體的活力',
      coreServices: [
        {
          title: '身心狀況了解',
          content: '先了解您平常活動的感受，陪您看看哪些動作是您想挑戰、或是想做得更輕鬆的。'
        },
        {
          title: '活力機能觀察',
          content: '不使用生硬的醫療數據，而是清楚告訴您身體目前的強項與需要補強的地方。'
        },
        {
          title: '改善建議',
          content: '針對您的需求，提供溫和運動做法，您可以按心情與體能狀況，自由選擇想練習的內容。'
        },
        {
          title: '健康夥伴',
          content: '我們像好鄰居一樣隨時在側，支持您維持一個充滿活力、自在無憂的樂齡生活。'
        }
      ],
      partners: [
        {
          title: '安全守護顧問',
          description: '理解長輩身心需求、守護您生活尊嚴的夥伴。'
        },
        {
          title: '安心保證',
          description: '給予具體且實在的運動意見，不追求極限，只追求您的生活品質。'
        }
      ],
      cases: [
        {
          id: uuidv4(),
          title: '鍾伯伯的散步圓夢計畫',
          description: '曾經覺得上下樓梯很費力的鍾伯伯，在老師的溫暖陪伴下進行適度的腿部力量訓練，現在能輕鬆走到公園與老友下棋，找回行動的自信。',
          image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2070&auto=format&fit=crop',
          tag: '散步圓夢'
        },
        {
          id: uuidv4(),
          title: '羅奶奶的優雅起居',
          description: '起床時總是覺得腰背僵硬的羅奶奶，我們陪著她學習簡單的床上伸展，現在每天醒來都能感到身心舒暢，開啟更有精神的一天。',
          image: 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?q=80&w=2070&auto=format&fit=crop',
          tag: '優雅起居'
        },
        {
          id: uuidv4(),
          title: '邱先生的平衡守護',
          description: '擔心絆倒而不敢出遠門的邱先生，透過我們的平衡與反應練習，重新掌握身體重心，現在又重新享受獨自去超市採買的樂趣。',
          image: 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?q=80&w=2070&auto=format&fit=crop',
          tag: '平衡守護'
        }
      ],
      additionalServices: ['home-reorganization', 'safety-assessment', 'home-dentist'],
      
    }
  }
};
