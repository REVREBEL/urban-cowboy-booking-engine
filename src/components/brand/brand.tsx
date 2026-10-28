export function Brand({ className = "", subtle = false, alt = false }: {
  className?: string;
  subtle?: boolean;
  /** Use the full brand lockup instead of the compact mark. */
  alt?: boolean;
}) {
  return (
    <img
      src={alt ? "/assets/brand/logos/brand-full.svg" : "/assets/brand/logos/brand.svg"}
      alt="Urban Cowboy"
      className={`inline-block h-auto w-auto max-w-full object-contain ${subtle ? "opacity-70" : ""} ${className}`}
    />
  );
}
