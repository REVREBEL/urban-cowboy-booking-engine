import React from 'react';

export const PillarFeatures: React.FC = () => {
  const pillars = [
    {
      title: 'DISAPPEAR FOR A WHILE',
      text: 'Trade pavement for mountain air and the kind of quiet that makes you forget what day it is.',
<<<<<<< Updated upstream
      icon: '/assets/icons/amenities/simple/hammock.svg',
=======
      icon: '/assets/icons/icons-simple/hammock.svg',
>>>>>>> Stashed changes
      alt: 'Hammock'
    },
    {
      title: 'SOAK IT ALL IN',
      text: 'Sauna, outdoor hangs, long baths and plenty of ways to slow the whole operation down.',
<<<<<<< Updated upstream
      icon: '/assets/icons/amenities/simple/estonian_sauna.svg',
=======
      icon: '/assets/icons/icons-simple/estonian_sauna.svg',
>>>>>>> Stashed changes
      alt: 'Estonian Sauna'
    },
    {
      title: 'BETTER TOGETHER',
      text: 'Dinner, drinks, fireside nights and whatever happens next. Cowboy is made for gathering.',
<<<<<<< Updated upstream
      icon: '/assets/icons/amenities/simple/campfire.svg',
=======
      icon: '/assets/icons/icons-simple/campfire.svg',
>>>>>>> Stashed changes
      alt: 'Campfire'
    }
  ];

  return (
    <section className="w-full max-w-5xl mx-auto px-4 py-12 md:py-16">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
        {pillars.map((p, idx) => (
          <div
            key={idx}
            className="flex flex-col items-center md:items-start text-center md:text-left group"
          >
            <div className="w-16 h-16 rounded-full bg-transparent flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <img
                src={p.icon}
                alt={p.alt}
                className="w-12 h-12 md:w-14 md:h-14 object-contain select-none"
              />
            </div>
            <h3 className="font-woodblock text-sm md:text-base font-bold text-[#4E332D] tracking-wider uppercase mb-2">
              {p.title}
            </h3>
            <p className="font-editorial text-sm md:text-[15px] text-[#4E332D]/80 leading-relaxed">
              {p.text}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
