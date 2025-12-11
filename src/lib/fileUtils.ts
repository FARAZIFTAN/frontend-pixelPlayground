/**
 * Utility functions for file handling
 */

/**
 * Get file extension from URL or filename
 * @param url - File URL or filename
 * @returns File extension with dot (e.g., '.jpg', '.png') or '.jpg' as default
 */
export function getFileExtension(url: string): string {
  try {
    // Remove query parameters and hash
    const cleanUrl = url.split('?')[0].split('#')[0];
    
    // Get the last part after the last dot
    const parts = cleanUrl.split('.');
    if (parts.length > 1) {
      const ext = parts[parts.length - 1].toLowerCase();
      
      // Validate common image extensions
      const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
      if (validExtensions.includes(ext)) {
        return `.${ext}`;
      }
    }
    
    // Default to .jpg if no valid extension found
    return '.jpg';
  } catch (error) {
    console.error('Error getting file extension:', error);
    return '.jpg';
  }
}

/**
 * Download file from URL with proper extension
 * @param url - File URL to download
 * @param filename - Desired filename without extension
 * @returns Promise that resolves when download starts
 */
export async function downloadFile(url: string, filename: string): Promise<void> {
  try {
    // Get proper extension from URL
    const extension = getFileExtension(url);
    const fullFilename = `${filename}${extension}`;
    
    // Fetch the file as blob to handle CORS and external URLs
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    
    // Create download link
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = fullFilename;
    a.style.display = 'none';
    document.body.appendChild(a);
    
    // Trigger download
    a.click();
    
    // Cleanup
    setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);
    }, 100);
    
  } catch (error) {
    console.error('Download error:', error);
    throw error;
  }
}

/**
 * Get MIME type from file extension
 * @param extension - File extension (e.g., '.jpg', 'png')
 * @returns MIME type string
 */
export function getMimeType(extension: string): string {
  const ext = extension.toLowerCase().replace('.', '');
  
  const mimeTypes: Record<string, string> = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'bmp': 'image/bmp',
    'svg': 'image/svg+xml',
  };
  
  return mimeTypes[ext] || 'image/jpeg';
}
