import { describe, it, expect } from 'vitest';
import { getErrorIcon } from '@log-ui/lib/get-error-icon';
import { ErrorIcon } from '@log-ui/lib/error-serialization';
import React from 'react';
import { render } from '@testing-library/react';

describe('getErrorIcon', () => {
    it('should return a ShieldX-like icon for CREDENTIALS', () => {
        const icon = getErrorIcon(ErrorIcon.CREDENTIALS);
        expect(icon).toBeDefined();
        const { container } = render(icon as React.ReactElement);
        expect(container.querySelector('svg')).toBeDefined();
        expect(container.querySelector('.h-5.w-5')).toBeDefined();
    });

    it('should return a ServerCrash-like icon for TRY_AGAIN_OR_CONTACT', () => {
        const icon = getErrorIcon(ErrorIcon.TRY_AGAIN_OR_CONTACT);
        expect(icon).toBeDefined();
        const { container } = render(icon as React.ReactElement);
        expect(container.querySelector('svg')).toBeDefined();
    });

    it('should return an AlertCircle-like icon for ALERT_CIRCLE', () => {
        const icon = getErrorIcon(ErrorIcon.ALERT_CIRCLE);
        expect(icon).toBeDefined();
        const { container } = render(icon as React.ReactElement);
        expect(container.querySelector('svg')).toBeDefined();
    });

    it('should return undefined for unknown iconType', () => {
        const icon = getErrorIcon('unknown' as unknown as ErrorIcon);
        expect(icon).toBeUndefined();
    });

    it('should return undefined when iconType is undefined', () => {
        const icon = getErrorIcon(undefined);
        expect(icon).toBeUndefined();
    });
});
