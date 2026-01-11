import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import * as ImgController from '@log-ui/core/presentation/controllers/img';
import * as ImgUC from '@log-ui/core/application/usecases/services/img';
import { createDomainError, ErrorCodes } from '@skrteeeeee/profile-domain';

// Mock dependencies
vi.mock('@log-ui/core/application/usecases/services/img');
vi.mock('@skrteeeeee/profile-domain');

describe('Image Controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('uploadImg', () => {
    it('should upload image successfully', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const formData = new FormData();
      formData.set('img', mockFile);
      
      const uploadResult = { url: 'https://example.com/image.jpg' };
      (ImgUC.uploadImageUC as Mock).mockResolvedValue(uploadResult);

      const result = await ImgController.uploadImg(formData);

      expect(ImgUC.uploadImageUC).toHaveBeenCalledWith(mockFile);
      expect(result).toBe(uploadResult);
    });

    it('should throw error when no image provided', async () => {
      const formData = new FormData();
      // No image added

      await expect(ImgController.uploadImg(formData)).rejects.toThrow();
    });

    it('should propagate errors from uploadImageUC', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const formData = new FormData();
      formData.set('img', mockFile);
      
      const domainError = createDomainError(
        ErrorCodes.SHARED_ACTION,
        ImgController.uploadImg,
        "uploadImg",
        "tryAgainOrContact",
        { entity: "image", optionalMessage: "Upload failed" }
      );
      (ImgUC.uploadImageUC as Mock).mockRejectedValue(domainError);

      await expect(ImgController.uploadImg(formData)).rejects.toThrow(domainError);
    });
  });

  describe('updateImg', () => {
    it('should update image successfully (delete old + upload new)', async () => {
      const mockFile = new File(['test'], 'new-image.jpg', { type: 'image/jpeg' });
      const formData = new FormData();
      formData.set('img', mockFile);
      
      const oldImageUrl = 'https://example.com/old-image.jpg';
      const uploadResult = { url: 'https://example.com/new-image.jpg' };

      (ImgUC.deleteImageUC as Mock).mockResolvedValue(true);
      (ImgUC.uploadImageUC as Mock).mockResolvedValue(uploadResult);

      const result = await ImgController.updateImg(formData, oldImageUrl);

      expect(ImgUC.deleteImageUC).toHaveBeenCalledWith(oldImageUrl);
      expect(ImgUC.uploadImageUC).toHaveBeenCalledWith(mockFile);
      expect(result).toBe(uploadResult);
    });

    it('should throw error when no image provided in update', async () => {
      const formData = new FormData();
      // No image added

      await expect(ImgController.updateImg(formData, 'test-url')).rejects.toThrow();
    });

    it('should throw error when deleteImageUC fails', async () => {
      const mockFile = new File(['test'], 'new-image.jpg', { type: 'image/jpeg' });
      const formData = new FormData();
      formData.set('img', mockFile);
      
      (ImgUC.deleteImageUC as Mock).mockResolvedValue(false);

      await expect(ImgController.updateImg(formData, 'test-url')).rejects.toThrow();
    });

    it('should propagate errors from uploadImageUC in update', async () => {
      const mockFile = new File(['test'], 'new-image.jpg', { type: 'image/jpeg' });
      const formData = new FormData();
      formData.set('img', mockFile);
      
      const oldImageUrl = 'https://example.com/old-image.jpg';
      const domainError = createDomainError(
        ErrorCodes.SHARED_ACTION,
        ImgController.uploadImg,
        "uploadImg",
        "tryAgainOrContact",
        { entity: "image", optionalMessage: "Upload failed" }
      );

      (ImgUC.deleteImageUC as Mock).mockResolvedValue(true);
      (ImgUC.uploadImageUC as Mock).mockRejectedValue(domainError);

      await expect(ImgController.updateImg(formData, oldImageUrl)).rejects.toThrow(domainError);
    });

    it('should propagate errors from deleteImageUC in update', async () => {
      const mockFile = new File(['test'], 'new-image.jpg', { type: 'image/jpeg' });
      const formData = new FormData();
      formData.set('img', mockFile);
      
      const oldImageUrl = 'https://example.com/old-image.jpg';
      const domainError = createDomainError(
        ErrorCodes.SHARED_ACTION,
        ImgController.uploadImg,
        "uploadImg",
        "tryAgainOrContact",
        { entity: "image", optionalMessage: "Delete failed" }
      );

      (ImgUC.deleteImageUC as Mock).mockRejectedValue(domainError);

      await expect(ImgController.updateImg(formData, oldImageUrl)).rejects.toThrow(domainError);
    });
  });
});
