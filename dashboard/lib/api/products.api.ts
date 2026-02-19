import { getDummyProducts, getDummyCategories, dummyProducts } from '../dummy/data';

export interface Product {
  _id?: string;
  id?: string;
  name: string;
  slug: string;
  price: number;
  oldPrice?: number;
  image: string;
  images?: string[];
  category: string | { _id: string; name: string; slug: string };
  rating?: number;
  description?: string;
  shortDescription?: string;
  inStock?: boolean;
  sku?: string;
  variants?: ProductVariant[];
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  inStock: boolean;
  attributes?: Record<string, string>;
}

export interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const productsApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    inStock?: string;
  }): Promise<ProductsResponse> => {
    return getDummyProducts(params) as unknown as ProductsResponse;
  },

  getAllAdmin: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    inStock?: string;
  }): Promise<ProductsResponse> => {
    return getDummyProducts(params) as unknown as ProductsResponse;
  },

  getById: async (id: string): Promise<Product> => {
    const product = dummyProducts.find((p) => p.id === id || p._id === id);
    if (!product) throw new Error('Product not found');
    return product as Product;
  },

  getBySlug: async (slug: string): Promise<Product> => {
    const product = dummyProducts.find((p) => p.slug === slug);
    if (!product) throw new Error('Product not found');
    return product as Product;
  },

  create: async (product: Partial<Product>): Promise<Product> => {
    return {
      id: 'prod-new',
      name: product.name ?? 'New Product',
      slug: product.slug ?? 'new-product',
      price: product.price ?? 0,
      image: product.image ?? '',
      category: product.category ?? '',
      inStock: product.inStock ?? true,
    } as Product;
  },

  update: async (id: string, product: Partial<Product>): Promise<Product> => {
    const existing = dummyProducts.find((p) => p.id === id || p._id === id);
    if (!existing) throw new Error('Product not found');
    return { ...existing, ...product } as Product;
  },

  delete: async (_id: string): Promise<void> => {
    // Dummy: no-op
  },
};
