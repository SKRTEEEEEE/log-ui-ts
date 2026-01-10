import { describe, it, expect, vi } from 'vitest';
import {
  serializeError,
  deserializeError,
  isDomainError,
  analyzeError,
  ErrorIcon,
} from '@log-ui/lib/error-serialization';
import { DomainError as ActualDomainError, ErrorCodes, IntlBase } from '@skrteeeeee/profile-domain';

// Mock del módulo @skrteeeeee/profile-domain
vi.mock('@skrteeeeee/profile-domain', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@skrteeeeee/profile-domain')>();
  const mockDomainError = class MockDomainError extends actual.DomainError {
    constructor(
      message: string, // Added message parameter
      code: ErrorCodes, // Changed from actual.ErrorCodes
      location: unknown,
      func: string,
      friendlyDesc?: unknown,
      meta?: unknown,
    ) {
      super(message, code, location as unknown as (...args: unknown[]) => unknown, func, friendlyDesc as unknown as IntlBase, meta as unknown as Record<string, unknown>);
    }
  };

  return {
    ...actual,
    DomainError: mockDomainError,
    createDomainError: (
      code: ErrorCodes, // Changed from actual.ErrorCodes
      location: unknown,
      func: string,
      friendlyDesc?: unknown,
      meta?: unknown,
      friendlyHeader?: unknown,
      message?: string // Added message parameter
    ) => {
      const msg = message || (friendlyDesc as unknown as IntlBase)?.en || (friendlyDesc as string) || 'Mock Domain Error';
      return new mockDomainError(msg, code, location, func, friendlyDesc, meta);
    },
  };
});

