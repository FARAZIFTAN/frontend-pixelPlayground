import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Cache management utilities with robust error handling
export interface CacheValidationResult<T> {
  isValid: boolean;
  data?: T;
  error?: string;
}

export interface CacheOptions {
  maxAge?: number; // in milliseconds
  validateStructure?: (data: any) => boolean;
}

/**
 * Safely parse JSON from cache with comprehensive error handling
 */
export function safeJsonParse<T>(jsonString: string, options: CacheOptions = {}): CacheValidationResult<T> {
  try {
    const parsed = JSON.parse(jsonString);

    // Validate structure if validator provided
    if (options.validateStructure && !options.validateStructure(parsed)) {
      return {
        isValid: false,
        error: 'Cache data structure validation failed'
      };
    }

    // Validate max age if provided
    if (options.maxAge && parsed.timestamp) {
      const age = Date.now() - parsed.timestamp;
      if (age > options.maxAge) {
        return {
          isValid: false,
          error: `Cache expired (age: ${age}ms, max: ${options.maxAge}ms)`
        };
      }
    }

    return {
      isValid: true,
      data: parsed
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown parsing error';
    return {
      isValid: false,
      error: `JSON parse error: ${errorMessage}`
    };
  }
}

/**
 * Safely set item to sessionStorage with quota error handling
 */
export function safeSessionStorageSet(key: string, value: any): boolean {
  try {
    const serialized = JSON.stringify(value);
    sessionStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'QuotaExceededError') {
        console.warn(`⚠️ SessionStorage quota exceeded for key: ${key}, clearing all cache`);
        // Clear all cache when quota exceeded
        try {
          sessionStorage.clear();
          console.log('🧹 Cleared all sessionStorage cache');
          // Retry after clearing
          const serialized = JSON.stringify(value);
          sessionStorage.setItem(key, serialized);
          return true;
        } catch (retryError) {
          console.error('❌ Failed to set cache even after clearing:', retryError);
          return false;
        }
      } else {
        console.error(`❌ SessionStorage error for key ${key}:`, error.message);
      }
    } else {
      console.error(`❌ Unknown sessionStorage error for key ${key}:`, error);
    }
    return false;
  }
}

/**
 * Safely get item from sessionStorage with validation
 */
export function safeSessionStorageGet<T>(key: string, options: CacheOptions = {}): CacheValidationResult<T> {
  try {
    const item = sessionStorage.getItem(key);
    if (!item) {
      return {
        isValid: false,
        error: 'Cache key not found'
      };
    }

    return safeJsonParse<T>(item, options);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown storage error';
    return {
      isValid: false,
      error: `Storage access error: ${errorMessage}`
    };
  }
}

/**
 * Validate template array structure
 */
export function validateTemplateArray(data: any): boolean {
  if (!Array.isArray(data)) return false;

  return data.every(template =>
    template &&
    typeof template === 'object' &&
    typeof template._id === 'string' &&
    typeof template.name === 'string' &&
    typeof template.category === 'string' &&
    typeof template.thumbnail === 'string' &&
    typeof template.frameUrl === 'string' &&
    typeof template.isPremium === 'boolean' &&
    typeof template.frameCount === 'number'
  );
}

/**
 * Validate single template structure
 */
export function validateTemplate(data: any): boolean {
  return data &&
    typeof data === 'object' &&
    typeof data._id === 'string' &&
    typeof data.name === 'string' &&
    typeof data.category === 'string' &&
    typeof data.thumbnail === 'string' &&
    typeof data.frameUrl === 'string' &&
    typeof data.isPremium === 'boolean' &&
    typeof data.frameCount === 'number';
}

/**
 * Utility for safe event listener management to prevent memory leaks
 * Ensures proper cleanup of event listeners in React useEffect hooks
 *
 * Usage in React components:
 * ```tsx
 * useEffect(() => {
 *   const cleanup = addEventListenerWithCleanup(
 *     window,
 *     'scroll',
 *     handleScroll,
 *     { passive: true }
 *   );
 *
 *   return cleanup; // Automatically removes listener on unmount
 * }, []);
 * ```
 *
 * Or use directly in useEffect return:
 * ```tsx
 * useEffect(() => {
 *   return addEventListenerWithCleanup(window, 'scroll', handleScroll);
 * }, []);
 * ```
 *
 * @param target - The event target (window, document, element, etc.)
 * @param eventType - The event type (e.g., 'scroll', 'click', 'keydown')
 * @param handler - The event handler function
 * @param options - Event listener options (optional)
 * @returns Cleanup function to remove the event listener
 */
export function addEventListenerWithCleanup<K extends keyof WindowEventMap>(
  target: Window,
  eventType: K,
  handler: (event: WindowEventMap[K]) => void,
  options?: boolean | AddEventListenerOptions
): () => void;

export function addEventListenerWithCleanup<K extends keyof DocumentEventMap>(
  target: Document,
  eventType: K,
  handler: (event: DocumentEventMap[K]) => void,
  options?: boolean | AddEventListenerOptions
): () => void;

export function addEventListenerWithCleanup(
  target: EventTarget,
  eventType: string,
  handler: EventListener,
  options?: boolean | AddEventListenerOptions
): () => void;

export function addEventListenerWithCleanup(
  target: EventTarget,
  eventType: string,
  handler: EventListener,
  options?: boolean | AddEventListenerOptions
): () => void {
  target.addEventListener(eventType, handler, options);

  // Return cleanup function for useEffect
  return () => {
    target.removeEventListener(eventType, handler, options);
  };
}
