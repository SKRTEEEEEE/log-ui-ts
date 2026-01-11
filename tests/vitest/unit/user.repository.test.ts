import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiUserRepository } from '@log-ui/core/infrastructure/api/user.repository';
import { ErrorCodes, RoleType } from '@skrteeeeee/profile-domain';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MockFetch = any;

describe('ApiUserRepository', () => {
    const baseUrl = 'https://api.test.com';
    let repository: ApiUserRepository;

    beforeEach(() => {
        repository = new ApiUserRepository(baseUrl);
        vi.restoreAllMocks();
        global.fetch = vi.fn() as MockFetch;
    });

    describe('readAll', () => {
        it('should call fetch with JWT', async () => {
            (global.fetch as MockFetch).mockResolvedValue({
                ok: true,
                json: async () => []
            });
            await repository.readAll('token');
            expect(global.fetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
                headers: expect.objectContaining({ Authorization: 'Bearer token' })
            }));
        });

        it('should call fetch without JWT', async () => {
            (global.fetch as MockFetch).mockResolvedValue({
                ok: true,
                json: async () => []
            });
            await repository.readAll();
            const callHeaders = (global.fetch as MockFetch).mock.calls[0][1].headers;
            expect(callHeaders.Authorization).toBeUndefined();
        });
    });

    describe('login', () => {
        it('should work with and without JWT', async () => {
            (global.fetch as MockFetch).mockResolvedValue({ ok: true, json: async () => ({}) });

            await repository.login({ payload: {} as Parameters<typeof repository.login>[0]['payload'] }, 'jwt');
            expect(global.fetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
                headers: expect.objectContaining({ Authorization: 'Bearer jwt' })
            }));

            await repository.login({ payload: {} as Parameters<typeof repository.login>[0]['payload'] });
            const secondCallHeaders = (global.fetch as MockFetch).mock.calls[1][1].headers;
            expect(secondCallHeaders.Authorization).toBeUndefined();
        });

        it('should handle catch block with non-DomainError', async () => {
            (global.fetch as MockFetch).mockRejectedValue(new Error('Network'));
            try {
                await repository.login({ payload: {} as Parameters<typeof repository.login>[0]['payload'] });
            } catch (error) {
                expect((error as { type: string }).type).toBe(ErrorCodes.DATABASE_FIND);
            }
        });

        it('should rethrow DomainError in catch block', async () => {
            const domainError = { type: 'CUSTOM', message: 'msg' };
            (global.fetch as MockFetch).mockRejectedValue(domainError);
            await expect(repository.login({ payload: {} as Parameters<typeof repository.login>[0]['payload'] })).rejects.toEqual(domainError);
        });
    });

    describe('readById', () => {
        it('should handle JWT', async () => {
            (global.fetch as MockFetch).mockResolvedValue({ ok: true, json: async () => ({}) });
            await repository.readById('1', 'jwt');
            expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/1'), expect.objectContaining({
                headers: expect.objectContaining({ Authorization: 'Bearer jwt' })
            }));
        });
    });

    describe('update', () => {
        it('should handle JWT', async () => {
            (global.fetch as MockFetch).mockResolvedValue({ ok: true, json: async () => ({}) });
            await repository.update({
                payload: {} as Parameters<typeof repository.update>[0]['payload'],
                formData: { id: '1', img: null, email: null }
            }, 'jwt');
            expect(global.fetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
                headers: expect.objectContaining({ Authorization: 'Bearer jwt' })
            }));
        });

        it('should throw DATABASE_ACTION on failure', async () => {
            (global.fetch as MockFetch).mockResolvedValue({ ok: false });
            await expect(repository.update({
                payload: {} as Parameters<typeof repository.update>[0]['payload'],
                formData: { id: '1', img: null, email: null }
            })).rejects.toMatchObject({
                type: ErrorCodes.DATABASE_ACTION
            });
        });
    });

    describe('deleteById', () => {
        it('should handle JWT', async () => {
            (global.fetch as MockFetch).mockResolvedValue({ ok: true, json: async () => ({}) });
            await repository.deleteById({
                id: '1',
                payload: {} as Parameters<typeof repository.deleteById>[0]['payload'],
                address: '0x1'
            }, 'jwt');
            expect(global.fetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
                headers: expect.objectContaining({ Authorization: 'Bearer jwt' })
            }));
        });
    });

    describe('updateSolicitud', () => {
        it('should handle JWT', async () => {
            (global.fetch as MockFetch).mockResolvedValue({ ok: true, json: async () => ({}) });
            await repository.updateSolicitud({ id: '1', solicitud: RoleType.ADMIN }, 'jwt');
            expect(global.fetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
                headers: expect.objectContaining({ Authorization: 'Bearer jwt' })
            }));
        });
    });

    describe('resendVerificationEmail', () => {
        it('should handle JWT', async () => {
            (global.fetch as MockFetch).mockResolvedValue({ ok: true, json: async () => ({}) });
            await repository.resendVerificationEmail({ id: '1', email: '' }, 'jwt');
            expect(global.fetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
                headers: expect.objectContaining({ Authorization: 'Bearer jwt' })
            }));
        });
    });
});
