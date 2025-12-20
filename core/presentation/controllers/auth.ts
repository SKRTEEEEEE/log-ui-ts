"use server"

import { getCurrentUserUC } from "@log-ui/core/application/usecases/entities/user"
import { generatePayloadUC, getCookiesUC, isLoggedInUC, logoutUC, protAdmActUC, loginUC } from "@log-ui/core/application/usecases/services/auth"
import { GenerateLoginPayloadParams, LoginPayload, VerifyLoginPayloadParams } from "thirdweb/auth"


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
    // try {
        return await loginUC(payload);
    // } catch (error) {
    //     // Serializar el error para que llegue al cliente
    //     // Las Server Actions no pueden devolver instancias de Error
    //     if (error && typeof error === 'object' && 'type' in error) {
    //         // Es un DomainError, devolverlo como objeto plano
    //         return {
    //             error: true,
    //             errorData: {
    //                 type: (error as any).type,
    //                 friendlyDesc: (error as any).friendlyDesc,
    //                 meta: (error as any).meta,
    //                 timestamp: (error as any).timestamp,
    //             }
    //         };
    //     }
    //     // Error genérico
    //     throw error;
    // }
}

export async function protAdmAct(){
    return await protAdmActUC()
}

export async function getCookies(){
    return await getCookiesUC()
}

export async function getUserData() {
    return await getCurrentUserUC();
}
