import { apiFetch, parseResponse, setAuthToken, removeAuthToken } from './config';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'customer';
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

export const authApi = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    const result = await parseResponse<AuthResponse>(response);
    if (result.token) {
      setAuthToken(result.token);
    }
    return result;
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    const result = await parseResponse<AuthResponse>(response);
    if (result.token) {
      setAuthToken(result.token);
    }
    return result;
  },

  logout: (): void => {
    removeAuthToken();
  },

  getMe: async (): Promise<User> => {
    const response = await apiFetch('/api/auth/me');
    const result = await parseResponse<{ success: boolean; user: User }>(response);
    return result.user;
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await apiFetch('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    const result = await parseResponse<{ success: boolean; user: User }>(response);
    return result.user;
  },
};
