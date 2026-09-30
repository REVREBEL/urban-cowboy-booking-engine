/ Button.tsx


import React, { ButtonHTMLAttributes, ReactNode } from 'react';

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";


const buttonVariants = cva(
  "font-button inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

// --- COLOR PALETTE DEFINITIONS & CONTRAST CONFIG ---
export type ButtonColor =
  | 'dark'
  | 'light'
  | 'smoke'
  | 'lake-forest'
  | 'copper'
  | 'oxblood'
  | 'oxidized-teal'
  | 'bandana-red'
  | 'whiskey-sour'
  | 'lodge-yellow'
  | 'nude-ember'
  | 'ash';

export type ButtonVariant = 'filled' | 'outline' | 'transparent';
export type ButtonSize = 'small' | 'default' | 'large';

interface ColorConfig {
  name: string;
  hex: string;
  isLightBg: boolean;
}

export const COLOR_PALETTE: Record<ButtonColor, ColorConfig> = {
  dark: { name: 'Dark', hex: '#4E332D', isLightBg: false },
  light: { name: 'Light', hex: '#EBE8E0', isLightBg: true },
  smoke: { name: 'Smoke', hex: '#343833', isLightBg: false },
  'lake-forest': { name: 'Lake Forest', hex: '#0E301A', isLightBg: false },
  copper: { name: 'Copper', hex: '#9A5636', isLightBg: false },
  oxblood: { name: 'Oxblood', hex: '#69253A', isLightBg: false },
  'oxidized-teal': { name: 'Oxidized Teal', hex: '#236B7D', isLightBg: false },
  'bandana-red': { name: 'Bandana Red', hex: '#D65241', isLightBg: false },
  'whiskey-sour': { name: 'Whiskey Sour', hex: '#DDC5A4', isLightBg: true },
  'lodge-yellow': { name: 'Lodge Yellow', hex: '#FDDC4E', isLightBg: true },
  'nude-ember': { name: 'Nude Ember', hex: '#F2AAA9', isLightBg: true },
  ash: { name: 'Ash', hex: '#CCC7BB', isLightBg: true },
};

// Chevron SVG Icon
export const ChevronRight: React.FC<{ color?: string; size?: number }> = ({
  color = 'currentColor',
  size = 14,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 10 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="inline-block transition-transform duration-150 group-hover:translate-x-0.5"
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

// Spinner SVG for Loading State
export const Spinner: React.FC<{ size?: number; color?: string }> = ({
  size = 16,
  color = 'currentColor',
}) => (
  <svg
    className="animate-spin -ml-1 mr-2"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
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

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  color?: ButtonColor;
  size?: ButtonSize;
  hasIcon?: boolean;
  icon?: ReactNode;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * Reusable Design System Button Component
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'filled',
  color = 'dark',
  size = 'default',
  hasIcon = false,
  icon,
  isLoading = false,
  disabled = false,
  className = '',
  style = {},
  onClick,
  ...props
}) => {
  const colorConfig = COLOR_PALETTE[color] || COLOR_PALETTE.dark;
  const mainColor = colorConfig.hex;
  const isLightBg = colorConfig.isLightBg;

  // Text color tokens
  const darkTextColor = '#4E332D';
  const whiteTextColor = '#FFFFFF';

  // 1. Size Configurations matching Figma CSS specs
  const sizeStyles = {
    small: {
      height: '36px',
      padding: '2px 20px 0px',
      fontSize: '11px',
      iconSize: 11,
      gap: '6px',
    },
    default: {
      height: '48px',
      padding: '2px 30px 0px',
      fontSize: '14px',
      iconSize: 14,
      gap: '8px',
    },
    large: {
      height: '60px',
      padding: '4px 40px 0px',
      fontSize: '18px',
      iconSize: 18,
      gap: '10px',
    },
  }[size];

  // 2. Variant Styles
  let dynamicStyles: React.CSSProperties = {};
  let textColor = '';

  if (variant === 'filled') {
    textColor = isLightBg ? darkTextColor : whiteTextColor;
    dynamicStyles = {
      backgroundColor: mainColor,
      color: textColor,
      border: 'none',
    };
  } else if (variant === 'outline') {
    textColor = mainColor;
    const borderWidth =
      size === 'large' ? '2.5px' : size === 'small' ? '1.5px' : '2px';
    dynamicStyles = {
      backgroundColor: 'transparent',
      color: textColor,
      border: `${borderWidth} solid ${mainColor}`,
    };
  } else if (variant === 'transparent') {
    textColor = mainColor;
    dynamicStyles = {
      backgroundColor: 'transparent',
      color: textColor,
      border: 'none',
    };
  }

  const isDisabledOrLoading = disabled || isLoading;

  return (
    <button
      disabled={isDisabledOrLoading}
      onClick={onClick}
      className={`
        group inline-flex items-center justify-center 
        font-bold uppercase rounded-[25px] 
        transition-all duration-200 ease-in-out
        select-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-400
        ${
          isDisabledOrLoading
            ? 'opacity-50 cursor-not-allowed transform-none'
            : 'hover:opacity-90 active:scale-95'
        }
        ${className}
      `}
      style={{
        height: sizeStyles.height,
        padding: sizeStyles.padding,
        fontSize: sizeStyles.fontSize,
        gap: sizeStyles.gap,
        boxSizing: 'border-box',
        letterSpacing: '0.05em',
        fontFamily: "'Brothers OT', 'Cinzel', serif, sans-serif",
        ...dynamicStyles,
        ...style,
      }}
      {...props}
    >
      {isLoading ? (
        <Spinner size={sizeStyles.iconSize} color={textColor} />
      ) : null}

      <span className="leading-none pt-0.5">{children}</span>

      {!isLoading && hasIcon && (
        <span className="inline-flex items-center justify-center">
          {icon || <ChevronRight color={textColor} size={sizeStyles.iconSize} />}
        </span>
      )}
    </button>
  );
};



export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";



/**
 * Example Usage & Showcase Layout
 */
export default function ButtonShowcase() {
  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 p-8 space-y-8">
      <header className="border-b border-stone-800 pb-4">
        <h1 className="text-2xl font-bold text-amber-500">
          Design System Button Showcase
        </h1>
        <p className="text-stone-400 text-sm mt-1">
          TypeScript exportable React button component.
        </p>
      </header>

      <section className="space-y-6">
        <h2 className="text-lg font-semibold text-amber-400">
          Variants & Colors
        </h2>
        <div className="flex flex-wrap gap-4 items-center bg-stone-950 p-6 rounded-2xl border border-stone-800">
          <Button variant="filled" color="dark" hasIcon>
            Dark Filled
          </Button>
          <Button variant="outline" color="dark">
            Dark Outline
          </Button>
          <Button variant="transparent" color="dark">
            Dark Transparent
          </Button>
          <Button variant="filled" color="lodge-yellow">
            Lodge Yellow
          </Button>
          <Button variant="filled" color="bandana-red" hasIcon>
            Bandana Red
          </Button>
          <Button variant="filled" color="lake-forest" isLoading>
            Loading
          </Button>
          <Button variant="filled" color="copper" disabled>
            Disabled
          </Button>
        </div>
      </section>
    </div>
  );
}

export { Button, buttonVariants };


