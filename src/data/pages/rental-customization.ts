import { Page, DEFAULT_MAJOR_ITEM_TEMPLATE, DEFAULT_SUB_ITEM_TEMPLATE } from '../../types/admin';
import { v4 as uuidv4 } from 'uuid';

export const rentalCustomizationPage: Page = {
  id: 'rental-customization',
  slug: 'rental-customization',
  title: '出租屋訂製',
  template: 'SUB_ITEM',
  parentId: 'renovation',
  isPublished: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  content: {
    ...DEFAULT_MAJOR_ITEM_TEMPLATE,
    subItem: {
      productId: 'rental-customization',
      ...DEFAULT_SUB_ITEM_TEMPLATE,
      coreServicesSectionTitle: '出租屋訂製，資產活化雙策略，從基礎工程到美學改造',
      coreServices: [
        {
          title: '老屋深度翻新',
          content: '針對高屋齡物件，提供水電管線更新、格局重整（改套/分租）與動線優化。不只是變新，而是確保未來 10 年收益穩定的基礎建設。'
        },
        {
          title: '收益型租屋改造',
          content: '針對屋況尚可的物件，以「快租、好拍」為目標。優化燈光、色系與家具配置，用最小預算達成最高出租效益。'
        },
        {
          title: '五大品項客製',
          content: '專注於「燈、牆、地、配、軟」五大視覺核心，快速翻轉空間氣氣，吸引優質租客目光。'
        },
        {
          title: '族群導向房型規劃',
          content: '依據區域特性量身訂製房型，確保空間配置精準符合當地市場需求。'
        }
      ],
      partners: [
        {
          title: '安全守護顧問',
          description: '具備包租代管經驗之設計團隊'
        },
        {
          title: '安心保證',
          description: '透明化估價、租金投報率試算、耐用材選用'
        },
        {
          title: '策略夥伴',
          description: '租寓'
        }
      ],
      cases: [
        {
          id: uuidv4(),
          title: '王爺爺的老洋樓重整',
          description: '王爺爺40年的老屋，透過格局微調與管線更新，從乏人問津轉身變為三組租客搶租的北歐風文青公寓，租金提升 40%。',
          image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=2069&auto=format&fit=crop',
          tag: '老屋翻新'
        },
        {
          id: uuidv4(),
          title: '陳太太的電梯大樓煥新',
          description: '運用「燈、牆、地、配、軟」改造法，僅花兩週工期即完工，上架三天內即成交簽約。',
          image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop',
          tag: '快速改造'
        },
        {
          id: uuidv4(),
          title: '林先生學區套房規劃',
          description: '針對大學生需求重新設計收納與插座位置，並搭配耐磨抗髒材質，讓屋主維護成本大幅降低。',
          image: 'https://images.unsplash.com/photo-1555854816-802f188090e4?q=80&w=2070&auto=format&fit=crop',
          tag: '學區規劃'
        }
      ],
      additionalServices: ['rental-management', 'light-renovation']
    }
  }
};
