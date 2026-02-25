import { apiFetch, parseResponse } from './config';

export interface Review {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  product: string;
  rating: number;
  title?: string;
  comment: string;
  helpful: number;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewData {
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
}

export const reviewsApi = {
  getProductReviews: async (productId: string): Promise<Review[]> => {
    const response = await apiFetch(`/api/reviews/product/${productId}`);
    const data = await parseResponse<{ reviews: Review[] }>(response);
    return data.reviews.filter(r => r.isApproved);
  },

  createReview: async (productId: string, data: CreateReviewData): Promise<Review> => {
    const response = await apiFetch(`/api/reviews/product/${productId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return parseResponse<Review>(response);
  },

  markHelpful: async (reviewId: string): Promise<void> => {
    await apiFetch(`/api/reviews/${reviewId}/helpful`, {
      method: 'POST',
    });
  },
};
