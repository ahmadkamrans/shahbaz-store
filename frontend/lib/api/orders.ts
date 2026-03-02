import { apiFetch, parseResponse } from './config';
import { Product } from '@/types';

export interface OrderItem {
  product: Product;
  quantity: number;
  price: number;
  selectedVariant?: any;
}

export interface CreateOrderData {
  items: Array<{
    product: string;
    quantity: number;
    price: number;
    selectedVariant?: any;
  }>;
  billingAddress?: {
    firstName?: string;
    lastName?: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone?: string;
    email?: string;
  };
  shippingAddress: {
    firstName?: string;
    lastName?: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone?: string;
    email?: string;
  };
  discountCode?: string;
}

export interface Order {
  _id: string;
  user: string;
  items: OrderItem[];
  totalAmount: number;
  discountCode?: string | {
    _id?: string;
    code: string;
    type: string;
    value: number;
  };
  discountAmount: number;
  deliveryCharges?: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  billingAddress?: {
    firstName?: string;
    lastName?: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone?: string;
    email?: string;
  };
  shippingAddress: {
    firstName?: string;
    lastName?: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone?: string;
    email?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export const ordersApi = {
  getOrders: async (): Promise<Order[]> => {
    const response = await apiFetch('/api/orders');
    const data = await parseResponse<{ orders: Order[] }>(response);
    return data.orders;
  },

  getOrder: async (id: string): Promise<Order> => {
    const response = await apiFetch(`/api/orders/${id}`);
    return parseResponse<Order>(response);
  },

  createOrder: async (data: CreateOrderData): Promise<Order> => {
    const response = await apiFetch('/api/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    const result = await parseResponse<{ success: boolean; order: Order }>(response);
    return result.order;
  },
};
