import { Page, DEFAULT_SUB_ITEM_TEMPLATE, DEFAULT_MAJOR_ITEM_TEMPLATE } from '../../types/admin';
import { v4 as uuidv4 } from 'uuid';

export const shortTermCarePage: Page = {
  id: 'short-term-care',
  slug: 'short-term-care',
  title: '短期照護',
  template: 'SUB_ITEM',
  parentId: 'health',
  isPublished: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  content: {
    ...DEFAULT_MAJOR_ITEM_TEMPLATE,
    subItem: {
      ...DEFAULT_SUB_ITEM_TEMPLATE,
      productId: 'short-term-care',
      coreServicesSectionTitle: '短期照護，讓家人的愛不打折',
      coreServices: [
        {
          title: '術後返家過渡支援',
          content: '針對出院後的關鍵復原期，提供傷口簡單照顧、居家動線引導及營養餐食準備，確保長輩平安度過體力恢復期。'
        },
        {
          title: '全方位生活陪伴員',
          content: '不只是看顧，更包含代購生活物資、陪同外出散步、讀報與聊天。我們重視心靈的交流，讓長輩感到被尊重與陪伴。'
        },
        {
          title: '專業陪診與醫療紀錄',
          content: '協助預約掛號、陪同就醫，並精準記錄醫囑與下次回診資訊，讓不在身邊的子女也能第一時間掌握父母的健康狀況。'
        },
        {
          title: '彈性喘息服務',
          content: '為長期照顧者的您提供暫時的替手。不管是半天或數週，讓您能放心處理私事或稍作休息，我們幫您守護最愛的家人。'
        }
      ],
      partners: [
        {
          title: '安全守護顧問',
          description: '專業護理師與合格照服團隊。'
        },
        {
          title: '安心保證',
          description: '所有服務人員皆經過背景審核、具備專業證照，並提供投保責任險與透明回報機制。'
        }
      ],
      cases: [
        {
          id: uuidv4(),
          title: '林奶奶的復健生活',
          description: '林奶奶出院後，子女因工作無法全天候照顧。我們派駐了生活陪伴員，除了打理三餐，更鼓勵奶奶進行簡單的復健運動。',
          image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=2070&auto=format&fit=crop',
          tag: '術後照顧'
        },
        {
          id: uuidv4(),
          title: '張先生的陪診體驗',
          description: '長期居住國外的張先生，透過我們的陪診服務，張先生每個月都能收到詳盡的醫囑報告與父親的健康觀察紀錄，遠距離也能安心。',
          image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2070&auto=format&fit=crop',
          tag: '陪診服務'
        },
        {
          id: uuidv4(),
          title: '陳太太的喘息時光',
          description: '陳太太需要照顧失智的先生，她預約了每週兩次的喘息服務，讓自己能出門透氣。她說：「這幾小時的放鬆，讓我更有力氣繼續陪先生走下去。」',
          image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=2070&auto=format&fit=crop',
          tag: '喘息服務'
        }
      ],
      additionalServices: ['health-fitness', 'home-dentist']
    }
  }
};
