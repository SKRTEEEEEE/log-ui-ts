import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMediaQuery } from '@log-ui/lib/hooks/use-media-query';

describe('useMediaQuery', () => {
    beforeEach(() => {
        vi.stubGlobal('window', {
            matchMedia: vi.fn(),
        });
    });

    it('should return false initially if media query does not match', () => {
        (window.matchMedia as Mock).mockReturnValue({
            matches: false,
            media: '(min-width: 1024px)',
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
        });

        const { result } = renderHook(() => useMediaQuery('(min-width: 1024px)'));
        expect(result.current).toBe(false);
    });

    it('should return true if media query matches initially', () => {
        (window.matchMedia as Mock).mockReturnValue({
            matches: true,
            media: '(min-width: 1024px)',
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
        });

        const { result } = renderHook(() => useMediaQuery('(min-width: 1024px)'));
        expect(result.current).toBe(true);
    });

    it('should update value when media query change event fires', () => {
        let changeHandler: (...args: unknown[]) => void;
        const mediaQueryMock = {
            matches: false,
            media: '(min-width: 1024px)',
            addEventListener: vi.fn().mockImplementation((event, handler) => {
                if (event === 'change') changeHandler = handler;
            }),
            removeEventListener: vi.fn(),
        };

        (window.matchMedia as Mock).mockReturnValue(mediaQueryMock);

        const { result } = renderHook(() => useMediaQuery('(min-width: 1024px)'));
        expect(result.current).toBe(false);

        // Update the mock state
        mediaQueryMock.matches = true;

        act(() => {
            changeHandler();
        });

        expect(result.current).toBe(true);
    });
});
