import React, {
  type ButtonHTMLAttributes,
  type CSSProperties,
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
  | "ash"
  | "paper";

export type ButtonSize =
  | "xsmall"
  | "small"
  | "default"
  | "medium"
  | "large"
  | "xlarge";

type Palette = {
  bg: string;
  text: string;
  border: string;
};

export const COLOR_PALETTE: Record<ButtonColor, Palette> = {
  dark: {
    bg: "var(--lake-forest, #0e301a)",
    text: "var(--paper,  #faf9f9)",
    border: "var(-lake-forest-300, #3e5948;)",
  },
  light: {
    bg: "var(--paper, #faf9f9)",
    text: "var(--lake-forest, #0e301a)",
    border: "var(--paper, #faf9f9)",
  },
  "alpine-linen": {
    bg: "var(--color-alpine-linen, #ebe8e0)",
    text: "var(--color-lake-forest, #0e301a)",
    border: "var(--color-alpine-linen, #ebe8e0)",
  },
  "cowboy-umber": {
    bg: "var(--cowboy-umber, #4e332d)",
    text: "var(--alpine-linen, #ebe8e0)",
    border: "var(--cowboy-umber, #4e332d)",
  },
  smoke: {
    bg: "var(--smoke, #343833)",
    text: "var(--paper, #faf9f9)",
    border: "var(--smoke, #343833)",
  },
  "lake-forest": {
    bg: "var(--lake-forest, #0e301a)",
    text: "var(--alpine-linen, #ebe8e0)",
    border: "var(--lake-forest-300, #3e5948;)",
  },
  copper: {
    bg: "var(--copper, #9a5636)",
    text: "var(--alpine-linen-200,  #f1efe9)",
    border: "var(--copper, #9a5636)",
  },
  oxblood: {
    bg: "var(--oxblood, #69253a)",
    text: "var(--alpine-linen-200,  #f1efe9)",
    border: "var(--oxblood, #69253a)",
  },
  "oxidized-teal": {
    bg: "var(--oxidized-teal, #236b7d)",
    text: "var(--paper,  #faf9f9)",
    border: "var(--oxidized-teal, #236b7d)",
  },
  "bandana-red": {
    bg: "var(--bandana-red, #d65241)",
    text: "var(--paper,  #faf9f9)",
    border: "var(--bandana-red, #d65241)",
  },
  "whiskey-sour": {
    bg: "var(--whiskey-sour, #ddc5a4)",
    text: "var(--cowboy-umber, #4e332d)",
    border: "var(--whiskey-sour, #ddc5a4)",
  },
  "lodge-yellow": {
    bg: "var(--lodge-yellow, #fddc4e)",
    text: "var(--lake-forest, #0e301a)",
    border: "var(--lodge-yellow, #fddc4e)",
  },
  "nude-ember": {
    bg: "var(--nude-ember, #f2aaa9)",
    text: "var(--lake-forest, #0e301a)",
    border: "var(--nude-ember, #f2aaa9)",
  },
  ash: {
    bg: "var(--ash, #ccc7bb)",
    text: "var(--paper,  #faf9f9)",
    border: "var(--ash, #ccc7bb)",
  },
  paper: {
    bg: "var(--paper, #faf9f9)",
    text: "var(--smoke, #343833)",
    border: "var(--ash, #343833)",
  },
};

const colorMap = COLOR_PALETTE;

export const buttonVariants = cva(
  "group inline-flex box-border select-none items-center justify-center gap-2 font-bold transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--copper) focus-visible:ring-offset-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        filled:
          "bg-(--cowboy-umber) text-(--alpine-linen)",
        outline:
          "border-(--_size---button--border-width) border-(--cowboy-umber) bg-transparent text-(--cowboy-umber)",
        transparent:
          "border-0 bg-transparent text-(--cowboy-umber)",
      },
      size: {
        xsmall:
          "rounded-(--_size---button-xs--border-radius) px-3 py-2 text-(--_size---button-xs--font-size)",
        small:
          "rounded-(--_size---button-sm--border-radius) px-(--_size---button-sm--padding-left) py-(--_size---button-sm--padding-top) text-(--_size---button-sm--font-size)",
        default:
          "rounded-(--_size---button--border-radius) px-(--_size---button--padding-left) py-(--_size---button--padding-top) text-(--_size---button--font-size)",
        medium:
          "rounded-(--_size---button-md--border-radius) px-(--_size---button--padding-left) py-(--_size---button--padding-top) text-(--_size---button-md--font-size)",
        large:
          "rounded-(--_size---button-lg--border-radius) px-(--_size---button-lg--padding-left) py-(--_size---button-lg--padding-top) text-(--_size---button-lg--font-size)",
        xlarge:
          "rounded-(--_size---button-xl--border-radius) px-(--_size---button-lg--padding-left) py-(--_size---button-lg--padding-top) text-(--_size---button-xl--font-size)",
      },
    },
    defaultVariants: {
      variant: "filled",
      size: "default",
    },
  },
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
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke={color}
      strokeWidth="4"
    />
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

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonStyle;
  /** Preferred name from the Webflow-derived component API. */
  colorScheme?: ButtonColor;
  /** Backward-compatible alias used by the existing booking engine. */
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

