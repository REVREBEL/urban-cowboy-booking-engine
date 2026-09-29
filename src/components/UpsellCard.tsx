import { useEffect, useId, useRef, useState } from "react";
import { productLineTotal } from "../state/booking";
import { money, imgUrl } from "../lib/format";
import { chargingLabel } from "../lib/shaping";
import { focusFirst, trapTab } from "../lib/focus";
import type { ShapedProduct } from "../types/mews";
import { Photo } from "./Photo";
import { IconCheck, IconClose, IconPlus, IconSparkles } from "./icons";
import { t } from "../i18n";

export function UpsellCard({
  product,
  imageBaseUrl,
  selected,
  nightsCount,
  guestsCount,
  onToggle,
  locked = false,
}: {
  product: ShapedProduct;
  imageBaseUrl: string;
  selected: boolean;
  nightsCount: number;
  guestsCount: number;
  onToggle: () => void;
  locked?: boolean;
}) {
  const [detail, setDetail] = useState(false);
  const lineTotal = productLineTotal(product, nightsCount, guestsCount);

  return (
    <>
      <div
        className={`card group relative flex h-36 w-full items-stretch overflow-hidden text-left transition ${
          locked ? "ring-2 ring-turquoise/70" : "hover:shadow-float"
        } ${selected && !locked ? "ring-2 ring-turquoise" : ""}`}
      >
        <button
          type="button"
          disabled={locked}
          aria-pressed={locked ? undefined : selected}
          onClick={onToggle}
          className={`flex min-w-0 flex-1 items-stretch text-left ${
            locked ? "cursor-default" : "cursor-pointer"
          }`}
        >
          <span className="relative w-24 shrink-0 sm:w-28">
            <Photo
              src={imgUrl(imageBaseUrl, product.imageId, 300)}
              alt={product.name}
              className="h-full w-full object-cover"
              gradient="from-creole via-creole-soft to-turquoise-vivid"
            />
          </span>
          <span className="flex min-w-0 flex-1 flex-col p-4 pr-24">
            <span className="flex items-start justify-between gap-2">
              <span className="line-clamp-2 font-semibold leading-snug text-ink">{product.name}</span>
              {locked ? (
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-turquoise px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                  <IconCheck aria-hidden="true" className="h-3 w-3" /> {t("upsell.mandatory")}
                </span>
              ) : (
                <span
                  aria-hidden="true"
                  className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border transition ${
                    selected ? "border-turquoise bg-turquoise text-white" : "border-ink/25 text-ink/40"
                  }`}
                >
                  {selected ? <IconCheck className="h-4 w-4" /> : <IconPlus className="h-4 w-4" />}
                </span>
              )}
            </span>
            {product.description && (
              <span className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink/60">{product.description}</span>
            )}
            <span className="mt-auto pt-2 text-sm">
              <span className="font-display text-lg text-teal-deep">{money(product.price, product.currency)}</span>
              {chargingLabel(product.chargingMode) && (
                <span className="text-xs text-ink/45"> {chargingLabel(product.chargingMode)}</span>
              )}
              {lineTotal !== product.price && (
                <span className="text-xs text-ink/45">
                  {" "}· {money(lineTotal, product.currency)} {t("upsell.total")}
                </span>
              )}
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => setDetail(true)}
          className="absolute bottom-4 right-4 z-10 shrink-0 whitespace-nowrap text-xs font-medium text-turquoise underline-offset-2 hover:underline"
        >
          {t("upsell.learnMore")}
        </button>
      </div>

      {detail && (
        <ExtraDetailModal
          product={product}
          imageBaseUrl={imageBaseUrl}
          selected={selected}
          locked={locked}
          lineTotal={lineTotal}
          onToggle={onToggle}
          onClose={() => setDetail(false)}
        />
      )}
    </>
  );
}

function ExtraDetailModal({
  product,
  imageBaseUrl,
  selected,
  locked,
  lineTotal,
  onToggle,
  onClose,
}: {
  product: ShapedProduct;
  imageBaseUrl: string;
  selected: boolean;
  locked: boolean;
  lineTotal: number;
  onToggle: () => void;
  onClose: () => void;
}) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const raf = requestAnimationFrame(() => focusFirst(dialogRef.current));
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCloseRef.current();
        return;
      }
      trapTab(dialogRef.current, e);
    };
    document.addEventListener("keydown", onKey);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      requestAnimationFrame(() => returnFocusRef.current?.focus());
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        ref={dialogRef}
        className="relative z-10 max-h-[90vh] w-full max-w-md animate-scale-in overflow-y-auto rounded-t-2xl bg-cream shadow-float sm:rounded-2xl"
      >
        <div className="relative h-44 w-full">
          <Photo
            src={imgUrl(imageBaseUrl, product.imageId, 800)}
            alt={product.name}
            className="h-full w-full object-cover"
            gradient="from-creole via-creole-soft to-turquoise-vivid"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label={t("upsell.close")}
            className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/85 text-ink shadow transition hover:bg-white"
          >
            <IconClose aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5">
          <h3 id={titleId} className="font-display text-xl text-ink">{product.name}</h3>
          <p className="mt-1 text-sm">
            <span className="font-display text-lg text-teal-deep">{money(product.price, product.currency)}</span>
            {chargingLabel(product.chargingMode) && (
              <span className="text-ink/50"> {chargingLabel(product.chargingMode)}</span>
            )}
            {lineTotal !== product.price && (
              <span className="text-ink/50"> · {money(lineTotal, product.currency)} {t("upsell.total")}</span>
            )}
          </p>
          {product.description && (
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink/70">{product.description}</p>
          )}
          <div className="mt-5 flex items-center gap-2">
            {locked ? (
              <span className="flex flex-1 items-center gap-1.5 rounded-lg bg-turquoise/10 px-3 py-2 text-sm font-medium text-teal-deep">
                <IconCheck aria-hidden="true" className="h-4 w-4" /> {t("upsell.mandatoryNote")}
              </span>
            ) : (
              <button type="button" onClick={onToggle} className={`flex-1 ${selected ? "btn-ghost" : "btn-primary"}`}>
                {selected ? (
                  <>
                    <IconCheck aria-hidden="true" className="h-4 w-4" /> {t("upsell.added")}
                  </>
                ) : (
                  <>
                    <IconPlus aria-hidden="true" className="h-4 w-4" /> {t("upsell.add")}
                  </>
                )}
              </button>
            )}
            <button type="button" onClick={onClose} className="btn-ghost">
              {t("upsell.close")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function InlineUpsell({
  product,
  added,
  onToggle,
}: {
  product: ShapedProduct;
  added: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-xl2 border border-creole/30 bg-creole/10 p-4 sm:p-5">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-creole/20 text-creole">
        <IconSparkles aria-hidden="true" className="h-6 w-6" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink">
          {t("upsell.enhance", { name: product.name })}
        </p>
        <p className="text-xs text-ink/60">
          {product.description || t("upsell.descFallback")} ·{" "}
          <span className="font-semibold text-teal-deep">{money(product.price, product.currency)}</span>
        </p>
      </div>
      <button
        type="button"
        onClick={onToggle}
        className={added ? "btn-ghost" : "btn-accent"}
      >
        {added ? (
          <>
            <IconCheck aria-hidden="true" className="h-4 w-4" /> {t("upsell.added")}
          </>
        ) : (
          <>
            <IconPlus aria-hidden="true" className="h-4 w-4" /> {t("upsell.add")}
          </>
        )}
      </button>
    </div>
  );
}
