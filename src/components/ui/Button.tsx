// src/components/ui/Button.tsx

import React, {
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

export type ButtonStyle = "filled" | "outline" | "transparent";

export type ButtonColor =
  | "dark"
  | "light"
  | "alpine-linen"
  | "cowboy-umber"
  | "smoke"
  | "lake-forest"
  | "copper"
  | "oxblood"
  | "oxidized-teal"
  | "bandana-red"
  | "whiskey-sour"
  | "lodge-yellow"
  | "nude-ember"
  | "paper";

export type ButtonSize =
  | "xsmall"
  | "small"
  | "default"
  | "medium"
  | "large"
  | "xlarge";

export type Palette = {
  bg: string;
  text: string;
  border: string;
};

export const COLOR_PALETTE: Record<ButtonColor, Palette> = {
  dark: {
    bg: "var(--lake-forest, #0e301a)",
    text: "var(--paper, #faf9f9)",
    border: "var(--lake-forest-fade, #3e5948)",
  },
  light: {
    bg: "var(--paper, #faf9f9)",
    text: "var(--lake-forest, #0e301a)",
    border: "var(--paper, #faf9f9)",
  },
  "alpine-linen": {
    bg: "var(--color-alpine-linen, #ebe8e0)",
    text: "var(--color-lake-forest, #0e301a)",
    border: "var(--color-alpine-linen-fade, #ebe8e0)",
  },
  "cowboy-umber": {
    bg: "var(--cowboy-umber, #4e332d)",
    text: "var(--alpine-linen, #ebe8e0)",
    border: "var(--cowboy-umber-fade, #4e332d)",
  },
  smoke: {
    bg: "var(--smoke, #343833)",
    text: "var(--paper, #faf9f9)",
    border: "var(--smoke-fade, #343833)",
  },
  "lake-forest": {
    bg: "var(--lake-forest, #0e301a)",
    text: "var(--alpine-linen, #ebe8e0)",
    border: "var(--lake-forest-fade, #3e5948)",
  },
  copper: {
    bg: "var(--copper, #9a5636)",
    text: "var(--alpine-linen-200, #f1efe9)",
    border: "var(--copper-fade, #9a5636)",
  },
  oxblood: {
    bg: "var(--oxblood, #69253a)",
    text: "var(--alpine-linen-200, #f1efe9)",
    border: "var(--oxblood-fade, #69253a)",
  },
  "oxidized-teal": {
    bg: "var(--oxidized-teal, #236b7d)",
    text: "var(--paper, #faf9f9)",
    border: "var(--oxidized-teal-fade, #236b7d)",
  },
  "bandana-red": {
    bg: "var(--bandana-red, #d65241)",
    text: "var(--paper, #faf9f9)",
    border: "var(--bandana-red-fade, #d65241)",
  },
  "whiskey-sour": {
    bg: "var(--whiskey-sour, #ddc5a4)",
    text: "var(--cowboy-umber, #4e332d)",
    border: "var(--whiskey-sour-fade, #ddc5a4)",
  },
  "lodge-yellow": {
    bg: "var(--lodge-yellow, #fddc4e)",
    text: "var(--lake-forest, #0e301a)",
    border: "var(--lodge-yellow-fade, #fddc4e)",
  },
  "nude-ember": {
    bg: "var(--nude-ember, #f2aaa9)",
    text: "var(--lake-forest, #0e301a)",
    border: "var(--nude-ember-fade, #f2aaa9)",
  },
  paper: {
    bg: "var(--paper, #faf9f9)",
    text: "var(--smoke, #343833)",
    border: "var(--smoke-fade, #343833)",
  },
};

const COLOR_CLASSES: Record<ButtonColor, { bg: string; text: string; border: string }> = {
  dark: { bg: "bg-lake-forest", text: "text-paper", border: "border-lake-forest-fade" },
  light: { bg: "bg-paper", text: "text-lake-forest", border: "border-paper" },
  "alpine-linen": { bg: "bg-alpine-linen", text: "text-lake-forest", border: "border-alpine-linen-fade" },
  "cowboy-umber": { bg: "bg-cowboy-umber", text: "text-alpine-linen", border: "border-cowboy-umber-fade" },
  smoke: { bg: "bg-smoke", text: "text-paper", border: "border-smoke-fade" },
  "lake-forest": { bg: "bg-lake-forest", text: "text-alpine-linen", border: "border-lake-forest-fade" },
  copper: { bg: "bg-copper", text: "text-alpine-linen-200", border: "border-copper-fade" },
  oxblood: { bg: "bg-oxblood", text: "text-alpine-linen-200", border: "border-oxblood-fade" },
  "oxidized-teal": { bg: "bg-oxidized-teal", text: "text-paper", border: "border-oxidized-teal-fade" },
  "bandana-red": { bg: "bg-bandana-red", text: "text-paper", border: "border-bandana-red-fade" },
  "whiskey-sour": { bg: "bg-whiskey-sour", text: "text-cowboy-umber", border: "border-whiskey-sour-fade" },
  "lodge-yellow": { bg: "bg-lodge-yellow", text: "text-lake-forest", border: "border-lodge-yellow-fade" },
  "nude-ember": { bg: "bg-nude-ember", text: "text-lake-forest", border: "border-nude-ember-fade" },
  paper: { bg: "bg-paper", text: "text-smoke", border: "border-smoke-fade" },
};

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 select-none uppercase font-bold tracking-wider transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-copper focus-visible:ring-offset-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        filled: "border-transparent",
        outline: "bg-transparent border-solid",
        transparent: "bg-transparent border-none",
      },
      size: {
        xsmall: "btn-xs",
        small: "btn-sm",
        default: "btn",
        medium: "btn-md",
        large: "btn-lg",
        xlarge: "btn-xl",
      },
    },
    defaultVariants: {
      variant: "filled",
      size: "default",
    },
  }
);

