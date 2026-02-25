import { apiFetch, parseResponse } from './config';

export interface HeaderLink {
  _id?: string;
  id?: string;
  label: string;
  url: string;
  order: number;
  isActive?: boolean;
  openInNewTab?: boolean;
}

export interface HeaderLinksResponse {
  success: boolean;
  links: HeaderLink[];
}

export const headerLinksApi = {
  /**
   * Get all active header links (public endpoint, no auth required)
   */
  getAll: async (): Promise<HeaderLink[]> => {
    const response = await apiFetch('/api/header-links');
    const data = await parseResponse<HeaderLinksResponse>(response);
    return data.links || [];
  },
};
