import { GenerateLoginPayloadParams, LoginPayload, VerifyLoginPayloadParams } from "thirdweb/auth";
import { authRepository } from "@log-ui/core/presentation/services/auth.service";
import { ExtendedJWTPayload, JWTContext } from "../../interfaces/services/auth";
import { RoleType, createDomainError, ErrorCodes } from "@skrteeeeee/profile-domain";

// ========================================
// BASIC OPERATIONS (delegación directa)
// ========================================

export const logoutUC = async () => {
    return authRepository.logout()
}

export const getCookiesUC = async (): Promise<ExtendedJWTPayload|false> => {
    return authRepository.getCookies()
}

export const generatePayloadUC = async (payload: GenerateLoginPayloadParams): Promise<LoginPayload> => {
    return authRepository.generatePayload(payload)
}

export const setJwtUC = async (payload: VerifyLoginPayloadParams, context: JWTContext): Promise<ExtendedJWTPayload> => {
    return authRepository.setJwt(payload, context)
}

export const verifyPayloadUC = async (params: VerifyLoginPayloadParams) => {
    return authRepository.verifyPayload(params)
}

// ========================================
// BUSINESS LOGIC (reglas de negocio)
// ========================================

/**
 * Realiza el login completo del usuario
 * LÓGICA DE NEGOCIO: Orquesta login → setJWT → mapeo de datos
 */
export const loginUC = async (payload: VerifyLoginPayloadParams) => {
    // Importación dinámica para evitar dependencia circular
    const { apiLoginUserUC } = await import("../entities/user");
    
    const res = await apiLoginUserUC({payload});
    if(!res || !res.success) {
        throw createDomainError(
            ErrorCodes.UNAUTHORIZED_ACTION,
            loginUC,
            "loginUC",
            "credentials",
            { optionalMessage: res?.message || "Login failed" }
        );
    }
    
    // Guardar JWT con los datos del usuario
    const jwt = await setJwtUC(payload, {
        role: res.data.role,
        nick: res.data.nick,
        id: res.data.id,
        img: res.data.img || undefined
    });
    
    // Retornar los datos completos del usuario
    return {
        jwt,
        userData: {
            id: res.data.id,
            nick: res.data.nick,
            img: res.data.img,
            email: res.data.email,
            address: res.data.address,
            role: res.data.role,
            isVerified: res.data.isVerified,
            solicitud: res.data.solicitud
        }
    };
}

/**
 * Verifica si el usuario está logueado
 * LÓGICA DE NEGOCIO: Define qué significa "estar logueado"
 */
export const isLoggedInUC = async (): Promise<boolean> => {
    const cookies = await authRepository.getCookies();
    return cookies !== false;
}

/**
 * Verifica si el usuario es administrador
 * LÓGICA DE NEGOCIO: Define qué significa "ser admin"
 */
export const isAdminUC = async (): Promise<boolean> => {
    const cookies = await authRepository.getCookies();
    return cookies !== false && cookies.ctx?.role === RoleType.ADMIN;
}

/**
 * Protege una acción requiriendo que el usuario esté logueado
 * LÓGICA DE NEGOCIO: Validación + error si no está logueado
 */
export const protLogActUC = async (): Promise<ExtendedJWTPayload> => {
    const cookies = await authRepository.getCookies();
    if (!cookies) {
        throw createDomainError(
            ErrorCodes.UNAUTHORIZED_ACTION,
            protLogActUC,
            "protLogActUC",
            {
                es: "Debes iniciar sesión",
                en: "Must log in",
                ca: "Has d'iniciar sessió",
                de: "Du musst dich anmelden"
            },
            { optionalMessage: "User must be logged in" }
        );
    }
    return cookies;
}

/**
 * Protege una acción requiriendo que el usuario sea administrador
 * LÓGICA DE NEGOCIO: Validación + error si no es admin
 */
export const protAdmActUC = async (): Promise<true> => {
    const isAdmin = await isAdminUC();
    if (!isAdmin) {
        throw createDomainError(
            ErrorCodes.UNAUTHORIZED_ACTION,
            protAdmActUC,
            "protAdmActUC",
            {
                es: "Necesitas permisos de administrador",
                en: "Admin access required",
                ca: "Necessites permisos d'administrador",
                de: "Administratorrechte erforderlich"
            },
            { optionalMessage: "Must be admin" }
        );
    }
    return true;
}

/**
 * Protege una ruta requiriendo que el usuario esté logueado
 * LÓGICA DE NEGOCIO: Validación de acceso a ruta
 */
export const protLogRouUC = async (path: string): Promise<ExtendedJWTPayload> => {
    const cookies = await authRepository.getCookies();
    if (cookies === false) {
        throw createDomainError(
            ErrorCodes.UNAUTHORIZED_ACTION,
            protLogRouUC,
            "protLogRouUC",
            {
                es: "Debes iniciar sesión para acceder",
                en: "Must log in to access this route",
                ca: "Has d'iniciar sessió per accedir",
                de: "Du musst dich anmelden, um zuzugreifen"
            },
            { optionalMessage: `Route access denied: ${path}` }
        );
    }
    return cookies;
}

/**
 * Protege una ruta requiriendo que el usuario sea administrador
 * LÓGICA DE NEGOCIO: Validación de acceso admin a ruta
 */
export const protAdmRouUC = async (path: string): Promise<ExtendedJWTPayload> => {
    const cookies = await authRepository.getCookies();
    if (cookies === false || cookies.ctx?.role !== RoleType.ADMIN) {
        throw createDomainError(
            ErrorCodes.UNAUTHORIZED_ACTION,
            protAdmRouUC,
            "protAdmRouUC",
            {
                es: "Necesitas permisos de administrador",
                en: "Admin access required",
                ca: "Necessites permisos d'administrador",
                de: "Administratorrechte erforderlich"
            },
            { optionalMessage: `Admin route access denied: ${path}` }
        );
    }
    return cookies;
}
