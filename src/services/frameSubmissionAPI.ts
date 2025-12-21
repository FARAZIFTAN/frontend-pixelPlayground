import { API_BASE_URL } from './api';

interface FrameSubmissionData {
  name: string;
  description: string;
  frameUrl: string;
  thumbnail: string;
  frameCount: number;
  layout: string;
  frameSpec: Record<string, unknown>;
  layoutPositions: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    borderRadius: number;
    rotation: number;
  }>;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  count?: number;
}

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
      let errorData;
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
    }
    
    const data = await response.json();
    return data;
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error(`API Error [${endpoint}]:`, err);

    if (err.message === 'Failed to fetch') {
      throw new Error('Cannot connect to server. Please make sure the backend is running.');
    }

    throw err;
  }
}

export const frameSubmissionAPI = {
  /**
   * Submit a frame for admin approval (user PRO only)
   */
  async submit(frameData: FrameSubmissionData) {
    try {
      const response = await apiCall<ApiResponse<unknown>>('/user-submissions/frames', {
        method: 'POST',
        body: JSON.stringify(frameData),
      });
      return response;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      return {
        success: false,
        error: err.message || 'Failed to submit frame',
      };
    }
  },

  /**
   * Get user's frame submissions
   */
  async getMySubmissions(status?: string) {
    try {
      const endpoint = status
        ? `/user-submissions/frames?status=${status}`
        : '/user-submissions/frames';

      const response = await apiCall<ApiResponse<unknown>>(endpoint);
      return response;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      return {
        success: false,
        error: err.message || 'Failed to fetch submissions',
        data: [],
      };
    }
  },

  /**
   * Get single submission
   */
  async getById(id: string) {
    try {
      const response = await apiCall<ApiResponse<unknown>>(
        `/user-submissions/frames/${id}`
      );
      return response;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      return {
        success: false,
        error: err.message || 'Failed to fetch submission',
      };
    }
  },

  /**
   * Delete a pending submission
   */
  async delete(id: string) {
    try {
      const response = await apiCall<ApiResponse<unknown>>(
        `/user-submissions/frames/${id}`,
        { method: 'DELETE' }
      );
      return response;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      return {
        success: false,
        error: err.message || 'Failed to delete submission',
      };
    }
  },

  /**
   * Get pending submissions (admin only)
   */
  async getPendingSubmissions(status = 'pending') {
    try {
      const response = await apiCall<ApiResponse<unknown>>(
        `/admin/frame-submissions?status=${status}`
      );
      return response;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      return {
        success: false,
        error: err.message || 'Failed to fetch submissions',
        data: [],
      };
    }
  },

  /**
   * Approve a submitted frame (admin only)
   */
  async approve(id: string, isPremium: boolean) {
    try {
      const response = await apiCall<ApiResponse<unknown>>(
        `/admin/frame-submissions/${id}/approve`,
        {
          method: 'PATCH',
          body: JSON.stringify({ isPremium }),
        }
      );
      return response;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      return {
        success: false,
        error: err.message || 'Failed to approve submission',
      };
    }
  },

  /**
   * Reject a submitted frame (admin only)
   */
  async reject(id: string, rejectionReason: string) {
    try {
      const response = await apiCall<ApiResponse<unknown>>(
        `/admin/frame-submissions/${id}/reject`,
        {
          method: 'PATCH',
          body: JSON.stringify({ rejectionReason }),
        }
      );
      return response;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      return {
        success: false,
        error: err.message || 'Failed to reject submission',
      };
    }
  },
};
