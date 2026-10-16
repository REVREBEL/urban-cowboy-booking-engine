import * as React from "react";
import { Button, COLOR_PALETTE, type ButtonColor, type ButtonStyle } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export type PillSize = "xsmall" | "small" | "default" | "large";

export interface PillProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: ButtonStyle;
  colorScheme?: ButtonColor;
  color?: ButtonColor;
  size?: PillSize;
}

/* Re-export palette for tests and external consumers */
export { COLOR_PALETTE };

/* Color Scheme Class Mapping derived from design system tokens */
const COLOR_CLASSES: Record<ButtonColor, { bg: string; text: string; border: string }> = {
  dark: { bg: "bg-lake-forest", text: "text-paper", border: "border-lake-forest" },
  light: { bg: "bg-paper", text: "text-lake-forest", border: "border-paper" },
  "alpine-linen": { bg: "bg-alpine-linen", text: "text-lake-forest", border: "border-alpine-linen" },
  "cowboy-umber": { bg: "bg-cowboy-umber", text: "text-alpine-linen", border: "border-cowboy-umber" },
  smoke: { bg: "bg-smoke", text: "text-paper", border: "border-smoke" },
  "lake-forest": { bg: "bg-lake-forest", text: "text-alpine-linen", border: "border-lake-forest" },
  copper: { bg: "bg-copper", text: "text-alpine-linen", border: "border-copper" },
  oxblood: { bg: "bg-oxblood", text: "text-alpine-linen", border: "border-oxblood" },
  "oxidized-teal": { bg: "bg-oxidized-teal", text: "text-paper", border: "border-oxidized-teal" },
  "bandana-red": { bg: "bg-bandana-red", text: "text-paper", border: "border-bandana-red" },
  "whiskey-sour": { bg: "bg-whiskey-sour", text: "text-cowboy-umber", border: "border-whiskey-sour" },
  "lodge-yellow": { bg: "bg-lodge-yellow", text: "text-lake-forest", border: "border-lodge-yellow" },
  "nude-ember": { bg: "bg-nude-ember", text: "text-lake-forest", border: "border-nude-ember" },
  ash: { bg: "bg-ash", text: "text-paper", border: "border-ash" },
  paper: { bg: "bg-paper", text: "text-smoke", border: "border-ash" },
};

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
  const resolvedColor = colorScheme ?? color ?? "dark";
  const palette = COLOR_CLASSES[resolvedColor] ?? COLOR_CLASSES.dark;

  const colorClasses =
    variant === "filled"
      ? `${palette.bg} ${palette.text} border ${palette.border}`
      : variant === "outline"
        ? `bg-transparent ${palette.text} border ${palette.border}`
        : `bg-transparent ${palette.text} border-transparent`;

  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center justify-center gap-1.5 whitespace-nowrap align-middle font-label leading-none rounded-full box-border",
        colorClasses,
        className
      )}
      style={{
        ...PILL_SIZES[size],
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
      className={cn("max-w-full whitespace-nowrap font-label rounded-full font-medium leading-none", className)}
      style={{
        borderWidth: variant === "outline" ? "1px" : undefined,
        ...PILL_SIZES[size],
        ...style,
      }}
    >
      {children}
    </Button>
  )
);
PillButton.displayName = "PillButton";