type SizeStyle = {
  css: CSSProperties;
  iconSize: number;
  borderWidth: string;
};

function getSizeStyles(size: ButtonSize): SizeStyle {
  const baseLineHeight = "var(--_size---button--line-height, 1)";

  switch (size) {
    case "xlarge":
      return {
        css: {
          fontSize:
            "var(--_size---button-xl--font-size, var(--_typography---text-size--xl, 1.5rem))",
          lineHeight: baseLineHeight,
          paddingTop: "var(--_size---button-lg--padding-top, 1.25rem)",
          paddingRight: "var(--_size---button-lg--padding-right, 1.75rem)",
          paddingBottom: "var(--_size---button-lg--padding-bottom, 1.25rem)",
          paddingLeft: "var(--_size---button-lg--padding-left, 1.75rem)",
          borderRadius: "var(--_size---button-xl--border-radius, 20px)",
          fontWeight: "var(--_size---button-lg--font-weight, 700)",
          textTransform: "uppercase",
        },
        borderWidth: "var(--_size---button-lg--border-width, 3.5px)",
        iconSize: 20,
      };

    case "large":
      return {
        css: {
          fontSize:
            "var(--_size---button-lg--font-size, var(--_typography---text-size--lg, 1.3rem))",
          lineHeight: baseLineHeight,
          paddingTop: "var(--_size---button-lg--padding-top, 1.25rem)",
          paddingRight: "var(--_size---button-lg--padding-right, 1.75rem)",
          paddingBottom: "var(--_size---button-lg--padding-bottom, 1.25rem)",
          paddingLeft: "var(--_size---button-lg--padding-left, 1.75rem)",
          borderRadius: "var(--_size---button-lg--border-radius, 18px)",
          fontWeight: "var(--_size---button-lg--font-weight, 700)",
          textTransform: "uppercase",
        },
        borderWidth: "var(--_size---button-lg--border-width, 3.5px)",
        iconSize: 18,
      };

    case "medium":
      return {
        css: {
          fontSize:
            "var(--_size---button-md--font-size, var(--_typography---text-size--md, 1.2rem))",
          lineHeight: baseLineHeight,
          paddingTop: "var(--_size---button--padding-top, 1rem)",
          paddingRight: "var(--_size---button--padding-right, 1.15rem)",
          paddingBottom: "var(--_size---button--padding-bottom, 1rem)",
          paddingLeft: "var(--_size---button--padding-left, 1.15rem)",
          borderRadius: "var(--_size---button-md--border-radius, 16px)",
          fontWeight: "var(--_size---button--font-weight, 700)",
          textTransform: "uppercase",
        },
        borderWidth: "var(--_size---button--border-width, 3px)",
        iconSize: 16,
      };

    case "small":
      return {
        css: {
          fontSize:
            "var(--_size---button-sm--font-size, var(--_typography---text-size--sm, 1rem))",
          lineHeight: baseLineHeight,
          paddingTop: "var(--_size---button-sm--padding-top, 0.75rem)",
          paddingRight: "var(--_size---button-sm--padding-right, 1rem)",
          paddingBottom: "var(--_size---button-sm--padding-bottom, 0.75rem)",
          paddingLeft: "var(--_size---button-sm--padding-left, 1rem)",
          borderRadius: "var(--_size---button-sm--border-radius, 12px)",
          fontWeight: "var(--_size---button-sm--font-weight, 700)",
          textTransform: "uppercase",
        },
        borderWidth: "var(--_size---button-sm--border-width, 3px)",
        iconSize: 12,
      };

    case "xsmall":
      return {
        css: {
          fontSize:
            "var(--_size---button-xs--font-size, var(--_typography---text-size--xs, 0.9rem))",
          paddingTop: "var(--_size---button-xs--padding-top, 0.75rem)",
          paddingRight: "var(--_size---button-xs--padding-right, 1rem)",
          paddingBottom: "var(--_size---button-xs--padding-bottom, 0.75rem)",
          paddingLeft: "var(--_size---button-xs--padding-left, 1rem)",
          lineHeight: baseLineHeight,
          borderRadius: "var(--_size---button-xs--border-radius, 10px)",
          fontWeight: "var(--_size---button-xs--font-weight, 400)",
          textTransform: "uppercase",
        },
        borderWidth: "var(--_size---button-sm--border-width, 3px)",
        iconSize: 12,
      };

    case "default":
    default:
      return {
        css: {
          fontSize:
            "var(--_size---button--font-size, var(--_typography---text-size--base, 1.1rem))",
          lineHeight: baseLineHeight,
          paddingTop: "var(--_size---button--padding-top, 1rem)",
          paddingRight: "var(--_size---button--padding-right, 1.15rem)",
          paddingBottom: "var(--_size---button--padding-bottom, 1rem)",
          paddingLeft: "var(--_size---button--padding-left, 1.15rem)",
          borderRadius: "var(--_size---button--border-radius, 14px)",
          fontWeight: "var(--_size---button--font-weight, 700)",
          textTransform: "uppercase",
        },
        borderWidth: "var(--_size---button--border-width, 3px)",
        iconSize: 14,
      };
  }
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
    ref,
  ) => {
    const resolvedColor = colorScheme ?? color ?? "dark";
    const palette = colorMap[resolvedColor] ?? colorMap.dark;
    const { css: sizeCss, iconSize, borderWidth } = getSizeStyles(size);
    const isDisabledOrLoading = disabled || isLoading;
    const Comp = asChild ? Slot : "button";

    const variantStyle: CSSProperties =
      variant === "outline"
        ? {
          backgroundColor: "transparent",
          color: palette.border,
          border: `${borderWidth} solid ${palette.border}`,
        }
        : variant === "transparent"
          ? {
            backgroundColor: "transparent",
            color: palette.border,
            border: "none",
          }
          : {
            backgroundColor: palette.bg,
            color: palette.text,
            border: "none",
          };

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
          isDisabledOrLoading
            ? "transform-none cursor-not-allowed"
            : "hover:opacity-90 active:scale-[0.98]",
          className,
        )}
        style={{
          display: "inline-flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          gap: "8px",
          fontFamily:
            "var(--_typography---font-family--button, var(--font-button))",
          letterSpacing:
            "var(--_size---button--letter-spacing, 0.05em)",
          cursor: isDisabledOrLoading ? "not-allowed" : "pointer",
          opacity: isDisabledOrLoading ? 0.6 : 1,
          boxSizing: "border-box",
          transition: "all 0.2s ease-in-out",
          ...variantStyle,
          ...sizeCss,
          ...style,
        }}
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
  },
);

Button.displayName = "Button";

export default Button;
