export default function LoadingState({ message = 'Finding your stay…' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4" role="status" aria-live="polite">
      <div className="w-10 h-10 rounded-full border-2 border-[#ccc7bb] border-t-[#9a5636] animate-spin" />
      <p
        className="text-sm tracking-widest uppercase text-[#9a5636]"
        style={{ fontFamily: 'var(--font-brothers)' }}
      >
        {message}
      </p>
    </div>
  );
}
