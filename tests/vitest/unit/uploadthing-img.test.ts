import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { uploadthingImgRepository } from '@log-ui/core/infrastructure/services/uploadthing-img';

// Mock the UploadThingAdapter
vi.mock('@log-ui/core/infrastructure/connectors/uploadthing-st');

describe('UploadThingImgRepository', () => {
  let mockUtapi: Record<string, Mock>;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock UTApi instance
    mockUtapi = {
      uploadFiles: vi.fn(),
      deleteFiles: vi.fn(),
    };

    // Mock the utapi getter
    Object.defineProperty(uploadthingImgRepository, 'utapi', {
      get: () => mockUtapi,
      configurable: true
    });
  });

  describe('uploadImage', () => {
    it('should upload a valid file and return URL', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockResponse = {
        data: { url: 'https://example.com/image.jpg' },
        error: null
      };

      mockUtapi.uploadFiles.mockResolvedValue([mockResponse]);

      const result = await uploadthingImgRepository.uploadImage(mockFile);

      expect(mockUtapi.uploadFiles).toHaveBeenCalledWith([mockFile]);
      expect(result).toBe('https://example.com/image.jpg');
    });

    it('should throw error for invalid file input', async () => {
      // Test with a string instead of a File object
      const invalidFile = 'not-a-file';
      
      await expect(uploadthingImgRepository.uploadImage(invalidFile as unknown as File)).rejects.toThrow();
    });

    it('should throw error when uploadFiles returns no data', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockResponse = {
        data: null,
        error: 'Upload failed'
      };

      mockUtapi.uploadFiles.mockResolvedValue([mockResponse]);

      await expect(uploadthingImgRepository.uploadImage(mockFile)).rejects.toThrow();
    });

    it('should handle uploadFiles throwing error', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      mockUtapi.uploadFiles.mockRejectedValue(new Error('Network error'));

      await expect(uploadthingImgRepository.uploadImage(mockFile)).rejects.toThrow('Network error');
    });
  });

  describe('deleteImage', () => {
    it('should delete image successfully', async () => {
      const imageUrl = 'https://example.com/image.jpg';
      mockUtapi.deleteFiles.mockResolvedValue({ success: true });

      const result = await uploadthingImgRepository.deleteImage(imageUrl);

      expect(mockUtapi.deleteFiles).toHaveBeenCalledWith(imageUrl);
      expect(result).toBe(true);
    });

    it('should handle failed deletion', async () => {
      const imageUrl = 'https://example.com/image.jpg';
      mockUtapi.deleteFiles.mockResolvedValue({ success: false });

      const result = await uploadthingImgRepository.deleteImage(imageUrl);

      expect(result).toBe(false);
    });

    it('should handle deleteFiles throwing error', async () => {
      const imageUrl = 'https://example.com/image.jpg';
      mockUtapi.deleteFiles.mockRejectedValue(new Error('Delete error'));

      await expect(uploadthingImgRepository.deleteImage(imageUrl)).rejects.toThrow('Delete error');
    });
  });

  describe('useUtapi', () => {
    it('should return the UTApi instance', () => {
      const utapi = uploadthingImgRepository.useUtapi();
      expect(utapi).toBe(mockUtapi);
    });
  });
});
