type Props = {
  heading?: string;
  body?: string;
  action?: { label: string; onClick: () => void };
  /** Optional prefix for root-relative icon URLs when hosted under a base path. */
  imageBaseUrl?: string;
};

export default function EmptyState({
  heading = 'Nothing available for these dates',
  body = 'Try different dates or adjust your guest count.',
  action,
  imageBaseUrl = '',
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-5 text-center px-5">
      <img src={`${imageBaseUrl}/assets/icons/icons-simple/hammock.svg`} alt="" aria-hidden="true" className="h-16 opacity-40" />
      <h3
        className="text-2xl text-cowboy-umber"
        style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}
      >
        {heading}
      </h3>
      <p className="text-sm text-alpine-linen-900 max-w-xs" style={{ fontFamily: 'var(--font-body)' }}>
        {body}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-2 px-6 py-2.5 bg-copper text-white text-xs tracking-widest uppercase rounded-full hover:bg-copper transition-colors"
          style={{ fontFamily: 'var(--font-urbanist)', fontWeight: 600 }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
