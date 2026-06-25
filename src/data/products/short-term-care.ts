import { Product } from '../../types/admin';

export const shortTermCareProduct: Product = {
  id: 'short-term-care',
  name: '短期照護',
  description: '我們是您最可靠的生活神隊友！無論是術後休養還是短期生活支援，我們提供充滿溫度的專業陪伴，讓長輩在熟悉的家中享有尊嚴與舒適。',
  image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=2070&auto=format&fit=crop', // A warm photo of a caregiver with an elderly person
  checklist: [
    { text: '專業術後與日常起居照護' },
    { text: '溫馨陪診與用藥提醒服務' },
    { text: '客製化短期生活支援計畫' }
  ],
  orderMode: 'EXTERNAL_LINK',
  fixedConfig: {
    price: 0,
    unit: '次',
    buttonText: '立即下單',
  },
  externalLinkConfig: {
    priceText: '依需求報價',
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
