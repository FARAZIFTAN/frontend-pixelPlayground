// API Base URL from environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Configuration constants
const DEFAULT_TIMEOUT = 180000; // 180 seconds (3 minutes) - increased for slow backend
const TOKEN_STORAGE_KEY = 'token';

/**
 * Get authentication token from storage
 */
const getAuthToken = (): string | null => {
  return sessionStorage.getItem(TOKEN_STORAGE_KEY);
};

/**
 * Get authentication headers
 */
const getAuthHeaders = (): Record<string, string> => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

/**
 * Create timeout promise for fetch requests
 */
const createTimeoutPromise = (ms: number): Promise<never> => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Request timeout')), ms);
  });
};

/**
 * Handle API error responses
 */
const handleApiError = async (response: Response, endpoint: string): Promise<never> => {
  let errorData: any;
  try {
    errorData = await response.json();
  } catch {
    errorData = { message: `HTTP error! status: ${response.status}` };
  }

  let errorMessage = errorData.message || errorData.error || `HTTP error! status: ${response.status}`;

  if (errorData.details) {
    errorMessage += ` - ${errorData.details}`;
  }

  console.error(`API Error [${endpoint}]:`, errorMessage, errorData);
  throw new Error(errorMessage);
};

/**
 * Generic API call function with timeout
 */
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {},
  timeout: number = DEFAULT_TIMEOUT
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
    const response = await Promise.race([
      fetch(url, config),
      createTimeoutPromise(timeout),
    ]);

    if (!response.ok) {
      return handleApiError(response, endpoint);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error(`API Error [${endpoint}]:`, err);

    // More descriptive error messages
    if (err.message === 'Failed to fetch') {
      throw new Error('Cannot connect to server. Please make sure the backend is running on port 3000.');
    }

    if (err.message === 'Request timeout') {
      throw new Error('Request timed out. The server is taking longer than expected. Please try again or contact support.');
    }

    throw err;
  }
}

/**
 * API call with retry logic for resilience
 */
