import { Page, DEFAULT_MAJOR_ITEM_TEMPLATE, DEFAULT_SUB_ITEM_TEMPLATE } from '../../types/admin';
import { v4 as uuidv4 } from 'uuid';

export const elderlyHousingPage: Page = {
  id: 'elderly-housing-exchange',
  slug: 'elderly-housing-exchange',
  title: '適老換屋',
  template: 'SUB_ITEM',
  isPublished: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  content: {
    ...DEFAULT_MAJOR_ITEM_TEMPLATE,
    subItem: {
      productId: 'elderly-housing-exchange',
      ...DEFAULT_SUB_ITEM_TEMPLATE,
      coreServicesSectionTitle: '適老換屋，將「房產」化為「資產」',
      coreServices: [
        {
          title: '資產活化評估',
          content: '專業分析老屋殘值，提供「售、租、留」財務規劃，讓沉睡的房產轉化為高品質晚年生活基金 。'
        },
        {
          title: '全效代租代管',
          content: '首創收益直轉「安心卡」護盾金，確保每月晚年現金流穩定透明，免除長輩修繕、收租負擔 。'
        },
        {
          title: '適老輕裝修',
          content: '專為換屋需求打造，透過快速工期進行防滑、扶手與照明優化，實現真正的無障礙居家環境 。'
        },
        {
          title: '代尋適老新屋',
          content: '依據健康階段媒合電梯大樓或高齡公寓，代為把關社區環境與醫療可達性 。'
        }
      ],
      partners: [
        {
          title: '安全守護顧問',
          description: '我們不只是房產經紀，更是您家庭資產的守護顧問 。'
        },
        {
          title: '安全保證',
          description: '所有換屋規劃皆包含資產保全機制，確保每一分房產收益都能真正服務於您的生活 。'
        },
        {
          title: '策略夥伴',
          description: '信義房屋、租寓'
        }
      ],
      cases: [
        {
          id: uuidv4(),
          title: '王伯伯的公寓轉身記',
          description: '從爬不完的公寓樓梯，換到電梯大樓並領取固定租金收益，生活品質大幅提升 。',
          image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop',
          tag: '適老換屋'
        },
        {
          id: uuidv4(),
          title: '林太太的資產活化體驗',
          description: '透過代租代管，將舊家租金直接撥入安心卡，看病與日常花費再也不用向子女開口 。',
          image: 'https://images.unsplash.com/photo-1554469384-e58fac16e23a?q=80&w=2070&auto=format&fit=crop',
          tag: '資產活化'
        },
        {
          id: uuidv4(),
          title: '張先生的無障礙新居',
          description: '透過專業媒合找到離醫院近的電梯大樓，就醫復健不再舟車勞頓，子女也更放心。',
          image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=2070&auto=format&fit=crop',
          tag: '代尋新屋'
        }
      ],
      additionalServices: ['home-safety', 'peace-of-mind'] // Link to home-safety and peace-of-mind-card
    }
  }
};
