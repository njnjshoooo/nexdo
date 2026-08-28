import { Product } from '../../types/admin';

export const homeClearanceProduct: Product = {
  id: 'home-clearance',
  name: '室內清運',
  description: '不管是搬家後的舊家具，還是堆積已久的雜物，我們陪您一次理清，找回居家環境最初的呼吸感。',
  image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=2069&auto=format&fit=crop',
  checklist: [
    { text: '大型家具專業拆解搬運' },
    { text: '環保合法清運流程' },
    { text: '施工後基礎環境清消' }
  ],
  orderMode: 'FIXED',
  fixedConfig: {
    price: 2000,
    unit: '車',
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
