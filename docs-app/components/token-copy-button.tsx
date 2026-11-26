"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type CopyState = "idle" | "copied" | "error";

/** Small native control: copies a token name or value without owning app-wide button styling. */
export function TokenCopyButton({ value, label }: { value: string; label: string }) {
  const [state, setState] = useState<CopyState>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const copy = useCallback(async () => {
    try {
      let copied = false;
      if (navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(value);
          copied = true;
        } catch {
          // The async clipboard can be denied on plain HTTP; try the fallback.
        }
      }
      if (!copied) {
        const field = document.createElement("textarea");
        field.value = value;
        field.setAttribute("readonly", "");
        field.style.position = "fixed";
        field.style.opacity = "0";
        document.body.appendChild(field);
        field.select();
        copied = document.execCommand("copy");
        field.remove();
      }
      if (!copied) throw new Error("copy unavailable");
      setState("copied");
    } catch {
      setState("error");
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 1800);
  }, [value]);

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Copy ${label}: ${value}`}
      title={`Copy ${value}`}
      className="inline-flex shrink-0 cursor-pointer items-center rounded-field border border-paper-700 bg-paper px-2 py-1 font-label text-[11px] uppercase tracking-wider text-lake-forest hover:bg-alpine-linen-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper"
    >
      <span aria-hidden="true">{state === "copied" ? "✓" : state === "error" ? "!" : "Copy"}</span>
      <span aria-live="polite" className="sr-only">
        {state === "copied" ? `Copied ${label}` : state === "error" ? `Could not copy ${label}` : ""}
      </span>
    </button>
  );
}
