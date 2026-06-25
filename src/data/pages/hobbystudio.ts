import { Page, DEFAULT_MAJOR_ITEM_TEMPLATE } from '../../types/admin';

export const hobbystudioPage: Page = {
  id: 'hobbystudio',
  slug: 'hobbystudio',
  title: '習慣健康國際',
  template: 'GENERAL',
  isPublished: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  content: {
    ...DEFAULT_MAJOR_ITEM_TEMPLATE,
    general: {
      blocks: [
        {
          id: 'hero',
          type: 'HERO_2',
          hero2: {
            title: '習慣健康國際',
            description: '樂齡健康專業服務，我們陪您一起找回身體的活力。',
            backgroundImage: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2070&auto=format&fit=crop',
            mainButton: { text: '預約諮詢', type: 'FORM', value: 'default-contact', isVisible: true },
            secondaryButton: { text: '', type: 'URL', value: '', isVisible: false }
          }
        },
        {
          id: 'text-block',
          type: 'TEXT',
          text: {
            content: '習慣健康國際致力於提供最專業的樂齡健康服務，透過專業的課程顧問與體適能指導，讓長輩在安全、安心的環境中，維持健康活力。',
            alignment: 'center',
            fontSize: 'medium_heading'
          }
        }
      ]
    }
  }
};
