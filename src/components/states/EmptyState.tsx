type Props = {
  heading?: string;
  body?: string;
  action?: { label: string; onClick: () => void };
};

export default function EmptyState({
  heading = 'Nothing available for these dates',
  body = 'Try different dates or adjust your guest count.',
  action,
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-5 text-center px-5">
      <img src="/assets/hammock.svg" alt="" aria-hidden="true" className="h-16 opacity-40" />
      <h3
        className="text-2xl text-[#4e332d]"
        style={{ fontFamily: 'var(--font-desert)', fontWeight: 700 }}
      >
        {heading}
      </h3>
      <p className="text-sm text-[#767470] max-w-xs" style={{ fontFamily: 'var(--font-inter)' }}>
        {body}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-2 px-6 py-2.5 bg-[#9a5636] text-white text-xs tracking-widest uppercase rounded-full hover:bg-[#8b3a2e] transition-colors"
          style={{ fontFamily: 'var(--font-urbanist)', fontWeight: 600 }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
