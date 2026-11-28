"use client";

import Image from "next/image";
import { useState } from "react";
import styles from "./color-swatch.module.css";

export type ColorSwatchProps = {
  colorName: string;
  colorToken: string;
  hexValue: string;
  oklchValue: string;
  color: string;
  /** Override the card ink for light colors that need a dark label. */
  foreground: string;
  /** The checked-in copy icon is white; invert it when the card uses dark ink. */
  copyIconDark: boolean;
};

/** Figma color--swatch (1478:813), using the booking engine's real type and color tokens. */
export function ColorSwatch({
  colorName,
  colorToken,
  hexValue,
  oklchValue,
  color,
  foreground,
  copyIconDark,
}: ColorSwatchProps) {
  const [copied, setCopied] = useState(false);

  async function copyColor() {
    try {
      await navigator.clipboard.writeText(hexValue);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <article
      className={styles.swatch}
      style={{ backgroundColor: color, color: foreground }}
      data-node-id="1478:813"
      data-name="color--swatch"
      data-dark-ink={copyIconDark}
    >
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <div className={styles.topSection}>
            <button
              type="button"
              onClick={copyColor}
              aria-label={`Copy ${colorName} color value ${hexValue}`}
              title={copied ? "Copied" : `Copy ${hexValue}`}
              className={styles.copyButton}
            >
              <Image className={styles.copyIcon} src="/icons/color-swatch-copy.svg" alt="" width={21} height={23} />
              <span className={styles.srOnly} aria-live="polite">{copied ? "Color value copied" : ""}</span>
            </button>
            <div className={styles.itemWrapper}>
              <h3 className={styles.name}>{colorName}</h3>
              <p className={styles.token}>{colorToken.replace(/^--/, "—")}</p>
            </div>
          </div>
          <div className={styles.bottomSection}>
            <p className={styles.hex}>{hexValue}</p>
            <p className={styles.oklch}>{oklchValue}</p>
          </div>
        </div>
      </div>
    </article>
  );
}
