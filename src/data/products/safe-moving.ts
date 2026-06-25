import { Product } from '../../types/admin';

export const safeMovingProduct: Product = {
  id: 'safe-moving',
  name: '安心移居',
  description: '不只是物品的移動，更是生活空間的溫柔轉移。專業、細心、透明化，讓搬家不再是體力與心理的負擔。',
  image: 'https://images.unsplash.com/photo-1574689211272-bc15e6406241?q=80&w=2070&auto=format&fit=crop',
  checklist: [
          { text: '貼近心靈的斷捨離引導' },
          { text: '100% 物品定位還原技術' },
          { text: '搬遷全程專業督導隨行' }
        ],
  orderMode: 'EXTERNAL_LINK',
  fixedConfig: {
    price: 0,
    unit: '次',
    buttonText: '立即下單'
  },
  externalLinkConfig: {
    priceText: '依需求報價',
    buttonText: 'LINE諮詢報價',
    url: ''
  },
  internalFormConfig: {
    priceText: '依需求報價',
    buttonText: '填寫表單',
    formId: ''
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};
