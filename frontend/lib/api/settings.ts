import { apiFetch, parseResponse } from './config';

export interface BannerSettings {
  text: string;
  linkText: string;
  linkUrl: string;
  isActive: boolean;
}

export interface SiteSettings {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface SocialSettings {
  facebook?: string;
  instagram?: string;
  twitter?: string;
}

export interface SEOSettings {
  metaTitle?: string;
  metaDescription?: string;
}

export interface DeliveryChargesSettings {
  amount: number;
  freeDeliveryThreshold: number;
}

export interface Settings {
  _id?: string;
  banner: BannerSettings;
  site?: SiteSettings;
  social?: SocialSettings;
  seo?: SEOSettings;
  deliveryCharges?: DeliveryChargesSettings;
}

export interface SettingsResponse {
  success: boolean;
  settings: Settings;
}

export interface BannerResponse {
  success: boolean;
  banner: BannerSettings;
}

export const settingsApi = {
  /**
   * Get all settings (public endpoint, no auth required)
   */
  get: async (): Promise<Settings> => {
    const response = await apiFetch('/api/settings');
    const data = await parseResponse<SettingsResponse>(response);
    return data.settings;
  },
  
  /**
   * Update banner settings (admin only)
   */
  updateBanner: async (banner: Partial<BannerSettings>): Promise<BannerSettings> => {
    const response = await apiFetch('/api/settings/banner', {
      method: 'PUT',
      body: JSON.stringify(banner),
    });
    const data = await parseResponse<BannerResponse>(response);
    return data.banner;
  },
  
  /**
   * Update all settings (admin only)
   */
  update: async (settings: Partial<Settings>): Promise<Settings> => {
    const response = await apiFetch('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
    const data = await parseResponse<SettingsResponse>(response);
    return data.settings;
  },
};
