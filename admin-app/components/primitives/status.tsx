import React from "react";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "success" | "warn" | "danger";
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = "default", className = "", children, ...props }, ref) => {
    const variantClass =
      variant === "success" ? "ap-badge--success" :
      variant === "warn" ? "ap-badge--warn" :
      variant === "danger" ? "ap-badge--danger" : "";
    return (
      <span ref={ref} className={`ap-badge ${variantClass} ${className}`.trim()} {...props}>
        {children}
      </span>
    );
  }
);
Badge.displayName = "Badge";

type AvatarProps = React.HTMLAttributes<HTMLDivElement> & {
  src?: string;
  alt?: string;
  initials?: string;
};

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ src, alt, initials, className = "", ...props }, ref) => (
    <div
      ref={ref}
      className={`inline-flex size-10 items-center justify-center overflow-hidden rounded-ap-full border border-ap-border-subtle bg-ap-bg-surface-subtle font-ap-sans text-ap-sm text-ap-text-primary ${className}`.trim()}
      {...props}
    >
      {src ? <img src={src} alt={alt ?? ""} className="h-full w-full object-cover" /> : (initials ?? "?")}
    </div>
  )
);
Avatar.displayName = "Avatar";

export const Skeleton = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = "", ...props }, ref) => (
    <div
      ref={ref}
      className={`animate-pulse rounded-ap-md bg-ap-bg-surface-subtle ${className}`.trim()}
      {...props}
    />
  )
);
Skeleton.displayName = "Skeleton";

export const Spinner = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = "", ...props }, ref) => (
    <div
      ref={ref}
      role="status"
      aria-label="Loading"
      className={`inline-block size-5 animate-spin rounded-ap-full border-2 border-ap-border-subtle border-t-ap-accent-ember ${className}`.trim()}
      {...props}
    />
  )
);
Spinner.displayName = "Spinner";
