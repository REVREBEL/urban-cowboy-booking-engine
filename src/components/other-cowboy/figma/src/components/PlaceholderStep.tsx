import { useBooking } from '../booking/BookingContext';

type Props = { title: string };

export default function PlaceholderStep({ title }: Props) {
  const { goBack } = useBooking();
  return (
    <main className="min-h-screen bg-[#ebe8e0] flex flex-col items-center justify-center gap-6 px-5">
      <h1
        className="text-4xl md:text-6xl text-[#4e332d] text-center"
        style={{ fontFamily: 'var(--font-desert)', fontWeight: 700 }}
      >
        {title}
      </h1>
      <p className="text-sm text-[#767470] text-center max-w-xs" style={{ fontFamily: 'var(--font-uchen)' }}>
        This step is a placeholder in the prototype.
      </p>
      <button
        onClick={goBack}
        className="px-6 py-3 border border-[#4e332d] text-[#4e332d] text-xs tracking-widest uppercase rounded-full hover:bg-[#4e332d] hover:text-white transition-colors"
        style={{ fontFamily: 'var(--font-brothers)' }}
      >
        ← Back
      </button>
    </main>
  );
}
