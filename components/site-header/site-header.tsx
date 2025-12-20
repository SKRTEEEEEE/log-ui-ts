import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ThemePopover from "../theme-popover";
import { Link } from "@/lib/i18n/routing";
import { getCurrentUserUC } from "@log-ui/core/application/usecases/entities/user";
import { MobileNav, type SiteNavConfig } from "./mobile-nav";
import { AppsMenu } from "./apps-menu";
import LocalSwitcher from "../local-switch";
import { Github,  Linkedin } from "lucide-react";
import { siteConfig } from "@/lib/log-ui-data";
import { getTranslations, getLocale } from "next-intl/server";
import { Suspense } from "react";
import { UserConnectSkeleton } from "./user-connect-wrapper";
import { CustomConnectButton } from "../custom-connect-button";
import { SectionFallbackProvider } from "../section-fallback-provider";
import { analyzeError } from "@log-ui/lib/error-serialization";

export async function SiteHeader() {
  const user = await getCurrentUserUC(); // Solo para MobileNav
  const locale = await getLocale() as "es" | "en" | "ca" | "de";
  const t = await getTranslations();
  const tUser = await getTranslations('userProfile');
  
  // Pre-translate strings for client component
  const walletTranslations = {
    yourWallet: tUser('yourWallet'),
    walletSettings: tUser('walletSettings'),
  };

  const dataSiteConfig: SiteNavConfig = {
    logo: {
      path: "/",
      render: (
        <>
          {siteConfig.icon}
          <span className="font-bold">{siteConfig.name}</span>
        </>
      ),
    },
    paths: siteConfig.paths.map(path => ({
      ...path,
      title: t(`nav.${path.id}`)
    })),
    icons: [
      {
        id: "github",
        path: "https://github.com/SKRTEEEEEE",
        title: "GitHub",
        render: (
          <>
            <Github className="h-4 w-4" />
            <span className="sr-only">GitHub</span>
          </>
        ),
        blank: true,
      },
      {
        id: "linkedin",
        path: "https://www.linkedin.com/in/adan-reh/",
        title: "Linkedin",
        render: (
          <>
            <Linkedin className="h-4 w-4" />
            <span className="sr-only">Linkedin</span>
          </>
        ),
        blank: true,
      },
    ],
  };

  return (
    <header className="z-10 sticky top-0 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <nav className="flex items-center space-x-4 lg:space-x-6">
          {/* Logo */}
          <Link
            href={dataSiteConfig.logo.path as never}
            className="hidden md:flex items-center gap-2"
          >
            {dataSiteConfig.logo.render}
          </Link>

          <AppsMenu />

          {/* Nav Links */}
          {dataSiteConfig.paths.map((path) => (
            <Link
              key={path.id}
              href={path.path as never}
              className="text-sm font-medium transition-colors hover:text-primary hidden md:inline-block"
            >
              {path.title}
            </Link>
          ))}
        </nav>

        <div className="flex flex-1 items-center justify-end space-x-2">
          <nav className="hidden md:flex items-center gap-2">
            {dataSiteConfig.icons.map((item) =>
              item.blank ? (
                <a
                  key={item.id}
                  href={item.path}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(
                    buttonVariants({ variant: "ghost" }),
                    "w-10 px-0 inline-flex"
                  )}
                >
                  {item.render}
                </a>
              ) : (
                <Link
                  key={item.id}
                  href={item.path as never}
                  className={cn(
                    buttonVariants({ variant: "ghost" }),
                    "w-10 px-0 inline-flex"
                  )}
                >
                  {item.render}
                </Link>
              )
            )}
          </nav>

          <div className="hidden w-40 md:block">
            <Suspense fallback={<UserConnectSkeleton />}>
              <UserConnectSection
                connectButtonLabel={t("auth.login")}
                locale={locale}
                walletTranslations={walletTranslations}
              />
            </Suspense>
          </div>

          {/* Language Switcher */}
          <LocalSwitcher />

          {/* Theme Toggle */}
          <ThemePopover />
          <MobileNav dataSiteConfig={dataSiteConfig} user={user} />
        </div>
      </div>
    </header>
  );
}

/**
 * Server Component que maneja la carga del usuario y errores
 * Usa SectionFallbackProvider para mostrar toast automático en caso de error
 */
async function UserConnectSection({
  connectButtonLabel,
  locale,
  walletTranslations,
}: {
  connectButtonLabel: string;
  locale: "es" | "en" | "ca" | "de";
  walletTranslations: { yourWallet: string; walletSettings: string };
}) {
  try {
    const user = await getCurrentUserUC();
    
    return (
      <CustomConnectButton
        connectButtonLabel={connectButtonLabel}
        initialUser={user}
        locale={locale}
        walletTranslations={walletTranslations}
      />
    );
  } catch (error) {
    const serializedError = analyzeError(error);
    
    // Si es error silencioso ('d'), solo mostrar skeleton sin toast
    if (serializedError.description.es === 'd') {
      return <UserConnectSkeleton />;
    }
    
    // Si hay error, mostrar skeleton + toast automático
    return (
      <SectionFallbackProvider error={serializedError}>
        <UserConnectSkeleton />
      </SectionFallbackProvider>
    );
  }
}
