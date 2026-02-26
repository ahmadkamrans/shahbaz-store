export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  oldPrice?: number;
  image: string;
  images?: string[];
  category: string;
  categoryInfo?: {
    id: string;
    name: string;
    slug: string;
  };
  rating?: number;
  reviews?: number;
  description?: string;
  shortDescription?: string;
  inStock?: boolean;
  sku?: string;
  variants?: ProductVariant[];
  tags?: string[];
}

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  inStock: boolean;
  attributes?: Record<string, string>;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
  children?: Category[];
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  variant?: ProductVariant;
  price: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
  subtotal: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

