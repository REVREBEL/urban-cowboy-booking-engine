import React from "react";

type SurfaceProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: "light" | "subtle" | "dark" | "grid";
  radius?: "none" | "xs" | "sm" | "md" | "lg" | "pill" | "full";
  bordered?: boolean;
};

export const Surface = React.forwardRef<HTMLDivElement, SurfaceProps>(
  ({ variant = "light", radius = "lg", bordered = false, className = "", children, ...props }, ref) => {
    const variantClass =
      variant === "light" ? "ap-surface-light" :
      variant === "subtle" ? "ap-surface-subtle" :
      variant === "dark" ? "ap-surface-dark" : "ap-surface-grid";
    const radiusClass =
      radius === "none" ? "ap-rounded-none" :
      radius === "xs" ? "ap-rounded-xs" :
      radius === "sm" ? "ap-rounded-sm" :
      radius === "md" ? "ap-rounded-md" :
      radius === "lg" ? "ap-rounded-lg" :
      radius === "pill" ? "ap-pill" : "ap-rounded-full";
    return (
      <div
        ref={ref}
        className={`${variantClass} ${radiusClass} ${bordered ? "ap-bordered" : ""} ${className}`.trim()}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Surface.displayName = "Surface";

export const Card = React.forwardRef<HTMLDivElement, SurfaceProps>(
  (props, ref) => <Surface ref={ref} variant="light" radius="lg" bordered {...props} />
);
Card.displayName = "Card";

type DividerProps = React.HTMLAttributes<HTMLHRElement> & {
  orientation?: "horizontal" | "vertical";
  tone?: "subtle" | "dark";
};

export const Divider = React.forwardRef<HTMLHRElement, DividerProps>(
  ({ orientation = "horizontal", tone = "subtle", className = "", ...props }, ref) => (
    <hr
      ref={ref}
      aria-orientation={orientation}
      className={`ap-divider ${tone === "dark" ? "ap-divider--dark" : ""} ${
        orientation === "vertical" ? "h-full w-px border-t-0 border-l" : ""
      } ${className}`.trim()}
      {...props}
    />
  )
);
Divider.displayName = "Divider";

type ContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
};

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ maxWidth = "xl", className = "", children, ...props }, ref) => (
    <div
      ref={ref}
      className={`ap-container ${className}`.trim()}
      style={{ maxWidth: maxWidth === "full" ? "100%" : undefined }}
      {...props}
    >
      {children}
    </div>
  )
);
Container.displayName = "Container";

type StackProps = React.HTMLAttributes<HTMLDivElement> & {
  gap?: "1" | "2" | "3" | "4" | "6" | "7" | "8" | "14" | "16" | "21" | "28";
  direction?: "vertical" | "horizontal";
};

export const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  ({ gap = "4", direction = "vertical", className = "", children, ...props }, ref) => (
    <div
      ref={ref}
      className={`flex ${direction === "vertical" ? "flex-col" : "flex-row"} gap-ap-${gap} ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  )
);
Stack.displayName = "Stack";
