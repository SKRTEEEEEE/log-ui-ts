"use client";

import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuList, NavigationMenuTrigger } from "../ui/navigation-menu";
import { useMediaQuery } from "../../lib/hooks";
import type { AppsMenuConfig, LinkComponentType } from "../../lib/types";
import { cn } from "../../lib/utils";
import { resolveLinkComponent } from "./link-component";
import { ListItem } from "./list-item";

type AppsMenuProps = {
  config: AppsMenuConfig;
  label?: string;
  linkComponent?: LinkComponentType;
};

export function AppsMenu({ config, label = "Apps", linkComponent }: AppsMenuProps) {
  const isSmallViewport = useMediaQuery("(max-width: 960px)");
  const LinkComp = resolveLinkComponent(linkComponent);

  return (
    <NavigationMenu viewport={isSmallViewport} className="z-50 max-w-full justify-start">
      <NavigationMenuList className="justify-start">
        <NavigationMenuItem>
          <NavigationMenuTrigger>{label}</NavigationMenuTrigger>
          <NavigationMenuContent className="max-md:mx-0 max-md:-ml-4 max-md:-mr-4 max-md:rounded-none max-md:border-b max-md:px-4">
            <ul className="grid w-[360px] gap-3 p-4 sm:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
              <li className="row-span-3">
                <LinkComp
                  href={config.hero.href}
                  className={cn(
                    "from-muted/50 to-muted flex h-full w-full flex-col justify-end rounded-md bg-linear-to-b p-6 no-underline outline-hidden select-none focus:shadow-md",
                    "text-left"
                  )}
                >
                  {config.hero.eyebrow && (
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{config.hero.eyebrow}</p>
                  )}
                  <div className="mt-4 text-lg font-medium">{config.hero.title}</div>
                  {config.hero.description && (
                    <p className="text-muted-foreground text-sm leading-tight">{config.hero.description}</p>
                  )}
                </LinkComp>
              </li>
              {config.items.map((item) => (
                <ListItem key={item.id} href={item.href} title={item.title} linkComponent={linkComponent}>
                  {item.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
