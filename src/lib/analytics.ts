// Analytics tracking utility

interface TrackEventParams {
  eventType: string;
  eventCategory: string;
  userId?: string;
  sessionId?: string;
  templateId?: string;
  metadata?: Record<string, string | number | boolean>;
}

export const trackEvent = async (params: TrackEventParams): Promise<void> => {
  try {
    // Don't block the main thread
    setTimeout(async () => {
      try {
        await fetch('http://localhost:3001/api/analytics/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(params),
        });
      } catch (error) {
        // Silently fail - analytics shouldn't break the app
        console.debug('Analytics tracking failed:', error);
      }
    }, 0);
  } catch (error) {
    // Silently fail
    console.debug('Analytics tracking error:', error);
  }
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

export default analytics;
