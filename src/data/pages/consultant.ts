import { Page, DEFAULT_MAJOR_ITEM_TEMPLATE } from '../../types/admin';

export const consultantPage: Page = {
  id: 'consultant',
  slug: 'consultant',
  title: '好齡居顧問',
  template: 'GENERAL',
  isPublished: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  content: {
    ...DEFAULT_MAJOR_ITEM_TEMPLATE,
    general: {
      blocks: [
        {
          id: 'hero',
          type: 'HERO_1',
          hero1: {
            title: '您的專屬生活顧問，陪您規劃安心未來',
            image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=2070&auto=format&fit=crop',
            buttons: []
          }
        },
        {
          id: 'grid-1',
          type: 'GRID',
          grid: {
            title: '',
            columns: 3,
            items: [
              {
                title: '鄭博元',
                description: '#### 生活規劃師 & 清潔顧問\n\n專注於居家清潔與微管家服務，為您創造一個清潔、舒適且充滿正能量的生活空間。\n\n**專業領域：**\n* 居家安全：動線規劃與無障礙空間評估。\n* 安心移居：精緻搬家，免動手服務。\n* 清潔／微管家：維持潔淨舒適的生活品質。',
                image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=2000&auto=format&fit=crop',
                showImage: true,
                link: ''
              },
              {
                title: '黃恩頡',
                description: '#### 生活規劃師 & 清潔顧問\n\n專注於居家清潔與微管家服務，為您創造一個清潔、舒適且充滿正能量的生活空間。\n\n**專業領域：**\n* 居家安全：動線規劃與無障礙空間評估。\n* 安心移居：精緻搬家，免動手服務。\n* 清潔／微管家：維持潔淨舒適的生活品質。',
                image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=2000&auto=format&fit=crop',
                showImage: true,
                link: ''
              },
              {
                title: '闕艾倫',
                description: '#### 搬家 & 清運顧問\n\n專注於樂齡搬家服務，擅長為行動不便的您，規劃一套輕鬆不費力的一條龍搬家流程。\n\n**專業領域：**\n* 一條龍服務： 方位服務，讓長輩優雅移居。\n* 斷捨離指導： 分類珍貴回憶與冗餘雜物。\n* 空間清運： 專業確保施工過程順暢且安全。',
                image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=2000&auto=format&fit=crop',
                showImage: true,
                link: ''
              },
              {
                title: '陳美秀',
                description: '#### 高齡理財 顧問\n\n專注長者理財規劃，可以為您提供最詳細、最安全有保障的理財建議。\n\n**專業領域：**\n* 資產防護：詐騙防範與資金安全配置。\n* 信託與法律：安養信託與意定監護建議。\n* 財富尊嚴傳承： 優化資產分配，達成圓滿傳承。',
                image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=2000&auto=format&fit=crop',
                showImage: true,
                link: ''
              }
            ]
          }
        },
      ]
    }
  }
};
