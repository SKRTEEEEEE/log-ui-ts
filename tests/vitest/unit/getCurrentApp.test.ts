import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getCurrentApp } from '@log-ui/lib/config/apps-config';

describe('getCurrentApp', () => {
  const originalWindow = global.window;

  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_BASE_URL', '');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.stubGlobal('window', originalWindow);
  });

  describe('Client-side (window defined)', () => {
    it('should return "profile" for profile production URL', () => {
      vi.stubGlobal('window', {
        location: {
          origin: 'https://dev.desarollador.tech',
        },
      });

      expect(getCurrentApp()).toBe('profile');
    });

    it('should return "admin" for admin production URL', () => {
      vi.stubGlobal('window', {
        location: {
          origin: 'https://profile-skrt.vercel.app',
        },
      });

      expect(getCurrentApp()).toBe('admin');
    });

    it('should return the correct app in development environment', () => {
      vi.stubEnv('NODE_ENV', 'development');
      vi.stubGlobal('window', {
        location: {
          origin: 'http://localhost:3002',
        },
      });

      expect(getCurrentApp()).toBe('agora');
    });

    it('should return null when origin does not match any app pattern', () => {
      vi.stubGlobal('window', {
        location: {
          origin: 'https://unknown.example.com',
        },
      });

      expect(getCurrentApp()).toBeNull();
    });
  });

  describe('Server-side (window undefined)', () => {
    it('should return the correct app based on NEXT_PUBLIC_BASE_URL', () => {
      vi.stubGlobal('window', undefined);
      vi.stubEnv('NEXT_PUBLIC_BASE_URL', 'https://agora.desarollador.tech');

      expect(getCurrentApp()).toBe('agora');
    });

    it('should return null when NEXT_PUBLIC_BASE_URL is not defined', () => {
      vi.stubGlobal('window', undefined);
      vi.stubEnv('NEXT_PUBLIC_BASE_URL', '');

      expect(getCurrentApp()).toBeNull();
    });

    it('should return null when NEXT_PUBLIC_BASE_URL does not match any app', () => {
      vi.stubGlobal('window', undefined);
      vi.stubEnv('NEXT_PUBLIC_BASE_URL', 'https://unknown.com');

      expect(getCurrentApp()).toBeNull();
    });
  });
});
