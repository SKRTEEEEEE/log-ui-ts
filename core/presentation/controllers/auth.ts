"use server"

import { apiLoginUserUC, apiReadUserByIdUC } from "@log-ui/core/application/usecases/entities/user"
import { generatePayloadUC, getCookiesUC, isLoggedInUC, logoutUC, protAdmActUC, setJwtUC } from "@log-ui/core/application/usecases/services/auth"
import { GenerateLoginPayloadParams, LoginPayload, VerifyLoginPayloadParams } from "thirdweb/auth"
import { createDomainError, ErrorCodes } from "@skrteeeeee/profile-domain"


export async function isLoggedIn(){
    return await isLoggedInUC()
}
export async function generatePayload(address: GenerateLoginPayloadParams): Promise<LoginPayload>{
    return await generatePayloadUC(address)
}
export async function logout(){
    await logoutUC()
}
export async function login(payload: VerifyLoginPayloadParams){
    const res = await apiLoginUserUC({payload})
    if(!res || !res.success) throw createDomainError(
        ErrorCodes.UNAUTHORIZED_ACTION,
        login,
        "login",
        "credentials"
    )
    
    // Guardar JWT con los datos del usuario
    const jwt = await setJwtUC(
      payload,
      {
        role: res.data.role,
        nick: res.data.nick,
        id: res.data.id,
        img: res.data.img || undefined
      }
    );
    
    // Retornar los datos completos del usuario directamente del login
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
    }
}

export async function protAdmAct(){
    return await protAdmActUC()
}

export async function getCookies(){
    return await getCookiesUC()
}

export async function getUserData() {
    try {
        const cookies = await getCookiesUC()
        if (!cookies || !cookies.ctx) return null
        
        // Obtener datos completos del usuario desde el backend
        const userData = await apiReadUserByIdUC(cookies.ctx.id)
        if (!userData || !userData.success) return null
        
        return {
            id: userData.data.id,
            nick: userData.data.nick,
            img: userData.data.img,
            email: userData.data.email,
            address: userData.data.address,
            role: userData.data.role,
            isVerified: userData.data.isVerified,
            solicitud: userData.data.solicitud
        }
    } catch (error) {
        throw createDomainError(
            ErrorCodes.DATABASE_FIND,
            getUserData,
            "getUserData",
            "tryAgainOrContact",
            { optionalMessage: error instanceof Error ? error.message : String(error) }
        )
    }
}
