import { describe, it, expect, vi, Mock } from 'vitest';
import { getCurrentUserUC } from '@log-ui/core/application/usecases/entities/user';
import { getCookiesUC } from '@log-ui/core/application/usecases/services/auth';
import { ApiUserRepository } from '@log-ui/core/infrastructure/api/user.repository';
import { RoleType } from '@skrteeeeee/profile-domain';
import { nextCookieAdapter } from '@log-ui/core/presentation/adapters/next-cookie.adapter';

vi.mock('@log-ui/core/application/usecases/services/auth', () => ({
  getCookiesUC: vi.fn(),
}));

vi.mock('@log-ui/core/infrastructure/api/user.repository');
vi.mock('@log-ui/core/presentation/adapters/next-cookie.adapter');

describe('User Use Cases', () => {
  describe('getCurrentUserUC', () => {
    it('should return null if user is not authenticated', async () => {
      (getCookiesUC as Mock).mockResolvedValue(false);
      const result = await getCurrentUserUC();
      expect(result).toBeNull();
    });

    it('should return null if backend does not respond', async () => {
      (getCookiesUC as Mock).mockResolvedValue({ ctx: { id: 'user-id' } });
      ApiUserRepository.prototype.readById = vi.fn().mockResolvedValue({ success: false });

      const result = await getCurrentUserUC();
      expect(result).toBeNull();
    });
  });
});
