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
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error(`API Error [${endpoint}]:`, err);

    // More descriptive error messages
    if (err.message === 'Failed to fetch') {
      throw new Error('Cannot connect to server. Please make sure the backend is running on port 3001.');
    }

    throw err;
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

  logout: async () => {
    return apiCall('/auth/logout', {
      method: 'POST',
    });
  },

  verify: async () => {
    return apiCall('/auth/verify', {
      method: 'GET',
    });
  },

  forgotPassword: async (email: string) => {
    return apiCall('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: async (token: string, newPassword: string) => {
    return apiCall('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  },

  verifyEmail: async (token: string) => {
    return apiCall(`/auth/verify-email?token=${token}`, {
      method: 'GET',
    });
  },
};

// Export API base URL for direct access if needed
// Export API base URL for direct access if needed
export { API_BASE_URL, apiCall };

// Photo Session API
export const sessionAPI = {
  // Create new session
  createSession: async (data: { sessionName: string; templateId?: string; metadata?: Record<string, unknown> }) => {
    return apiCall('/sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Get all sessions
  getSessions: async (params?: { status?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    
    return apiCall(`/sessions?${query.toString()}`, { method: 'GET' });
  },

  // Get session by ID
  getSession: async (id: string) => {
    return apiCall(`/sessions/${id}`, { method: 'GET' });
  },

  // Update session
  updateSession: async (id: string, data: { status?: string; sessionName?: string; metadata?: Record<string, unknown> }) => {
    return apiCall(`/sessions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Delete session
  deleteSession: async (id: string) => {
    return apiCall(`/sessions/${id}`, { method: 'DELETE' });
  },
};

// Photo Upload API
export const photoAPI = {
  // Upload captured photo
  uploadPhoto: async (data: {
    sessionId: string;
    photoUrl: string;
    thumbnailUrl?: string;
    order?: number;
    metadata?: Record<string, unknown>;
  }) => {
    return apiCall('/photos/upload', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Get photos for session
  getPhotos: async (sessionId: string) => {
    return apiCall(`/photos/upload?sessionId=${sessionId}`, { method: 'GET' });
  },
};

// Composite API
export const compositeAPI = {
  // Create final composite
  createComposite: async (data: {
    sessionId: string;
    compositeUrl: string;
    thumbnailUrl?: string;
    templateId?: string;
    isPublic?: boolean;
    metadata?: Record<string, unknown>;
  }) => {
    return apiCall('/composites', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Get user's composites
  getComposites: async (params?: { page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    
    return apiCall(`/composites?${query.toString()}`, { method: 'GET' });
  },

  // Share composite
  shareComposite: async (id: string) => {
    return apiCall(`/share/${id}`, { method: 'GET' });
  },
};

// User profile API helpers
export const userAPI = {
  getProfile: async () => {
    return apiCall('/users/profile', { method: 'GET' });
  },

  updateProfile: async (payload: { name?: string; email?: string; phone?: string }) => {
    return apiCall('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  // Upload profile picture — FormData, do not set JSON content-type
  uploadAvatar: async (file: File) => {
    const token = localStorage.getItem('token');
    const url = `${API_BASE_URL}/users/profile-picture`;

    const form = new FormData();
    form.append('profilePicture', file);

    const res = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      credentials: 'include',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: form,
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || `Upload failed with status ${res.status}`);
    }

    const data = await res.json().catch(() => ({}));
    return data;
  },

  deleteAvatar: async () => {
    return apiCall('/users/profile-picture', { method: 'DELETE' });
  },

  deactivateAccount: async (password: string) => {
    return apiCall('/users/deactivate', {
      method: 'PUT',
      body: JSON.stringify({ password }),
    });
  },

  deleteAccount: async (password: string) => {
    return apiCall('/users/delete', {
      method: 'DELETE',
      body: JSON.stringify({ password }),
    });
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    return apiCall('/users/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  // ===== ADMIN ONLY METHODS =====
  // Get all users (admin)
  getAllUsers: async (options?: { limit?: number; skip?: number; role?: string }) => {
    const params = new URLSearchParams();
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.skip) params.append('skip', options.skip.toString());
    if (options?.role) params.append('role', options.role);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiCall(`/users/all${query}`);
  },

  // Get user by ID (admin)
  getUser: async (id: string) => {
    return apiCall(`/users/${id}`);
  },

  // Update user role (admin)
  updateUserRole: async (id: string, role: 'user' | 'admin') => {
    return apiCall(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  },

  // Delete user (admin)
  deleteUser: async (id: string) => {
    return apiCall(`/users/${id}/delete`, {
      method: 'DELETE',
    });
  },

  // Get user statistics (admin)
  getUserStats: async () => {
    return apiCall('/users/stats');
  },
};

// Dashboard API
export const dashboardAPI = {
  // Get dashboard statistics
  getStats: async () => {
    return apiCall('/dashboard/stats', { method: 'GET' });
  },

  // Get recent templates
  getRecentTemplates: async () => {
    return apiCall('/dashboard/templates', { method: 'GET' });
  },

  // Get recent activity
  getRecentActivity: async () => {
    return apiCall('/dashboard/activity', { method: 'GET' });
  },
};

// Template API
export const templateAPI = {
  // Get all templates
  getTemplates: async (params?: { category?: string; isPremium?: boolean; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.isPremium !== undefined) query.append('isPremium', params.isPremium.toString());
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    
    return apiCall(`/templates?${query.toString()}`, { method: 'GET' });
  },

  // Get single template
  getTemplate: async (id: string) => {
    return apiCall(`/templates/${id}`, { method: 'GET' });
  },

  // Create template (admin only)
  createTemplate: async (data: {
    name: string;
    category: string;
    thumbnail: string;
    frameUrl: string;
    isPremium?: boolean;
    frameCount: number;
    layoutPositions: Array<{ x: number; y: number; width: number; height: number }>;
    isActive?: boolean;
  }) => {
    return apiCall('/templates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update template (admin only)
  updateTemplate: async (id: string, data: {
    name?: string;
    category?: string;
    thumbnail?: string;
    frameUrl?: string;
    isPremium?: boolean;
    frameCount?: number;
    layoutPositions?: Array<{ x: number; y: number; width: number; height: number }>;
    isActive?: boolean;
  }) => {
    return apiCall(`/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete template (admin only)
  deleteTemplate: async (id: string) => {
    return apiCall(`/templates/${id}`, { method: 'DELETE' });
  },
};

