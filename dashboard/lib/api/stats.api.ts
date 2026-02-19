import type { DashboardStats } from './orders.api';
import { getDummyStats } from '../dummy/data';

export type { DashboardStats };

export const statsApi = {
  getStats: async (): Promise<DashboardStats> => {
    return getDummyStats() as unknown as DashboardStats;
  },
};
