import React, { useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { SearchBarPromoDropdown } from "../../src/components/booking/search/SearchBarPromoDropdown";

function Harness() {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [aborted, setAborted] = useState(false);
  const [completed, setCompleted] = useState(false);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        Promo
      </button>
      <output data-testid="aborted">{String(aborted)}</output>
      <output data-testid="completed">{String(completed)}</output>

      {open ? (
        <SearchBarPromoDropdown
          initialValue="TESTCODE"
          triggerRef={triggerRef}
          closeOnApply
          onClose={() => setOpen(false)}
          onApply={(_, signal) =>
            new Promise<void>((resolve) => {
              const timer = window.setTimeout(() => {
                if (!signal?.aborted) setCompleted(true);
                resolve();
              }, 250);

              signal?.addEventListener(
                "abort",
                () => {
                  window.clearTimeout(timer);
                  setAborted(true);
                  resolve();
                },
                { once: true },
              );
            })
          }
        />
      ) : null}
    </>
  );
}

createRoot(document.getElementById("root")!).render(<Harness />);
