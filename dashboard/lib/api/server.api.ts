// Server-side API client (for use in Server Components)
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const url = `${API_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    cache: 'no-store', // Always fetch fresh data on server
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}

// Admin routes require token - we'll handle this differently for server components
// For now, we can pass token from server actions or use API routes as middleware

export const serverApi = {
  // Public routes (no auth needed)
  products: {
    getAll: async (params?: {
      page?: number;
      limit?: number;
      search?: string;
      category?: string;
      inStock?: string;
    }) => {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.category) queryParams.append('category', params.category);
      if (params?.inStock) queryParams.append('inStock', params.inStock);
      
      const query = queryParams.toString();
      return fetchAPI(`/products${query ? `?${query}` : ''}`);
    },
    getById: async (id: string) => fetchAPI(`/products/${id}`),
    getBySlug: async (slug: string) => fetchAPI(`/products/slug/${slug}`),
  },

  categories: {
    getAll: async () => fetchAPI('/categories'),
    getById: async (id: string) => fetchAPI(`/categories/${id}`),
  },
};

