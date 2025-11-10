"use client";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Link } from "@/lib/i18n/routing";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { ListItem } from "./list-item";

export function AppsMenu() {
  const isSmallViewport = useMediaQuery("(max-width: 960px)");

  return (
    <NavigationMenu
      viewport={isSmallViewport}
      className="z-50 max-w-full justify-start"
    >
      <NavigationMenuList className="justify-start">
        <NavigationMenuItem>
          <NavigationMenuTrigger>Apps</NavigationMenuTrigger>
          <NavigationMenuContent className="max-md:mx-0 max-md:-ml-4 max-md:-mr-4 max-md:rounded-none max-md:border-b max-md:px-4">
            <ul className="grid gap-3 p-4 w-[360px] sm:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <Link
                    className="from-muted/50 to-muted flex h-full w-full flex-col justify-end rounded-md bg-linear-to-b p-6 no-underline outline-hidden select-none focus:shadow-md"
                    href="/"
                  >
                    <div className="mt-4 mb-2 text-lg font-medium">
                      Web, IIoT & PLC
                    </div>
                    <p className="text-muted-foreground text-sm leading-tight">
                      desarrollador.tech
                    </p>
                  </Link>
                </NavigationMenuLink>
              </li>
              <ListItem
                href="https://profile-skrt.vercel.app/es/academia"
                title="Blog"
              >
                Blog y formación para desarrolladores. SaaS de muestra.
              </ListItem>
              <ListItem
                href="https://profile-skrt.vercel.app/es/admin"
                title="Dashboard Admin"
              >
                Panel de administración para gestionar la página y sus contenidos.
              </ListItem>
              <li>
                <NavigationMenuLink asChild>
                  <a href="https://dev.desarrollador.tech">
                    <div className="text-sm leading-none font-medium">
                      Desarrollador
                    </div>
                    <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
                      Información sobre el desarrollador y su experiencia.
                    </p>
                  </a>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