async function apiCallWithRetry<T>(
  endpoint: string,
  options: RequestInit = {},
  timeout: number = DEFAULT_TIMEOUT,
  maxRetries: number = 2
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        // Exponential backoff: 1s, 2s
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 3000);
        console.log(`⏳ Retrying request to ${endpoint} (attempt ${attempt + 1}/${maxRetries + 1}) after ${delay}ms delay...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      return await apiCall<T>(endpoint, options, timeout);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on auth errors or client errors
      if (lastError.message.includes('401') ||
        lastError.message.includes('403') ||
        lastError.message.includes('400')) {
        throw lastError;
      }

      // Continue to next retry
      if (attempt < maxRetries) {
        console.warn(`⚠️ Request failed (attempt ${attempt + 1}/${maxRetries + 1}):`, lastError.message);
      }
    }
  }

  // All retries exhausted
  throw lastError || new Error('Request failed after all retries');
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

  googleAuth: async (googleToken: string) => {
    return apiCall('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ token: googleToken }),
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
  // Upload composite image as file
  uploadCompositeImage: async (base64Image: string, sessionId: string, templateId?: string) => {
    // Convert base64 to blob
    const base64Data = base64Image.split(',')[1];
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/png' });

    // Create FormData
    const formData = new FormData();
    formData.append('image', blob, `composite-${Date.now()}.png`);
    formData.append('sessionId', sessionId);
    if (templateId) formData.append('templateId', templateId);

    // Upload without JSON.stringify (FormData handles its own encoding)
    const token = sessionStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/composites/upload`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: formData, // Don't stringify FormData!
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Upload failed');
    }

    return response.json();
  },

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

  // Delete composite
  deleteComposite: async (id: string) => {
    return apiCall(`/composites/${id}`, { method: 'DELETE' });
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
    const token = sessionStorage.getItem('token');

    if (!token) {
      console.error('No token found for upload');
      throw new Error('Authentication required. Please login again.');
    }

    const url = `${API_BASE_URL}/users/profile-picture`;

    console.log('Uploading to:', url);
    console.log('Token exists:', !!token);
    console.log('File size:', file.size, 'bytes');

    const form = new FormData();
    form.append('profilePicture', file);

    const res = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      credentials: 'include',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: form,
    });

    console.log('Upload response status:', res.status);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      console.error('Upload error response:', data);

      if (res.status === 401) {
        throw new Error('Unauthorized - Your session may have expired');
      }

      throw new Error(data.message || `Upload failed with status ${res.status}`);
    }

    const data = await res.json().catch(() => ({}));
    console.log('Upload success response:', data);
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

  // Get user settings
  getSettings: async () => {
    return apiCall('/users/settings', { method: 'GET' });
  },

  // Update user settings
  updateSettings: async (type: 'notifications' | 'theme', settings: Record<string, any>) => {
    return apiCall('/users/settings', {
      method: 'PUT',
      body: JSON.stringify({ type, settings }),
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

  // Get user detail with statistics (admin)
  getUserDetail: async (id: string) => {
    return apiCall(`/users/${id}`);
  },

  // Block/Unblock user (admin)
  blockUser: async (id: string, isActive: boolean) => {
    return apiCall(`/users/${id}/block`, {
      method: 'POST',
      body: JSON.stringify({ isActive }),
    });
  },

  // Toggle premium status (admin)
  togglePremium: async (id: string, isPremium: boolean, expiresInDays?: number) => {
    return apiCall(`/users/${id}/premium`, {
      method: 'PATCH',
      body: JSON.stringify({ isPremium, expiresInDays }),
    });
  },

  // Get user activities (admin)
  getUserActivities: async (id: string, options?: { limit?: number; skip?: number }) => {
    const params = new URLSearchParams();
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.skip) params.append('skip', options.skip.toString());

    const query = params.toString() ? `?${params.toString()}` : '';
    return apiCall(`/users/${id}/activities${query}`);
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

// Template API with request deduplication and optimized caching
let templatesPromise: Promise<any> | null = null;
let templatesCache: { data: any; timestamp: number } | null = null;
const CACHE_DURATION = 2 * 60 * 1000; // Reduced to 2 minutes for fresher data

export const templateAPI = {
  // Get all templates with deduplication and caching
  getTemplates: async (params?: { category?: string; isPremium?: boolean; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.isPremium !== undefined) query.append('isPremium', params.isPremium.toString());
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());

    const cacheKey = query.toString();

    // Check memory cache first
    if (templatesCache && Date.now() - templatesCache.timestamp < CACHE_DURATION) {
      console.log('⚡ Using memory cache for templates');
      return Promise.resolve(templatesCache.data);
    }

    // Deduplicate simultaneous requests
    if (templatesPromise) {
      console.log('⏳ Reusing in-flight template request');
      return templatesPromise;
    }

    // Make the actual request with extended timeout (180s for templates)
    // Retry once if timeout occurs
    templatesPromise = apiCallWithRetry(`/templates?${query.toString()}`, { method: 'GET' }, 180000, 1)
      .then(data => {
        templatesCache = { data, timestamp: Date.now() };
        templatesPromise = null;
        return data;
      })
      .catch(err => {
        templatesPromise = null;
        throw err;
      });

    return templatesPromise;
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

  // Get template statistics (admin only)
  getTemplateStats: async (id: string) => {
    return apiCall(`/templates/${id}/stats`, { method: 'GET' });
  },
};

// AI API
import type {
  GenerateFrameRequest,
  GenerateFrameResponse,
  ChatAIRequest,
  ChatAIResponse,
  GenerateImageRequest,
  GenerateImageResponse,
  FrameLayout,
  AIFrameSpecification
} from '@/types/ai-frame.types';

export const aiAPI = {
  /**
   * Chat dengan AI untuk mendapatkan bantuan dalam mendesain frame
   * 
   * @param messages - Array of chat messages
   * @returns Response dari AI dengan optional frameSpec
   * 
   * @example
   * ```typescript
   * const response = await aiAPI.chatAI([
   *   { role: 'user', content: 'Saya ingin frame 3 foto vertikal' }
   * ]);
   * console.log(response.message);
   * if (response.frameSpec) {
   *   // frameSpec tersedia, user sudah confirm design
   * }
   * ```
   */
  chatAI: async (messages: ChatAIRequest['messages']): Promise<ChatAIResponse> => {
    return apiCall<ChatAIResponse>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ messages }),
    });
  },

  /**
   * Generate image dari text prompt menggunakan AI
   * 
   * @param prompt - Text prompt untuk generate gambar
   * @param negativePrompt - Negative prompt (optional)
   * @returns Response dengan base64 encoded image
   * 
   * @example
   * ```typescript
   * const response = await aiAPI.generateImage(
   *   'Beautiful sunset over mountains',
   *   'ugly, blurry'
   * );
   * const imgSrc = `data:${response.contentType};base64,${response.image}`;
   * ```
   */
  generateImage: async (
    prompt: string,
    negativePrompt?: string
  ): Promise<GenerateImageResponse> => {
    const request: GenerateImageRequest = {
      prompt,
      negative_prompt: negativePrompt,
      num_inference_steps: 10,
    };

    return apiCall<GenerateImageResponse>('/ai/generate-image', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  /**
   * Generate frame template sebagai SVG image
   * 
   * @param config - Frame configuration
   * @returns Response dengan base64 encoded SVG image
   * 
   * @example
   * ```typescript
   * const response = await aiAPI.generateFrame({
   *   frameCount: 3,
   *   layout: 'vertical',
   *   backgroundColor: '#FFD700',
   *   borderColor: '#FFA500',
   *   gradientFrom: '#FFD700',
   *   gradientTo: '#FFC700'
   * });
   * 
   * if (response.success) {
   *   const imgSrc = `data:${response.contentType};base64,${response.image}`;
   *   // Use imgSrc in <img> tag
   * }
   * ```
   */
  generateFrame: async (config: GenerateFrameRequest): Promise<GenerateFrameResponse> => {
    return apiCall<GenerateFrameResponse>('/ai/generate-frame', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  },

  /**
   * Generate frame dengan parameter yang lebih simple (helper function)
   * 
   * @param frameCount - Jumlah foto dalam frame (2-6)
   * @param layout - Tipe layout frame
   * @param backgroundColor - Warna background
   * @param borderColor - Warna border
   * @param gradientFrom - Warna awal gradient (optional)
   * @param gradientTo - Warna akhir gradient (optional)
   * @returns Response dengan base64 encoded SVG image
   */
  generateFrameSimple: async (
    frameCount: number,
    layout: FrameLayout = 'vertical',
    backgroundColor: string = '#FDE2E4',
    borderColor: string = '#F7A9A8',
    gradientFrom?: string,
    gradientTo?: string
  ): Promise<GenerateFrameResponse> => {
    const request: GenerateFrameRequest = {
      frameCount,
      layout,
      backgroundColor,
      borderColor,
      borderThickness: 2,
      borderRadius: 8,
      gradientFrom: gradientFrom || backgroundColor,
      gradientTo: gradientTo || backgroundColor,
    };

    return aiAPI.generateFrame(request);
  },

  /**
   * Menyimpan AI-generated frame ke database dengan visibility setting
   * 
   * @param data - Data frame yang akan disimpan
   * @returns Response dengan informasi template yang tersimpan
   * 
   * @example
   * ```typescript
   * const response = await aiAPI.saveFrame({
   *   name: 'My Custom Frame',
   *   frameSpec: aiFrameSpec,
   *   frameDataUrl: 'data:image/svg+xml;base64,...',
   *   visibility: 'public', // atau 'private'
   *   description: 'Beautiful AI-generated frame',
   *   tags: ['AI', 'Modern', 'Gradient']
   * });
   * ```
   */
  saveFrame: async (data: {
    name: string;
    frameSpec: AIFrameSpecification;
    frameDataUrl: string;
    visibility: 'public' | 'private';
    description?: string;
    tags?: string[];
  }): Promise<any> => {
    return apiCall<any>('/ai/save-frame', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Feedback API
export const feedbackAPI = {
  submit: async (data: {
    name: string;
    email: string;
    message: string;
  }): Promise<any> => {
    return apiCall<any>('/feedback', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getAll: async (): Promise<any> => {
    return apiCall<any>('/feedback', {
      method: 'GET',
    });
  },

  updateStatus: async (id: string, status: 'unread' | 'read' | 'replied'): Promise<any> => {
    return apiCall<any>(`/feedback/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  delete: async (id: string): Promise<any> => {
    return apiCall<any>(`/feedback/${id}`, {
      method: 'DELETE',
    });
  },
};

// User Generated Frames API
export const userFrameAPI = {
  getAll: async (): Promise<any> => {
    return apiCall<any>('/user-frames', {
      method: 'GET',
    });
  },

  create: async (data: {
    name: string;
    description?: string;
    frameUrl: string;
    thumbnail: string;
    frameCount: number;
    layoutPositions: Array<{
      x: number;
      y: number;
      width: number;
      height: number;
      borderRadius?: number;
      rotation?: number;
    }>;
    frameSpec?: any;
  }): Promise<any> => {
    return apiCall<any>('/user-frames', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getById: async (id: string): Promise<any> => {
    return apiCall<any>(`/user-frames/${id}`, {
      method: 'GET',
    });
  },

  update: async (id: string, data: {
    name?: string;
    description?: string;
    isFavorite?: boolean;
    isActive?: boolean;
  }): Promise<any> => {
    return apiCall<any>(`/user-frames/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string): Promise<any> => {
    return apiCall<any>(`/user-frames/${id}`, {
      method: 'DELETE',
    });
  },
};