import { Product } from '../../types/admin';

export const safetyAssessmentProduct: Product = {
  id: 'safety-assessment',
  name: '安全評估',
  description: '家是最放鬆的地方，不該有看不見的絆腳石。我們陪您走一遍家裡的每個角落，找出能讓您行走更穩、起居更輕鬆的貼心調整。',
  image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=2070&auto=format&fit=crop',
  checklist: [
          { text: '100 點居家安全細節巡檢' },
          { text: '物理治療師與空間顧問共同參與' },
          { text: '量身打造的輔具與修繕建議' }
        ],
  orderMode: 'EXTERNAL_LINK',
  fixedConfig: {
    price: 3000,
    unit: '次',
    buttonText: '立即預約評估'
  },
  externalLinkConfig: {
    priceText: '依空間大小報價',
    buttonText: '立即預約評估',
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
