import { Product } from '../../types/admin';

export const oldHouseDiagnosisProduct: Product = {
  id: 'old-house-diagnosis',
  name: '舊屋診斷',
  description: '老房子裝載了無數故事，也可能隱藏了需要修補的痕跡。我們陪您一起聽聽房子的聲音，找出讓生活更安穩的守護方式。',
  image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=2073&auto=format&fit=crop',
  checklist: [
          { text: '資深專業診斷團隊陪伴' },
          { text: '實踐導向的環境安全建議' },
          { text: '透明清楚的修繕改善方案' }
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
