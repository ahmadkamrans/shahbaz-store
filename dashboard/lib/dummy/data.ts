/**
 * Dummy data for dashboard when no backend API is connected.
 * Uses local types to avoid circular dependency with api modules.
 */

export interface DummyCategory {
  _id?: string;
  id?: string;
  name: string;
  slug: string;
  parentId?: string | null;
}

export interface DummyProduct {
  _id?: string;
  id?: string;
  name: string;
  slug: string;
  price: number;
  oldPrice?: number;
  image: string;
  category: string;
  inStock?: boolean;
  shortDescription?: string;
  description?: string;
  sku?: string;
  tags?: string[];
}

export interface DummyOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface DummyShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface DummyOrder {
  _id?: string;
  id?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: DummyOrderItem[];
  subtotal: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: DummyShippingAddress;
  paymentMethod: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DummyStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  recentOrders: DummyOrder[];
}

export const dummyCategories: DummyCategory[] = [
  { id: 'cat-1', name: 'Doors', slug: 'doors', parentId: null },
  { id: 'cat-2', name: 'Bricks', slug: 'bricks', parentId: null },
  { id: 'cat-3', name: 'Accessories', slug: 'accessories', parentId: null },
  { id: 'cat-4', name: 'Internal Doors', slug: 'internal-doors', parentId: 'cat-1' },
  { id: 'cat-5', name: 'Entry Doors', slug: 'entry-doors', parentId: 'cat-1' },
];

const defaultImage = '/Images/Doors/entry doors1.jpeg';

export const dummyProducts: DummyProduct[] = [
  {
    id: 'prod-1',
    name: 'Classic Oak Entry Door',
    slug: 'classic-oak-entry-door',
    price: 899,
    oldPrice: 999,
    image: defaultImage,
    category: 'cat-1',
    inStock: true,
    shortDescription: 'Solid oak entry door with brass fittings.',
    description: 'Premium solid oak entry door. Weather resistant finish.',
    sku: 'ENT-OAK-01',
    tags: ['oak', 'entry', 'door'],
  },
  {
    id: 'prod-2',
    name: 'Red Clay Brick Pack',
    slug: 'red-clay-brick-pack',
    price: 245,
    image: '/Images/Bricks/Brick (1).jpeg',
    category: 'cat-2',
    inStock: true,
    shortDescription: 'Traditional red clay bricks, 500 per pack.',
    sku: 'BRK-RED-500',
    tags: ['brick', 'clay', 'construction'],
  },
  {
    id: 'prod-3',
    name: 'Chrome Basin Mixer',
    slug: 'chrome-basin-mixer',
    price: 89,
    oldPrice: 119,
    image: '/Images/accessories/basin-mixers (1).jpeg',
    category: 'cat-3',
    inStock: true,
    shortDescription: 'Modern chrome basin mixer tap.',
    sku: 'ACC-BASIN-01',
    tags: ['bathroom', 'chrome', 'mixer'],
  },
  {
    id: 'prod-4',
    name: 'Internal Panel Door',
    slug: 'internal-panel-door',
    price: 320,
    image: '/Images/Internal-doors/internal-doors03.jpeg',
    category: 'cat-4',
    inStock: true,
    shortDescription: 'White internal panel door, standard size.',
    sku: 'INT-PAN-01',
    tags: ['internal', 'door', 'panel'],
  },
  {
    id: 'prod-5',
    name: 'Door Handle Set',
    slug: 'door-handle-set',
    price: 45,
    image: '/Images/accessories/internal-door-handles1.jpeg',
    category: 'cat-3',
    inStock: false,
    shortDescription: 'Stainless steel door handle set.',
    sku: 'ACC-HANDLE-01',
    tags: ['handle', 'hardware'],
  },
];

const dummyShipping: DummyShippingAddress = {
  street: '123 Main St',
  city: 'New York',
  state: 'NY',
  zipCode: '10001',
  country: 'USA',
};

const dummyOrderItems: DummyOrderItem[] = [
  { productId: 'prod-1', productName: 'Classic Oak Entry Door', quantity: 1, price: 899 },
  { productId: 'prod-3', productName: 'Chrome Basin Mixer', quantity: 2, price: 89 },
];

export const dummyOrders: DummyOrder[] = [
  {
    id: 'ord-1',
    customerName: 'John Smith',
    customerEmail: 'john@example.com',
    customerPhone: '+1 555-0100',
    items: dummyOrderItems,
    subtotal: 1077,
    total: 1120,
    status: 'delivered',
    shippingAddress: dummyShipping,
    paymentMethod: 'card',
    createdAt: '2025-02-15T10:30:00Z',
    updatedAt: '2025-02-18T14:00:00Z',
  },
  {
    id: 'ord-2',
    customerName: 'Jane Doe',
    customerEmail: 'jane@example.com',
    items: [{ productId: 'prod-2', productName: 'Red Clay Brick Pack', quantity: 3, price: 245 }],
    subtotal: 735,
    total: 760,
    status: 'processing',
    shippingAddress: { ...dummyShipping, street: '456 Oak Ave', city: 'Boston', state: 'MA', zipCode: '02101' },
    paymentMethod: 'paypal',
    createdAt: '2025-02-18T09:15:00Z',
  },
  {
    id: 'ord-3',
    customerName: 'Bob Wilson',
    customerEmail: 'bob@example.com',
    items: [{ productId: 'prod-4', productName: 'Internal Panel Door', quantity: 2, price: 320 }],
    subtotal: 640,
    total: 670,
    status: 'pending',
    shippingAddress: { ...dummyShipping, street: '789 Pine Rd', city: 'Chicago', state: 'IL', zipCode: '60601' },
    paymentMethod: 'card',
    createdAt: '2025-02-19T11:00:00Z',
  },
];

export function getDummyStats(): DummyStats {
  return {
    totalProducts: dummyProducts.length,
    totalOrders: dummyOrders.length,
    totalRevenue: dummyOrders.reduce((sum, o) => sum + o.total, 0),
    recentOrders: [...dummyOrders].sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    ).slice(0, 5),
  };
}

export function getDummyProducts(params?: { page?: number; limit?: number; category?: string }) {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 20;
  let list = [...dummyProducts];
  if (params?.category) {
    list = list.filter((p) => p.category === params.category);
  }
  const total = list.length;
  const pages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  const products = list.slice(start, start + limit);
  return {
    products,
    pagination: { page, limit, total, pages },
  };
}

export function getDummyCategories(): DummyCategory[] {
  return [...dummyCategories];
}

export function getDummyOrders(params?: { page?: number; limit?: number; status?: string }) {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 20;
  let list = [...dummyOrders];
  if (params?.status) {
    list = list.filter((o) => o.status === params.status);
  }
  const total = list.length;
  const pages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  const orders = list.slice(start, start + limit);
  return {
    orders,
    pagination: { page, limit, total, pages },
  };
}
