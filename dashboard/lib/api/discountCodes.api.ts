import {
  getDummyDiscountCodes,
  addDummyDiscountCode,
  updateDummyDiscountCode,
  removeDummyDiscountCode,
} from '../dummy/data';

export interface DiscountCode {
  id?: string;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  minOrder?: number;
  maxUses?: number;
  usedCount?: number;
  startDate: string;
  endDate: string;
  active: boolean;
}

export const discountCodesApi = {
  getAll: async (): Promise<DiscountCode[]> => {
    return getDummyDiscountCodes() as DiscountCode[];
  },

  create: async (data: Omit<DiscountCode, 'id'>): Promise<DiscountCode> => {
    return addDummyDiscountCode(data) as DiscountCode;
  },

  update: async (id: string, data: Partial<DiscountCode>): Promise<DiscountCode> => {
    const updated = updateDummyDiscountCode(id, data);
    if (!updated) throw new Error('Discount code not found');
    return updated as DiscountCode;
  },

  delete: async (id: string): Promise<void> => {
    removeDummyDiscountCode(id);
  },
};
