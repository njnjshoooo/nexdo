import { Product } from '../../types/admin';

export const elderlyHousingExchangeProduct: Product = {
  id: 'elderly-housing-exchange',
  name: '適老換屋',
  description: '老屋的樓梯不應成為生活的阻礙。透過「活化、代管、改裝、尋新」四步曲，在熟悉的記憶與舒適的空間中取得平衡 。',
  image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop',
  checklist: [
          { text: '資產活化評估' },
          { text: '適老輕裝修' },
          { text: '代尋適老新屋' }
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
