type Props = {
  message?: string;
  onRetry?: () => void;
};

export default function ErrorState({
  message = 'Something went wrong. Please try again.',
  onRetry,
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-5 text-center px-5">
      <div className="w-12 h-12 rounded-full border-2 border-copper flex items-center justify-center">
        <span className="text-copper text-xl font-bold">!</span>
      </div>
      <p className="text-sm text-cowboy-umber max-w-xs" style={{ fontFamily: 'var(--font-body)' }}>
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-6 py-2.5 border border-cowboy-umber text-cowboy-umber text-xs tracking-widest uppercase rounded-full hover:bg-cowboy-umber hover:text-white transition-colors"
          style={{ fontFamily: 'var(--font-urbanist)', fontWeight: 600 }}
        >
          Try again
        </button>
      )}
    </div>
  );
}
