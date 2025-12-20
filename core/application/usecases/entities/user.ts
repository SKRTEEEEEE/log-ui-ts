import { VerifyLoginPayloadParams } from "thirdweb/auth";
import { ApiUserRepository, UserUpdateData } from "@log-ui/core/infrastructure/api/user.repository";
import { RoleType } from "@skrteeeeee/profile-domain";
import { nextCookieAdapter } from "@log-ui/core/presentation/adapters/next-cookie.adapter";
import { setJwtUC, getCookiesUC } from "../services/auth";

const apiUserRepository = new ApiUserRepository(process.env.NEXT_PUBLIC_BACKEND_URL);

// Helper to get JWT token string from cookies
const getJwtToken = async (): Promise<string | undefined> => {
    const jwtCookie = await nextCookieAdapter.get("jwt");
    return jwtCookie || undefined;
}

/**
 * Obtiene los datos completos del usuario actual desde cookies + backend
 * LÓGICA DE NEGOCIO: Orquestación de obtener cookies → buscar user → mapear
 * 
 * @returns User data si está autenticado y el backend responde, null en caso contrario
 * NO lanza errores - permite que la app funcione sin backend
 */
export const getCurrentUserUC = async () => {
    try {
        const cookies = await getCookiesUC();
        if (!cookies || !cookies.ctx) return null;
        
        // Obtener datos completos del usuario desde el backend
        const userData = await apiReadUserByIdUC(cookies.ctx.id);
        if (!userData || !userData.success) return null;
        
        return {
            id: userData.data.id,
            nick: userData.data.nick,
            img: userData.data.img,
            email: userData.data.email,
            address: userData.data.address,
            role: userData.data.role,
            isVerified: userData.data.isVerified,
            solicitud: userData.data.solicitud
        };
    } catch (error) {
        // NO lanzar error - devolver null para que la app siga funcionando sin backend
        // El error ya fue creado por apiReadUserByIdUC → repository
        console.warn('[getCurrentUserUC] Backend unavailable:', error instanceof Error ? error.message : String(error));
        return null;
    }
}

export const apiReadUserByIdUC = async (id: string) => {
    const jwt = await getJwtToken();
    return await apiUserRepository.readById(id, jwt)
}

export const apiReadUsersUC = async () => {
    const jwt = await getJwtToken();
    return await apiUserRepository.readAll(jwt)
}

export const apiLoginUserUC = async (data:{payload: VerifyLoginPayloadParams}) => {
    const jwt = await getJwtToken();
    return await apiUserRepository.login(data, jwt)
}

export const apiUpdateUserUC = async (data: {
    payload: VerifyLoginPayloadParams;
    formData: UserUpdateData;
}) => {
    const jwt = await getJwtToken();
    const res = await apiUserRepository.update(data, jwt);
    
    // LÓGICA DE NEGOCIO: Actualizar JWT con nuevos datos del usuario
    if (res && res.success && res.data) {
        await setJwtUC(data.payload, {
            nick: res.data.nick,
            id: res.data.id,
            role: res.data.role,
            img: res.data.img || undefined,
        });
    }
    
    return res;
}

export const apiDeleteUserUC = async (data: {
    payload: VerifyLoginPayloadParams;
    id: string;
    address: string;
}) => {
    const jwt = await getJwtToken();
    return await apiUserRepository.deleteById(data, jwt)
}

export const apiUpdateUserSolicitudUC = async (data: {
    id: string;
    solicitud: RoleType;
}) => {
    const jwt = await getJwtToken();
    return await apiUserRepository.updateSolicitud(data, jwt)
}

export const apiResendVerificationEmailUC = async (userI: {
    id: string;
    email: string;
}) => {
    const jwt = await getJwtToken();
    return await apiUserRepository.resendVerificationEmail(userI, jwt)
}
