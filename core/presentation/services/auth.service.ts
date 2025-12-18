// Presentation layer service - instantiates auth repository with Next.js cookie provider
import { createAuthRepository } from "@log-ui/core/infrastructure/services/thirdweb-auth";
import { nextCookieAdapter } from "../adapters/next-cookie.adapter";

// Create auth repository instance with Next.js cookie adapter
export const authRepository = createAuthRepository(nextCookieAdapter);
