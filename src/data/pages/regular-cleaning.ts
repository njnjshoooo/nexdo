import { Page, DEFAULT_SUB_ITEM_TEMPLATE, DEFAULT_MAJOR_ITEM_TEMPLATE } from '../../types/admin';
import { v4 as uuidv4 } from 'uuid';

export const regularCleaningPage: Page = {
  id: 'regular-cleaning',
  slug: 'regular-cleaning',
  title: '定期清潔',
  template: 'SUB_ITEM',
  parentId: 'cleaning',
  isPublished: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  content: {
    ...DEFAULT_MAJOR_ITEM_TEMPLATE,
    subItem: {
      ...DEFAULT_SUB_ITEM_TEMPLATE,
      productId: 'regular-cleaning',
      linkedProductId: 'regular-cleaning',
      coreServicesSectionTitle: '定期清潔，美好生活從乾淨的空間開始',
      coreServices: [
        {
          title: '全屋天然除菌清掃',
          content: '嚴選歐盟認證、對呼吸道友善的天然清潔劑。針對長輩頻繁接觸的門把、扶手、遙控器進行高溫與酒精雙重除菌，打造防疫級居家。'
        },
        {
          title: '行走動線障礙排除',
          content: '在清潔過程中，排查地板散落的電線、滑動的地墊，並在清潔後恢復安全動線，嚴防跌倒風險。'
        },
        {
          title: '過敏原深度除塵計畫',
          content: '針對床墊、窗簾與冷氣濾網進行定期除塵蟎服務。這對於氣管敏感或有氣喘困擾的長輩至關重要，有效提升睡眠品質。'
        },
        {
          title: '過期食品與物資巡檢',
          content: '檢查冰箱與儲藏櫃，協助長輩辨識並清理過期食品，確保飲食衛生安全。'
        }
      ],
      partners: [
        {
          title: '安全守護顧問',
          description: '受過專業培訓、理解高齡家庭需求的居家管家。'
        },
        {
          title: '安心保證',
          description: '所有的服務流程皆有標準化檢核，並由專業團隊提供最專業的技術支持。'
        }
      ],
      cases: [
        {
          id: uuidv4(),
          title: '陳先生的孝親預約',
          description: '陳先生工作繁忙，無暇幫年邁父母打掃老家。透過我們的定期清潔服務，讓兩老住得更清爽，陳先生也更放心。',
          image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=2070&auto=format&fit=crop',
          tag: '孝親預約'
        },
        {
          id: uuidv4(),
          title: '羅奶奶的亮白浴室夢',
          description: '專業團隊進駐後，用溫和高效的技術恢復了亮白。現在奶奶洗澡時，總說心情跟浴室一樣變美了。',
          image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=2070&auto=format&fit=crop',
          tag: '浴室煥新'
        },
        {
          id: uuidv4(),
          title: '王太太的過敏改善',
          description: '王太太長期咳嗽不癒，我們定期進行除蟎清潔與高處除塵後，室內過敏原大幅下降，王太太現在睡得安穩多了。',
          image: 'https://images.unsplash.com/photo-1527368744181-708889a4d190?q=80&w=2070&auto=format&fit=crop',
          tag: '過敏改善'
        }
      ],
      additionalServices: ['home-reorganization', 'organization-planning'],
      button: {
        text: '立即下單',
        type: 'FORM',
        value: 'regular-cleaning-form',
        isVisible: true
      }
    }
  }
};
