import { create } from 'zustand';
import toast from 'react-hot-toast';
import { Product } from '@/types';
import { wishlistApi } from '@/lib/api/wishlist';
import { getAuthToken } from '@/lib/api/config';

interface WishlistStore {
  items: Product[];
  loading: boolean;
  addItem: (product: Product) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  fetchWishlist: () => Promise<void>;
}

export const useWishlist = create<WishlistStore>((set, get) => ({
  items: [],
  loading: false,
  
  fetchWishlist: async () => {
    if (!getAuthToken()) {
      set({ items: [] });
      return;
    }
    
    try {
      set({ loading: true });
      const items = await wishlistApi.getWishlist();
      set({ items, loading: false });
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
      set({ loading: false });
    }
  },

  addItem: async (product) => {
    if (!getAuthToken()) {
      // If not logged in, redirect to login or show message
      if (typeof window !== 'undefined') {
        toast.error('Please login to add items to wishlist', {
          duration: 4000,
        });
        // Small delay to show toast before redirect
        setTimeout(() => {
          if (confirm('Go to login page?')) {
            window.location.href = '/login';
          }
        }, 500);
      }
      return;
    }

    try {
      // Get updated wishlist from server
      const updatedItems = await wishlistApi.addToWishlist(product.id);
      set({ items: updatedItems });
    } catch (error: any) {
      console.error('Failed to add to wishlist:', error);
      const errorMessage = error?.message || 'Failed to add product to wishlist';
      toast.error(errorMessage);
      throw error;
    }
  },

  removeItem: async (productId) => {
    if (!getAuthToken()) return;

    try {
      // Get updated wishlist from server
      const updatedItems = await wishlistApi.removeFromWishlist(productId);
      set({ items: updatedItems });
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
      throw error;
    }
  },

  isInWishlist: (productId) => get().items.some((p) => p.id === productId),
}));
