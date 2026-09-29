import type { AnchorHTMLAttributes, ReactNode } from "react";

export function Link({
  to,
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { to?: string; children?: ReactNode }) {
  return (
    <a
      href={to ?? "#"}
      {...props}
      onClick={(event) => {
        props.onClick?.(event);
        event.preventDefault();
      }}
    >
      {children}
    </a>
  );
}
