import { describe, it, expect, vi, Mock } from 'vitest';
import { isLoggedInUC, isAdminUC, protLogActUC, protAdmActUC, protLogRouUC, protAdmRouUC, loginUC } from '@log-ui/core/application/usecases/services/auth';
import { authRepository } from '@log-ui/core/presentation/services/auth.service';
import { RoleType } from '@skrteeeeee/profile-domain';
import { apiLoginUserUC } from '@log-ui/core/application/usecases/entities/user';
import { VerifyLoginPayloadParams, LoginPayload } from 'thirdweb/auth'; // Import LoginPayload

vi.mock('@log-ui/core/presentation/services/auth.service', () => ({
  authRepository: {
    getCookies: vi.fn(),
    setJwt: vi.fn(),
  },
}));

vi.mock('@log-ui/core/application/usecases/entities/user', () => ({
  apiLoginUserUC: vi.fn(),
}));

describe('Auth Use Cases', () => {
  describe('loginUC', () => {
    it('should return JWT and user data on successful login', async () => {
      const mockLoginPayload: LoginPayload = {
        domain: 'example.com',
        chain_id: '1', // Corrected to chain_id
        address: '0x123',
        statement: 'Sign in to example.com',
        uri: 'https://example.com',
        version: '1',
        nonce: 'nonce',
        issued_at: '2023-01-01T00:00:00.000Z',
        expiration_time: '2023-01-01T01:00:00.000Z',
        invalid_before: '2023-01-01T00:00:00.000Z',
        resources: ['https://example.com/resources']
      };

      const payload: VerifyLoginPayloadParams = {
        signature: '0xabc',
        payload: mockLoginPayload
      };

      const mockApiResponse = {
        success: true,
        data: {
          id: 'user-id',
          nick: 'test-user',
          img: 'test-img',
          email: 'test-email',
          address: '0x123',
          role: RoleType.STUDENT,
          isVerified: true,
          solicitud: RoleType.STUDENT,
        },
      };

      const mockJwt = {
        token: 'test-token',
        payload: {
          sub: 'user-id',
          address: '0x123',
        },
        ctx: {
          id: 'user-id',
          nick: 'test-user',
          role: RoleType.STUDENT,
          img: 'test-img',
        },
      };

      (apiLoginUserUC as Mock).mockResolvedValue(mockApiResponse);
      (authRepository.setJwt as Mock).mockResolvedValue(mockJwt);

      const result = await loginUC(payload);

      expect(result.jwt).toEqual(mockJwt);
      expect(result.userData).toEqual(mockApiResponse.data);
    });

    it('should throw an error on failed login', async () => {
      const mockLoginPayload: LoginPayload = {
        domain: 'example.com',
        chain_id: '1', // Corrected to chain_id
        address: '0x123',
        statement: 'Sign in to example.com',
        uri: 'https://example.com',
        version: '1',
        nonce: 'nonce',
        issued_at: '2023-01-01T00:00:00.000Z',
        expiration_time: '2023-01-01T01:00:00.000Z',
        invalid_before: '2023-01-01T00:00:00.000Z',
        resources: ['https://example.com/resources']
      };
      const payload: VerifyLoginPayloadParams = {
        signature: '0xabc',
        payload: mockLoginPayload
      };

      (apiLoginUserUC as Mock).mockResolvedValue({ success: false });

      await expect(loginUC(payload)).rejects.toThrow();
    });
  });

  describe('isLoggedInUC', () => {
    it('should return true if cookies are present', async () => {
      (authRepository.getCookies as Mock).mockResolvedValue({ ctx: {} });
      const result = await isLoggedInUC();
      expect(result).toBe(true);
    });

    it('should return false if cookies are not present', async () => {
      (authRepository.getCookies as Mock).mockResolvedValue(false);
      const result = await isLoggedInUC();
      expect(result).toBe(false);
    });
  });

  describe('isAdminUC', () => {
    it('should return true if user is an admin', async () => {
      (authRepository.getCookies as Mock).mockResolvedValue({
        ctx: { role: RoleType.ADMIN },
      });
      const result = await isAdminUC();
      expect(result).toBe(true);
    });

    it('should return false if user is not an admin', async () => {
      (authRepository.getCookies as Mock).mockResolvedValue({
        ctx: { role: RoleType.STUDENT },
      });
      const result = await isAdminUC();
      expect(result).toBe(false);
    });

    it('should return false if user is not logged in', async () => {
      (authRepository.getCookies as Mock).mockResolvedValue(false);
      const result = await isAdminUC();
      expect(result).toBe(false);
    });
  });

  describe('protLogActUC', () => {
    it('should return cookies if user is logged in', async () => {
      const cookies = { ctx: {} };
      (authRepository.getCookies as Mock).mockResolvedValue(cookies);
      const result = await protLogActUC();
      expect(result).toBe(cookies);
    });

    it('should throw an error if user is not logged in', async () => {
      (authRepository.getCookies as Mock).mockResolvedValue(false);
      await expect(protLogActUC()).rejects.toThrow();
    });
  });

  describe('protAdmActUC', () => {
    it('should return true if user is an admin', async () => {
      (authRepository.getCookies as Mock).mockResolvedValue({ ctx: { role: RoleType.ADMIN } });
      const result = await protAdmActUC();
      expect(result).toBe(true);
    });

    it('should throw an error if user is not an admin', async () => {
      (authRepository.getCookies as Mock).mockResolvedValue({ ctx: { role: RoleType.STUDENT } });
      await expect(protAdmActUC()).rejects.toThrow();
    });
  });

  describe('protLogRouUC', () => {
    it('should return cookies if user is logged in', async () => {
      const cookies = { ctx: {} };
      (authRepository.getCookies as Mock).mockResolvedValue(cookies);
      const result = await protLogRouUC('/some-route');
      expect(result).toBe(cookies);
    });

    it('should throw an error if user is not logged in', async () => {
      (authRepository.getCookies as Mock).mockResolvedValue(false);
      await expect(protLogRouUC('/some-route')).rejects.toThrow();
    });
  });

  describe('protAdmRouUC', () => {
    it('should return cookies if user is an admin', async () => {
      const cookies = { ctx: { role: RoleType.ADMIN } };
      (authRepository.getCookies as Mock).mockResolvedValue(cookies);
      const result = await protAdmRouUC('/admin-route');
      expect(result).toBe(cookies);
    });

    it('should throw an error if user is not an admin', async () => {
      (authRepository.getCookies as Mock).mockResolvedValue({ ctx: { role: RoleType.STUDENT } });
      await expect(protAdmRouUC('/admin-route')).rejects.toThrow();
    });
  });
});
