import { apiFetch, parseResponse } from './config';

export interface DiscountCode {
  _id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minPurchase?: number;
  maxDiscount?: number;
  validFrom: string;
  validUntil: string;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
}

export interface ValidateDiscountCodeResponse {
  valid: boolean;
  discountCode?: DiscountCode;
  discountAmount?: number;
  message?: string;
}

export const discountCodesApi = {
  validateDiscountCode: async (code: string, totalAmount: number): Promise<ValidateDiscountCodeResponse> => {
    const response = await apiFetch('/api/discount-codes/validate', {
      method: 'POST',
      body: JSON.stringify({ code, totalAmount }),
    });
    return parseResponse<ValidateDiscountCodeResponse>(response);
  },
};
