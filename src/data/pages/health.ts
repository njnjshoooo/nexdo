import { Page, DEFAULT_MAJOR_ITEM_TEMPLATE } from '../../types/admin';
import { v4 as uuidv4 } from 'uuid';

export const healthPage: Page = {
  id: 'health',
  slug: 'health',
  title: '樂齡健康',
  template: 'MAJOR_ITEM',
  isPublished: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  content: {
    ...DEFAULT_MAJOR_ITEM_TEMPLATE,
    servicesSectionTitle: '全方位服務',
    hero: {
      ...DEFAULT_MAJOR_ITEM_TEMPLATE.hero,
      title: '樂齡健康，陪您自在舒展每一天',
      description: '健康的身體是享受生活的基礎。從到府體適能到專業營養諮詢，我們陪您建立最適合的健康習慣，輕鬆迎接充實的樂齡生活。',
      backgroundImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=1200',
    },
    services: [
      {
        id: uuidv4(),
        title: '到府體適能',
        description: '擁有好的體力，才能繼續探索生活的美好！從簡單的動作開始，建立支撐日常活動的身體能量，讓您走得更穩、動得更自在。',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=1200',
        items: ['專業樂齡教練陪伴', '針對日常機能設計的漸進式課程', '彈性且不具壓力的運動計畫'],
        price: '3000 / 次',
        targetPageId: 'health-fitness'
      },
      {
        id: uuidv4(),
        title: '短期照護',
        description: '我們是您最可靠的生活神隊友！無論是術後休養還是短期生活支援，我們提供充滿溫度的專業陪伴，讓長輩在熟悉的家中享有尊嚴與舒適。',
        image: 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?auto=format&fit=crop&q=80&w=1200',
        items: ['專業術後與日常起居照護', '溫馨陪診與用藥提醒服務', '客製化短期生活支援計畫'],
        price: '依需求報價',
        targetPageId: 'short-term-care'
      },
      {
        id: uuidv4(),
        title: '到府牙醫',
        description: '讓專業牙醫走進家中。不只解決眼前的牙疼，更透過深度衛教與口腔護理指導，守護長輩「品嚐美食」的尊嚴與快樂。',
        image: 'https://images.unsplash.com/photo-1588776814546-1ffce47267a5?auto=format&fit=crop&q=80&w=1200',
        items: ['行動診察設備進駐', '口腔機能退化評估', '手把手家庭潔牙衛教'],
        price: '1200 / 次',
        targetPageId: 'home-dentist'
      },
      {
        id: uuidv4(),
        title: '醫藥陪同',
        description: '您的健康隨行秘書！我們協助長輩處理繁瑣的醫院領藥流程，並轉化複雜醫囑為簡單易懂的日常關懷，讓用藥安全不再是家人的負擔。',
        image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=1200',
        items: ['慢性處方箋準時代領', '多科別用藥安全整合', '居家殘藥清查與分類'],
        price: '1200 / 小時',
        targetPageId: 'medical-companion'
      },
      {
        id: uuidv4(),
        title: '營養諮詢',
        description: '吃得對，比吃得補更重要！專業營養師一對一到府，針對長輩的體質與咀嚼狀況，量身打造「不犧牲美味」的健康飲食計畫，找回餐桌上的笑容。',
        image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=1200',
        items: ['營養師到府體質評估', '咀嚼與吞嚥友善飲食設計', '慢性病（糖/鹽/脂）精準控管'],
        price: '2000 / 次',
        targetPageId: 'nutrition-consulting'
      }
    ],
    cases: [
      {
        id: uuidv4(),
        title: '鍾伯伯的活力早晨',
        description: '曾經覺得上下樓梯吃力的鍾伯伯，在專業老師的陪伴下進行適度的體能訓練，現在能輕鬆走到公園散步，找回行動的自信與自由。',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=1200',
        tag: '體能訓練'
      },
      {
        id: uuidv4(),
        title: '羅奶奶的美食守護計畫',
        description: '因為缺牙而不敢吃硬物的羅奶奶，透過牙科顧問的溫慢陪伴與諮詢，重新建立口腔健康習慣，現在又能和孫子一起開心享受晚餐時光。',
        image: 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?auto=format&fit=crop&q=80&w=1200',
        tag: '牙科衛教'
      },
      {
        id: uuidv4(),
        title: '邱先生的居家飲食調整',
        description: '獨居的邱先生常因簡單吃而營養不均，營養師陪他一起檢視日常飲食，提供簡單易做的營養小撇步，讓他現在每餐都吃得更有滋有味、更有元氣。',
        image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=1200',
        tag: '營養諮詢'
      }
    ]
  }
};
