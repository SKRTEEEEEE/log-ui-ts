"use server"

import { getCurrentUserUC } from "@log-ui/core/application/usecases/entities/user"
import { generatePayloadUC, isLoggedInUC, loginUC } from "@log-ui/core/application/usecases/services/auth"
import { GenerateLoginPayloadParams, LoginPayload, VerifyLoginPayloadParams } from "thirdweb/auth"


export async function isLoggedIn() {
    return await isLoggedInUC()
}
export async function generatePayload(address: GenerateLoginPayloadParams): Promise<LoginPayload> {
    return await generatePayloadUC(address)
}
export async function login(payload: VerifyLoginPayloadParams) {
    return await loginUC(payload);
}

export async function getUserData() {
    return await getCurrentUserUC();
}
