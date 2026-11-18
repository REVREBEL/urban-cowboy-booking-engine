// COW-37 shared panel states. Mock data is never used as a fallback.
import { Button } from "@/components/ui/Button";

export function LoadingPanel({ label = "Loading data" }: { label?: string }) {
  return (
    <div className="card flex items-center gap-3 p-5" role="status" aria-live="polite">
      <span className="size-5 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-emphasis" aria-hidden />
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
}

export function ErrorPanel({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="card border border-error/30 p-5" role="alert">
      <h2 className="font-heading text-lg text-foreground">Unable to load this section</h2>
      <p className="mt-1 text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <div className="mt-4 flex justify-start">
          <Button variant="outline" colorScheme="light" size="small" textCase="title" onClick={onRetry}>
            Retry
          </Button>
        </div>
      )}
    </div>
  );
}

export function EmptyPanel({ message }: { message: string }) {
  return (
    <div className="card p-5" role="status">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
