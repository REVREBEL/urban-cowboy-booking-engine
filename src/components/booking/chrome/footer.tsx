import { getLang, setLangAndReload, type Lang } from "@/lib/lang";

export function BookingFooter() {
  const active = getLang();
  const languages: Array<{ code: Lang; label: string }> = [
    { code: "fr", label: "FR" },
    { code: "en", label: "EN" },
  ];

  return (
    <footer className="mt-20 w-full border-t-4 border-[#343833] bg-[#4E332D] pb-12 pt-14 text-[#EBE8E0]">
      <div className="booking-shell">
        <div className="flex flex-col items-center justify-between gap-8 border-b border-[#EBE8E0]/15 pb-10 text-center md:flex-row md:text-left">
          <img
            src="./assets/brand/logos/urban-cowboy_light.svg"
            alt="Urban Cowboy"
            className="mx-auto h-10 w-auto select-none object-contain md:mx-0 sm:h-12"
          />
          <div className="flex flex-wrap items-center justify-center gap-6 font-woodblock text-xs uppercase tracking-widest text-[#EBE8E0]/80">
            <span>The Catskills (Big Indian, NY)</span>
            <span>·</span>
            <span>Nashville, TN</span>
            <span>·</span>
            <span>Denver, CO</span>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-5 pt-8 text-[11px] text-[#EBE8E0]/60 sm:flex-row">
          <span>© <span className="font-number">{new Date().getFullYear()}</span> Urban Cowboy Lodge & Bathing Suites. All rights reserved.</span>
          <div className="flex items-center gap-2">
            <span className="font-label text-[10px] uppercase tracking-wider">Language</span>
            {languages.map((language) => (
              <button
                key={language.code}
                type="button"
                onClick={() => setLangAndReload(language.code)}
                aria-pressed={active === language.code}
                className={"rounded-full border px-2.5 py-1 font-button text-[10px] font-bold transition " + (active === language.code ? "border-[#EBE8E0] bg-[#EBE8E0] text-[#4E332D]" : "border-[#EBE8E0]/30 text-[#EBE8E0]/70 hover:border-[#EBE8E0] hover:text-[#EBE8E0]")}
              >
                {language.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4 font-woodblock text-[10px] uppercase tracking-wider">
            <span>Privacy Policy</span><span>·</span><span>Terms & Conditions</span><span>·</span><span>Accessibility</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
