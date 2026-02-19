import { getDummyReviews, setReviewApproved as setApproved } from '../dummy/data';

export interface Review {
  id?: string;
  productId: string;
  productName: string;
  customerName: string;
  customerEmail: string;
  rating: number;
  comment: string;
  status: 'pending' | 'approved';
  createdAt: string;
}

export const reviewsApi = {
  getAll: async (): Promise<Review[]> => {
    return getDummyReviews() as Review[];
  },

  approve: async (id: string): Promise<void> => {
    setApproved(id);
  },
};
