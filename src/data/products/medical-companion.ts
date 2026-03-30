import { Product } from '../../types/admin';

export const medicalCompanionProduct: Product = {
  id: 'medical-companion',
  name: '醫藥陪同',
  description: '您的健康隨行秘書！我們協助長輩處理繁瑣的醫院領藥流程，並轉化複雜醫囑為簡單易懂的日常關懷，讓用藥安全不再是家人的負擔。',
  image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070&auto=format&fit=crop',
  checklist: [
    { text: '慢性處方箋準時代領' },
    { text: '多科別用藥安全整合' },
    { text: '居家殘藥清查與分類' }
  ],
  orderMode: 'FIXED',
  fixedConfig: {
    price: 1200,
    unit: '小時',
    buttonText: '立即下單'
  },
  quoteConfig: {
    priceText: '依需求報價',
    buttonText: '立即預約評估',
    link: ''
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};
