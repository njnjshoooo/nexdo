import { Product } from '../../types/admin';

export const realEstateProduct: Product = {
  id: 'real-estate',
  name: '房屋仲介',
  description: '不只是買賣房子，更是為您的老後資產尋找最優解。我們結合法律、財務與建築評估，確保每一筆交易都能換取更安穩的晚年生活。',
  image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=2073&auto=format&fit=crop',
  checklist: [
          { text: '高齡適居房屋篩選' },
          { text: '嚴防房產詐騙' },
          { text: '財務估算建議' }
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
