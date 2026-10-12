/**
 * Photo Attachment & Validation Utilities
 * Enforces file size (max 10MB), supported mime types (JPEG, PNG, WebP),
 * and object URL lifecycle management to prevent memory leaks.
 */

export const MAX_PHOTO_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
];

export interface PhotoValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates file type and size according to botanical journal requirements.
 */
export function validatePhotoFile(file: File): PhotoValidationResult {
  if (!file) {
    return { valid: false, error: 'No file provided.' };
  }

  // Type check
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Unsupported format (${file.type || 'unknown'}). Please attach JPEG, PNG, or WebP images.`,
    };
  }

  // Size check
  if (file.size > MAX_PHOTO_SIZE_BYTES) {
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File size (${sizeInMb} MB) exceeds maximum allowed limit of 10 MB.`,
    };
  }

  return { valid: true };
}

/**
 * Safely creates an object URL for a file.
 */
export function createPhotoObjectUrl(file: File): string {
  if (typeof URL !== 'undefined' && URL.createObjectURL) {
    return URL.createObjectURL(file);
  }
  return '';
}

/**
 * Revokes an object URL if it is a local blob URL.
 */
export function revokePhotoObjectUrl(url: string | undefined): void {
  if (!url) return;
  if (typeof URL !== 'undefined' && URL.revokeObjectURL && url.startsWith('blob:')) {
    try {
      URL.revokeObjectURL(url);
    } catch {
      // Ignore cleanup error if already revoked
    }
  }
}

/**
 * Revokes an array of preview URLs.
 */
export function revokePhotoObjectUrls(urls: string[]): void {
  urls.forEach((u) => revokePhotoObjectUrl(u));
}
