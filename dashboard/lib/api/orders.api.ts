import { getDummyOrders, dummyOrders } from '../dummy/data';

export interface OrderItem {
  productId: string | { _id: string; name: string; image?: string };
  productName: string;
  productImage?: string;
  quantity: number;
  price: number;
  variantId?: string;
}

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Order {
  _id?: string;
  id?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrdersResponse {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  recentOrders: Order[];
}

export const ordersApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<OrdersResponse> => {
    return getDummyOrders(params) as unknown as OrdersResponse;
  },

  getById: async (id: string): Promise<Order> => {
    const order = dummyOrders.find((o) => o.id === id || o._id === id);
    if (!order) throw new Error('Order not found');
    return order as Order;
  },

  updateStatus: async (id: string, status: Order['status']): Promise<Order> => {
    const order = dummyOrders.find((o) => o.id === id || o._id === id);
    if (!order) throw new Error('Order not found');
    return { ...order, status } as Order;
  },
};
