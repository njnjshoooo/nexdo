import { Product } from '../../types/admin';

export const homeReorganizationProduct: Product = {
  id: 'home-reorganization',
  name: '居家整聊',
  description: '生活不該被雜物佔據。透過「傾聽需求、篩選回憶、空間重塑」的過程，在熟悉的角落裡找回與空間的連結。',
  image: 'https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?q=80&w=2070&auto=format&fit=crop',
  checklist: [
          { text: '專業整聊顧問陪伴' },
          { text: '情感導向的物資篩選' },
          { text: '實用導向的空間配置' }
        ],
  orderMode: 'INTERNAL_FORM',
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
    buttonText: '立即填寫表單',
    formId: 'home-organize-booking-form',
    enableDeposit: true,
    depositRatio: 30,
    balanceRatio: 70
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};
