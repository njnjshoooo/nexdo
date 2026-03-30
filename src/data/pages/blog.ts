import { Page, DEFAULT_BLOG_TEMPLATE } from '../../types/admin';

export const blogPage: Page = {
  id: 'blog',
  slug: 'blog',
  title: '好齡居誌',
  template: 'BLOG',
  isPublished: true,
  createdAt: '2026-03-12T00:00:00.000Z',
  updatedAt: '2026-03-12T00:00:00.000Z',
  content: {
    hero: {
      title: '',
      description: '',
      backgroundImage: '',
      mainButton: { text: '', type: 'URL', value: '', isVisible: false },
      secondaryButton: { text: '', type: 'URL', value: '', isVisible: false }
    },
    services: [],
    cases: [],
    blog: {
      ...DEFAULT_BLOG_TEMPLATE,
      recommendedServiceIds: ['home-safety', 'home-reorganization', 'elderly-housing-exchange']
    }
  }
};
