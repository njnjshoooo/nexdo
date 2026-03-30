import { Product } from '../../types/admin';

export const healthFitnessProduct: Product = {
  id: 'health-fitness',
  name: '到府體適能',
  description: '擁有好的體力，才能繼續探索生活的美好！從簡單的動作開始，建立支撐日常活動的身體能量，讓您走得更穩、動得更自在。',
  image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2070&auto=format&fit=crop',
  checklist: [
          { text: '專業樂齡教練陪伴' },
          { text: '針對日常機能設計的漸進式課程' },
          { text: '彈性且不具壓力的運動計畫' }
        ],
  orderMode: 'FIXED',
  requireDate: true,
  requireTime: true,
  requireNotes: true,
  variants: [
    {
      id: 'var-health-fitness-2p',
      name: '2人小班',
      description: '與你的好齡居，一起在家運動吧！2人小班制僅加價 $1,000，限時活動，請儘速報名！',
      price: 1000,
      unit: '次，共2小時'
    }
  ],
  fixedConfig: {
    price: 3000,
    unit: '次',
    buttonText: '立即下單'
  },
  quoteConfig: {
    priceText: '依需求報價',
    buttonText: '立即下單',
    link: ''
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};
