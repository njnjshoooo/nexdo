import { Page, DEFAULT_MAJOR_ITEM_TEMPLATE } from '../../types/admin';

export const aboutPage: Page = {
  id: 'about',
  slug: 'about',
  title: '關於我們',
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
          type: 'HERO_2',
          hero2: {
            title: '因為懂，所以想陪你一起',
            description: '我們發現，家不只是遮風避雨的場所，更是長輩情感的歸宿。然而，老屋的樓梯、堆積的舊物，不應成為自在生活的阻礙。',
            backgroundImage: 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?q=80&w=2070&auto=format&fit=crop',
            mainButton: { text: '預約諮詢', type: 'FORM', value: 'default-contact', isVisible: true },
            secondaryButton: { text: '', type: 'URL', value: '', isVisible: false }
          }
        },
        {
          id: 'text-block',
          type: 'TEXT',
          text: {
            content: '好齡居的核心團隊來自不動產管理、服務設計與高齡護理領域。我們不是來「管理」你的生活，而是想成為你懂生活的鄰居，陪你一起解決家裡的大小事。',
            alignment: 'center',
            fontSize: 'medium_heading'
          }
        },
        {
          id: 'grid-block',
          type: 'GRID',
          grid: {
            title: '五大服務支柱，將專業轉化為實用的生活好處',
            columns: 5,
            items: [
              { title: '生活安全', description: '陪你評估居家環境，讓進出浴室、行走動線都變得更輕鬆安全。', showImage: false },
              { title: '生活品質', description: '幫忙處理累積多年的舊物，讓空間重新變回你喜歡的樣子。', showImage: false },
              { title: '生活歸屬', description: '如果你想換個環境，我們陪你評估資產活化，找一個更適合家。', showImage: false },
              { title: '生活免憂', description: '用信託與安心卡，確保每一分退休金都實實在在地用在自己身上。', showImage: false },
              { title: '生活活力', description: '不管是牙科諮詢還是到府體適能，我們都陪著你保持最好狀態。', showImage: false }
            ]
          }
        },
        {
          id: 'image-text-block',
          type: 'IMAGE_TEXT_GRID',
          imageTextGrid: {
            layout: 'imageLeft',
            image: 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?q=80&w=2070&auto=format&fit=crop',
            title: '專業承諾，實踐勝於術語！',
            content: '我們累積了許多真實案例與經驗。我們知道怎麼做，所以能給你穩妥的建議。我們與「租寓、家天使、信義房屋、DO UP」等團隊站在一起，所有合作都經過嚴格的認證，確保你得到的每一項支持都是可靠的。'
          }
        }
      ]
    }
  }
};
