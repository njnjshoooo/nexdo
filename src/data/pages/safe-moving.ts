import { Page, DEFAULT_MAJOR_ITEM_TEMPLATE, DEFAULT_SUB_ITEM_TEMPLATE } from '../../types/admin';
import { v4 as uuidv4 } from 'uuid';

export const safeMovingPage: Page = {
  id: 'safe-moving',
  slug: 'safe-moving',
  title: '安心移居',
  template: 'SUB_ITEM',
  parentId: 'rent-and-move',
  isPublished: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  content: {
    ...DEFAULT_MAJOR_ITEM_TEMPLATE,
    subItem: {
      productId: 'safe-moving',
      ...DEFAULT_SUB_ITEM_TEMPLATE,
      button: {
        text: '立即預約',
        type: 'FORM',
        value: 'booking-form',
        isVisible: true
      },
      coreServicesSectionTitle: '安心移居，為長輩守護每一份珍貴記憶',
      coreServices: [
        {
          title: '全責打包與記憶標記',
          content: '所有物品的精細打包，並特別標記長輩珍視的紀念品，確保回憶在運輸中得到最完善保護。'
        },
        {
          title: '新居空間還原配置',
          content: '依照原生活習慣定位家具物品，減少長輩對新環境的陌生，踏入新家就能立刻像往常一樣生活。'
        },
        {
          title: '生活機能無縫銜接',
          content: '代辦水電瓦斯與網路轉移。我們不只搬動家具，更確保長輩搬入第一天就能擁有完整的生活機能。'
        },
        {
          title: '舊宅廢棄物清運處置',
          content: '溫柔引導斷捨離，並聯絡清運與回收，減輕長輩體力負擔，讓舊宅回歸清爽面貌。'
        }
      ],
      partners: [
        {
          title: '安全守護顧問',
          description: '專業搬家公司配合'
        },
        {
          title: '安心保證',
          description: '專屬搬運意外險、透明化合約不加價承諾。'
        }
      ],
      cases: [
        {
          id: uuidv4(),
          title: '王伯伯的無痛搬家',
          description: '王伯伯住在老公寓多年，膝蓋退化讓他視出門為畏途。我們協助他將累積 40 年的家具進行篩選、保留，並在搬入新大樓當天，將物件原樣還原。',
          image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=2069&auto=format&fit=crop',
          tag: '原樣還原'
        },
        {
          id: uuidv4(),
          title: '陳奶奶的優雅入住',
          description: '定居海外的兒子擔心陳奶奶無法獨自應付搬遷壓力。透過好齡居的安心移居服務，讓奶奶在不驚擾日常節奏的情況下，優雅入住高齡友善社區。',
          image: 'https://images.unsplash.com/photo-1447703693928-9cd89c8d3ac5?q=80&w=2071&auto=format&fit=crop',
          tag: '優雅入住'
        },
        {
          id: uuidv4(),
          title: '李老師的物品篩選',
          description: '退我們協助李老師將數千冊藏書分門別類，一部分捐贈、一部分留存。搬遷後，李老師的新家不再擁擠，取而代之的是通風採光極佳的閱讀角！',
          image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2128&auto=format&fit=crop',
          tag: '斷捨離'
        }
      ],
      additionalServices: ['elderly-housing-exchange', 'rental-management']
    }
  }
};
