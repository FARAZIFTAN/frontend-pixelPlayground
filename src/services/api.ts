// API Base URL
const API_BASE_URL = 'http://localhost:3001/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

// Generic API call function
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    ...options,
    mode: 'cors',
    credentials: 'include',
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error(`API Error [${endpoint}]:`, error);
    
    // More descriptive error messages
    if (error.message === 'Failed to fetch') {
      throw new Error('Cannot connect to server. Please make sure the backend is running on port 3001.');
    }
    
    throw error;
  }
}

// Auth API
export const authAPI = {
  register: async (name: string, email: string, password: string) => {
    return apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  },

  login: async (email: string, password: string) => {
    return apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  verify: async () => {
    return apiCall('/auth/verify', {
      method: 'GET',
    });
  },
};

// Export API base URL for direct access if needed
export { API_BASE_URL };
