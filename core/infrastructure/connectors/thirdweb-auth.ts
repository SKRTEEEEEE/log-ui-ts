import { createAuth } from "thirdweb/auth";
import { privateKeyToAccount } from "thirdweb/wallets";
import { createThirdwebClient, ThirdwebClient } from "thirdweb";
import { createDomainError, ErrorCodes } from "@skrteeeeee/profile-domain";


export class ThirdwebClientConfig {
    private clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;
    private _client: ThirdwebClient | null = null;
    
    private initialize() {
        if(!this.clientId) throw createDomainError(
            ErrorCodes.SET_ENV,
            ThirdwebClientConfig,
            "initialize",
            "tryAgainOrContact",
            { 
                variable: "NEXT_PUBLIC_THIRDWEB_CLIENT_ID",
                optionalMessage: "Thirdweb Client ID not found in environment variables"
            }
        )
        return createThirdwebClient({clientId: this.clientId})
    }
    
    public get client (): ThirdwebClient {
        if (!this._client) {
            this._client = this.initialize()
        }
        return this._client
    }
}

export abstract class ThirdwebAuthAdapter extends ThirdwebClientConfig{
    private privateKey = process.env.THIRDWEB_ADMIN_PRIVATE_KEY;
    private _thirdwebAuth: ReturnType<typeof createAuth> | null = null;
    private domain = process.env.NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN 
    
    private initializeAuth(): void {
        if (!this.privateKey) throw createDomainError(
            ErrorCodes.SET_ENV,
            ThirdwebAuthAdapter,
            "initializeAuth",
            "tryAgainOrContact",
            { 
                variable: "THIRDWEB_ADMIN_PRIVATE_KEY",
                optionalMessage: "Thirdweb admin private key not found in environment variables"
            }
        );
        if(!this.domain) throw createDomainError(
            ErrorCodes.SET_ENV,
            ThirdwebAuthAdapter,
            "initializeAuth",
            "tryAgainOrContact",
            { 
                variable: "NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN",
                optionalMessage: "Thirdweb auth domain not found in environment variables"
            }
        );
        try {
            this._thirdwebAuth = createAuth({
                domain: this.domain ,
                adminAccount: privateKeyToAccount({ client: this.client, privateKey: this.privateKey }),
            });
        } catch (error) {
            throw createDomainError(
                ErrorCodes.SHARED_ACTION,
                ThirdwebAuthAdapter,
                "initializeAuth",
                "tryAgainOrContact",
                { 
                    entity: "ThirdwebAuth",
                    optionalMessage: error instanceof Error ? error.message : String(error)
                }
            );
        }
    }

    // Método para asegurar que thirdwebAuth está inicializado antes de su uso
    protected get thirdwebAuth() {
        if (!this._thirdwebAuth) {
            this.initializeAuth();
        }
        if (!this._thirdwebAuth) {
            throw createDomainError(
                ErrorCodes.SHARED_ACTION,
                ThirdwebAuthAdapter,
                "thirdwebAuth",
                "tryAgainOrContact",
                { 
                    entity: "ThirdwebAuth",
                    optionalMessage: "ThirdwebAuth not initialized. Initialization failed or was not called."
                }
            );
        }
        return this._thirdwebAuth;
    }
}
