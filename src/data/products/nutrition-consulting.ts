import { Product } from '../../types/admin';

export const nutritionConsultingProduct: Product = {
  id: 'nutrition-consulting',
  name: '營養諮詢',
  description: '吃得對，比吃得補更重要！專業營養師一對一到府，針對長輩的體質與咀嚼狀況，量身打造「不犧牲美味」的健康飲食計畫，找回餐桌上的笑容。',
  image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=2070&auto=format&fit=crop',
  checklist: [
    { text: '營養師到府體質評估' },
    { text: '咀嚼與吞嚥友善飲食設計' },
    { text: '慢性病（糖/鹽/脂）精準控管' }
  ],
  orderMode: 'FIXED',
  fixedConfig: {
    price: 2000,
    unit: '次',
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
