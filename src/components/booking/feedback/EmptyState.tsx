export function EmptyState({
  heading,
  body,
  action,
}: {
  heading: string;
  body: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="rounded-2xl border border-umber/15 bg-white/65 p-10 text-center">
      <h2 className="font-display text-2xl text-umber">{heading}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">{body}</p>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-5 rounded-full bg-umber px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-linen"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
