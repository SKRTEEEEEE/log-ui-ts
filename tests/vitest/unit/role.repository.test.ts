import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiRoleRepository } from '@log-ui/core/infrastructure/api/role.repository';
import { ErrorCodes } from '@skrteeeeee/profile-domain';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MockFetch = any;

describe('ApiRoleRepository', () => {
    const baseUrl = 'https://api.test.com';
    let repository: ApiRoleRepository;

    beforeEach(() => {
        repository = new ApiRoleRepository(baseUrl);
        vi.restoreAllMocks();
        global.fetch = vi.fn() as MockFetch;
    });

    describe('create', () => {
        it('should call fetch with correct parameters', async () => {
            const roleData = { name: 'Admin', description: 'desc', address: '0x123', permissions: 'ADMIN' as import('@skrteeeeee/profile-domain').RoleType };
            const mockResponse = { id: '1', ...roleData };

            (global.fetch as MockFetch).mockResolvedValue({
                ok: true,
                json: async () => mockResponse
            });

            const result = await repository.create(roleData, 'token');

            expect(global.fetch).toHaveBeenCalledWith(`${baseUrl}/role`, {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                    'Authorization': 'Bearer token'
                },
                body: JSON.stringify(roleData)
            });
            expect(result).toEqual(mockResponse);
        });

        it('should throw DomainError if response is not ok', async () => {
            (global.fetch as MockFetch).mockResolvedValue({
                ok: false,
                statusText: 'Bad Request'
            });

            await expect(repository.create({ address: '0x1', permissions: 'USER' as import('@skrteeeeee/profile-domain').RoleType })).rejects.toMatchObject({
                type: ErrorCodes.DATABASE_ACTION
            });
        });
    });

    describe('readById', () => {
        it('should call fetch with correct URL', async () => {
            const roleId = '123';
            const mockResponse = { id: roleId, name: 'Admin' };

            (global.fetch as MockFetch).mockResolvedValue({
                ok: true,
                json: async () => mockResponse
            });

            const result = await repository.readById(roleId);

            expect(global.fetch).toHaveBeenCalledWith(`${baseUrl}/role/${roleId}`, expect.any(Object));
            expect(result).toEqual(mockResponse);
        });

        it('should throw DomainError if response is not ok', async () => {
            (global.fetch as MockFetch).mockResolvedValue({
                ok: false,
                statusText: 'Not Found'
            });

            await expect(repository.readById('123')).rejects.toMatchObject({
                type: ErrorCodes.DATABASE_FIND
            });
        });
    });

    describe('read (all)', () => {
        it('should call fetch with query params', async () => {
            const filter = { name: 'Admin' };
            const mockResponse = [{ id: '1', name: 'Admin' }];

            (global.fetch as MockFetch).mockResolvedValue({
                ok: true,
                json: async () => mockResponse
            });

            const result = await repository.read(filter);

            expect(global.fetch).toHaveBeenCalledWith(`${baseUrl}/role?name=Admin`, expect.any(Object));
            expect(result).toEqual(mockResponse);
        });

        it('should call fetch without query params if filter is missing', async () => {
            (global.fetch as MockFetch).mockResolvedValue({
                ok: true,
                json: async () => []
            });

            await repository.read();

            expect(global.fetch).toHaveBeenCalledWith(`${baseUrl}/role`, expect.any(Object));
        });

        it('should throw DomainError if response is not ok', async () => {
            (global.fetch as MockFetch).mockResolvedValue({
                ok: false,
                statusText: 'Error'
            });

            await expect(repository.read()).rejects.toMatchObject({
                type: ErrorCodes.DATABASE_FIND
            });
        });
    });

    describe('updateById', () => {
        it('should call fetch with PUT method and correct body', async () => {
            const id = '123';
            const updateData = { address: '0x123' };
            const mockResponse = { success: true };

            (global.fetch as MockFetch).mockResolvedValue({
                ok: true,
                json: async () => mockResponse
            });

            const result = await repository.updateById({ id, updateData });

            expect(global.fetch).toHaveBeenCalledWith(`${baseUrl}/role/${id}`, {
                method: 'PUT',
                headers: expect.any(Object),
                body: JSON.stringify(updateData)
            });
            expect(result).toEqual(mockResponse);
        });

        it('should throw DomainError if response is not ok', async () => {
            (global.fetch as MockFetch).mockResolvedValue({
                ok: false,
                statusText: 'Error'
            });

            await expect(repository.updateById({ id: '1', updateData: { address: '0x1' } })).rejects.toMatchObject({
                type: ErrorCodes.DATABASE_ACTION
            });
        });
    });

    describe('deleteById', () => {
        it('should call fetch with DELETE method', async () => {
            const id = '123';
            const mockResponse = { success: true };

            (global.fetch as MockFetch).mockResolvedValue({
                ok: true,
                json: async () => mockResponse
            });

            const result = await repository.deleteById(id);

            expect(global.fetch).toHaveBeenCalledWith(`${baseUrl}/role/${id}`, {
                method: 'DELETE',
                headers: expect.any(Object)
            });
            expect(result).toEqual(mockResponse);
        });

        it('should throw DomainError if response is not ok', async () => {
            (global.fetch as MockFetch).mockResolvedValue({
                ok: false,
                statusText: 'Error'
            });

            await expect(repository.deleteById('1')).rejects.toMatchObject({
                type: ErrorCodes.DATABASE_ACTION
            });
        });
    });

    describe('delete (many)', () => {
        it('should call fetch with many endpoint and filter in body', async () => {
            const props = { filter: { name: 'Old' } };
            const mockResponse = { deletedCount: 5 };

            (global.fetch as MockFetch).mockResolvedValue({
                ok: true,
                json: async () => mockResponse
            });

            const result = await repository.delete(props);

            expect(global.fetch).toHaveBeenCalledWith(`${baseUrl}/role/many`, {
                method: 'DELETE',
                headers: expect.any(Object),
                body: JSON.stringify(props.filter)
            });
            expect(result).toEqual(mockResponse);
        });

        it('should throw DomainError if response is not ok', async () => {
            (global.fetch as MockFetch).mockResolvedValue({
                ok: false,
                statusText: 'Error'
            });

            await expect(repository.delete({ filter: {} })).rejects.toMatchObject({
                type: ErrorCodes.DATABASE_ACTION
            });
        });
    });
});
