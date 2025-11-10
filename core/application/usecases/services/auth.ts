import { GenerateLoginPayloadParams, LoginPayload, VerifyLoginPayloadParams } from "thirdweb/auth";
import { authRepository } from "@log-ui/core/infrastructure/services/thirdweb-auth";
import { AuthRepository, ExtendedJWTPayload, JWTContext } from "../../interfaces/services/auth";

abstract class UseAuth {
    constructor(protected authRepository: AuthRepository){}
}
class Logout extends UseAuth {
    async execute(): Promise<void> {
        this.authRepository.logout()
    }
}
export const logoutUC = async () => {
    const l = new Logout(authRepository)
    await l.execute()
}
class GetCookies extends UseAuth {
    async execute(): Promise<ExtendedJWTPayload|false>{
        return this.authRepository.getCookies()
    }
}
export const getCookiesUC = async () => {
    const g = new GetCookies(authRepository)
    return g.execute()
}
class IsLoggedIn extends UseAuth {
    async execute(): Promise<boolean>{
        return this.authRepository.isLoggedIn()
    }
}
export const isLoggedInUC = async (): Promise<boolean> => {
    const i = new IsLoggedIn(authRepository)
    return await i.execute()
} 
class ProtAdmAct extends UseAuth {
    async execute(): Promise<true>{
        return this.authRepository.protAdmAct()
    }
}
export const protAdmActUC = async () => {
    const p = new ProtAdmAct(authRepository)
    return p.execute()
}
class GeneratePayload extends UseAuth {
    async execute(address:GenerateLoginPayloadParams): Promise<LoginPayload> {
        return this.authRepository.generatePayload(address)
    }
}
export const generatePayloadUC = async (payload: GenerateLoginPayloadParams): Promise<LoginPayload> => {
    const g = new GeneratePayload(authRepository)
    return await g.execute(payload)
}
class SetJwt extends UseAuth {
    async execute(payload: VerifyLoginPayloadParams, context:JWTContext): Promise<ExtendedJWTPayload>{
        return await this.authRepository.setJwt(payload, context)
    }
}
export const setJwtUC = async (payload: VerifyLoginPayloadParams, context:JWTContext)=> {
    const s = new SetJwt(authRepository)
    return await s.execute(payload,context)
}

export const verifyPayloadUC = async(params: VerifyLoginPayloadParams)=>{
    return await authRepository.verifyPayload(params)
}
