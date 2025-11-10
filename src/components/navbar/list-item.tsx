import { forwardRef, type ComponentPropsWithoutRef, type ReactNode, type Ref } from "react";

import { NavigationMenuLink } from "../ui/navigation-menu";
import { cn } from "../../lib/utils";
import type { LinkComponentType, LinkComponentProps } from "../../lib/types";
import { resolveLinkComponent } from "./link-component";

type ListItemProps = {
  title: string;
  href: string;
  children: ReactNode;
  linkComponent?: LinkComponentType;
} & ComponentPropsWithoutRef<"a">;

export const ListItem = forwardRef<HTMLAnchorElement, ListItemProps>(
  ({ className, title, children, href, linkComponent, ...props }, ref) => {
    const LinkComp = resolveLinkComponent(linkComponent) as unknown as (
      props: LinkComponentProps & { ref?: Ref<HTMLAnchorElement> }
    ) => ReactNode;
    const isExternal = href.startsWith("http");

    const commonProps: LinkComponentProps = {
      href,
      className: cn(
        "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors",
        className
      ),
      ...props,
    } as LinkComponentProps;

    const content = (
      <>
        <div className="text-sm font-medium leading-none">{title}</div>
        <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">{children}</p>
      </>
    );

    return (
      <li>
        <NavigationMenuLink asChild>
          {isExternal ? (
            <a ref={ref} href={href} target="_blank" rel="noreferrer" {...commonProps}>
              {content}
            </a>
          ) : (
            <LinkComp {...commonProps} ref={ref}>
              {content}
            </LinkComp>
          )}
        </NavigationMenuLink>
      </li>
    );
  }
);

ListItem.displayName = "ListItem";
