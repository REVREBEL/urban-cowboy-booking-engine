export function Brand({ className = "", subtle = false, alt = false }: {
  className?: string;
  subtle?: boolean;
  /** Use the full brand lockup instead of the compact mark. */
  alt?: boolean;
}) {
  return (
    <span
      role="img"
      aria-label="Urban Cowboy"
      className={`inline-block h-7 w-auto max-w-full shrink-0 bg-current align-middle sm:h-8 ${subtle ? "opacity-70" : ""} ${className}`}
      style={{
        // An external <img> cannot inherit currentColor. A CSS mask retains
        // the committed SVG as the source while tinting it via text color.
        aspectRatio: alt ? "2539.09 / 1784.72" : "300 / 52.93",
        maskImage: `url("/assets/brand/logos/${alt ? "brand-full.svg" : "brand.svg"}")`,
        WebkitMaskImage: `url("/assets/brand/logos/${alt ? "brand-full.svg" : "brand.svg"}")`,
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskPosition: "center",
        WebkitMaskPosition: "center",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
      }}
    />
  );
}
