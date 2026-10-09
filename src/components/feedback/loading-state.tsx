export default function LoadingState({ message = 'Finding your stay…' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4" role="status" aria-live="polite">
      <div className="w-10 h-10 rounded-full border-2 border-ash border-t-[#9a5636] animate-spin" />
      <p
        className="text-sm tracking-widest uppercase text-copper"
        style={{ fontFamily: 'var(--font-label)' }}
      >
        {message}
      </p>
    </div>
  );
}
