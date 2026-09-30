import type { ReactNode } from "react";
import {
  COLOR_PALETTE,
  type ButtonColor,
} from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type BannerProps = {
  children: ReactNode;
  color?: ButtonColor;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
};

export function Banner({
  children,
  color = "whiskey-sour",
  actionLabel,
  onAction,
  className,
}: BannerProps) {
  const colorConfig = COLOR_PALETTE[color];
  const textColor = colorConfig.isLightBg ? "#4E332D" : "#FFFFFF";

  return (
    <div
      role="status"
      className={cn(
        "w-full px-5 py-2.5 text-center font-body text-sm",
        className,
      )}
      style={{
        backgroundColor: colorConfig.hex,
        color: textColor,
        fontFamily: "var(--font-body)",
      }}
    >
      <span>{children}</span>
      {actionLabel && onAction ? (
        <>
          {" "}
          <button
            type="button"
            onClick={onAction}
            className="font-body font-semibold underline underline-offset-2 transition-opacity hover:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-2"
          >
            {actionLabel}
          </button>
        </>
      ) : null}
    </div>
  );
}
