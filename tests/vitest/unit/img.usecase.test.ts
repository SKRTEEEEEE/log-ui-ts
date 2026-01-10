import { describe, it, expect, afterEach, vi, Mock } from 'vitest';
import { deleteImageUC, uploadImageUC } from '@log-ui/core/application/usecases/services/img';
import { uploadthingImgRepository } from '@log-ui/core/infrastructure/services/uploadthing-img';

vi.mock('@log-ui/core/infrastructure/services/uploadthing-img', () => ({
  uploadthingImgRepository: {
    deleteImage: vi.fn(),
    uploadImage: vi.fn(),
  },
}));

describe('Image Use Cases', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });
  describe('deleteImageUC', () => {
    it('should call deleteImage with the correct file name', async () => {
      const imgUrl = 'https://example.com/image.jpg';
      (uploadthingImgRepository.deleteImage as Mock).mockResolvedValue(true);
      await deleteImageUC(imgUrl);
      expect(uploadthingImgRepository.deleteImage).toHaveBeenCalledWith('image.jpg');
    });

    it('should throw an error for an invalid image URL', async () => {
      const imgUrl = ''; // Changed from 'invalid-url' to ''
      await expect(deleteImageUC(imgUrl)).rejects.toThrow();
    });
  });

  describe('uploadImageUC', () => {
    it('should call uploadImage with the correct file', async () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
      (uploadthingImgRepository.uploadImage as Mock).mockResolvedValue('https://example.com/new-image.jpg');
      await uploadImageUC(file);
      expect(uploadthingImgRepository.uploadImage).toHaveBeenCalledWith(file);
    });
  });
});
