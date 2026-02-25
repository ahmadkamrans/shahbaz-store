import { create } from 'zustand';
import { CartItem, Product, ProductVariant } from '@/types';

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, variant?: ProductVariant) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  subtotal: number;
  initializeCart: () => void;
}

const CART_STORAGE_KEY = 'shahbaz-cart-items';

const calculateTotals = (items: CartItem[]) => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return {
    subtotal,
    total: subtotal, // Add shipping/tax logic here if needed
  };
};

// Load initial state from localStorage
const loadCartFromStorage = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load cart from storage:', error);
  }
  return [];
};

// Save cart to localStorage
const saveCartToStorage = (items: CartItem[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Failed to save cart to storage:', error);
  }
};

export const useCart = create<CartStore>((set, get) => {
  // Initialize from storage (only on client side)
  const initialItems = typeof window !== 'undefined' ? loadCartFromStorage() : [];
  const initialTotals = calculateTotals(initialItems);

  return {
    items: initialItems,
    ...initialTotals,
    
    initializeCart: () => {
      // Only reinitialize if items are empty (to avoid overwriting current state)
      const currentItems = get().items;
      if (currentItems.length === 0) {
        const storedItems = loadCartFromStorage();
        const totals = calculateTotals(storedItems);
        set({ items: storedItems, ...totals });
      }
    },

    addItem: (product, quantity = 1, variant?: ProductVariant) => {
      set((state) => {
        // Use variant price if provided, otherwise use product price
        const itemPrice = variant?.price || product.price;
        
        // Check if item with same product and variant already exists
        const existingItem = state.items.find(
          (item) => 
            item.product.id === product.id &&
            (!variant || JSON.stringify(item.variant) === JSON.stringify(variant))
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
            price: itemPrice,
            variant: variant || undefined,
          };
          newItems = [...state.items, newItem];
        }

        const totals = calculateTotals(newItems);
        saveCartToStorage(newItems);
        
        return {
          items: newItems,
          ...totals,
        };
      });
    },
    
    removeItem: (itemId) => {
      set((state) => {
        const newItems = state.items.filter((item) => item.id !== itemId);
        const totals = calculateTotals(newItems);
        saveCartToStorage(newItems);
        
        return {
          items: newItems,
          ...totals,
        };
      });
    },
    
    updateQuantity: (itemId, quantity) => {
      set((state) => {
        const newItems = state.items.map((item) =>
          item.id === itemId ? { ...item, quantity: Math.max(1, quantity) } : item
        );
        const totals = calculateTotals(newItems);
        saveCartToStorage(newItems);
        
        return {
          items: newItems,
          ...totals,
        };
      });
    },
    
    clearCart: () => {
      saveCartToStorage([]);
      set({ items: [], total: 0, subtotal: 0 });
    },
  };
});
