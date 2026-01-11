import { describe, it, expect, vi, beforeEach } from 'vitest';
import { nextCookieAdapter } from '@log-ui/core/presentation/adapters/next-cookie.adapter';
import { getCookiesUC, setJwtUC } from '@log-ui/core/application/usecases/services/auth';
import type { Mock } from 'vitest';

describe('User Use Cases (Enhanced)', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let api: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let userRepo: any;

  beforeEach(async () => {
    vi.resetModules();
    vi.mock('@log-ui/core/presentation/adapters/next-cookie.adapter');
    vi.mock('@log-ui/core/application/usecases/services/auth');
    vi.mock('@log-ui/core/infrastructure/api/user.repository');

    // Import repository class mock
    const repoModule = await import('@log-ui/core/infrastructure/api/user.repository');
    userRepo = repoModule.ApiUserRepository;

    // Import UCs
    api = await import('@log-ui/core/application/usecases/entities/user');
  });

  describe('getCurrentUserUC', () => {
    it('should return null if no cookies', async () => {
      (getCookiesUC as Mock).mockResolvedValue(null);
      const result = await api.getCurrentUserUC();
      expect(result).toBeNull();
    });

    it('should return mapped user data on success', async () => {
      (getCookiesUC as Mock).mockResolvedValue({ ctx: { id: '123' } });
      userRepo.prototype.readById.mockResolvedValue({
        success: true,
        data: { id: '123', nick: 'Juan', role: 'admin' }
      });

      const result = await api.getCurrentUserUC();
      expect(result).toEqual(expect.objectContaining({ id: '123', nick: 'Juan' }));
    });

    it('should return null and warn on catch', async () => {
      (getCookiesUC as Mock).mockRejectedValue(new Error('Fail'));
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => { });
      const result = await api.getCurrentUserUC();
      expect(result).toBeNull();
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe('API Actions', () => {
    it('apiReadUserByIdUC should use JWT from cookies', async () => {
      (nextCookieAdapter.get as Mock).mockResolvedValue('jwt-token');
      userRepo.prototype.readById.mockResolvedValue({ success: true });

      await api.apiReadUserByIdUC('123');
      expect(userRepo.prototype.readById).toHaveBeenCalledWith('123', 'jwt-token');
    });

    it('apiReadUsersUC should call readAll', async () => {
      (nextCookieAdapter.get as Mock).mockResolvedValue(undefined);
      await api.apiReadUsersUC();
      expect(userRepo.prototype.readAll).toHaveBeenCalled();
    });

    it('apiLoginUserUC should call login', async () => {
      const data = { payload: { address: '0x1' } };
      await api.apiLoginUserUC(data);
      expect(userRepo.prototype.login).toHaveBeenCalled();
    });

    it('apiUpdateUserUC should update JWT on success', async () => {
      const data = { payload: { address: '0x1' }, formData: { id: '1', nick: 'New', img: 'x.jpg', email: null } };
      userRepo.prototype.update.mockResolvedValue({
        success: true,
        data: { id: '1', nick: 'New', role: 'user', img: 'x.jpg' }
      });

      const res = await api.apiUpdateUserUC(data);

      expect(userRepo.prototype.update).toHaveBeenCalled();
      expect(setJwtUC).toHaveBeenCalledWith(data.payload, expect.objectContaining({ nick: 'New' }));
      expect(res.success).toBe(true);
    });

    it('apiDeleteUserUC should call deleteById', async () => {
      userRepo.prototype.deleteById.mockResolvedValue({
        success: true,
        data: { id: '1' }
      });
      
      const result = await api.apiDeleteUserUC({ id: '1', payload: {}, address: '0x1' });
      
      expect(userRepo.prototype.deleteById).toHaveBeenCalledWith(
        { id: '1', payload: {}, address: '0x1' },
        undefined
      );
      expect(result.success).toBe(true);
    });

    it('apiUpdateUserSolicitudUC should call updateSolicitud', async () => {
      await api.apiUpdateUserSolicitudUC({ id: '1', solicitud: 'ADMIN' });
      expect(userRepo.prototype.updateSolicitud).toHaveBeenCalled();
    });

    it('apiResendVerificationEmailUC should call resendVerificationEmail', async () => {
      await api.apiResendVerificationEmailUC({ id: '1', email: 'a@b.com' });
      expect(userRepo.prototype.resendVerificationEmail).toHaveBeenCalled();
    });
  });
});
