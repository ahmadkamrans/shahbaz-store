import { getDummyCategories, dummyCategories } from '../dummy/data';
export interface Category {
  _id?: string;
  id?: string;
  name: string;
  slug: string;
  parentId?: string | null;
  children?: Category[];
  createdAt?: string;
  updatedAt?: string;
}

export const categoriesApi = {
  getAll: async (): Promise<Category[]> => {
    return getDummyCategories() as Category[];
  },

  getById: async (id: string): Promise<Category> => {
    const cat = dummyCategories.find((c) => c.id === id || c._id === id);
    if (!cat) throw new Error('Category not found');
    return cat as Category;
  },

  create: async (_category: Partial<Category>): Promise<Category> => {
    return {
      id: 'cat-new',
      name: _category.name ?? 'New Category',
      slug: _category.slug ?? 'new-category',
      parentId: _category.parentId ?? null,
    } as Category;
  },

  update: async (id: string, _category: Partial<Category>): Promise<Category> => {
    const cat = dummyCategories.find((c) => c.id === id || c._id === id);
    if (!cat) throw new Error('Category not found');
    return { ...cat, ..._category } as Category;
  },

  delete: async (_id: string): Promise<void> => {
    // Dummy: no-op
  },
};
