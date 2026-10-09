import React, { useMemo, useState } from "react";
import type { RateCardConfig, RateCardLiveContent } from "@/types/rate-card";
import { RATE_CARD_COLORS } from "@/lib/rateCardPresentation";
import { normalizeRateCardCtaLabel } from "@/lib/rateCardCta";
import { Button } from "@/components/ui/button";
import {
  HORIZONTAL_OFFER_BASE_HEIGHT,
  HORIZONTAL_OFFER_BASE_WIDTH,
  useHorizontalOfferLayout,
} from "./useHorizontalOfferLayout";

export interface ConfigurableHorizontalRateCardProps {
  config: RateCardConfig;
  live: RateCardLiveContent;
  onBook: () => void;
  isExpanded?: boolean;
  onExpand?: () => void;
  confirmLabel?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * 1475 × 380 offer composition.
 *
 * Responsive behavior is intentionally art-directed:
 * 1. crop from the right,
 * 2. move only the live transactional overlay left,
 * 3. stop the overlay at 51% of the original artboard,
 * 4. then scale the cropped composition proportionally.
 */
export const ConfigurableHorizontalRateCard: React.FC<
  ConfigurableHorizontalRateCardProps
> = ({
  config,
  live,
  onBook,
  isExpanded = false,
  onExpand,
  confirmLabel = "CONFIRM BOOKING",
  disabled = false,
  className = "",
}) => {
  const [artworkFailed, setArtworkFailed] = useState(false);
  const { ref, layout } = useHorizontalOfferLayout<HTMLElement>();

  const artwork = artworkFailed ? null : config.horizontalArtworkUrl;
  const fallbackIsVisible = !artwork;
  const textColor = RATE_CARD_COLORS[config.textColor].hex;

  const style = useMemo(
    () =>
      ({
        "--rate-fg": textColor,
        "--rate-border-color": textColor,
        "--horizontal-offer-height": `${layout.renderedHeight}px`,
      }) as React.CSSProperties,
    [layout.renderedHeight, textColor],
  );

  const baseCtaLabel = normalizeRateCardCtaLabel(config.ctaLabel ?? live.ctaLabel);
  const ctaLabel = isExpanded ? confirmLabel : baseCtaLabel;

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
          <div
            className={
              fallbackIsVisible
                ? "horizontal-rate-card-semantic horizontal-rate-card-semantic--visible"
                : "sr-only"
            }
          >
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
            style={{
              transform: `translateX(-${layout.overlayShift}px)`,
            }}
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
                style={
                  config.buttonStyle === "outline"
                    ? { color: textColor }
                    : undefined
                }
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
};

export default ConfigurableHorizontalRateCard;
