// Button.tsx

import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

// Utility for class merging (or import from '@/lib/utils')
function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(' ');
}

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

// CVA configuration matching the Design System variants and sizes
export const buttonVariants = cva(
  "group inline-flex items-center justify-center font-button font-bold uppercase transition-all duration-200 ease-in-out select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-stone-400 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        filled: "",
        outline: "",
        transparent: "",
      },
      size: {
        small: "h-[36px] rounded-[10px] px-[20px] pt-[2px] pb-0 text-[11px] gap-[6px]",
        default: "h-[48px] rounded-[14px] px-[30px] pt-[2px] pb-0 text-[14px] gap-[8px]",
        large: "h-[60px] rounded-[19px] px-[40px] pt-[4px] pb-0 text-[18px] gap-[10px]",
      },
    },
    defaultVariants: {
      variant: "filled",
      size: "default",
    },
  }
);

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

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  children?: ReactNode;
  variant?: ButtonVariant;
  color?: ButtonColor;
  size?: ButtonSize;
  hasIcon?: boolean;
  icon?: ReactNode;
  isLoading?: boolean;
  disabled?: boolean;
  asChild?: boolean;
  className?: string;
}

/**
 * Reusable Design System Button Component
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'filled',
      color = 'dark',
      size = 'default',
      hasIcon = false,
      icon,
      isLoading = false,
      disabled = false,
      asChild = false,
      className = '',
      style = {},
      onClick,
      ...props
    },
    ref
  ) => {
    const colorConfig = COLOR_PALETTE[color] || COLOR_PALETTE.dark;
    const mainColor = colorConfig.hex;
    const isLightBg = colorConfig.isLightBg;

    // Text color tokens
    const darkTextColor = '#4E332D';
    const whiteTextColor = '#FFFFFF';

    const iconSizes = {
      small: 11,
      default: 14,
      large: 18,
    };
    const iconSize = iconSizes[size || 'default'];

    // Variant Styles
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
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        ref={ref}
        disabled={isDisabledOrLoading}
        onClick={onClick}
        className={cn(
          buttonVariants({ variant, size }),
          isDisabledOrLoading
            ? 'opacity-50 cursor-not-allowed transform-none'
            : 'hover:opacity-90 active:scale-95',
          className
        )}
        style={{
          boxSizing: 'border-box',
          letterSpacing: '0.05em',
          fontFamily: 'var(--font-button)',
          ...dynamicStyles,
          ...style,
        }}
        {...props}
      >
        {isLoading ? <Spinner size={iconSize} color={textColor} /> : null}

        <span className="leading-none pt-0.5">{children}</span>

        {!isLoading && hasIcon && (
          <span className="inline-flex items-center justify-center">
            {icon || <ChevronRight color={textColor} size={iconSize} />}
          </span>
        )}
      </Comp>
    );
  }
);

Button.displayName = 'Button';

/**
 * Showcase Layout & Testing Preview
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