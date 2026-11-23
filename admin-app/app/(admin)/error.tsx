"use client";

import { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin portal route error", error);
  }, [error]);

  return (
    <section role="alert" className="flex flex-col items-start gap-3 rounded-md border border-border p-4">
      <h2 className="text-lg font-semibold">This admin page could not be loaded</h2>
      <p className="text-sm text-muted-foreground">
        The error was contained by the route boundary. Retry, or return to the admin home.
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-md border border-border px-3 py-2 text-sm"
      >
        Try again
      </button>
    </section>
  );
}
