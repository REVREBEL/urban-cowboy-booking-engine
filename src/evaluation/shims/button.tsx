import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Button({
  className,
  variant,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "outline" }) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-2",
        variant === "outline" ? "border bg-transparent" : "",
        className,
      )}
    />
  );
}
