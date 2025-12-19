"use client";

import { useState, type ReactNode } from "react";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link } from "@/lib/i18n/routing";
import { CustomConnectButton } from "../custom-connect-button";
import UserFormDialog from "./user-form-dialog";

export type SiteNavConfig<TPath = string> = {
  logo: {
    path: TPath;
    render: ReactNode;
  };
  paths: {
    id: string;
    path: TPath;
    title: string;
  }[];
  icons: {
    id: string;
    path: string;
    title: string;
    render: ReactNode;
    blank?: boolean;
  }[];
};

type HeaderUser = {
  id: string;
  nick: string | null;
  img: string | null;
  email: string | null;
  address: string;
  role: string | null;
  isVerified: boolean;
  solicitud: string | null;
} | null;

type MobileNavProps<TPath = string> = {
  dataSiteConfig: SiteNavConfig<TPath>;
  user: HeaderUser;
};

export function MobileNav<TPath = string>({ dataSiteConfig, user }: MobileNavProps<TPath>) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="w-10 px-0 md:hidden" aria-label="Abrir menú">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex flex-col gap-4">
        <SheetTitle>
          <Link
            href={dataSiteConfig.logo.path as never}
            className="flex items-center gap-2 text-xl font-semibold"
            onClick={() => setOpen(false)}
          >
            {dataSiteConfig.logo.render}
          </Link>
        </SheetTitle>
        <Separator />
        <div className="flex flex-col gap-3">
          {dataSiteConfig.paths.map((path) => (
            <Link
              key={path.id}
              href={path.path as never}
              className="text-base font-medium"
              onClick={() => setOpen(false)}
            >
              {path.title}
            </Link>
          ))}

          {dataSiteConfig.icons.map((icon) => (
            icon.blank ? (
              <a
                key={icon.id}
                href={icon.path}
                target="_blank"
                rel="noreferrer"
                className="text-base font-medium"
                onClick={() => setOpen(false)}
              >
                {icon.title}
              </a>
            ) : (
              <Link
                key={icon.id}
                href={icon.path as never}
                className="text-base font-medium"
                onClick={() => setOpen(false)}
              >
                {icon.title}
              </Link>
            )
          ))}

          <div className="pt-2">
            {user && (
              <UserFormDialog
                user={user}
                buttonLabelClass="w-full justify-center"
                buttonLabelVariant="outline"
              />
            )}
            <CustomConnectButton
              connectButtonLabel="Iniciar sesión"
              initialUser={user ?? null}
              wrapperClassName="flex-col items-stretch gap-3"
              showUserFormButton={false}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
