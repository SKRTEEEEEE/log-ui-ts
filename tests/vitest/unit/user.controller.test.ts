import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import * as UserController from '@log-ui/core/presentation/controllers/user';
import * as UserUC from '@log-ui/core/application/usecases/entities/user';
import { RoleType } from '@skrteeeeee/profile-domain';
import { LoginPayload, VerifyLoginPayloadParams } from 'thirdweb/auth';

// Mock dependencies
vi.mock('@log-ui/core/application/usecases/entities/user');
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn()
}));

describe('User Controller', () => {
  const mockLoginPayload: LoginPayload = {
    domain: 'admin-next.local',
    chain_id: '1',
    address: '0xabcdef1234567890',
    statement: 'Sign in to admin-next',
    uri: 'http://localhost:3000',
    version: '1',
    nonce: 'test-nonce-123',
    issued_at: new Date().toISOString(),
    expiration_time: new Date(Date.now() + 3600000).toISOString(),
    invalid_before: new Date().toISOString()
  };

  const mockPayload: VerifyLoginPayloadParams = {
    signature: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef' as `0x${string}`,
    payload: mockLoginPayload
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const updateData = {
        email: 'test@example.com',
        nick: 'TestUser',
        img: 'https://example.com/image.jpg'
      };

      const userRepositoryResponse = { success: true, data: { id: '123', nick: 'TestUser' } };
      (UserUC.apiUpdateUserUC as Mock).mockResolvedValue(userRepositoryResponse);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await UserController.updateUser('123', mockPayload as any, updateData);

      expect(UserUC.apiUpdateUserUC).toHaveBeenCalledWith({
        payload: mockPayload,
        formData: {
          id: '123',
          nick: 'TestUser',
          img: 'https://example.com/image.jpg',
          email: 'test@example.com',
        },
      });
      expect(result).toBe(userRepositoryResponse);
    });

    it('should handle null nick and email correctly', async () => {
      const updateData = {
        email: null,
        img: null,
      };

      const userRepositoryResponse = { success: true, data: { id: '123' } };
      (UserUC.apiUpdateUserUC as Mock).mockResolvedValue(userRepositoryResponse);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await UserController.updateUser('123', mockPayload as any, updateData);

      expect(UserUC.apiUpdateUserUC).toHaveBeenCalledWith({
        payload: mockPayload,
        formData: {
          id: '123',
          nick: null,
          img: null,
          email: null,
        },
      });
    });

    it('should revalidate path after update', async () => {
      const { revalidatePath } = await import('next/cache');
      const updateData = { email: 'test@example.com', nick: 'TestUser', img: '' };

      (UserUC.apiUpdateUserUC as Mock).mockResolvedValue({ success: true });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await UserController.updateUser('123', mockPayload as any, updateData);

      expect(revalidatePath).toHaveBeenCalledWith('/');
    });

    it('should propagate errors from apiUpdateUserUC', async () => {
      const error = new Error('Update failed');
      (UserUC.apiUpdateUserUC as Mock).mockRejectedValue(error);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await expect(UserController.updateUser('123', mockPayload as any, { email: '', img: '' }))
        .rejects.toThrow('Update failed');
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      const deleteResponse = { success: true, data: { id: '123' } };
      (UserUC.apiDeleteUserUC as Mock).mockResolvedValue(deleteResponse);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await UserController.deleteUser(mockPayload as any, '123', '0xabcdef1234567890');

      expect(UserUC.apiDeleteUserUC).toHaveBeenCalledWith({
        payload: mockPayload,
        id: '123',
        address: '0xabcdef1234567890'
      });
    });

    it('should revalidate path after delete', async () => {
      const { revalidatePath } = await import('next/cache');
      (UserUC.apiDeleteUserUC as Mock).mockResolvedValue({ success: true });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await UserController.deleteUser(mockPayload as any, '123', '0xabcdef1234567890');

      expect(revalidatePath).toHaveBeenCalledWith('/');
    });

    it('should propagate errors from apiDeleteUserUC', async () => {
      const error = new Error('Delete failed');
      (UserUC.apiDeleteUserUC as Mock).mockRejectedValue(error);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await expect(UserController.deleteUser(mockPayload as any, '123', '0xabcdef1234567890'))
        .rejects.toThrow('Delete failed');
    });
  });

  describe('updateUserSolicitud', () => {
    it('should update user solicitud successfully', async () => {
      const solicitudData = { id: '123', solicitud: 'ADMIN' as RoleType };
      const response = { success: true, data: { id: '123', solicitud: 'ADMIN' } };
      (UserUC.apiUpdateUserSolicitudUC as Mock).mockResolvedValue(response);

      const result = await UserController.updateUserSolicitud(solicitudData);

      expect(UserUC.apiUpdateUserSolicitudUC).toHaveBeenCalledWith(solicitudData);
      expect(result).toBe(response);
    });

    it('should revalidate path after solicitud update', async () => {
      const { revalidatePath } = await import('next/cache');
      (UserUC.apiUpdateUserSolicitudUC as Mock).mockResolvedValue({ success: true });

      await UserController.updateUserSolicitud({ id: '123', solicitud: 'ADMIN' as RoleType });

      expect(revalidatePath).toHaveBeenCalledWith('/');
    });

    it('should propagate errors from apiUpdateUserSolicitudUC', async () => {
      const error = new Error('Solicitud update failed');
      (UserUC.apiUpdateUserSolicitudUC as Mock).mockRejectedValue(error);

      await expect(UserController.updateUserSolicitud({ id: '123', solicitud: 'ADMIN' as RoleType }))
        .rejects.toThrow('Solicitud update failed');
    });
  });

  describe('resendVerificationEmail', () => {
    it('should resend verification email successfully', async () => {
      const userData = { id: '123', email: 'test@example.com' };
      const response = { success: true, data: { message: 'Email sent' } };
      (UserUC.apiResendVerificationEmailUC as Mock).mockResolvedValue(response);

      const result = await UserController.resendVerificationEmail(userData);

      expect(UserUC.apiResendVerificationEmailUC).toHaveBeenCalledWith(userData);
      expect(result).toBe(response);
    });

    it('should propagate errors from apiResendVerificationEmailUC', async () => {
      const error = new Error('Email resend failed');
      (UserUC.apiResendVerificationEmailUC as Mock).mockRejectedValue(error);

      await expect(UserController.resendVerificationEmail({ id: '123', email: 'test@example.com' }))
        .rejects.toThrow('Email resend failed');
    });
  });
});
