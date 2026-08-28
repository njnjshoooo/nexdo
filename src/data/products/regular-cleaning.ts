import { Product } from '../../types/admin';

export const regularCleaningProduct: Product = {
  id: 'regular-cleaning',
  name: '定期清潔',
  description: '打理那些最費心的角落，讓廚房的油垢與衛浴的積水不再成為負擔。現在就讓專業團隊，為您找回那份久違的居家品質。',
  image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=2070&auto=format&fit=crop',
  checklist: [
    { text: '廚房衛浴專業除污垢' },
    { text: '天然無毒除菌清潔' },
    { text: '過敏原深度除塵' }
  ],
  orderMode: 'FIXED',
  fixedConfig: {
    price: 600,
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
