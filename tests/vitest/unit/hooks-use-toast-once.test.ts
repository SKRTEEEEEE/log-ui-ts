import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useToastOnce } from '@log-ui/lib/hooks/use-toast-once';
import { toast } from 'sonner';
import { useLocale } from 'next-intl';

vi.mock('sonner', () => ({
    toast: {
        error: vi.fn(),
    },
}));

vi.mock('next-intl', () => ({
    useLocale: vi.fn(),
}));

describe('useToastOnce', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (useLocale as Mock).mockReturnValue('en');
    });

    it('should call toast.error once for a simple IntlBase message', () => {
        const message = { en: 'Hello', es: 'Hola', ca: 'Hola', de: 'Hallo' };

        const { rerender } = renderHook(({ msg }) => useToastOnce(msg), {
            initialProps: { msg: message }
        });

        expect(toast.error).toHaveBeenCalledTimes(1);
        expect(toast.error).toHaveBeenCalledWith('Hello');

        // Rerender should not trigger toast again
        rerender({ msg: message });
        expect(toast.error).toHaveBeenCalledTimes(1);
    });

    it('should call toast.error once for a SerializedError', () => {
        const error = {
            type: 'ERR_TEST',
            title: { en: 'Error Title', es: 'Título', ca: 'Títol', de: 'Fehler' },
            description: { en: 'Error desc', es: 'Desc', ca: 'Desc', de: 'Desc' },
            timestamp: Date.now(),
        };

        const { rerender } = renderHook(({ err }) => useToastOnce(err), {
            initialProps: { err: error }
        });

        expect(toast.error).toHaveBeenCalledTimes(1);
        expect(toast.error).toHaveBeenCalledWith('Error Title', expect.objectContaining({
            description: 'Error desc'
        }));

        rerender({ err: error });
        expect(toast.error).toHaveBeenCalledTimes(1);
    });

    it('should NOT call toast.error for a silent error (description.es === "d")', () => {
        const silentError = {
            type: 'ERR_SILENT',
            title: { en: 'Title', es: '', ca: '', de: '' },
            description: { en: 'd', es: 'd', ca: 'd', de: 'd' },
            timestamp: Date.now(),
        };

        renderHook(() => useToastOnce(silentError));

        expect(toast.error).not.toHaveBeenCalled();
    });
});
