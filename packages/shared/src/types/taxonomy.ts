export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  articleCount: number;
}

export interface TagItem {
  id: string;
  name: string;
  slug: string;
  articleCount: number;
}

export interface UpsertCategoryRequest {
  name: string;
  slug: string;
  description?: string;
}

export interface UpsertTagRequest {
  name: string;
  slug: string;
}
