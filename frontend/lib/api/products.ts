import { apiFetch, parseResponse } from './config';
import { Product } from '@/types';

// Helper function to format image URLs with backend base URL
const formatImageUrl = (imagePath: string | undefined): string => {
  if (!imagePath) return '/assets/images/products/product-1.jpg';
  
  // If already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Get base URL for images (backend serves at root, not /api)
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  const BACKEND_BASE_URL = API_BASE_URL.replace('/api', '');
  
  // If starts with /, it's a server path - prepend backend URL
  if (imagePath.startsWith('/')) {
    return `${BACKEND_BASE_URL}${imagePath}`;
  }
  
  // Otherwise, assume it's relative to uploads
  return `${BACKEND_BASE_URL}/${imagePath}`;
};

export interface ProductsResponse {
  success: boolean;
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProductFilters {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStock?: boolean;
  featured?: boolean;
  tags?: string[];
  sortBy?: 'createdAt' | 'name' | 'price' | 'averageRating' | 'viewCount';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface BackendProduct {
  _id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  description: string;
  shortDescription?: string;
  image?: string;
  images: string[];
  category: {
    _id: string;
    name: string;
    slug: string;
  };
  stock: number;
  trackInventory: boolean;
  averageRating: number;
  reviewCount: number;
  tags?: string[];
  variants?: any;
  sku?: string;
  barcode?: string;
  featured?: boolean;
  isActive?: boolean;
}

// Transform backend product to frontend product format
export const transformProduct = (product: BackendProduct): Product => {
  // Use main image if available, otherwise use first image from array
  const mainImage = product.image || product.images?.[0];
  
  return {
    id: product._id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    oldPrice: product.compareAtPrice,
    image: formatImageUrl(mainImage),
    images: product.images?.map(formatImageUrl) || [],
    category: product.category?.name || 'Uncategorized',
    categoryInfo: product.category ? {
      id: product.category._id,
      name: product.category.name,
      slug: product.category.slug,
    } : undefined,
    rating: product.averageRating,
    reviews: product.reviewCount,
    description: product.description,
    shortDescription: product.shortDescription,
    inStock: product.trackInventory ? product.stock > 0 : true,
    sku: product.sku,
    tags: product.tags,
    variants: product.variants ? (() => {
      try {
        // Handle different variant formats from backend
        let variantsObj = product.variants;
        
        // If it's a Map-like object, convert to plain object
        if (variantsObj && typeof variantsObj === 'object' && !Array.isArray(variantsObj)) {
          // Check if it's already a plain object or needs conversion
          const entries = Object.entries(variantsObj);
          
          if (entries.length > 0) {
            // Product price is the base price when variants exist
            const basePrice = product.price || 0;
            
            const result = entries.flatMap(([key, values]: [string, any]) => {
              // Ensure values is an array
              const valuesArray = Array.isArray(values) ? values : [];
              
              return valuesArray.map((v: any) => {
                // Calculate variant price: basePrice + priceModifier
                const priceModifier = v.priceModifier || 0;
                const variantPrice = basePrice + priceModifier;
                
                return {
                  id: `${product._id}-${key}-${v.value}`,
                  name: key,
                  price: variantPrice,
                  priceModifier: priceModifier,
                  basePrice: basePrice,
                  inStock: (v.stock !== undefined && v.stock !== null) ? v.stock > 0 : true,
                  stock: v.stock,
                  attributes: { [key]: v.value },
                  image: v.image,
                  sku: v.sku,
                  barcode: v.barcode,
                };
              });
            });
            return result;
          }
        }
        return undefined;
      } catch (error) {
        console.error('Error transforming variants:', error);
        return undefined;
      }
    })() : undefined,
  };
};

export const productsApi = {
  getProducts: async (filters: ProductFilters = {}): Promise<ProductsResponse> => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, String(v)));
        } else {
          params.append(key, String(value));
        }
      }
    });

    const response = await apiFetch(`/api/products?${params.toString()}`);
    const data = await parseResponse<{ 
      products: BackendProduct[]; 
      pagination?: { total: number; page: number; limit: number; pages: number };
      total?: number;
      page?: number;
      limit?: number;
      totalPages?: number;
    }>(response);
    
    // Handle both response formats (with pagination object or flat)
    const pagination = data.pagination || {
      total: data.total || 0,
      page: data.page || 1,
      limit: data.limit || 12,
      pages: data.totalPages || 1,
    };
    
    return {
      success: true,
      products: data.products.map(transformProduct),
      total: pagination.total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: pagination.pages,
    };
  },

  getProduct: async (id: string): Promise<Product> => {
    const response = await apiFetch(`/api/products/${id}`);
    const data = await parseResponse<{ success: boolean; product: BackendProduct }>(response);
    return transformProduct(data.product);
  },

  getProductBySlug: async (slug: string): Promise<Product> => {
    // Backend endpoint accepts both ID and slug, so we can use the same endpoint
    const response = await apiFetch(`/api/products/${slug}`);
    const data = await parseResponse<{ success: boolean; product: BackendProduct }>(response);
    return transformProduct(data.product);
  },

  getPopularProducts: async (limit: number = 10): Promise<Product[]> => {
    const response = await apiFetch(`/api/products/popular?limit=${limit}`);
    const data = await parseResponse<{ products: BackendProduct[] }>(response);
    return data.products.map(transformProduct);
  },

  getRelatedProducts: async (productId: string, limit: number = 4): Promise<Product[]> => {
    const response = await apiFetch(`/api/products/${productId}/related?limit=${limit}`);
    const data = await parseResponse<{ products: BackendProduct[] }>(response);
    return data.products.map(transformProduct);
  },

  getCollections: async (type: 'featured' | 'bestSelling' | 'latest' | 'topRated', categoryId?: string, limit: number = 4): Promise<Product[]> => {
    const params = new URLSearchParams();
    params.append('type', type);
    if (categoryId) {
      params.append('category', categoryId);
    }
    params.append('limit', String(limit));
    
    const response = await apiFetch(`/api/products/collections?${params.toString()}`);
    const data = await parseResponse<{ success: boolean; products: BackendProduct[] }>(response);
    return data.products.map(transformProduct);
  },
};
