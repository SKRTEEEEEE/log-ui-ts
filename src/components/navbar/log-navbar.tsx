import type { ReactNode } from "react";

import { buttonVariants } from "../ui/button";
import { cn } from "../../lib/utils";
import type {
  AppsMenuConfig,
  LinkComponentType,
  NavItem,
  SocialLink,
  UserActionRenderer,
} from "../../lib/types";
import type { CustomConnectButtonProps } from "../auth/custom-connect-button";
import { CustomConnectButton } from "../auth/custom-connect-button";
import { ThemePopover } from "../theme/theme-popover";
import { ModeToggle } from "../theme/mode-toggle";
import { AppsMenu } from "./apps-menu";
import { MobileNav } from "./mobile-nav";
import { resolveLinkComponent } from "./link-component";

type BrandConfig = {
  href: string;
  content: ReactNode;
};

export type LogNavbarProps = {
  brand: BrandConfig;
  navItems?: NavItem[];
  socialLinks?: SocialLink[];
  appsMenu?: AppsMenuConfig;
  linkComponent?: LinkComponentType;
  connectButton?: CustomConnectButtonProps;
  userActionSlot?: UserActionRenderer;
  i18nToggle?: ReactNode;
  showThemePopover?: boolean;
  showModeToggle?: boolean;
  className?: string;
};

export function LogNavbar({
  brand,
  navItems = [],
  socialLinks = [],
  appsMenu,
  linkComponent,
  connectButton,
  userActionSlot,
  i18nToggle,
  showThemePopover = true,
  showModeToggle = false,
  className,
}: LogNavbarProps) {
  const LinkComp = resolveLinkComponent(linkComponent);
  const connectButtonWithSlot = connectButton
    ? {
        ...connectButton,
        userActionSlot: userActionSlot ?? connectButton.userActionSlot,
      }
    : undefined;

  return (
    <header className={cn("z-10 sticky top-0 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60", className)}>
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <nav className="flex items-center space-x-4 lg:space-x-6">
          <LinkComp href={brand.href} className="hidden md:flex items-center gap-2">
            {brand.content}
          </LinkComp>

          {appsMenu && <AppsMenu config={appsMenu} linkComponent={linkComponent} />}

          {navItems.map((item) => (
            <LinkComp
              key={item.id}
              href={item.href}
              className="text-sm font-medium transition-colors hover:text-primary hidden md:inline-block"
            >
              {item.label}
            </LinkComp>
          ))}
        </nav>

        <div className="flex flex-1 items-center justify-end space-x-2">
          <nav className="hidden md:flex items-center gap-2">
            {socialLinks.map((item) => {
              const commonProps = {
                className: cn(buttonVariants({ variant: "ghost" }), "w-10 px-0 inline-flex"),
              };
              return item.external ? (
                <a key={item.id} href={item.href} target="_blank" rel="noreferrer" {...commonProps}>
                  {item.icon}
                </a>
              ) : (
                <LinkComp key={item.id} href={item.href} {...commonProps}>
                  {item.icon}
                </LinkComp>
              );
            })}
          </nav>

          {connectButtonWithSlot && (
            <div className="hidden w-40 md:block">
              <CustomConnectButton {...connectButtonWithSlot} />
            </div>
          )}

          {i18nToggle && <div className="hidden md:block">{i18nToggle}</div>}

          {showThemePopover && <ThemePopover />}
          {showModeToggle && <ModeToggle />}

          <MobileNav
            brand={brand}
            navItems={navItems}
            socialLinks={socialLinks}
            linkComponent={linkComponent}
            connectButton={connectButtonWithSlot}
            userActionSlot={userActionSlot}
            i18nToggle={i18nToggle}
          />
        </div>
      </div>
    </header>
  );
}
