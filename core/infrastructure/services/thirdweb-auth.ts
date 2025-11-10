// infrastructure/services/thirdweb-auth.ts


import { GenerateLoginPayloadParams, LoginPayload, VerifyLoginPayloadParams, VerifyLoginPayloadResult } from "thirdweb/auth";
import { ThirdwebAuthAdapter } from "../connectors/thirdweb-auth";
//Para hacer-lo bien estas funciones no se deberian usar aquí⚠️🧠👨‍🎓!
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { UnauthorizedError } from "@log-ui/core/domain/flows/domain.error";
import { RoleType } from "@log-ui/core/domain/entities/role.type";
import { AuthRepository, ExtendedJWTPayload, JWTContext } from "@log-ui/core/application/interfaces/services/auth";

class ThirdwebAuthRepository extends ThirdwebAuthAdapter implements AuthRepository {
  async logout(): Promise<void> {
    const res = await cookies()
    res.delete("jwt");
  }

  async setJwt(payload: VerifyLoginPayloadParams, context: JWTContext): Promise<ExtendedJWTPayload> {
    const verifiedPayload = await this.thirdwebAuth.verifyPayload(payload);
    if (!verifiedPayload.valid)throw new UnauthorizedError(ThirdwebAuthRepository,"login payload") 
        const jwt = await this.thirdwebAuth.generateJWT({
            payload: verifiedPayload.payload,
            context
          });
          (await cookies()).set("jwt", jwt);
          const authRes = await this.thirdwebAuth.verifyJWT({jwt});
        if(!authRes.valid)throw new UnauthorizedError(ThirdwebAuthRepository,"jwt login token")
        return authRes.parsedJWT as ExtendedJWTPayload
    
  }
  async generatePayload(params: GenerateLoginPayloadParams): Promise<LoginPayload>  {
    return this.thirdwebAuth.generatePayload(params)
  }
  async verifyPayload(params: VerifyLoginPayloadParams): Promise<VerifyLoginPayloadResult> {
    return this.thirdwebAuth.verifyPayload(params)
  }
  
  async getCookies(): Promise<ExtendedJWTPayload | false> {
    const jwt = (await cookies()).get("jwt");
    if (!jwt?.value) return false;
    const result = await this.thirdwebAuth.verifyJWT({ jwt: jwt.value });
    return result.valid ? result.parsedJWT as ExtendedJWTPayload : false;
  }
  
  async isLoggedIn(): Promise<boolean> {
    const cookies = await this.getCookies();
    return cookies !== false;
  }
  
  //Hay que revisar estas funciones!!⚠️⚠️
  async isAdmin(): Promise<boolean> {
    const cookies = await this.getCookies();
    return cookies !== false && cookies.ctx?.role === RoleType["ADMIN"];
  }
  async protAdmAct(): Promise<true> {
    const isAdmin = await this.isAdmin();
    if (!isAdmin) throw new UnauthorizedError(ThirdwebAuthRepository,"Must be admin")
    return isAdmin
    
  }
  //Esta función limitara a que el usuario sea el mismo que el que ha iniciado sesión
  async protLogAct(): Promise<ExtendedJWTPayload> {
    const cookies = await this.getCookies()
    if (!cookies) throw new UnauthorizedError(ThirdwebAuthRepository,"Must log in")
    return cookies
  }

  async protLogRou(path: string): Promise<ExtendedJWTPayload> {
    const cookies = await this.getCookies();
    if (cookies === false) redirect(path);
    return cookies;
  }

  async protAdmRou(path: string): Promise<ExtendedJWTPayload> {
    const cookies = await this.getCookies();
    if (cookies === false || cookies.ctx?.role !== RoleType.ADMIN) redirect(path);
    return cookies;
  }
}
export const authRepository = new ThirdwebAuthRepository()
