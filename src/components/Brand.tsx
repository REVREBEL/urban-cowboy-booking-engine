export function Brand({ className = "", subtle = false }: { className?: string; subtle?: boolean }) {
  return (
    <span
      role="img"
      aria-label="Urban Cowboy"
      className={`inline-flex h-7 items-center font-display text-xl font-semibold uppercase tracking-[0.16em] sm:h-8 ${subtle ? "opacity-70" : ""} ${className}`}
    >
      Urban Cowboy
    </span>
  );
}