describe('Error Serialization', () => {
  const mockIntlBase = { es: 'Hola', en: 'Hello', ca: 'Hola', de: 'Hallo' };
  const mockMeta = { entity: 'User', optionalMessage: 'Test message' };

  const mockDomainError: ActualDomainError = {
    name: 'DomainError',
    type: ErrorCodes.UNAUTHORIZED_ACTION, // Changed to ErrorCodes.UNAUTHORIZED_ACTION
    friendlyDesc: mockIntlBase,
    meta: mockMeta,
    timestamp: Date.now(),
    success: false,
    location: vi.fn(),
    func: 'testFunc',
    code: ErrorCodes.UNAUTHORIZED_ACTION,
    message: 'Test Domain Error Message',
  } as ActualDomainError;

  describe('serializeError', () => {
    it('should serialize a DomainError with IntlBase friendlyDesc', () => {
      const serialized = serializeError(mockDomainError);
      expect(serialized).toEqual({
        type: mockDomainError.type,
        title: { es: 'Error', en: 'Error', ca: 'Error', de: 'Fehler' },
        description: mockIntlBase,
        meta: mockMeta,
        timestamp: mockDomainError.timestamp,
      });
    });

    it('should serialize a DomainError with string friendlyDesc', () => {
      const stringFriendlyDesc = 'Some string error';
      const stringDomainError = {
        ...mockDomainError,
        friendlyDesc: stringFriendlyDesc as unknown as ActualDomainError['friendlyDesc'],
      };
      const serialized = serializeError(stringDomainError as ActualDomainError);
      expect(serialized).toEqual({
        type: stringDomainError.type,
        title: { es: 'Error', en: 'Error', ca: 'Error', de: 'Fehler' },
        description: {
          es: stringFriendlyDesc,
          en: stringFriendlyDesc,
          ca: stringFriendlyDesc,
          de: stringFriendlyDesc,
        },
        meta: mockMeta,
        timestamp: stringDomainError.timestamp,
      });
    });
  });

  describe('deserializeError', () => {
    it('should deserialize a SerializedError to a DomainError-like object', () => {
      const serialized = serializeError(mockDomainError);
      const deserialized = deserializeError(serialized);
      expect(deserialized).toEqual(
        expect.objectContaining({
          type: serialized.type,
          friendlyDesc: serialized.description,
          meta: serialized.meta,
          timestamp: serialized.timestamp,
          success: false,
          func: 'deserialized',
          message: serialized.meta?.optionalMessage || 'Error from server',
        })
      );
    });
  });

  describe('isDomainError', () => {
    it('should return true for a valid DomainError object', () => {
      expect(isDomainError(mockDomainError)).toBe(true);
    });

    it('should return false for a non-DomainError object', () => {
      const nonDomainError = { someProp: 'value' };
      expect(isDomainError(nonDomainError)).toBe(false);
    });

    it('should return false for null or undefined', () => {
      expect(isDomainError(null)).toBe(false);
      expect(isDomainError(undefined)).toBe(false);
    });
  });

  describe('analyzeError', () => {
    it('should throw error if not a DomainError', () => {
      const nonDomainError = new Error('Generic error');
      expect(() => analyzeError(nonDomainError)).toThrow('Generic error');
    });

    it('should throw error if friendlyDesc is undefined', () => {
      const errorWithNoFriendlyDesc = {
        ...mockDomainError,
        friendlyDesc: undefined,
      };
      expect(() => analyzeError(errorWithNoFriendlyDesc as ActualDomainError)).toThrow();
    });

    it('should handle silent errors (friendlyDesc === "d")', () => {
      const silentError = { ...mockDomainError, friendlyDesc: 'd' as unknown as ActualDomainError['friendlyDesc'] };
      const analyzed = analyzeError(silentError as ActualDomainError);
      expect(analyzed.meta?.silent).toBe(true);
      expect(analyzed.description.es).toBe('d');
    });

    it('should handle predefined string friendlyDesc', () => {
      const predefinedError = { ...mockDomainError, friendlyDesc: 'credentials' as unknown as ActualDomainError['friendlyDesc'] };
      const analyzed = analyzeError(predefinedError as ActualDomainError);
      expect(analyzed.iconType).toBe(ErrorIcon.CREDENTIALS);
      expect(analyzed.title.es).toBe("Credenciales inválidas");
    });

    it('should handle unknown string friendlyDesc', () => {
      const unknownStringError = { ...mockDomainError, friendlyDesc: 'unknownErrorString' as unknown as ActualDomainError['friendlyDesc'] };
      const analyzed = analyzeError(unknownStringError as ActualDomainError);
      expect(analyzed.iconType).toBe(ErrorIcon.ALERT_CIRCLE);
      expect(analyzed.description.es).toBe('unknownErrorString');
    });

    it('should prioritize meta.icon explicit icon', () => {
      const explicitIconError = {
        ...mockDomainError,
        friendlyDesc: mockIntlBase,
        meta: { ...mockMeta, icon: ErrorIcon.TRY_AGAIN_OR_CONTACT }
      };
      const analyzed = analyzeError(explicitIconError as ActualDomainError);
      expect(analyzed.iconType).toBe(ErrorIcon.TRY_AGAIN_OR_CONTACT);
    });

    it('should detect icon by meta.desc (credentials)', () => {
      const credentialsError = {
        ...mockDomainError,
        friendlyDesc: mockIntlBase,
        meta: { ...mockMeta, desc: { es: 'credenciales inválidas', en: 'invalid credentials', ca: 'credencials invàlides', de: 'ungültige Anmeldeinformationen' } }
      };
      const analyzed = analyzeError(credentialsError as ActualDomainError);
      expect(analyzed.iconType).toBe(ErrorIcon.CREDENTIALS);
    });

    it('should detect icon by meta.desc (tryAgainOrContact)', () => {
      const tryAgainError = {
        ...mockDomainError,
        friendlyDesc: mockIntlBase,
        meta: { ...mockMeta, desc: { es: 'ups, un error ha ocurrido', en: 'oops, an error occurred', ca: 'ups, ha ocorregut un error', de: 'ups, ein Fehler ist aufgetreten' } }
      };
      const analyzed = analyzeError(tryAgainError as ActualDomainError);
      expect(analyzed.iconType).toBe(ErrorIcon.TRY_AGAIN_OR_CONTACT);
    });

    it('should use alert-circle as fallback icon', () => {
      const fallbackIconError = {
        ...mockDomainError,
        friendlyDesc: mockIntlBase,
        meta: { ...mockMeta, desc: { es: 'otro tipo de error', en: 'other type of error', ca: 'altre tipus d\'error', de: 'andere Art von Fehler' } }
      };
      const analyzed = analyzeError(fallbackIconError as ActualDomainError);
      expect(analyzed.iconType).toBe(ErrorIcon.ALERT_CIRCLE);
    });

    it('should use overrideTitle and overrideDescription', () => {
      const overrideTitle = { es: 'Título Personalizado', en: 'Custom Title', ca: 'Títol Personalitzat', de: 'Benutzerdefinierter Titel' };
      const overrideDescription = { es: 'Descripción Personalizada', en: 'Custom Description', ca: 'Descripció Personalitzada', de: 'Benutzerdefinierte Beschreibung' };
      const analyzed = analyzeError(mockDomainError, overrideTitle, overrideDescription);
      expect(analyzed.title).toEqual(overrideTitle);
      expect(analyzed.description).toEqual(overrideDescription);
    });
  });
});
