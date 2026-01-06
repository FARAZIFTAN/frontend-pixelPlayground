// Analytics tracking utility

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

interface TrackEventParams {
  eventType: string;
  eventCategory: string;
  userId?: string;
  sessionId?: string;
  templateId?: string;
  metadata?: Record<string, string | number | boolean>;
}

// Flag to track if analytics backend is available
let analyticsEnabled: boolean | null = null;

// Check if backend is running by trying to connect once
const checkBackendAvailability = async (): Promise<boolean> => {
  // Return cached result if already checked
  if (analyticsEnabled !== null) return analyticsEnabled;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 500); // 500ms timeout
    
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'HEAD',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    analyticsEnabled = response.ok;
  } catch {
    // Backend not available - disable analytics
    analyticsEnabled = false;
  }
  
  return analyticsEnabled;
};

export const trackEvent = async (params: TrackEventParams): Promise<void> => {
  // Skip if explicitly disabled
  if (analyticsEnabled === false) return;
  
  // Check backend availability on first call
  if (analyticsEnabled === null) {
    const available = await checkBackendAvailability();
    if (!available) return;
  }
  
  // Send analytics event without blocking
  setTimeout(() => {
    fetch(`${API_BASE_URL}/analytics/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    }).catch(() => {
      // Disable on failure to prevent future errors
      analyticsEnabled = false;
    });
  }, 0);
};

// Common event types
export const EventTypes = {
  // Page views
  PAGE_VIEW: 'page_view',
  
  // User actions
  USER_REGISTER: 'user_register',
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  
  // Template actions
  TEMPLATE_VIEW: 'template_view',
  TEMPLATE_SELECT: 'template_select',
  TEMPLATE_SEARCH: 'template_search',
  
  // Photo booth actions
  CAMERA_OPEN: 'camera_open',
  PHOTO_CAPTURE: 'photo_capture',
  PHOTO_RETAKE: 'photo_retake',
  COMPOSITE_GENERATE: 'composite_generate',
  COMPOSITE_DOWNLOAD: 'composite_download',
  COMPOSITE_SHARE: 'composite_share',
  
  // Gallery actions
  GALLERY_VIEW: 'gallery_view',
  GALLERY_FILTER: 'gallery_filter',
  PHOTO_DELETE: 'photo_delete',
  PHOTO_FAVORITE: 'photo_favorite',
  
  // Admin actions
  ADMIN_LOGIN: 'admin_login',
  TEMPLATE_CREATE: 'template_create',
  TEMPLATE_UPDATE: 'template_update',
  TEMPLATE_DELETE: 'template_delete',
} as const;

// Common event categories
export const EventCategories = {
  PAGE: 'page',
  AUTH: 'authentication',
  TEMPLATE: 'template',
  PHOTO: 'photo',
  GALLERY: 'gallery',
  ADMIN: 'admin',
  ERROR: 'error',
} as const;

// Helper functions for common tracking scenarios
export const analytics = {
  // Track page view
  pageView: (pageName: string, userId?: string) => {
    trackEvent({
      eventType: EventTypes.PAGE_VIEW,
      eventCategory: EventCategories.PAGE,
      userId,
      metadata: { pageName },
    });
  },

  // Track user authentication
  userLogin: (userId: string, method: 'email' | 'google' = 'email') => {
    trackEvent({
      eventType: EventTypes.USER_LOGIN,
      eventCategory: EventCategories.AUTH,
      userId,
      metadata: { method },
    });
  },

  userRegister: (userId: string, method: 'email' | 'google' = 'email') => {
    trackEvent({
      eventType: EventTypes.USER_REGISTER,
      eventCategory: EventCategories.AUTH,
      userId,
      metadata: { method },
    });
  },

  userLogout: (userId: string) => {
    trackEvent({
      eventType: EventTypes.USER_LOGOUT,
      eventCategory: EventCategories.AUTH,
      userId,
    });
  },

  // Track template interactions
  templateView: (templateId: string, templateName: string, userId?: string) => {
    trackEvent({
      eventType: EventTypes.TEMPLATE_VIEW,
      eventCategory: EventCategories.TEMPLATE,
      userId,
      templateId,
      metadata: { templateName },
    });
  },

  templateSelect: (templateId: string, templateName: string, userId?: string, sessionId?: string) => {
    trackEvent({
      eventType: EventTypes.TEMPLATE_SELECT,
      eventCategory: EventCategories.TEMPLATE,
      userId,
      sessionId,
      templateId,
      metadata: { templateName },
    });
  },

  // Track photo booth actions
  photoCapture: (sessionId: string, photoIndex: number, userId?: string, templateId?: string) => {
    trackEvent({
      eventType: EventTypes.PHOTO_CAPTURE,
      eventCategory: EventCategories.PHOTO,
      userId,
      sessionId,
      templateId,
      metadata: { photoIndex },
    });
  },

  compositeGenerate: (sessionId: string, userId?: string, templateId?: string) => {
    trackEvent({
      eventType: EventTypes.COMPOSITE_GENERATE,
      eventCategory: EventCategories.PHOTO,
      userId,
      sessionId,
      templateId,
    });
  },

  compositeDownload: (compositeId: string, userId?: string, templateId?: string) => {
    trackEvent({
      eventType: EventTypes.COMPOSITE_DOWNLOAD,
      eventCategory: EventCategories.PHOTO,
      userId,
      templateId,
      metadata: { compositeId },
    });
  },

  compositeDelete: (compositeId: string, userId?: string) => {
    trackEvent({
      eventType: EventTypes.PHOTO_DELETE,
      eventCategory: EventCategories.GALLERY,
      userId,
      metadata: { compositeId },
    });
  },

  // Track errors
  error: (errorType: string, errorMessage: string, userId?: string) => {
    trackEvent({
      eventType: 'error',
      eventCategory: EventCategories.ERROR,
      userId,
      metadata: { errorType, errorMessage },
    });
  },
};

// Safe wrapper for analytics functions to prevent app crashes
const safeAnalyticsCall = (fn: () => void) => {
  try {
    fn();
  } catch (error) {
    // Silently fail - analytics errors should never crash the app
    console.debug('Analytics call failed:', error);
  }
};

// Safe analytics wrapper that catches all errors
export const safeAnalytics = {
  // Track page view
  pageView: (pageName: string, userId?: string) => {
    safeAnalyticsCall(() => analytics.pageView(pageName, userId));
  },

  // Track user authentication
  userLogin: (userId: string, method: 'email' | 'google' = 'email') => {
    safeAnalyticsCall(() => analytics.userLogin(userId, method));
  },

  userRegister: (userId: string, method: 'email' | 'google' = 'email') => {
    safeAnalyticsCall(() => analytics.userRegister(userId, method));
  },

  userLogout: (userId: string) => {
    safeAnalyticsCall(() => analytics.userLogout(userId));
  },

  // Track template interactions
  templateView: (templateId: string, templateName: string, userId?: string) => {
    safeAnalyticsCall(() => analytics.templateView(templateId, templateName, userId));
  },

  templateSelect: (templateId: string, templateName: string, userId?: string, sessionId?: string) => {
    safeAnalyticsCall(() => analytics.templateSelect(templateId, templateName, userId, sessionId));
  },

  // Track photo booth actions
  photoCapture: (sessionId: string, photoIndex: number, userId?: string, templateId?: string) => {
    safeAnalyticsCall(() => analytics.photoCapture(sessionId, photoIndex, userId, templateId));
  },

  compositeGenerate: (sessionId: string, userId?: string, templateId?: string) => {
    safeAnalyticsCall(() => analytics.compositeGenerate(sessionId, userId, templateId));
  },

  compositeDownload: (compositeId: string, userId?: string, templateId?: string) => {
    safeAnalyticsCall(() => analytics.compositeDownload(compositeId, userId, templateId));
  },

  compositeDelete: (compositeId: string, userId?: string) => {
    safeAnalyticsCall(() => analytics.compositeDelete(compositeId, userId));
  },

  // Track errors
  error: (errorType: string, errorMessage: string, userId?: string) => {
    safeAnalyticsCall(() => analytics.error(errorType, errorMessage, userId));
  },
};

export default analytics;
