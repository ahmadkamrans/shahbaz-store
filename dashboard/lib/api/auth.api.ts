import api from './api';

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
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', credentials);
    const { token, user } = response.data;
    
    // Store token in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('adminToken', token);
      
      // Also set cookie for server-side access
      try {
        await fetch('/api/auth/set-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });
      } catch (error) {
        console.error('Failed to set cookie:', error);
        // Continue even if cookie setting fails
      }
    }
    
    return {
      token,
      admin: {
        id: user.id || user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  },

  logout: async (): Promise<void> => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('adminToken');
      
      // Also clear cookie
      try {
        await fetch('/api/auth/set-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: '' }),
        });
      } catch (error) {
        console.error('Failed to clear cookie:', error);
      }
    }
  },

  getCurrentUser: async (): Promise<AdminUser> => {
    const response = await api.get('/auth/me');
    const { user } = response.data;
    
    return {
      id: user._id || user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  },
};
