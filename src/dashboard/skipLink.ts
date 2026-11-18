// COW-37 skip-link activation. Kept separate so keyboard behavior is testable
// without mutating the hash used by the dashboard router.
export interface SkipLinkEvent {
  preventDefault(): void;
}

export interface FocusTarget {
  focus(): void;
}

export function activateSkipLink(event: SkipLinkEvent, main: FocusTarget | null): void {
  event.preventDefault();
  main?.focus();
}
