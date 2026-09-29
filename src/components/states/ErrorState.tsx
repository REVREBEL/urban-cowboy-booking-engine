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
      <div className="w-12 h-12 rounded-full border-2 border-[#8b3a2e] flex items-center justify-center">
        <span className="text-[#8b3a2e] text-xl font-bold">!</span>
      </div>
      <p className="text-sm text-[#4e332d] max-w-xs" style={{ fontFamily: 'var(--font-inter)' }}>
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-6 py-2.5 border border-[#4e332d] text-[#4e332d] text-xs tracking-widest uppercase rounded-full hover:bg-[#4e332d] hover:text-white transition-colors"
          style={{ fontFamily: 'var(--font-urbanist)', fontWeight: 600 }}
        >
          Try again
        </button>
      )}
    </div>
  );
}
