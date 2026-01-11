import { describe, it, expect } from 'vitest';
import { ApiBaseRepository, Modules } from '@log-ui/core/infrastructure/api/base.repository';

// Concrete implementation for testing the abstract class
class TestRepository extends ApiBaseRepository {
    constructor(module: Modules, baseUrl?: string) {
        super(module, baseUrl);
    }

    // Expose protected methods for testing
    public testGetEndpointConfig(key: string) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return this.getEndpointConfig(key as any);
    }

    public testGetEndpointModule(key: string) {
        return this.getEndpointModule(key);
    }

    public testGetDynamicEndpointModule(key: string, opt: string | string[]) {
        return this.getDynamicEndpointModule(key, opt);
    }
}

describe('ApiBaseRepository', () => {
    const baseUrl = 'https://api.test.com';

    describe('Initialization and Basic Getters', () => {
        it('should initialize with default baseUrl if none provided', () => {
            const repo = new TestRepository(Modules.ROLE);
            expect(repo.baseUrl).toBe('http://localhost:3001');
            expect(repo.module).toBe(Modules.ROLE);
        });

        it('should initialize with custom baseUrl', () => {
            const repo = new TestRepository(Modules.PROJECTS, baseUrl);
            expect(repo.baseUrl).toBe(baseUrl);
            expect(repo.module).toBe(Modules.PROJECTS);
        });
    });

    describe('endpoints Proxy', () => {
        it('should return endpoint config for valid keys in the module', () => {
            const repo = new TestRepository(Modules.ROLE, baseUrl);
            const createConfig = repo.endpoints.create;
            expect(createConfig).toEqual({
                endpoint: 'role',
                method: 'POST'
            });
        });

        it('should throw DomainError for invalid keys via proxy', () => {
            const repo = new TestRepository(Modules.ROLE, baseUrl);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            expect(() => (repo.endpoints as any).nonExistent).toThrow();
        });
    });

    describe('Protected Method Wrappers', () => {
        it('getEndpointConfig should return correct config', () => {
            const repo = new TestRepository(Modules.USER, baseUrl);
            const config = repo.testGetEndpointConfig('login');
            expect(config).toEqual({ endpoint: 'user', method: 'POST' });
        });

        it('getEndpointModule should return full URL', () => {
            const repo = new TestRepository(Modules.ROLE, baseUrl);
            const url = repo.testGetEndpointModule('readAll');
            expect(url).toBe(`${baseUrl}/role`);
        });

        it('getDynamicEndpointModule - functional endpoint (string)', () => {
            const repo = new TestRepository(Modules.TECH, baseUrl);
            // actualizarGithub is (opt) => `tech/${opt}`
            const url = repo.testGetDynamicEndpointModule('actualizarGithub', 'my-repo');
            expect(url).toBe(`${baseUrl}/tech/my-repo`);
        });

        it('getDynamicEndpointModule - functional endpoint (array)', () => {
            const repo = new TestRepository(Modules.TECH, baseUrl);
            const urls = repo.testGetDynamicEndpointModule('actualizarGithub', ['repo1', 'repo2']);
            expect(urls).toEqual([
                `${baseUrl}/tech/repo1`,
                `${baseUrl}/tech/repo2`
            ]);
        });

        it('getDynamicEndpointModule - static endpoint (string)', () => {
            const repo = new TestRepository(Modules.ROLE, baseUrl);
            // static endpoint "role"
            const url = repo.testGetDynamicEndpointModule('create', 'extra');
            expect(url).toBe(`${baseUrl}/role/extra`);
        });

        it('getDynamicEndpointModule - static endpoint (array)', () => {
            const repo = new TestRepository(Modules.ROLE, baseUrl);
            const urls = repo.testGetDynamicEndpointModule('create', ['extra1', 'extra2']);
            expect(urls).toEqual([
                `${baseUrl}/role/extra1`,
                `${baseUrl}/role/extra2`
            ]);
        });

        it('getDynamicEndpointModule - returns null for non-existent key', () => {
            const repo = new TestRepository(Modules.ROLE, baseUrl);
            const result = repo.testGetDynamicEndpointModule('nonExistent', 'opt');
            expect(result).toBeNull();
        });

        it('getDynamicEndpointModule - returns null for missing options', () => {
            const repo = new TestRepository(Modules.ROLE, baseUrl);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const result = repo.testGetDynamicEndpointModule('create', null as any);
            expect(result).toBeNull();
        });
    });
});
