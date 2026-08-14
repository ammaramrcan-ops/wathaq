import { describe, it, expect } from 'vitest';
import { extractYouTubeThumbnail, cn } from '../utils';

describe('utils', () => {
  describe('extractYouTubeThumbnail', () => {
    it('should extract correct thumbnail for standard YouTube URL', () => {
      const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      const thumb = extractYouTubeThumbnail(url);
      expect(thumb).toBe('https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg');
    });

    it('should extract correct thumbnail for short youtu.be URL', () => {
      const url = 'https://youtu.be/dQw4w9WgXcQ?t=10';
      const thumb = extractYouTubeThumbnail(url);
      expect(thumb).toBe('https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg');
    });

    it('should extract correct thumbnail for embed YouTube URL', () => {
      const url = 'https://www.youtube.com/embed/dQw4w9WgXcQ';
      const thumb = extractYouTubeThumbnail(url);
      expect(thumb).toBe('https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg');
    });

    it('should return null for invalid YouTube URL', () => {
      const url = 'https://google.com/not-youtube';
      const thumb = extractYouTubeThumbnail(url);
      expect(thumb).toBeNull();
    });
  });

  describe('cn (Tailwind Class Merging)', () => {
    it('should merge class names conditionally', () => {
      const result = cn('px-2 py-1', true && 'bg-primary', false && 'text-error');
      expect(result).toBe('px-2 py-1 bg-primary');
    });

    it('should override conflicting tailwind classes', () => {
      const result = cn('p-4', 'p-2');
      expect(result).toBe('p-2');
    });
  });
});
