import { create } from 'zustand';
import { Product } from '@/types';

interface WishlistStore {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
}

const initialItems: Product[] = [
  {
    id: '4',
    name: 'Men Watch',
    slug: 'men-watch',
    price: 17.9,
    image: '/assets/images/products/product-4.jpg',
    category: 'Accessories',
    inStock: true,
  },
  {
    id: '5',
    name: 'Men Cap',
    slug: 'men-cap',
    price: 17.9,
    image: '/assets/images/products/product-5.jpg',
    category: 'Accessories',
    inStock: true,
  },
  {
    id: '6',
    name: 'Men Black Gentle Belt',
    slug: 'men-black-gentle-belt',
    price: 17.9,
    image: '/assets/images/products/product-6.jpg',
    category: 'Accessories',
    inStock: true,
  },
];

export const useWishlist = create<WishlistStore>((set, get) => ({
  items: initialItems,
  addItem: (product) =>
    set((state) => {
      if (state.items.some((p) => p.id === product.id)) return state;
      return { items: [...state.items, product] };
    }),
  removeItem: (productId) =>
    set((state) => ({
      items: state.items.filter((p) => p.id !== productId),
    })),
  isInWishlist: (productId) => get().items.some((p) => p.id === productId),
}));
