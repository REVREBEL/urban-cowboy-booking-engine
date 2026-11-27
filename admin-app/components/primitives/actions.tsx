import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "ember" | "amber" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "ember", size = "md", loading = false, disabled, className = "", children, ...props }, ref) => {
    const variantClass =
      variant === "ember" ? "ap-btn--ember" :
      variant === "amber" ? "ap-btn--amber" :
      variant === "outline" ? "ap-btn--outline" :
      variant === "ghost" ? "ap-btn--ghost" : "ap-btn--destructive";
    const sizeClass = size === "sm" ? "ap-btn--sm" : size === "lg" ? "ap-btn--lg" : "ap-btn--md";
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        className={`ap-btn ${variantClass} ${sizeClass} ${loading ? "ap-btn--loading" : ""} ${className}`.trim()}
        {...props}
      >
        {loading ? <span className="ap-animate-pulse-subtle">…</span> : null}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

type IconButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  "aria-label": string;
  shape?: "square" | "circle";
  size?: "sm" | "md" | "lg";
};

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ shape = "square", size = "md", className = "", children, ...props }, ref) => {
    const sizeClass = size === "sm" ? "size-8" : size === "lg" ? "size-12" : "size-10";
    const radiusClass = shape === "circle" ? "rounded-ap-full" : "rounded-ap-md";
    return (
      <button
        ref={ref}
        className={`ap-btn ap-btn--ghost ${sizeClass} ${radiusClass} p-0 ${className}`.trim()}
        {...props}
      >
        {children}
      </button>
    );
  }
);
IconButton.displayName = "IconButton";
