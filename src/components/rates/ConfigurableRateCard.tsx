import React, { useMemo, useState } from "react";
import type {
  RateCardArtworkMode,
  RateCardConfig,
  RateCardLayout,
  RateCardLiveContent,
  RateCardOverlayPosition,
} from "@/types/rate-card";
import { normalizeRateCardCtaLabel } from "@/lib/rateCardCta";
import { Button, type ButtonColor } from "@/components/ui/Button";
import { PolicyDisplay } from "./PolicyDisplay";
import {
  useHorizontalOfferLayout,
  HORIZONTAL_OFFER_BASE_HEIGHT,
  HORIZONTAL_OFFER_BASE_WIDTH,
} from "./useHorizontalOfferLayout";
import { cn } from "@/lib/utils";

export interface ConfigurableRateCardProps {
  config: RateCardConfig;
  live: RateCardLiveContent;
  layout?: RateCardLayout;
  artworkMode?: RateCardArtworkMode;
  onBook: () => void;
  isExpanded?: boolean;
  onExpand?: () => void;
  confirmLabel?: string;
  disabled?: boolean;
  className?: string;
}

const DESKTOP_POSITION_TOP: Record<RateCardOverlayPosition, string> = {
  high: "62%",
  normal: "67%",
  low: "72%",
};

const MOBILE_POSITION_TOP: Record<RateCardOverlayPosition, string> = {
  high: "32%",
  normal: "38%",
  low: "44%",
};

type SharedProps = Omit<ConfigurableRateCardProps, "layout">;

function actionLabel(
  config: RateCardConfig,
  live: RateCardLiveContent,
  isExpanded: boolean,
  confirmLabel: string
) {
  const base = normalizeRateCardCtaLabel(config.ctaLabel ?? live.ctaLabel);
  return isExpanded ? confirmLabel : base;
}

function VerticalRateCard({
  config,
  live,
  artworkMode = "auto",
  onBook,
  isExpanded = false,
  onExpand,
  confirmLabel = "CONFIRM BOOKING",
  disabled = false,
  className = "",
}: SharedProps) {
  const [desktopFailed, setDesktopFailed] = useState(false);
  const [mobileFailed, setMobileFailed] = useState(false);

  const desktopArtwork = desktopFailed ? null : config.desktopArtworkUrl;
  const mobileArtwork = mobileFailed ? null : config.mobileArtworkUrl;

  const hasAnyArtwork = Boolean(desktopArtwork || mobileArtwork);
  const fallbackIsVisible = !hasAnyArtwork;

  const style = useMemo(
    () =>
      ({
        "--rate-overlay-desktop-top": DESKTOP_POSITION_TOP[config.desktopOverlayPosition],
        "--rate-overlay-mobile-top": MOBILE_POSITION_TOP[config.mobileOverlayPosition],
        "--rate-fg": `var(--color-${config.textColor})`,
        "--rate-border-color": `var(--color-${config.textColor})`,
        "--rate-accent": `var(--color-${config.buttonColor})`,
      }) as React.CSSProperties,
    [
      config.desktopOverlayPosition,
      config.mobileOverlayPosition,
      config.textColor,
      config.buttonColor,
    ]
  );

  const ctaLabel = actionLabel(config, live, isExpanded, confirmLabel);
  const handleAction = () => {
    if (!isExpanded && onExpand) {
      onExpand();
      return;
    }
    onBook();
  };

  return (
    <article
      className={cn("rate-card-shell", className)}
      data-rate-card={config.id}
      data-rate-card-layout="vertical"
      data-artwork-mode={artworkMode}
      data-layout="vertical"
      data-text-color={config.textColor}
      data-button-color={config.buttonColor}
      data-font-pair={config.fontPair}
      data-border-style={config.borderStyle}
      data-desktop-overlay-position={config.desktopOverlayPosition}
      data-mobile-overlay-position={config.mobileOverlayPosition}
      data-artwork-fallback={fallbackIsVisible ? "true" : "false"}
      style={style}
      aria-labelledby={`rate-card-${config.id}-title`}
    >
      <div
        className="rate-card-frame rate-card-border-surface"
        data-border-style={config.borderStyle}
      >
        <div
          className={
            fallbackIsVisible
              ? "rate-card-semantic rate-card-semantic--visible p-8"
              : "sr-only"
          }
        >
          {config.eyebrow && (
            <p className="font-button text-xs uppercase">{config.eyebrow}</p>
          )}
          <h3
            id={`rate-card-${config.id}-title`}
            className="font-button font-bold text-2xl uppercase"
          >
            {config.headline}
          </h3>
          <p className="font-sans text-sm">{config.description}</p>
          {config.supportingText && (
            <p className="font-sans text-xs opacity-80">
              {config.supportingText}
            </p>
          )}
        </div>

        {desktopArtwork && (
          <img
            src={desktopArtwork}
            alt=""
            aria-hidden="true"
            className="hidden sm:block rate-card-artwork"
            onError={() => setDesktopFailed(true)}
          />
        )}

        {mobileArtwork && (
          <img
            src={mobileArtwork}
            alt=""
            aria-hidden="true"
            className="block sm:hidden rate-card-artwork"
            onError={() => setMobileFailed(true)}
          />
        )}

        {!desktopArtwork && mobileArtwork && (
          <img
            src={mobileArtwork}
            alt=""
            aria-hidden="true"
            className="rate-card-artwork"
          />
        )}

        {!mobileArtwork && desktopArtwork && (
          <img
            src={desktopArtwork}
            alt=""
            aria-hidden="true"
            className="rate-card-artwork"
          />
        )}

        <div className="rate-card-overlay">
          <div className="rate-card-price-block">
            <div className="rate-card-price">
              {live.price} <span>{live.priceUnit ?? "Nightly"}</span>
            </div>
            <div className="rate-card-tax">{live.taxLabel}</div>
          </div>

          <div className="rate-card-action">
            <Button
              type="button"
              variant={config.buttonStyle as "filled" | "outline" | "transparent"}
              colorScheme={config.buttonColor as ButtonColor}
              size="medium"
              className="w-full max-w-75 h-14.5 px-9"
              onClick={(event) => {
                event.stopPropagation();
                handleAction();
              }}
              disabled={disabled}
              aria-label={`${ctaLabel}: ${config.headline}, ${live.price} ${live.priceUnit ?? "nightly"}`}
            >
              {ctaLabel}
            </Button>

            <PolicyDisplay
              className="rate-card-policy"
              text={live.cancellationText}
            />
          </div>
        </div>
      </div>
    </article>
  );
}

