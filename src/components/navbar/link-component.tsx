import { forwardRef } from "react";
import NextLink from "next/link";

import type { LinkComponentProps, LinkComponentType } from "../../lib/types";

const DefaultLink = forwardRef<HTMLAnchorElement, LinkComponentProps>(function DefaultLink(props, ref) {
  return <NextLink ref={ref} {...props} />;
});

export function resolveLinkComponent(component?: LinkComponentType) {
  if (component) {
    return component;
  }
  return DefaultLink;
}
