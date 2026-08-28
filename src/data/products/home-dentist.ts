import { Product } from '../../types/admin';

export const homeDentistProduct: Product = {
  id: 'home-dentist',
  name: '到府牙醫',
  description: '讓專業牙醫走進家中。不只解決眼前的牙疼，更透過深度衛教與口腔護理指導，守護長輩「品嚐美食」的尊嚴與快樂。',
  image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=2070&auto=format&fit=crop',
  checklist: [
    { text: '行動診察設備進駐' },
    { text: '口腔機能退化評估' },
    { text: '手把手家庭潔牙衛教' }
  ],
  orderMode: 'FIXED',
  fixedConfig: {
    price: 1200,
    unit: '次',
    buttonText: '立即下單'
  },
  quoteConfig: {
    priceText: '依需求報價',
    buttonText: 'LINE諮詢報價',
    link: ''
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};
