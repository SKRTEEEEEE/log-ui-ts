import { createThirdwebClient, type ThirdwebClient } from "thirdweb";

let cachedClient: ThirdwebClient | null = null;

export function getThirdwebClient(options?: { client?: ThirdwebClient; clientId?: string }) {
  if (options?.client) {
    return options.client;
  }

  if (cachedClient) {
    return cachedClient;
  }

  const clientId = options?.clientId ?? process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;
  if (!clientId) {
    throw new Error("Missing NEXT_PUBLIC_THIRDWEB_CLIENT_ID environment variable or client instance");
  }

  cachedClient = createThirdwebClient({ clientId });
  return cachedClient;
}
