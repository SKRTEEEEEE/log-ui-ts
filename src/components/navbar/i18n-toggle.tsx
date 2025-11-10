"use client";

import { Globe } from "lucide-react";

import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import type { LinkComponentType, LocaleOption } from "../../lib/types";
import { resolveLinkComponent } from "./link-component";

type I18nToggleProps = {
  locales: LocaleOption[];
  currentLocale: string;
  onSelectLocale?: (localeId: string) => void;
  linkComponent?: LinkComponentType;
  label?: string;
};

export function I18nToggle({ locales, currentLocale, onSelectLocale, linkComponent, label = "Idioma" }: I18nToggleProps) {
  const LinkComp = resolveLinkComponent(linkComponent);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Cambiar idioma">
          <Globe className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
        {locales.map((locale) => {
          const isActive = locale.id === currentLocale;
          if (locale.href) {
            return (
              <LinkComp
                key={locale.id}
                href={locale.href}
                className="flex items-center justify-between rounded px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
              >
                <span>{locale.label}</span>
                {isActive && <span className="text-xs text-primary">•</span>}
              </LinkComp>
            );
          }
          return (
            <DropdownMenuItem
              key={locale.id}
              onClick={() => onSelectLocale?.(locale.id)}
              className="flex items-center justify-between"
            >
              <span>{locale.label}</span>
              {isActive && <span className="text-xs text-primary">•</span>}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
