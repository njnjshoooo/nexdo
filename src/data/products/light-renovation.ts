import { Product } from '../../types/admin';

export const lightRenovationProduct: Product = {
  id: 'light-renovation',
  name: '樂齡輕裝修',
  description: '不需大動土木，透過局部優化、照明改善與防滑工程，為長輩打造一個既熟悉又更安全的居家環境。讓家跟著您一起優雅變老。',
  image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=2069&auto=format&fit=crop', // Warm living room renovation
  checklist: [
    { text: '免搬遷快速完工' },
    { text: '居家安全機能提升' },
    { text: '微工期風格煥新' }
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
