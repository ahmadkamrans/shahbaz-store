import { apiFetch, parseResponse } from './config';
import { Category } from '@/types';

export interface BackendCategory {
  _id: string;
  name: string;
  slug: string;
  parentId?: string;
  description?: string;
  isActive?: boolean;
}

const transformCategory = (category: BackendCategory): Category => {
  return {
    id: category._id,
    name: category.name,
    slug: category.slug,
    parentId: category.parentId,
  };
};

export const categoriesApi = {
  getCategories: async (): Promise<Category[]> => {
    const response = await apiFetch('/api/categories');
    const data = await parseResponse<{ categories: BackendCategory[] }>(response);
    return data.categories.map(transformCategory);
  },

  getCategory: async (id: string): Promise<Category> => {
    const response = await apiFetch(`/api/categories/${id}`);
    const category = await parseResponse<BackendCategory>(response);
    return transformCategory(category);
  },
};
