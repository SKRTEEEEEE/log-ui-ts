"use client";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { useMediaQuery } from "@log-ui/lib/hooks/use-media-query";
import { ListItem } from "./list-item";
import {
  APPS_CONFIG,
  getCurrentApp,
  getAppUrl,
} from "@log-ui/lib/config/apps-config";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Link } from "@/lib/i18n/routing";

export function AppsMenu() {
  const isSmallViewport = useMediaQuery("(max-width: 960px)");
  const [currentAppId, setCurrentAppId] = useState<string | null>(null);

  useEffect(() => {
    setCurrentAppId(getCurrentApp());
  }, []);

  const currentApp = APPS_CONFIG.find((app) => app.id === currentAppId);
  const otherApps = APPS_CONFIG.filter((app) => app.id !== currentAppId);

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
              {/* Featured app (current app home) */}
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <Link
                    href="/"
                    className={cn(
                      "from-muted/50 to-muted flex h-full w-full flex-col justify-end rounded-md bg-linear-to-b p-6 no-underline outline-hidden select-none focus:shadow-md transition-colors",
                      "ring-2 ring-primary ring-offset-2 bg-accent/50"
                    )}
                  >
                    <div className="mt-4 mb-2 text-lg font-medium">
                      {currentApp?.title || "Home"}
                    </div>
                    <p className="text-muted-foreground text-sm leading-tight">
                      {currentApp?.description || "Página principal"}
                    </p>
                  </Link>
                </NavigationMenuLink>
              </li>

              {/* Other apps */}
              {otherApps.map((app) => (
                <ListItem
                  key={app.id}
                  href={getAppUrl(app.id)}
                  title={app.title}
                  isActive={false}
                >
                  {app.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
