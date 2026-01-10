import { JSX } from "react";
/**
 * Configuration for micro-frontends in the apps menu
 */
interface AppConfig {
  id: string;
  url: {
    dev: string;
    prod: string;
  };
  featured?: boolean;
}



export const APPS_CONFIG: AppConfig[] = [
  {
    id: "profile",
    url: {
      dev: "http://localhost:3000",
      prod: "https://dev.desarollador.tech",
    },
  },
  {
    id: "agora",
    url: {
      dev: "http://localhost:3002",
      prod: "https://agora.desarollador.tech",
    },
  },
  {
    id: "admin",
    url: {
      dev: "http://localhost:3004",
      prod: "https://profile-skrt.vercel.app/es/admin",
    },
  },
];

/**
 * Configuration for the SiteHeader component
 * - Should be used for the SiteHeader component in the Micro-frontend apps
 */
export type SiteHeaderConfig = {
  name: string;
  icon: JSX.Element;
  paths: {
    id: string;
    path: string;
  }[];
}
// Helper function to compare URLs by origin (protocol + hostname + port)
export function urlsMatch(url1: string, url2: string): boolean {
  try {
    const u1 = new URL(url1);
    const u2 = new URL(url2);
    return u1.origin === u2.origin;
  } catch {
    // Handle invalid URLs gracefully
    return false;
  }
}

/**
 * Detect current app based on URL or environment
 */
export function getCurrentApp(): string | null {
  const isDevEnvironment = process.env.NODE_ENV === "development";

  if (typeof window === "undefined") {
    // Server-side: use environment variable
    const currentBaseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (!currentBaseUrl) return null;

    for (const app of APPS_CONFIG) {
      const appUrl = isDevEnvironment ? app.url.dev : app.url.prod;
      if (urlsMatch(currentBaseUrl, appUrl)) {
        return app.id;
      }
    }
    return null;
  } else {
    // Client-side: use window.location
    const currentOrigin = window.location.origin;

    for (const app of APPS_CONFIG) {
      const appUrl = isDevEnvironment ? app.url.dev : app.url.prod;
      if (urlsMatch(currentOrigin, appUrl)) {
        return app.id;
      }
    }
    return null;
  }
}

/**
 * Get URL for an app based on environment
 */
export function getAppUrl(appId: string): string {
  const app = APPS_CONFIG.find((a) => a.id === appId);
  if (!app) return "#";

  const isDev = process.env.NODE_ENV === "development";
  return isDev ? app.url.dev : app.url.prod;
}

/**
 * Get featured app configuration
 */
// export function getFeaturedApp(): AppConfig | undefined {
//   return APPS_CONFIG.find((app) => app.featured);
// }

/**
 * Get non-featured apps
 */
// export function getSecondaryApps(): AppConfig[] {
//   return APPS_CONFIG.filter((app) => !app.featured);
// }
