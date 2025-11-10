import type {
  ComponentPropsWithoutRef,
  ForwardRefExoticComponent,
  ReactNode,
  RefAttributes,
} from "react";

export type LogUser = {
  id: string;
  nick: string | null;
  img: string | null;
  email: string | null;
  address: string;
  role: string | null;
  isVerified: boolean;
  solicitud: string | null;
};

export type LinkComponentProps = ComponentPropsWithoutRef<"a"> & {
  href: string;
  children: ReactNode;
};

export type LinkComponentType =
  | ((props: LinkComponentProps) => ReactNode)
  | ForwardRefExoticComponent<LinkComponentProps & RefAttributes<HTMLAnchorElement>>;

export type NavItem = {
  id: string;
  href: string;
  label: string;
};

export type SocialLink = {
  id: string;
  href: string;
  label: string;
  icon: ReactNode;
  external?: boolean;
};

export type AppsMenuHero = {
  href: string;
  title: string;
  description?: string;
  eyebrow?: string;
};

export type AppsMenuLink = {
  id: string;
  href: string;
  title: string;
  description: string;
};

export type AppsMenuConfig = {
  hero: AppsMenuHero;
  items: AppsMenuLink[];
};

export type LocaleOption = {
  id: string;
  label: string;
  href?: string;
};

export type AuthHandlers = {
  isLoggedIn: () => Promise<boolean>;
  getUserData: () => Promise<LogUser | null>;
  generatePayload: (args: { address: string }) => Promise<unknown>;
  login: (params: unknown) => Promise<{ userData?: LogUser } | void>;
  logout?: () => Promise<void>;
};

export type UserActionRenderer =
  | ReactNode
  | ((user: LogUser, helpers: { refreshUser: () => Promise<void>; isLoggedIn: boolean }) => ReactNode);
