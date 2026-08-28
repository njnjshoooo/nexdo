import { Product } from '../../types/admin';

export const organizationPlanningProduct: Product = {
  id: 'organization-planning',
  name: '收納規劃',
  description: '家裡的物品，都是您精彩生活的印記。陪您重新理清生活動線，不強迫丟棄，而是透過專業的層次配置，讓每一件心愛的物品都有最順手的歸宿。',
  image: 'https://images.unsplash.com/photo-1594484208280-efa00f9e990c?q=80&w=2070&auto=format&fit=crop',
  checklist: [
          { text: '預見未來十年的起居動線規劃' },
          { text: '針對體力限制設計的低負擔收納' },
          { text: '免除攀高蹲低的系統化分類' }
        ],
  orderMode: 'EXTERNAL_LINK',
  fixedConfig: {
    price: 2500,
    unit: '小時',
    buttonText: '立即預約收納'
  },
  externalLinkConfig: {
    priceText: '依物品量報價',
    buttonText: '立即預約收納',
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
