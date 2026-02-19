/**
 * Auth API removed - dashboard uses dummy user and no login API.
 * This file is kept for any legacy imports; all methods are no-ops.
 */

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  token: string;
  admin: AdminUser;
}

export const authApi = {
  login: async (_credentials: LoginCredentials): Promise<LoginResponse> => {
    return {
      token: 'dummy-token',
      admin: { id: 'admin-1', name: 'Admin', email: 'admin@example.com', role: 'admin' },
    };
  },

  logout: async (): Promise<void> => {
    // No-op
  },

  getCurrentUser: async (): Promise<AdminUser> => {
    return { id: 'admin-1', name: 'Admin', email: 'admin@example.com', role: 'admin' };
  },
};
