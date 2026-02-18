import { create } from 'zustand';
import { CartItem, Product } from '@/types';

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  subtotal: number;
}

const calculateTotals = (items: CartItem[]) => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return {
    subtotal,
    total: subtotal, // Add shipping/tax logic here if needed
  };
};

const initialItems: CartItem[] = [
  {
    id: '1',
    product: {
      id: '1',
      name: 'Ultimate 3D Bluetooth Speaker',
      slug: 'ultimate-3d-bluetooth-speaker',
      price: 99.0,
      image: '/assets/images/products/product-1.jpg',
      category: 'Electronics',
    },
    quantity: 1,
    price: 99.0,
  },
  {
    id: '2',
    product: {
      id: '2',
      name: 'Brown Women Casual HandBag',
      slug: 'brown-women-casual-handbag',
      price: 35.0,
      image: '/assets/images/products/product-2.jpg',
      category: 'Fashion',
    },
    quantity: 1,
    price: 35.0,
  },
  {
    id: '3',
    product: {
      id: '3',
      name: 'Circled Ultimate 3D Speaker',
      slug: 'circled-ultimate-3d-speaker',
      price: 35.0,
      image: '/assets/images/products/product-3.jpg',
      category: 'Electronics',
    },
    quantity: 1,
    price: 35.0,
  },
];

export const useCart = create<CartStore>((set) => ({
  items: initialItems,
  addItem: (product, quantity = 1) =>
    set((state) => {
      const existingItem = state.items.find(
        (item) => item.product.id === product.id
      );
      let newItems: CartItem[];

      if (existingItem) {
        newItems = state.items.map((item) =>
          item.id === existingItem.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        const newItem: CartItem = {
          id: Date.now().toString(),
          product,
          quantity,
          price: product.price,
        };
        newItems = [...state.items, newItem];
      }

      return {
        items: newItems,
        ...calculateTotals(newItems),
      };
    }),
  removeItem: (itemId) =>
    set((state) => {
      const newItems = state.items.filter((item) => item.id !== itemId);
      return {
        items: newItems,
        ...calculateTotals(newItems),
      };
    }),
  updateQuantity: (itemId, quantity) =>
    set((state) => {
      const newItems = state.items.map((item) =>
        item.id === itemId ? { ...item, quantity: Math.max(1, quantity) } : item
      );
      return {
        items: newItems,
        ...calculateTotals(newItems),
      };
    }),
  clearCart: () => set({ items: [], total: 0, subtotal: 0 }),
  ...calculateTotals(initialItems),
}));
