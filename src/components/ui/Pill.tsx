import * as React from "react";
import { Button, COLOR_PALETTE, CONTROL_COLOR_CLASSES, CONTROL_BORDER_CLASSES, TEXT_CASE_CLASSES, type TextCase, type ControlBorderColor, type ButtonColor, type ButtonStyle } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export type PillSize = "xsmall" | "small" | "default" | "large";

export interface PillProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: ButtonStyle;
  colorScheme?: ButtonColor;
  borderColor?: ControlBorderColor;
  clickable?: boolean;
  size?: PillSize;
  textCase?: TextCase;
}

/* Re-export palette for tests and external consumers */
export { COLOR_PALETTE };

const PILL_SIZE_CLASSES: Record<PillSize, string> = {
  xsmall: "pill-xs",
  small: "pill-sm",
  default: "pill-default",
  large: "pill-lg",
};

export function Pill({
  variant = "filled",
  colorScheme,
  borderColor = "faded",
  clickable = false,
  size = "default",
  textCase,
  className,
  style,
  children,
  ...props
}: PillProps) {
  const resolvedColor = colorScheme ?? "dark";


  const colorClasses = `${CONTROL_COLOR_CLASSES[resolvedColor]} ${variant === "outline" ? "control-pill-outline" : variant === "transparent" ? "control-transparent" : "control-filled"}`;

  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center justify-center gap-1.5 whitespace-nowrap align-middle font-label leading-none rounded-full box-border",
        colorClasses,
        CONTROL_BORDER_CLASSES[borderColor],
        !clickable && "control-not-clickable",
        PILL_SIZE_CLASSES[size],
        textCase && TEXT_CASE_CLASSES[textCase],
        className
      )}
      style={style}
      data-clickable={clickable}
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
  ({ variant = "outline", colorScheme, borderColor = "faded", clickable = true, size = "default", textCase = "uppercase", pressed, className, style, children, ...props }, ref) => (
    <Button
      {...props}
      ref={ref}
      variant={variant}
      colorScheme={colorScheme ?? "dark"}
      borderColor={borderColor}
      clickable={clickable}
      size="xsmall"
      textCase={textCase}
      aria-pressed={pressed ?? props["aria-pressed"]}
      className={cn("max-w-full whitespace-nowrap font-label rounded-full font-medium leading-none", PILL_SIZE_CLASSES[size], className)}
      style={{ borderWidth: variant === "outline" ? "1px" : undefined, ...style }}
    >
      {children}
    </Button>
  )
);
PillButton.displayName = "PillButton";