import { describe, it, expect, vi, beforeEach } from 'vitest';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFunction = (...args: any[]) => any;

describe('Role Use Cases', () => {
    let apiCreateRoleUC: AnyFunction;
    let apiReadRoleByIdUC: AnyFunction;
    let apiReadRolesUC: AnyFunction;
    let apiUpdateRoleByIdUC: AnyFunction;
    let apiDeleteRoleByIdUC: AnyFunction;
    let apiDeleteRolesUC: AnyFunction;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let ApiRoleRepository: any;

    beforeEach(async () => {
        vi.resetModules();
        vi.mock('@log-ui/core/infrastructure/api/role.repository');

        // Import repository mock class
        const repoModule = await import('@log-ui/core/infrastructure/api/role.repository');
        ApiRoleRepository = repoModule.ApiRoleRepository;

        // Import UCs (this triggers 'new ApiRoleRepository()')
        const roleModule = await import('@log-ui/core/application/usecases/entities/role');
        apiCreateRoleUC = roleModule.apiCreateRoleUC;
        apiReadRoleByIdUC = roleModule.apiReadRoleByIdUC;
        apiReadRolesUC = roleModule.apiReadRolesUC;
        apiUpdateRoleByIdUC = roleModule.apiUpdateRoleByIdUC;
        apiDeleteRoleByIdUC = roleModule.apiDeleteRoleByIdUC;
        apiDeleteRolesUC = roleModule.apiDeleteRolesUC;
    });

    it('should call create on repository', async () => {
        const payload = { name: 'Admin', description: 'Super user' };
        // Setup mock on prototype
        ApiRoleRepository.prototype.create.mockResolvedValue({ success: true, data: payload });

        const result = await apiCreateRoleUC(payload);

        expect(ApiRoleRepository.prototype.create).toHaveBeenCalledWith(payload);
        expect(result).toEqual({ success: true, data: payload });
    });

    it('should call readById on repository', async () => {
        const id = '123';
        ApiRoleRepository.prototype.readById.mockResolvedValue({ success: true });

        await apiReadRoleByIdUC(id);
        expect(ApiRoleRepository.prototype.readById).toHaveBeenCalledWith(id);
    });

    it('should call read (readRoles) on repository', async () => {
        const filter = { name: 'Test' };
        ApiRoleRepository.prototype.read.mockResolvedValue({ success: true, data: [] });

        await apiReadRolesUC(filter);
        expect(ApiRoleRepository.prototype.read).toHaveBeenCalledWith(filter);
    });

    it('should call updateById on repository', async () => {
        const props = { id: '123', updateData: { name: 'Updated' } };
        ApiRoleRepository.prototype.updateById.mockResolvedValue({ success: true });

        await apiUpdateRoleByIdUC(props);
        expect(ApiRoleRepository.prototype.updateById).toHaveBeenCalledWith(props);
    });

    it('should call deleteById on repository', async () => {
        const id = '123';
        ApiRoleRepository.prototype.deleteById.mockResolvedValue({ success: true });

        await apiDeleteRoleByIdUC(id);
        expect(ApiRoleRepository.prototype.deleteById).toHaveBeenCalledWith(id);
    });

    it('should call delete (deleteRoles) on repository', async () => {
        const props = { filter: { name: 'Old' } };
        ApiRoleRepository.prototype.delete.mockResolvedValue({ success: true });

        await apiDeleteRolesUC(props);
        expect(ApiRoleRepository.prototype.delete).toHaveBeenCalledWith(props);
    });
});
