

import { cookies } from "next/headers";
import { CookieProvider } from "@log-ui/core/application/interfaces/services/cookie-provider";

// Next.js cookie adapter - implements CookieProvider using Next.js cookies
class NextCookieAdapter implements CookieProvider {
    async get(name: string): Promise<string | undefined> {
        const cookieStore = await cookies();
        return cookieStore.get(name)?.value;
    }

    async set(name: string, value: string): Promise<void> {
        const cookieStore = await cookies();
        cookieStore.set(name, value);
    }

    async delete(name: string): Promise<void> {
        const cookieStore = await cookies();
        cookieStore.delete(name);
    }
}

export const nextCookieAdapter = new NextCookieAdapter();
