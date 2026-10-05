import React, { useMemo, useState } from "react";
import type {
  RateCardArtworkMode,
  RateCardConfig,
  RateCardLiveContent,
  RateCardOverlayPosition,
} from "@/types/rate-card";

export interface ConfigurableRateCardProps {
  config: RateCardConfig;
  live: RateCardLiveContent;
  artworkMode?: RateCardArtworkMode;
  onBook: () => void;
  disabled?: boolean;
  className?: string;
}

const POSITION_TOP: Record<RateCardOverlayPosition, string> = {
  high: "48%",
  normal: "58%",
  low: "68%",
};

export const ConfigurableRateCard: React.FC<ConfigurableRateCardProps> = ({
  config,
  live,
  artworkMode = "auto",
  onBook,
  disabled = false,
  className = "",
}) => {
  const [desktopFailed, setDesktopFailed] = useState(false);
  const [mobileFailed, setMobileFailed] = useState(false);

  const desktopArtwork = desktopFailed ? null : config.desktopArtworkUrl;
  const mobileArtwork = mobileFailed ? null : config.mobileArtworkUrl;

  const hasAnyArtwork = Boolean(desktopArtwork || mobileArtwork);
  const fallbackIsVisible = !hasAnyArtwork;

  const style = useMemo(
    () =>
      ({
        "--rate-overlay-desktop-top": POSITION_TOP[config.desktopOverlayPosition],
        "--rate-overlay-mobile-top": POSITION_TOP[config.mobileOverlayPosition],
      }) as React.CSSProperties,
    [config.desktopOverlayPosition, config.mobileOverlayPosition],
  );

  return (
    <article
      className={`rate-card-shell ${className}`}
      data-rate-card={config.id}
      data-artwork-mode={artworkMode}
      data-theme={config.theme}
      data-font-pair={config.fontPair}
      data-artwork-fallback={fallbackIsVisible ? "true" : "false"}
      style={style}
      aria-labelledby={`rate-card-${config.id}-title`}
    >
      <div className="rate-card-frame">
        <div
          className={
            fallbackIsVisible
              ? "rate-card-semantic rate-card-semantic--visible"
              : "sr-only"
          }
        >
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
            <button
              type="button"
              className="rate-card-cta"
              data-button-style={config.buttonStyle}
              onClick={onBook}
              disabled={disabled}
              aria-label={`${live.ctaLabel ?? "Book now"}: ${config.headline}, ${live.price} ${live.priceUnit ?? "nightly"}`}
            >
              {live.ctaLabel ?? "BOOK NOW"}
            </button>

            <p className="rate-card-policy">{live.cancellationText}</p>
          </div>
        </div>
      </div>
    </article>
  );
};

export default ConfigurableRateCard;
