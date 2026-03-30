export interface Category {
  id: string;
  name: string;
  parentId?: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  content: string;
  coverImage: string;
  categoryId: string;
  seoKeywords: string[];
  relatedServiceIds?: string[]; // 關聯 SUB_ITEM (最多3個)
  showForm?: boolean;
  formId?: string;
  isPublished: boolean;
  updatedAt: string;
}
