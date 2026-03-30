import { Page, DEFAULT_MAJOR_ITEM_TEMPLATE } from '../../types/admin';

export const financePage: Page = {
  id: 'finance',
  slug: 'finance',
  title: '高齡理財',
  template: 'GENERAL',
  isPublished: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  content: {
    ...DEFAULT_MAJOR_ITEM_TEMPLATE,
    general: {
      blocks: [
        {
          id: 'block-1',
          type: 'TEXT',
          text: {
            content: 'COMING SOON',
            alignment: 'center',
            fontSize: 'heading'
          }
        }
      ]
    }
  }
};
