"use client";

import { useState, type ReactNode } from "react";
import { Menu } from "lucide-react";

import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "../ui/sheet";
import type { CustomConnectButtonProps } from "../auth/custom-connect-button";
import { CustomConnectButton } from "../auth/custom-connect-button";
import type {
  LinkComponentType,
  NavItem,
  SocialLink,
  UserActionRenderer,
} from "../../lib/types";
import { cn } from "../../lib/utils";
import { resolveLinkComponent } from "./link-component";

type MobileNavProps = {
  brand: { href: string; content: ReactNode };
  navItems?: NavItem[];
  socialLinks?: SocialLink[];
  linkComponent?: LinkComponentType;
  connectButton?: CustomConnectButtonProps;
  userActionSlot?: UserActionRenderer;
  i18nToggle?: React.ReactNode;
};

export function MobileNav({
  brand,
  navItems = [],
  socialLinks = [],
  linkComponent,
  connectButton,
  userActionSlot,
  i18nToggle,
}: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const LinkComp = resolveLinkComponent(linkComponent);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="w-10 px-0 md:hidden" aria-label="Abrir menú">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex flex-col gap-4">
        <SheetTitle>
          <LinkComp
            href={brand.href}
            className="flex items-center gap-2 text-xl font-semibold"
            onClick={() => setOpen(false)}
          >
            {brand.content}
          </LinkComp>
        </SheetTitle>
        <Separator />
        <div className="flex flex-col gap-3">
          {navItems.map((item) => (
            <LinkComp
              key={item.id}
              href={item.href}
              className="text-base font-medium"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </LinkComp>
          ))}

          {socialLinks.map((icon) => {
            const commonProps = {
              key: icon.id,
              className: "text-base font-medium",
              onClick: () => setOpen(false),
            };
            return icon.external ? (
              <a href={icon.href} target="_blank" rel="noreferrer" {...commonProps}>
                {icon.label}
              </a>
            ) : (
              <LinkComp href={icon.href} {...commonProps}>
                {icon.label}
              </LinkComp>
            );
          })}

          {i18nToggle && <div className="pt-2">{i18nToggle}</div>}

          {connectButton && (
            <div className="pt-2">
              <CustomConnectButton
                {...connectButton}
                userActionSlot={userActionSlot ?? connectButton.userActionSlot}
                wrapperClassName={cn("flex-col items-stretch gap-3", connectButton.wrapperClassName)}
                showUserActionSlot={connectButton.showUserActionSlot ?? true}
              />
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
