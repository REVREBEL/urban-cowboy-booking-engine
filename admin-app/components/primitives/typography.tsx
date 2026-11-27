import React from "react";

type HeadingProps = React.HTMLAttributes<HTMLHeadingElement> & {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  size?: "xs" | "sm" | "base" | "md" | "lg" | "xl" | "2xl" | "3xl";
};

export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ as = "h2", size = "xl", className = "", children, ...props }, ref) => {
    const Tag = as;
    const sizeClass =
      size === "xs" ? "text-ap-xs" :
      size === "sm" ? "text-ap-sm" :
      size === "base" ? "text-ap-base" :
      size === "md" ? "text-ap-md" :
      size === "lg" ? "text-ap-lg" :
      size === "xl" ? "text-ap-xl" :
      size === "2xl" ? "text-ap-2xl" : "text-ap-3xl";
    return (
      <Tag
        ref={ref}
        className={`font-ap-display text-ap-text-primary tracking-ap-tight leading-ap-tight ${sizeClass} ${className}`.trim()}
        {...props}
      >
        {children}
      </Tag>
    );
  }
);
Heading.displayName = "Heading";

type TextProps = React.HTMLAttributes<HTMLParagraphElement> & {
  as?: "p" | "span" | "div";
  size?: "xs" | "sm" | "base" | "md" | "lg";
  mono?: boolean;
};

export const Text = React.forwardRef<HTMLParagraphElement, TextProps>(
  ({ as = "p", size = "base", mono = false, className = "", children, ...props }, ref) => {
    const Tag = as as React.ElementType;
    const sizeClass =
      size === "xs" ? "text-ap-xs" :
      size === "sm" ? "text-ap-sm" :
      size === "base" ? "text-ap-base" :
      size === "md" ? "text-ap-md" : "text-ap-lg";
    return (
      <Tag
        ref={ref}
        className={`${mono ? "font-ap-mono" : "font-ap-sans"} ${sizeClass} text-ap-text-primary ${className}`.trim()}
        {...props}
      >
        {children}
      </Tag>
    );
  }
);
Text.displayName = "Text";

type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: "default" | "inherited";
};

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ variant = "default", className = "", children, ...props }, ref) => (
    <a
      ref={ref}
      className={`${variant === "default" ? "ap-link" : "text-inherit underline"} ${className}`.trim()}
      {...props}
    >
      {children}
    </a>
  )
);
Link.displayName = "Link";

export const Code = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className = "", children, ...props }, ref) => (
    <code
      ref={ref}
      className={`font-ap-mono text-ap-xs text-ap-text-primary bg-ap-bg-surface-subtle px-1 py-0.5 rounded-ap-xs ${className}`.trim()}
      {...props}
    >
      {children}
    </code>
  )
);
Code.displayName = "Code";

export const Kbd = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className = "", children, ...props }, ref) => (
    <kbd
      ref={ref}
      className={`font-ap-mono text-ap-xs px-1.5 py-0.5 rounded-ap-xs border border-ap-border-subtle bg-ap-bg-surface text-ap-text-primary ${className}`.trim()}
      {...props}
    >
      {children}
    </kbd>
  )
);
Kbd.displayName = "Kbd";
