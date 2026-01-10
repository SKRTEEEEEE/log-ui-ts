import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { nextCookieAdapter } from '@log-ui/core/presentation/adapters/next-cookie.adapter';
import { cookies } from 'next/headers';

vi.mock('next/headers', () => ({
    cookies: vi.fn(),
}));

describe('NextCookieAdapter', () => {
    const mockCookieStore = {
        get: vi.fn(),
        set: vi.fn(),
        delete: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (cookies as Mock).mockResolvedValue(mockCookieStore);
    });

    it('should get a cookie value', async () => {
        mockCookieStore.get.mockReturnValue({ value: 'test-value' });

        const value = await nextCookieAdapter.get('test-name');

        expect(cookies).toHaveBeenCalled();
        expect(mockCookieStore.get).toHaveBeenCalledWith('test-name');
        expect(value).toBe('test-value');
    });

    it('should return undefined if cookie is not found', async () => {
        mockCookieStore.get.mockReturnValue(undefined);

        const value = await nextCookieAdapter.get('non-existent');

        expect(value).toBeUndefined();
    });

    it('should set a cookie value', async () => {
        await nextCookieAdapter.set('name', 'value');

        expect(cookies).toHaveBeenCalled();
        expect(mockCookieStore.set).toHaveBeenCalledWith('name', 'value');
    });

    it('should delete a cookie', async () => {
        await nextCookieAdapter.delete('name');

        expect(cookies).toHaveBeenCalled();
        expect(mockCookieStore.delete).toHaveBeenCalledWith('name');
    });
});
