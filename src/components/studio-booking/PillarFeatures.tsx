const PILLARS = [
  {
    title: "DISAPPEAR FOR A WHILE",
    text: "Trade pavement for mountain air and the kind of quiet that makes you forget what day it is.",
    icon: "/assets/hammock.svg",
    alt: "Hammock",
  },
  {
    title: "SOAK IT ALL IN",
    text: "Sauna, outdoor hangs, long baths and plenty of ways to slow the whole operation down.",
    icon: "/assets/icons/amenities/simple/estonian_sauna.svg",
    alt: "Estonian sauna",
  },
  {
    title: "BETTER TOGETHER",
    text: "Dinner, drinks, fireside nights and whatever happens next. Cowboy is made for gathering.",
    icon: "/assets/campfire.svg",
    alt: "Campfire",
  },
];

export function PillarFeatures() {
  return (
    <section className="booking-shell py-12 md:py-16">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-12">
        {PILLARS.map((pillar) => (
          <div key={pillar.title} className="group flex flex-col items-center text-center md:items-start md:text-left">
            <div className="mb-4 flex h-16 w-16 items-center justify-center transition-transform group-hover:scale-105">
              <img src={pillar.icon} alt={pillar.alt} className="h-12 w-12 select-none object-contain md:h-14 md:w-14" />
            </div>
            <h3 className="mb-2 font-woodblock text-sm font-bold uppercase tracking-wider text-[#4E332D] md:text-base">
              {pillar.title}
            </h3>
            <p className="font-editorial text-sm leading-relaxed text-[#4E332D]/80 md:text-[15px]">
              {pillar.text}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