export const Spinner: React.FC<{ size?: number; color?: string }> = ({
  size = 16,
  color = "currentColor",
}) => (
  <svg
    className="-ml-1 mr-2 inline-block animate-spin"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke={color} strokeWidth="4" />
    <path
      className="opacity-75"
      fill={color}
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

export const ChevronRight: React.FC<{ color?: string; size?: number }> = ({
  color = "currentColor",
  size = 14,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 10 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="inline-block transition-transform duration-150 group-hover:translate-x-0.5"
    aria-hidden="true"
  >
    <path
      d="M2 2L8 7L2 12"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color"> {
  variant?: ButtonStyle;
  colorScheme?: ButtonColor;
  color?: ButtonColor;
  size?: ButtonSize;
  hasIcon?: boolean;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  isLoading?: boolean;
  children?: ReactNode;
  asChild?: boolean;
  buttonName?: string;
  buttonPage?: string;
  buttonContent?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "filled",
      colorScheme,
      color,
      size = "default",
      hasIcon = false,
      icon,
      iconPosition = "right",
      isLoading = false,
      disabled = false,
      children,
      asChild = false,
      className = "",
      style,
      buttonName,
      buttonPage,
      buttonContent,
      ...restProps
    },
    ref
  ) => {
    const resolvedColor = colorScheme ?? color ?? "dark";
    const palette = COLOR_CLASSES[resolvedColor] ?? COLOR_CLASSES.dark;
    const isDisabledOrLoading = disabled || isLoading;
    const Comp = asChild ? Slot : "button";

    const colorClasses =
      variant === "outline"
        ? `bg-transparent ${palette.border} text-current`
        : variant === "transparent"
        ? `bg-transparent border-none text-current`
        : `${palette.bg} ${palette.text} ${palette.border}`;

    const iconSize =
      size === "xlarge"
        ? 20
        : size === "large"
        ? 18
        : size === "medium"
        ? 16
        : size === "small" || size === "xsmall"
        ? 12
        : 14;

    const iconNode =
      icon ??
      (hasIcon ? <ChevronRight color="currentColor" size={iconSize} /> : null);

    return (
      <Comp
        ref={ref}
        disabled={isDisabledOrLoading}
        aria-busy={isLoading || undefined}
        className={cn(
          buttonVariants({ variant, size }),
          colorClasses,
          isDisabledOrLoading
            ? "transform-none cursor-not-allowed"
            : "hover:opacity-90 active:scale-[0.98]",
          className
        )}
        style={style}
        data-button-name={buttonName}
        data-button-page={buttonPage}
        data-button-content={buttonContent}
        {...restProps}
      >
        {isLoading ? (
          <Spinner size={iconSize} color="currentColor" />
        ) : iconPosition === "left" && iconNode ? (
          <span className="inline-flex items-center justify-center">{iconNode}</span>
        ) : null}

        <span>{children}</span>

        {!isLoading && iconPosition === "right" && iconNode ? (
          <span className="inline-flex items-center justify-center">{iconNode}</span>
        ) : null}
      </Comp>
    );
  }
);

Button.displayName = "Button";

export default Button;