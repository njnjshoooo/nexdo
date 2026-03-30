import { Product } from '../../types/admin';

export const decorDesignProduct: Product = {
  id: 'decor-design',
  name: '軟裝設計',
  description: '家不需要大動土木，也能擁有新的表情。從家具、布藝到光影細節，勾勒出最懂您的生活美學，讓熟悉的空間再次讓您怦然心動。',
  image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=2000&auto=format&fit=crop',
  checklist: [
          { text: '專業軟裝設計師到府陪伴諮詢' },
          { text: '融合日常習慣的空間美學提案' },
          { text: '具備生活溫度的家具與飾品採購建議' }
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
