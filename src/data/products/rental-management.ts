import { Product } from '../../types/admin';

export const rentalManagementProduct: Product = {
  id: 'rental-management',
  name: '代租代管',
  description: '租務繁瑣，不該是您退休生活的負擔。我們陪您打理從篩選房客到房屋修繕的每一處細節，讓您的資產成為最穩固的支持。',
  image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop',
  checklist: [
          { text: '租客篩選與管理' },
          { text: '修繕通報與專業維護' },
          { text: '透明租金管理與法律顧問支持' }
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
