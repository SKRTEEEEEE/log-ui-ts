// infrastructure/services/thirdweb-auth.ts

import { GenerateLoginPayloadParams, LoginPayload, VerifyLoginPayloadParams, VerifyLoginPayloadResult } from "thirdweb/auth";
import { ThirdwebAuthAdapter } from "../connectors/thirdweb-auth";
import { RoleType, createDomainError, ErrorCodes } from "@skrteeeeee/profile-domain";
import { AuthRepository, ExtendedJWTPayload, JWTContext } from "@log-ui/core/application/interfaces/services/auth";
import { CookieProvider } from "@log-ui/core/application/interfaces/services/cookie-provider";

class ThirdwebAuthRepository extends ThirdwebAuthAdapter implements AuthRepository {
  constructor(private cookieProvider: CookieProvider) {
    super();
  }

  async logout(): Promise<void> {
    await this.cookieProvider.delete("jwt");
  }

  async setJwt(payload: VerifyLoginPayloadParams, context: JWTContext): Promise<ExtendedJWTPayload> {
    const verifiedPayload = await this.thirdwebAuth.verifyPayload(payload);
    if (!verifiedPayload.valid) throw createDomainError(
      ErrorCodes.UNAUTHORIZED_ACTION,
      ThirdwebAuthRepository,
      "setJwt",
      "credentials",
      { optionalMessage: "Invalid login payload" }
    )
    
    const jwt = await this.thirdwebAuth.generateJWT({
      payload: verifiedPayload.payload,
      context
    });
    
    await this.cookieProvider.set("jwt", jwt);
    const authRes = await this.thirdwebAuth.verifyJWT({jwt});
    if(!authRes.valid) throw createDomainError(
      ErrorCodes.UNAUTHORIZED_ACTION,
      ThirdwebAuthRepository,
      "setJwt",
      "credentials",
      { optionalMessage: "Invalid JWT login token" }
    )
    return authRes.parsedJWT as ExtendedJWTPayload
  }
  async generatePayload(params: GenerateLoginPayloadParams): Promise<LoginPayload>  {
    return this.thirdwebAuth.generatePayload(params)
  }
  async verifyPayload(params: VerifyLoginPayloadParams): Promise<VerifyLoginPayloadResult> {
    return this.thirdwebAuth.verifyPayload(params)
  }
  
  async getCookies(): Promise<ExtendedJWTPayload | false> {
    const jwt = await this.cookieProvider.get("jwt");
    if (!jwt) return false;
    const result = await this.thirdwebAuth.verifyJWT({ jwt });
    return result.valid ? result.parsedJWT as ExtendedJWTPayload : false;
  }
}

// Export factory function instead of singleton - allows DI from presentation layer
export const createAuthRepository = (cookieProvider: CookieProvider) => {
  return new ThirdwebAuthRepository(cookieProvider);
}
