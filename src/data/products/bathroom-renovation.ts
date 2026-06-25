import { Product } from '../../types/admin';

export const bathroomRenovationProduct: Product = {
  id: 'bathroom-renovation',
  name: '衛浴裝修',
  description: '與您一起告別濕滑的隱憂，從地磚、扶手到動線微調，打造一個讓您進出更自在、洗得更踏實的安心沐浴空間。',
  image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=2070&auto=format&fit=crop',
  checklist: [
          { text: '高效防滑地磚鋪設' },
          { text: '安全扶手配置' },
          { text: '無障礙進出設計' }
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
