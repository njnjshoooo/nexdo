import { Page, DEFAULT_MAJOR_ITEM_TEMPLATE, DEFAULT_SUB_ITEM_TEMPLATE } from '../../types/admin';
import { v4 as uuidv4 } from 'uuid';

export const bathroomRenovationPage: Page = {
  id: 'bathroom-renovation',
  slug: 'bathroom-renovation',
  title: '衛浴裝修',
  template: 'SUB_ITEM',
  parentId: 'home-safety',
  isPublished: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  content: {
    ...DEFAULT_MAJOR_ITEM_TEMPLATE,
    subItem: {
      productId: 'bathroom-renovation',
      ...DEFAULT_SUB_ITEM_TEMPLATE,
      button: {
        text: '立即預約',
        type: 'FORM',
        value: 'booking-form',
        isVisible: true
      },
      coreServicesSectionTitle: '衛浴裝修，享受全然的沐浴安心感',
      coreServices: [
        {
          title: '空間評估',
          content: '精準找出最適合您的扶手位置與地面高度，讓安全更符合人性。'
        },
        {
          title: '防跌倒物件選用',
          content: '提供兼具美感的物件選用建議，讓腳下的每一分觸感都是踏實且溫暖的。'
        },
        {
          title: '無障礙動線設計',
          content: '透過截水溝設計與無障礙拉門的配置，讓進出浴室像走在平地般輕鬆自在。'
        },
        {
          title: '保固與關懷',
          content: '持續追蹤使用狀況，確保您的沐浴時光始終如初般安全愉快。'
        }
      ],
      partners: [
        {
          title: '安全守護顧問',
          description: '安全專家，專注於「去失能化」的衛浴配置，與您一起守護沐浴時光。'
        },
        {
          title: '安心保證',
          description: '所有產品皆經過使用測試，確保在關鍵時刻提供最穩定的支持力。'
        }
      ],
      cases: [
        {
          id: uuidv4(),
          title: '鍾伯伯的洗澡時光',
          description: '原本因為怕滑而減少洗澡次數的鍾伯伯，在鋪設防滑地磚與增設安全扶手後，現在能享受放鬆的熱水澡，找回生活尊嚴與自信。',
          image: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?q=80&w=2070&auto=format&fit=crop',
          tag: '自信洗澡'
        },
        {
          id: uuidv4(),
          title: '羅奶奶的無檻小日子',
          description: '門檻曾讓羅奶奶絆倒過。我們陪她進行衛浴大變身，抹平高低差並更換無障礙拉門，讓她現在進出浴室不再需要提心吊膽。',
          image: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?q=80&w=2070&auto=format&fit=crop',
          tag: '無檻日子'
        },
        {
          id: uuidv4(),
          title: '邱先生的衛浴連動',
          description: '考慮到邱先生的體力，我們微調了浴室設備的間距，讓他從坐起、洗漱到離開都能一氣呵成，大幅降低了沐浴過程中的體力負擔。',
          image: 'https://images.unsplash.com/photo-1564540583246-934409427776?q=80&w=2070&auto=format&fit=crop',
          tag: '體力負擔'
        }
      ],
      additionalServices: ['safety-assessment', 'old-house-diagnosis']
    }
  }
};
