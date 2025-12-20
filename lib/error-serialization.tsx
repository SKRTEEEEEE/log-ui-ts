import type { DomainError } from "@skrteeeeee/profile-domain";
import type { IntlBase } from "@skrteeeeee/profile-domain";

/**
 * Enum para identificadores de iconos
 */
export enum ErrorIcon {
  CREDENTIALS = 'credentials',
  TRY_AGAIN_OR_CONTACT = 'tryAgainOrContact',
  ALERT_CIRCLE = 'alert-circle'
}

/**
 * Tipo para iconos (enum + undefined)
 */
export type IconType = ErrorIcon | undefined;

/**
 * Error serializado que puede pasar de Server a Client
 * Solo contiene datos primitivos (JSON-serializable)
 */
export type SerializedError = {
  type: string;
  title: IntlBase;       // Título del toast
  description: IntlBase; // Descripción del toast (antes friendlyDesc)
  iconType?: IconType;   // Identificador del icono (serializable)
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
 * DEPRECATED: Usar analyzeError() en su lugar
 * 
 * @param error - DomainError a serializar
 * @returns Objeto JSON-serializable
 */
export function serializeError(error: DomainError): SerializedError {
  const defaultTitle: IntlBase = { es: 'Error', en: 'Error', ca: 'Error', de: 'Fehler' };
  const friendlyDesc = error.friendlyDesc;
  
  if (typeof friendlyDesc === 'object') {
    return {
      type: error.type,
      title: (error.meta?.desc as IntlBase) || defaultTitle,
      description: friendlyDesc,
      meta: error.meta,
      timestamp: error.timestamp,
    };
  }
  
  return {
    type: error.type,
    title: defaultTitle,
    description: { es: String(friendlyDesc), en: String(friendlyDesc), ca: String(friendlyDesc), de: String(friendlyDesc) },
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
    friendlyDesc: serialized.description, // Usar description
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
 * Mensajes predefinidos con título + descripción + iconType
 */
const PREDEFINED_MESSAGES: Record<string, {
  title: IntlBase;
  description: IntlBase;
  iconType: ErrorIcon;
}> = {
  'tryAgainOrContact': {
    iconType: ErrorIcon.TRY_AGAIN_OR_CONTACT,
    title: {
      es: "Error del servidor",
      en: "Server error",
      ca: "Error del servidor",
      de: "Serverfehler"
    },
    description: {
      es: "Inténtalo de nuevo más tarde o contáctanos si persiste.",
      en: "Try again later or contact us if it persists.",
      ca: "Torna-ho a provar més tard o contacta'ns si persisteix.",
      de: "Versuche es später erneut oder kontaktiere uns."
    }
  },
  'credentials': {
    iconType: ErrorIcon.CREDENTIALS,
    title: {
      es: "Credenciales inválidas",
      en: "Invalid credentials",
      ca: "Credencials invàlides",
      de: "Ungültige Anmeldedaten"
    },
    description: {
      es: "Las credenciales proporcionadas no son correctas.",
      en: "The provided credentials are incorrect.",
      ca: "Les credencials proporcionades no són correctes.",
      de: "Die angegebenen Anmeldedaten sind falsch."
    }
  },
  'credentials--mock': {
    iconType: ErrorIcon.CREDENTIALS,
    title: {
      es: "Credenciales inválidas",
      en: "Invalid credentials",
      ca: "Credencials invàlides",
      de: "Ungültige Anmeldedaten"
    },
    description: {
      es: "Credenciales inválidas (modo demostración).",
      en: "Invalid credentials (demo mode).",
      ca: "Credencials invàlides (mode demostració).",
      de: "Ungültige Anmeldedaten (Demomodus)."
    }
  }
};

/**
 * Analiza un DomainError y decide qué hacer
 * SIEMPRE devuelve SerializedError con título + descripción + icono (o lanza)
 * 
 * @param error - Error a analizar
 * @param overrideTitle - Título personalizado opcional (reemplaza el predefinido)
 * @param overrideDescription - Descripción personalizada opcional (reemplaza el predefinido)
 * @returns SerializedError con estructura completa para toast
 * @throws Error si no es DomainError o friendlyDesc === undefined
 */
export function analyzeError(
  error: unknown,
  overrideTitle?: IntlBase,
  overrideDescription?: IntlBase
): SerializedError {
  // 1. Si NO es DomainError → ErrorBoundary de Next.js
  if (!isDomainError(error)) {
    console.error('[analyzeError] Non-DomainError detected:', error);
    throw error;
  }

  const domainError = error as DomainError;
  const { friendlyDesc } = domainError;

  // 2. friendlyDesc === undefined → ErrorBoundary
  if (!friendlyDesc) {
    throw error;
  }

  // Título por defecto genérico
  const defaultTitle: IntlBase = { 
    es: 'Error', 
    en: 'Error', 
    ca: 'Error', 
    de: 'Fehler' 
  };

  // 3. friendlyDesc === 'd' → Silent (marca especial)
  if (typeof friendlyDesc === 'string' && friendlyDesc === 'd') {
    return {
      type: domainError.type,
      title: { es: '', en: '', ca: '', de: '' },
      description: { es: 'd', en: 'd', ca: 'd', de: 'd' },
      meta: { ...domainError.meta, silent: true },
      timestamp: domainError.timestamp
    };
  }

  // 4. friendlyDesc es string predefinido → Convertir a estructura completa
  // NOTA: En la práctica, este caso raramente se ejecuta porque profile-domain
  // expande los strings predefinidos a IntlBase antes de crear el DomainError
  if (typeof friendlyDesc === 'string') {
    const predefined = PREDEFINED_MESSAGES[friendlyDesc];
    
    if (!predefined) {
      return {
        type: domainError.type,
        title: overrideTitle || defaultTitle,
        description: overrideDescription || { 
          es: friendlyDesc, 
          en: friendlyDesc, 
          ca: friendlyDesc, 
          de: friendlyDesc 
        },
        iconType: ErrorIcon.ALERT_CIRCLE, // Default icon para strings no predefinidos
        meta: domainError.meta,
        timestamp: domainError.timestamp
      };
    }

    return {
      type: domainError.type,
      title: overrideTitle || predefined.title,
      description: overrideDescription || predefined.description,
      iconType: predefined.iconType,
      meta: domainError.meta,
      timestamp: domainError.timestamp
    };
  }

  // 5. friendlyDesc ya es IntlBase → Detectar icono por meta.icon o meta.desc
  // CASO MÁS COMÚN: profile-domain expande strings predefinidos a IntlBase con meta.desc
  // Por ejemplo: 'credentials' → { friendlyDesc: {...}, meta: { desc: 'Credenciales inválidas' } }
  const metaIcon = domainError.meta?.icon as ErrorIcon | string | undefined;
  const metaDesc = domainError.meta?.desc as IntlBase | undefined;
  let iconType: IconType;
  
  // Prioridad 1: meta.icon explícito (cuando se especifica manualmente)
  if (metaIcon) {
    // Convertir string a enum si coincide
    switch (metaIcon) {
      case 'credentials':
      case ErrorIcon.CREDENTIALS:
        iconType = ErrorIcon.CREDENTIALS;
        break;
      case 'tryAgainOrContact':
      case ErrorIcon.TRY_AGAIN_OR_CONTACT:
        iconType = ErrorIcon.TRY_AGAIN_OR_CONTACT;
        break;
      case 'alert-circle':
      case ErrorIcon.ALERT_CIRCLE:
        iconType = ErrorIcon.ALERT_CIRCLE;
        break;
      default:
        iconType = ErrorIcon.ALERT_CIRCLE;
    }
  } 
  // Prioridad 2: Detectar por meta.desc (strings predefinidos expandidos por profile-domain)
  else if (metaDesc?.es) {
    const desc = metaDesc.es.toLowerCase();
    if (desc.startsWith('credencial')) {
      iconType = ErrorIcon.CREDENTIALS;
    } else if (desc.startsWith('ups')) {
      iconType = ErrorIcon.TRY_AGAIN_OR_CONTACT;
    } else {
      iconType = ErrorIcon.ALERT_CIRCLE;
    }
  } 
  // Prioridad 3: Fallback a alert-circle
  else {
    iconType = ErrorIcon.ALERT_CIRCLE;
  }
  
  return {
    type: domainError.type,
    title: overrideTitle || (domainError.meta?.desc as IntlBase) || defaultTitle,
    description: overrideDescription || friendlyDesc,
    iconType,
    meta: domainError.meta,
    timestamp: domainError.timestamp
  };
}
