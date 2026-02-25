import { apiFetch, parseResponse } from './config';
import { Product } from '@/types';
import { BackendProduct, transformProduct } from './products';

export const wishlistApi = {
  getWishlist: async (): Promise<Product[]> => {
    const response = await apiFetch('/api/wishlist');
    const data = await parseResponse<{ wishlist: { products: Array<{ product: BackendProduct }> } }>(response);
    // Extract products from wishlist.products array
    return data.wishlist.products.map(item => transformProduct(item.product));
  },

  addToWishlist: async (productId: string): Promise<Product[]> => {
    const response = await apiFetch('/api/wishlist', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
    const data = await parseResponse<{ wishlist: { products: Array<{ product: BackendProduct }> } }>(response);
    // Return updated wishlist products
    return data.wishlist.products.map(item => transformProduct(item.product));
  },

  removeFromWishlist: async (productId: string): Promise<Product[]> => {
    const response = await apiFetch(`/api/wishlist/${productId}`, {
      method: 'DELETE',
    });
    const data = await parseResponse<{ wishlist: { products: Array<{ product: BackendProduct }> } }>(response);
    // Return updated wishlist products
    return data.wishlist.products.map(item => transformProduct(item.product));
  },
};
