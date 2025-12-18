/**
 * Configuration for micro-frontends in the apps menu
 */

export interface AppConfig {
  id: string;
  title: string;
  description: string;
  url: {
    dev: string;
    prod: string;
  };
  featured?: boolean;
}

export const APPS_CONFIG: AppConfig[] = [
  {
    id: "profile",
    title: "Desarrollador",
    description: "Información sobre el desarrollador y su experiencia.",
    url: {
      dev: "http://localhost:3000",
      prod: "https://dev.desarrollador.tech",
    },
  },
  {
    id: "agora",
    title: "Blog",
    description: "Blog y formación para desarrolladores. SaaS de muestra.",
    url: {
      dev: "http://localhost:3002",
      prod: "https://agora.desarrollador.tech",
    },
  },
  {
    id: "admin",
    title: "Dashboard Admin",
    description: "Panel de administración.",
    url: {
      dev: "http://localhost:3004",
      prod: "https://profile-skrt.vercel.app/es/admin",
    },
  },
];

/**
 * Detect current app based on URL or environment
 */
export function getCurrentApp(): string | null {
  if (typeof window === "undefined") {
    // Server-side: use environment variable
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (!baseUrl) return null;

    // Match by URL pattern
    if (baseUrl.includes("3000") || baseUrl.includes("dev.desarrollador")) {
      return "profile";
    }
    if (baseUrl.includes("3002") || baseUrl.includes("agora.desarrollador")) {
      return "agora";
    }
    if (baseUrl.includes("3003") || baseUrl.includes("admin")) {
      return "admin";
    }
    return null;
  }

  // Client-side: use window.location
  const { hostname, port } = window.location;

  // Match by port in dev
  if (port === "3000" || hostname.includes("dev.desarrollador")) {
    return "profile";
  }
  if (port === "3002" || hostname.includes("agora.desarrollador")) {
    return "agora";
  }
  if (port === "3003" || hostname.includes("admin")) {
    return "admin";
  }

  return null;
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
export function getFeaturedApp(): AppConfig | undefined {
  return APPS_CONFIG.find((app) => app.featured);
}

/**
 * Get non-featured apps
 */
export function getSecondaryApps(): AppConfig[] {
  return APPS_CONFIG.filter((app) => !app.featured);
}
