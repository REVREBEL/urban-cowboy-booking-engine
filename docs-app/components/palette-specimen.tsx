import type { ReactNode } from "react";
import type { ButtonColor, ButtonStyle } from "../../src/components/ui/Button";

/**
 * The light and paper schemes use paper as the text colour of outline and
 * transparent controls. On the light docs page those labels disappear, so wrap
 * just those combinations in a small dark specimen. The control itself is left
 * untouched — only its surrounding sample surface changes.
 */
export function PaletteSpecimen({
  color,
  variant,
  children,
}: {
  color: ButtonColor;
  variant: ButtonStyle;
  children: ReactNode;
}) {
  if (variant === "filled" || (color !== "light" && color !== "paper")) {
    return <>{children}</>;
  }
  return <span className="docs-contrast-specimen">{children}</span>;
}
