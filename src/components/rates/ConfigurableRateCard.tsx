import React, { useMemo, useState } from "react";
import type {
  RateCardArtworkMode,
  RateCardConfig,
  RateCardLayout,
  RateCardLiveContent,
  RateCardOverlayPosition,
} from "@/types/rate-card";
import { RATE_CARD_COLORS } from "@/lib/rateCardPresentation";
import { normalizeRateCardCtaLabel } from "@/lib/rateCardCta";
import { Button } from "@/components/ui/button";
import {
  HORIZONTAL_OFFER_BASE_HEIGHT,
  HORIZONTAL_OFFER_BASE_WIDTH,
  useHorizontalOfferLayout,
} from "./useHorizontalOfferLayout";

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
  confirmLabel: string,
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
  const textColor = RATE_CARD_COLORS[config.textColor].hex;
  const accentColor = RATE_CARD_COLORS[config.accentColor ?? "bandana-red"].hex;
  const fallbackIsVisible = !desktopArtwork && !mobileArtwork;

  const style = useMemo(
    () =>
      ({
        "--rate-overlay-desktop-top": DESKTOP_POSITION_TOP[config.desktopOverlayPosition],
        "--rate-overlay-mobile-top": MOBILE_POSITION_TOP[config.mobileOverlayPosition],
        "--rate-fg": textColor,
        "--rate-border-color": textColor,
        "--rate-accent": accentColor,
      }) as React.CSSProperties,
    [
      config.desktopOverlayPosition,
      config.mobileOverlayPosition,
      textColor,
      accentColor,
    ],
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
      className={`rate-card-shell ${className}`}
      data-rate-card={config.id}
      data-rate-card-layout="vertical"
      data-artwork-mode={artworkMode}
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
      <div className="rate-card-frame rate-card-border-surface" data-border-style={config.borderStyle}>
        <div className={fallbackIsVisible ? "rate-card-semantic rate-card-semantic--visible" : "sr-only"}>
          {config.eyebrow && <p>{config.eyebrow}</p>}
          <h3 id={`rate-card-${config.id}-title`}>{config.headline}</h3>
          <p>{config.description}</p>
          {config.supportingText && <p>{config.supportingText}</p>}
        </div>

        {desktopArtwork && (
          <img
            src={desktopArtwork}
            alt=""
            aria-hidden="true"
            className="rate-card-artwork rate-card-artwork--desktop"
            onError={() => setDesktopFailed(true)}
          />
        )}

        {mobileArtwork && (
          <img
            src={mobileArtwork}
            alt=""
            aria-hidden="true"
            className="rate-card-artwork rate-card-artwork--mobile"
            onError={() => setMobileFailed(true)}
          />
        )}

        {!desktopArtwork && mobileArtwork && (
          <img
            src={mobileArtwork}
            alt=""
            aria-hidden="true"
            className="rate-card-artwork rate-card-artwork--desktop rate-card-artwork--fallback"
          />
        )}

        {!mobileArtwork && desktopArtwork && (
          <img
            src={desktopArtwork}
            alt=""
            aria-hidden="true"
            className="rate-card-artwork rate-card-artwork--mobile rate-card-artwork--fallback"
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
              variant={config.buttonStyle}
              color={config.buttonColor}
              size="default"
              className="rate-card-cta max-w-full"
              style={config.buttonStyle === "outline" ? { color: textColor } : undefined}
              onClick={(event) => {
                event.stopPropagation();
                handleAction();
              }}
              disabled={disabled}
              aria-label={`${ctaLabel}: ${config.headline}, ${live.price} ${live.priceUnit ?? "nightly"}`}
            >
              {ctaLabel}
            </Button>
            <p className="rate-card-policy">{live.cancellationText}</p>
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
  const textColor = RATE_CARD_COLORS[config.textColor].hex;
  const accentColor = RATE_CARD_COLORS[config.accentColor ?? "bandana-red"].hex;

  const style = useMemo(
    () =>
      ({
        "--rate-fg": textColor,
        "--rate-border-color": textColor,
        "--rate-accent": accentColor,
        "--horizontal-offer-height": `${layout.renderedHeight}px`,
      }) as React.CSSProperties,
    [layout.renderedHeight, textColor, accentColor],
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
      className={`horizontal-rate-card-shell rate-card-border-surface ${className}`}
      data-rate-card={config.id}
      data-rate-card-layout="horizontal"
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
          <div className={fallbackIsVisible ? "horizontal-rate-card-semantic horizontal-rate-card-semantic--visible" : "sr-only"}>
            {config.eyebrow && <p>{config.eyebrow}</p>}
            <h3 id={`horizontal-rate-card-${config.id}-title`}>{config.headline}</h3>
            <p>{config.description}</p>
            {config.supportingText && <p>{config.supportingText}</p>}
          </div>

          {artwork && (
            <img
              src={artwork}
              alt=""
              aria-hidden="true"
              className="horizontal-rate-card-artwork"
              onError={() => setArtworkFailed(true)}
            />
          )}

          <div
            className="horizontal-rate-card-overlay"
            style={{ transform: `translateX(-${layout.overlayShift}px)` }}
          >
            <div className="horizontal-rate-card-price-block">
              <div className="horizontal-rate-card-price">
                {live.price} <span>{live.priceUnit ?? "Nightly"}</span>
              </div>
              <div className="horizontal-rate-card-tax">{live.taxLabel}</div>
            </div>

            <div className="horizontal-rate-card-action">
              <Button
                type="button"
                variant={config.buttonStyle}
                color={config.buttonColor}
                size="default"
                className="horizontal-rate-card-cta"
                style={config.buttonStyle === "outline" ? { color: textColor } : undefined}
                onClick={(event) => {
                  event.stopPropagation();
                  handleAction();
                }}
                disabled={disabled}
                aria-label={`${ctaLabel}: ${config.headline}, ${live.price} ${live.priceUnit ?? "nightly"}`}
              >
                {ctaLabel}
              </Button>
              <p className="horizontal-rate-card-policy">{live.cancellationText}</p>
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
