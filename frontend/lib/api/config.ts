// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Get auth token from localStorage
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
};

// Set auth token in localStorage
export const setAuthToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('auth_token', token);
};

// Remove auth token from localStorage
export const removeAuthToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth_token');
};

// API fetch wrapper with auth
export const apiFetch = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = getAuthToken();
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers && typeof options.headers === 'object' && !Array.isArray(options.headers) && !(options.headers instanceof Headers)
      ? (options.headers as Record<string, string>)
      : {}),
  };

  // Add ngrok bypass header if using ngrok (free tier shows browser warning)
  if (API_BASE_URL.includes('ngrok')) {
    headers['ngrok-skip-browser-warning'] = 'true';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle 401 unauthorized - clear token and redirect to login
    if (response.status === 401) {
      removeAuthToken();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }

    return response;
  } catch (error: any) {
    // Handle network errors (CORS, connection refused, etc.)
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error(
        `Network error: Failed to fetch from ${url}\n\n` +
        `This usually means:\n` +
        `1. The server is not running or not accessible\n` +
        `2. CORS is not properly configured on the server\n` +
        `3. The API URL is incorrect (current: ${API_BASE_URL})\n` +
        `4. If using ngrok, ensure:\n` +
        `   - The ngrok tunnel is active (run: ngrok http 5000)\n` +
        `   - The ngrok URL points to your backend server (port 5000)\n` +
        `   - NEXT_PUBLIC_API_URL is set to the full ngrok URL (e.g., https://xxx.ngrok-free.app)\n` +
        `   - The ngrok-skip-browser-warning header is automatically added for ngrok URLs\n` +
        `5. SSL/TLS certificate issues (common with ngrok free tier)\n` +
        `6. Try accessing the ngrok URL directly in your browser to verify it's working\n\n` +
        `Original error: ${error.message}`
      );
    }
    // Re-throw other errors
    throw error;
  }
};

// Parse JSON response with error handling
export const parseResponse = async <T>(response: Response): Promise<T> => {
  // Read the response text once (can only be read once)
  const text = await response.text();
  
  // Check if response is actually JSON
  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  
  // If it's HTML (like an error page from ngrok or server), provide a helpful error
  if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
    throw new Error(
      `Server returned HTML instead of JSON. This usually means:\n` +
      `1. The API endpoint is incorrect (check your NEXT_PUBLIC_API_URL)\n` +
      `2. The server is not running or not accessible\n` +
      `3. There's a CORS or routing issue\n` +
      `4. The ngrok URL might be pointing to the wrong service\n` +
      `Response status: ${response.status} ${response.statusText}\n` +
      `Request URL: ${response.url}`
    );
  }
  
  // If content-type says it's not JSON, throw an error
  if (!isJson) {
    throw new Error(
      `Expected JSON but received ${contentType || 'unknown content type'}\n` +
      `Response: ${text.substring(0, 200)}${text.length > 200 ? '...' : ''}`
    );
  }
  
  // Parse JSON
  let data: any;
  try {
    data = JSON.parse(text);
  } catch (error) {
    // If JSON parsing fails, provide helpful error
    throw new Error(
      `Failed to parse JSON response. This might indicate:\n` +
      `1. The API endpoint returned an error page\n` +
      `2. The server configuration is incorrect\n` +
      `3. The ngrok URL might be pointing to the wrong endpoint\n` +
      `Response: ${text.substring(0, 200)}${text.length > 200 ? '...' : ''}`
    );
  }
  
  if (!response.ok) {
    // Handle validation errors
    if (data.errors && Array.isArray(data.errors)) {
      const errorMessages = data.errors.map((err: any) => 
        `${err.field}: ${err.message}`
      ).join(', ');
      throw new Error(errorMessages || data.message || 'Validation error');
    }
    throw new Error(data.message || 'An error occurred');
  }
  
  return data;
};
