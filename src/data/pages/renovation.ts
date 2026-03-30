import { Page, DEFAULT_MAJOR_ITEM_TEMPLATE } from '../../types/admin';
import { v4 as uuidv4 } from 'uuid';

export const renovationPage: Page = {
  id: 'renovation',
  slug: 'renovation',
  title: '居家裝潢',
  template: 'MAJOR_ITEM',
  isPublished: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  content: {
    ...DEFAULT_MAJOR_ITEM_TEMPLATE,
    hero: {
      title: '居家裝潢，陪您打造更有溫度的生活角落',
      description: '家應該隨著生活的需求與品味一同成長。不管是輕裝修還是軟裝設計，用最合適的材質與色彩，讓熟悉的空間展現出更懂您的美學與舒適。',
      backgroundImage: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop',
      mainButton: { text: '預約諮詢', type: 'FORM', value: '', isVisible: true },
      secondaryButton: { text: '查看案例', type: 'URL', value: '#cases', isVisible: true },
    },
    servicesSectionTitle: '全方位服務',
    services: [
      {
        id: uuidv4(),
        title: '軟裝設計',
        description: '家不需要大動土木，也能擁有新的表情。從家具、布藝到光影細節，勾勒出最懂您的生活美學，讓熟悉的空間再次讓您怦然心動。',
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=2000&auto=format&fit=crop',
        items: ['專業軟裝設計師到府陪伴諮詢', '融合日常習慣的空間美學提案', '具備生活溫度的家具與飾品採購建議'],
        price: '立即預約',
        targetPageId: 'decor-design'
      },
      {
        id: uuidv4(),
        title: '樂齡輕裝修',
        description: '不需大動土木，透過局部優化、照明改善與防滑工程，為長輩打造一個既熟悉又更安全的居家環境。讓家跟著您一起優雅變老。',
        image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=2069&auto=format&fit=crop',
        items: ['免搬遷快速完工', '居家安全機能提升', '微工期風格煥新'],
        price: '依需求報價',
        targetPageId: 'light-renovation'
      },
      {
        id: uuidv4(),
        title: '出租屋訂製',
        description: '讓老房子成為您的穩定收益好夥伴！我們專精於將老舊空間轉型為高競爭力的出租物件，透過專業翻新與風格改造，實現「快租、好租、租金漂亮」的資產升級目標。',
        image: 'https://images.unsplash.com/photo-1556912177-450084ba2f90?q=80&w=2070&auto=format&fit=crop',
        items: ['老屋翻新與管線更新', '精準投報率導向改造', '最小預算創造最大收益'],
        price: '立即預約評估',
        targetPageId: 'rental-customization'
      }
    ],
    cases: [
      {
        id: uuidv4(),
        title: '舊客廳的文藝復興',
        description: '張老師退休後希望家裡更有書卷氣，我們陪他更換了柔和的調光簾並重新配置老家具的位子，讓老客廳瞬間變身成充滿質感的私人閱覽室。',
        image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=2069&auto=format&fit=crop',
        tag: '軟裝設計'
      },
      {
        id: uuidv4(),
        title: '屬於奶奶的午茶角落',
        description: '為了讓喜歡插花的李奶奶有專屬空間，我們陪她微調了陽台的採光與收納，選用防滑且溫潤的木地板，讓這個角落成為她最愛待的安靜天地。',
        image: 'https://images.unsplash.com/photo-1585128719715-46776b56a0d1?q=80&w=1974&auto=format&fit=crop',
        tag: '空間微調'
      },
      {
        id: uuidv4(),
        title: '色彩帶來的家新氣象',
        description: '謝先生的家住久了顯得沉悶，我們陪他選用暖色系的環保漆料，並更換了幾盞氣氛燈具。不需要敲敲打打，就讓全家人找回像搬新家一樣的驚喜感。',
        image: 'https://images.unsplash.com/photo-1583847268964-b28dc2f51ac9?q=80&w=1974&auto=format&fit=crop',
        tag: '輕裝修'
      }
    ]
  }
};
