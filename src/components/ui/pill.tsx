import * as React from "react";
import {
  Button,
  COLOR_PALETTE,
  type ButtonColor,
  type ButtonStyle,
} from "./button";
import { cn } from "@/lib/utils";

export type PillSize = "xsmall" | "small" | "default" | "large";

export interface PillProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: ButtonStyle;
  /** Identical to the Button component's colorScheme values. */
  colorScheme?: ButtonColor;
  color?: ButtonColor;
  size?: PillSize;
}

// The label font has an uneven visual baseline. The extra 1–2px on top
// optically centers the text without offsetting it with transforms.
// Keep all four sides independent so each size can be tuned in Storybook.
const PILL_SIZES: Record<PillSize, React.CSSProperties> = {
  xsmall: { fontSize: "0.6875rem", paddingTop: "3px", paddingRight: "8px", paddingBottom: "2px", paddingLeft: "8px" },
  small: { fontSize: "0.75rem", paddingTop: "5px", paddingRight: "10px", paddingBottom: "4px", paddingLeft: "10px" },
  default: { fontSize: "0.875rem", paddingTop: "8px", paddingRight: "14px", paddingBottom: "6px", paddingLeft: "14px" },
  large: { fontSize: "1rem", paddingTop: "10px", paddingRight: "16px", paddingBottom: "8px", paddingLeft: "16px" },
};

export function Pill({
  variant = "filled",
  colorScheme,
  color,
  size = "default",
  className,
  style,
  children,
  ...props
}: PillProps) {
  const palette = COLOR_PALETTE[colorScheme ?? color ?? "dark"];
  const paletteStyle: React.CSSProperties =
    variant === "filled"
      ? { backgroundColor: palette.bg, color: palette.text, border: "1px solid " + palette.border }
      : variant === "outline"
        ? { backgroundColor: "transparent", color: palette.border, border: "1px solid " + palette.border }
        : { backgroundColor: "transparent", color: palette.border, border: "1px solid transparent" };

  return (
    <span
      className={cn("inline-flex max-w-full items-center justify-center gap-1.5 whitespace-nowrap align-middle font-label leading-none", className)}
      style={{
        borderRadius: "9999px",
        boxSizing: "border-box",
        ...PILL_SIZES[size],
        ...paletteStyle,
        ...style,
      }}
      {...props}
    >
      {children}
    </span>
  );
}

export interface PillButtonProps extends Omit<React.ComponentProps<typeof Button>, "size"> {
  size?: PillSize;
  pressed?: boolean;
}

/** Interactive pill with the shared Button's focus, disabled and color behavior. */
export const PillButton = React.forwardRef<HTMLButtonElement, PillButtonProps>(
  ({ variant = "outline", colorScheme, color, size = "default", pressed, className, style, children, ...props }, ref) => (
    <Button
      {...props}
      ref={ref}
      variant={variant}
      colorScheme={colorScheme ?? color ?? "dark"}
      size="xsmall"
      aria-pressed={pressed ?? props["aria-pressed"]}
      className={cn("max-w-full whitespace-nowrap font-label", className)}
      style={{
        borderRadius: "9999px",
        borderWidth: variant === "outline" ? "1px" : undefined,
        fontWeight: "500",
        lineHeight: "1.2",
        ...PILL_SIZES[size],
        ...style,
      }}
    >
      {children}
    </Button>
  ),
);
PillButton.displayName = "PillButton";
