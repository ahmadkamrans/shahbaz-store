import { apiFetch, parseResponse } from './config';
import { Category } from '@/types';

export interface BackendCategory {
  _id: string;
  name: string;
  slug: string;
  parent?: {
    _id: string;
    name: string;
    slug: string;
  } | string | null;
  description?: string;
  isActive?: boolean;
}

const transformCategory = (category: BackendCategory): Category => {
  const parentId = category.parent && typeof category.parent === 'object' && category.parent !== null
    ? category.parent._id 
    : (typeof category.parent === 'string' ? category.parent : undefined);
    
  return {
    id: category._id,
    name: category.name,
    slug: category.slug,
    parentId: parentId,
  };
};

export const categoriesApi = {
  getCategories: async (parentId?: string | null): Promise<Category[]> => {
    let url = '/api/categories';
    if (parentId !== undefined) {
      url += `?parent=${parentId || 'null'}`;
    }
    const response = await apiFetch(url);
    const data = await parseResponse<{ success: boolean; categories: BackendCategory[] }>(response);
    return (data.categories || []).map(transformCategory);
  },

  getCategory: async (id: string): Promise<Category> => {
    const response = await apiFetch(`/api/categories/${id}`);
    const category = await parseResponse<BackendCategory>(response);
    return transformCategory(category);
  },
};