function HorizontalRateCard({
  config,
  live,
  onBook,
  isExpanded = false,
  onExpand,
  confirmLabel = "CONFIRM BOOKING",
  disabled = false,
  className = "",
}: SharedProps) {
  const [artworkFailed, setArtworkFailed] = useState(false);
  const { ref, layout } = useHorizontalOfferLayout<HTMLElement>();

  const artwork = artworkFailed ? null : config.horizontalArtworkUrl;
  const fallbackIsVisible = !artwork;

  const style = useMemo(
    () =>
      ({
        "--rate-fg": `var(--color-${config.textColor})`,
        "--rate-border-color": `var(--color-${config.textColor})`,
        "--rate-accent": `var(--color-${config.accentColor ?? "bandana-red"})`,
        "--horizontal-offer-height": `${layout.renderedHeight}px`,
      }) as React.CSSProperties,
    [layout.renderedHeight, config.textColor, config.accentColor]
  );

  const ctaLabel = actionLabel(config, live, isExpanded, confirmLabel);
  const handleAction = () => {
    if (!isExpanded && onExpand) {
      onExpand();
      return;
    }
    onBook();
  };

  return (
    <article
      ref={ref}
      className={cn("rate-card-shell rate-card-border-surface", className)}
      data-rate-card={config.id}
      data-rate-card-layout="horizontal"
      data-layout="horizontal"
      data-text-color={config.textColor}
      data-button-color={config.buttonColor}
      data-font-pair={config.fontPair}
      data-border-style={config.borderStyle}
      data-artwork-fallback={fallbackIsVisible ? "true" : "false"}
      style={style}
      aria-labelledby={`horizontal-rate-card-${config.id}-title`}
    >
      <div
        className="horizontal-rate-card-viewport"
        style={{
          width: `${layout.logicalViewportWidth}px`,
          height: `${HORIZONTAL_OFFER_BASE_HEIGHT}px`,
          transform: `scale(${layout.scale})`,
        }}
      >
        <div
          className="horizontal-rate-card-artboard"
          style={{
            width: `${HORIZONTAL_OFFER_BASE_WIDTH}px`,
            height: `${HORIZONTAL_OFFER_BASE_HEIGHT}px`,
          }}
        >
          <div
            className={
              fallbackIsVisible
                ? "horizontal-rate-card-semantic horizontal-rate-card-semantic--visible"
                : "sr-only"
            }
          >
            {config.eyebrow && <p>{config.eyebrow}</p>}
            <h3 id={`horizontal-rate-card-${config.id}-title`}>
              {config.headline}
            </h3>
            <p>{config.description}</p>
            {config.supportingText && <p>{config.supportingText}</p>}
          </div>

          {artwork && (
            <img
              src={artwork}
              alt=""
              aria-hidden="true"
              className="rate-card-artwork"
              onError={() => setArtworkFailed(true)}
            />
          )}

          <div
            className="horizontal-rate-card-overlay"
            style={{ transform: `translateX(-${layout.overlayShift}px)` }}
          >
            <div className="text-center rate-card-price-block top-13! right-9! left-9!">
              <div className="leading-[0.95] whitespace-nowrap rate-card-price text-[56px]!">
                {live.price} <span>{live.priceUnit ?? "Nightly"}</span>
              </div>
              <div className="mt-2.5 font-bold leading-tight rate-card-tax text-[23px]!">
                {live.taxLabel}
              </div>
            </div>

            <div className="rate-card-action bottom-9! right-8.5! left-8.5! gap-6">
              <Button
                type="button"
                variant={config.buttonStyle as "filled" | "outline" | "transparent"}
                colorScheme={config.buttonColor as ButtonColor}
                size="large"
                className="w-full max-w-78.75 h-20 px-8 text-[27px]"
                onClick={(event) => {
                  event.stopPropagation();
                  handleAction();
                }}
                disabled={disabled}
                aria-label={`${ctaLabel}: ${config.headline}, ${live.price} ${live.priceUnit ?? "nightly"}`}
              >
                {ctaLabel}
              </Button>
              <p className="font-bold leading-tight rate-card-policy text-[18px]!">
                {live.cancellationText}
              </p>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export const ConfigurableRateCard: React.FC<ConfigurableRateCardProps> = ({
  layout = "vertical",
  ...props
}) => {
  return layout === "horizontal" ? (
    <HorizontalRateCard {...props} />
  ) : (
    <VerticalRateCard {...props} />
  );
};

export default ConfigurableRateCard;