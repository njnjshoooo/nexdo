import { Product } from '../../types/admin';

export const rentalCustomizationProduct: Product = {
  id: 'rental-customization',
  name: '出租屋訂製',
  description: '讓老房子成為您的穩定收益好夥伴！我們專精於將老舊空間轉型為高競爭力的出租物件，透過專業翻新與風格改造，實現「快租、好租、租金漂亮」的資產升級目標。',
  image: 'https://images.unsplash.com/photo-1556912177-450084ba2f90?q=80&w=2070&auto=format&fit=crop',
  checklist: [
    { text: '老屋翻新與管線更新' },
    { text: '精準投報率導向改造' },
    { text: '最小預算創造最大收益' }
  ],
  orderMode: 'EXTERNAL_LINK',
  fixedConfig: {
    price: 0,
    unit: '次',
    buttonText: '立即預約'
  },
  externalLinkConfig: {
    priceText: '依現場狀況提供投報評估',
    buttonText: '立即預約評估',
    url: 'https://www.line.me/tw/'
  },
  internalFormConfig: {
    priceText: '依需求報價',
    buttonText: '填寫表單',
    formId: ''
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};
