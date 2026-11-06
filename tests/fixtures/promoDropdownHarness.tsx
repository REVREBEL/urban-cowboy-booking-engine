import React, { useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { SearchBarPromoDropdown } from "../../src/components/booking/search/SearchBarPromoDropdown";

function Harness() {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [aborted, setAborted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [closeCount, setCloseCount] = useState(0);

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
      <output data-testid="close-count">{String(closeCount)}</output>

      {open ? (
        <SearchBarPromoDropdown
          initialValue="TESTCODE"
          triggerRef={triggerRef}
          closeOnApply
          onClose={() => {
            setCloseCount((count) => count + 1);
            setOpen(false);
          }}
          onApply={(_, signal) =>
            new Promise<void>((resolve) => {
              window.setTimeout(() => {
                setCompleted(true);
                resolve();
              }, 250);

              signal?.addEventListener(
                "abort",
                () => {
                  setAborted(true);
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
