"use client";

import Image from "next/image";
import { useState } from "react";
import styles from "./color-swatch.module.css";

export type ColorSwatchProps = {
  colorName: string;
  colorToken: string;
  hexValue: string;
  oklchValue: string;
  color?: string;
};

/** Figma color--swatch (1478:813), using the booking engine's real type and color tokens. */
export function ColorSwatch({
  colorName,
  colorToken,
  hexValue,
  oklchValue,
  color = "var(--lake-forest-500, #184428)",
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
      style={{ backgroundColor: color }}
      data-node-id="1478:813"
      data-name="color--swatch"
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
              <Image className={styles.copyIcon} src="/icons/color-swatch-copy.svg" alt="" width={21} height={24} priority />
              <span className={styles.srOnly} aria-live="polite">{copied ? "Color value copied" : ""}</span>
            </button>
            <div className={styles.itemWrapper}>
              <h3 className={styles.name}>{colorName}</h3>
              <p className={styles.token}>{colorToken}</p>
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
