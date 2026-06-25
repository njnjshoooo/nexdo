import { Page, DEFAULT_MAJOR_ITEM_TEMPLATE, DEFAULT_SUB_ITEM_TEMPLATE } from '../../types/admin';
import { v4 as uuidv4 } from 'uuid';

export const decorDesignPage: Page = {
  id: 'decor-design',
  slug: 'decor-design',
  title: '軟裝設計',
  template: 'SUB_ITEM',
  isPublished: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  content: {
    ...DEFAULT_MAJOR_ITEM_TEMPLATE,
    subItem: {
      productId: 'decor-design',
      ...DEFAULT_SUB_ITEM_TEMPLATE,
      coreServicesSectionTitle: '軟裝設計，妝點生活的儀式感',
      coreServices: [
        {
          title: '生活風格',
          content: '了解您對生活的偏好，是喜歡暖木色的溫潤，還是清新明亮的簡約？找出最能讓您放鬆的視覺基調。'
        },
        {
          title: '美學評估',
          content: '陪您觀察採光與現有動線。不追求繁複的裝飾，而是透過燈光與色塊的微調，讓空間展現出層次感。'
        },
        {
          title: '專屬佈置',
          content: '提供多樣化的家具與織品建議，讓您可以自由選擇想優先更換的部分，一步步打造心中的家。'
        },
        {
          title: '現場佈置',
          content: '從掛畫高度到抱枕擺法，我們將與您一起完成空間的最後一塊拼圖。'
        }
      ],
      partners: [
        {
          title: '為什麼選擇好齡居？',
          description: '安全守護顧問：理解起居安全與美感平衡，成為長輩的生活夥伴。'
        },
        {
          title: '安心保證',
          description: '所有的挑選都兼顧實用與耐用性，避開尖銳或不穩固的擺設，讓美感實踐在安心的生活之上。'
        },
        {
          title: '策略夥伴',
          description: 'DO UP Décor Planner'
        }
      ],
      cases: [
        {
          id: uuidv4(),
          title: '張老師的書卷角',
          description: '退休的張老師希望能有舒適的閱讀處。我們陪他選購了一盞護眼且有質感的落地燈，並更換了透光不透人的調光簾，讓他在這裡待一整天都很自在。',
          image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=2069&auto=format&fit=crop',
          tag: '軟裝設計'
        },
        {
          id: uuidv4(),
          title: '李奶奶的陽台下午茶',
          description: '為了讓李奶奶在窗邊也能愜意插花，我們陪她挑選了高度適中的防水几與防滑地毯。透過色彩微調，讓原本堆放雜物的角落變成了她的午茶祕密基地。',
          image: 'https://images.unsplash.com/photo-1585128719715-46776b56a0d1?q=80&w=1974&auto=format&fit=crop',
          tag: '空間微調'
        },
        {
          id: uuidv4(),
          title: '謝先生客廳的「小搬新家」',
          description: '謝先生不想大裝潢。我們陪他換掉老舊沉重的沙發，選用輕量化且支撐力強的質感座椅，並點綴幾幅家族照片，讓客廳充滿了新氣象。',
          image: 'https://images.unsplash.com/photo-1583847268964-b28dc2f51ac9?q=80&w=1974&auto=format&fit=crop',
          tag: '輕裝修'
        }
      ],
      additionalServices: ['safety-assessment', 'old-house-diagnosis']
    }
  }
};
