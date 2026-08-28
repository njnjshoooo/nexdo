import { Page, DEFAULT_MAJOR_ITEM_TEMPLATE, DEFAULT_SUB_ITEM_TEMPLATE } from '../../types/admin';
import { v4 as uuidv4 } from 'uuid';

export const orgPlanningPage: Page = {
  id: 'organization-planning',
  slug: 'organization-planning',
  title: '收納規劃',
  template: 'SUB_ITEM',
  isPublished: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  content: {
    ...DEFAULT_MAJOR_ITEM_TEMPLATE,
    subItem: {
      productId: 'organization-planning',
      ...DEFAULT_SUB_ITEM_TEMPLATE,
      coreServicesSectionTitle: '收納規劃，陪您找回與家最舒適的距離',
      coreServices: [
        {
          title: '梳理日常節奏',
          content: '每個人都有自己的生活節奏。我們想了解您最常使用的物品在哪裡？陪您找出那些讓您找得辛苦、放得吃力的區塊。'
        },
        {
          title: '物品的黃金位置',
          content: '專業規劃師會陪您定義「最順手的收納高度」。我們將常用的生活必需品移至不必彎腰、不必踮腳的黃金地帶。'
        },
        {
          title: '讓空間會說話',
          content: '了讓未來取物更直覺，我們提供適合長輩閱讀的視覺化標示建議，陪您建立一個「不必思考也能歸位」的簡單系統。'
        },
        {
          title: '輕鬆維持的提案',
          content: '規劃是為了讓您活得更輕鬆。我們提供不費力的維持小技巧，像鄰居一樣支持您在未來的日子裡，始終享有清爽的居家氛圍。'
        }
      ],
      partners: [
        {
          title: '為什麼選擇好齡居？',
          description: '安全守護顧問：我們關注您的關節健康與防墜安全，是你堅定的居住顧問。'
        },
        {
          title: '安心保證',
          description: '所有的收納五金與層架，皆以穩固與易操作為首要考量，讓您拿取重物也心安。'
        },
        {
          title: '策略夥伴',
          description: '居家整聊室'
        }
      ],
      cases: [
        {
          id: uuidv4(),
          title: '鍾伯伯的工具箱',
          description: '鍾伯伯喜歡修補，但厚重的工具箱放在櫃子最底層。我們陪他重新規劃了工作桌下方的抽屜，按使用頻率分類，現在他修起東西來更得心應手。',
          image: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?q=80&w=2070&auto=format&fit=crop',
          tag: '收納規劃'
        },
        {
          id: uuidv4(),
          title: '羅奶奶的四季衣櫥',
          description: '每次換季都要大費周章搬動衣箱。我們陪奶奶微調了衣櫃層板，將厚重衣物與備用被褥移至有助力的滑動軌道，現在換季對奶奶來說只是小事一樁。',
          image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=1974&auto=format&fit=crop',
          tag: '空間微調'
        },
        {
          id: uuidv4(),
          title: '邱先生不再失蹤的藥盒',
          description: '藥品散落在客廳各處容易遺忘。我們陪邱先生在餐桌旁規劃了一個專屬的「健康加油站」，將藥品與水杯集中放置並貼上大字標籤，守護他每日的安心健康。',
          image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=2070&auto=format&fit=crop',
          tag: '健康收納'
        }
      ],
      additionalServices: ['home-reorganization', 'cleaning'],
      
    }
  }
};
