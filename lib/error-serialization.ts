import type { DomainError } from "@skrteeeeee/profile-domain";
import type { IntlBase } from "@skrteeeeee/profile-domain";

/**
 * Error serializado que puede pasar de Server a Client
 * Solo contiene datos primitivos (JSON-serializable)
 */
export type SerializedError = {
  type: string;
  friendlyDesc: string | IntlBase | 'd' | 'tryAgainOrContact' | 'credentials' | 'credentials--mock' | undefined;
  meta?: {
    entity?: string;
    desc?: IntlBase;
    optionalMessage?: string;
    silent?: boolean;
    [key: string]: unknown;
  };
  timestamp: number;
};

/**
 * Serializa un DomainError para que pueda pasarse del servidor al cliente
 * 
 * @param error - DomainError a serializar
 * @returns Objeto JSON-serializable
 */
export function serializeError(error: DomainError): SerializedError {
  return {
    type: error.type,
    friendlyDesc: error.friendlyDesc,
    meta: error.meta,
    timestamp: error.timestamp,
  };
}

/**
 * Deserializa un error para reconstruir un objeto compatible con DomainError
 * 
 * @param serialized - Error serializado
 * @returns Objeto que puede usarse con useErrorToast
 */
export function deserializeError(serialized: SerializedError): DomainError {
  return {
    name: 'DomainError',
    type: serialized.type,
    friendlyDesc: serialized.friendlyDesc,
    meta: serialized.meta,
    timestamp: serialized.timestamp,
    success: false,
    location: null as never, // No disponible en cliente
    func: 'deserialized',
    message: serialized.meta?.optionalMessage || 'Error from server',
  } as unknown as DomainError;
}

/**
 * Verifica si un error es un DomainError
 */
export function isDomainError(error: unknown): error is DomainError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'type' in error &&
    'friendlyDesc' in error &&
    'timestamp' in error
  );
}

/**
 * Tipo de acción a tomar según el error
 */
export type ErrorAction = 'throw' | 'toast' | 'silent';

/**
 * Analiza un DomainError y decide qué acción tomar
 * 
 * @param error - Error a analizar
 * @returns Acción a ejecutar y error serializado (si aplica)
 */
export function analyzeError(error: unknown): {
  action: ErrorAction;
  serializedError?: SerializedError;
} {
  // Si no es DomainError, lanzar (Error no controlado)
  if (!isDomainError(error)) {
    return { action: 'throw' };
  }

  const domainError = error as DomainError;
  const { friendlyDesc } = domainError;

  // 1. friendlyDesc === undefined → Backend caído → ErrorBoundary
  if (!friendlyDesc) {
    return { action: 'throw' };
  }

  // 2. friendlyDesc === 'd' → Error silencioso (solo logs)
  if (typeof friendlyDesc === 'string' && friendlyDesc === 'd') {
    return { action: 'silent' };
  }

  // 3. friendlyDesc con valor → Toast al usuario
  return {
    action: 'toast',
    serializedError: serializeError(domainError),
  };
}
