import React from 'react';

/**
 * Handcrafted architectural woodcuts and editorial line art for Urban Cowboy Catskills.
 * Authentic vector engravings that give the booking engine an artisanal, hand-printed feel.
 */

export const AlpineHausWoodcut: React.FC<{ className?: string; alt?: string }> = ({
  className = 'w-56 h-36',
  alt = 'Alpine Haus Architectural Illustration'
}) => (
  <img
    src="/assets/icons/buildings/alpine_haus.svg"
    alt={alt}
    className={`${className} object-contain select-none transition-transform duration-300 hover:scale-[1.02]`}
    loading="eager"
  />
);

export const WaldenHausWoodcut: React.FC<{ className?: string; alt?: string }> = ({
  className = 'w-56 h-36',
  alt = 'Walden Haus Architectural Illustration'
}) => (
  <img
    src="/assets/icons/buildings/walden.svg"
    alt={alt}
    className={`${className} object-contain select-none transition-transform duration-300 hover:scale-[1.02]`}
    loading="eager"
  />
);

export const LodgeWoodcut: React.FC<{ className?: string; alt?: string }> = ({
  className = 'w-60 h-40',
  alt = 'The Lodge Architectural Illustration'
}) => (
  <img
    src="/assets/icons/buildings/the_lodge.svg"
    alt={alt}
    className={`${className} object-contain select-none transition-transform duration-300 hover:scale-[1.02]`}
    loading="eager"
  />
);

export const ForestHausWoodcut: React.FC<{ className?: string; alt?: string }> = ({
  className = 'w-56 h-36',
  alt = 'Forest Haus Architectural Illustration'
}) => (
  <img
    src="/assets/icons/buildings/forest_haus.svg"
    alt={alt}
    className={`${className} object-contain select-none transition-transform duration-300 hover:scale-[1.02]`}
    loading="eager"
  />
);



/**
 * Illustrated Woodcut Room Amenities Icons matching Screenshot 2!
 */
export const AmenityWoodcutIcon: React.FC<{
  type:
    | 'robes'
    | 'bed'
    | 'stove'
    | 'radiant'
    | 'minibar'
    | 'desk'
    | 'wifi'
    | 'cedar-tub'
    | 'clawfoot-tub'
    | 'stone-fireplace'
    | 'separate-living'
    | 'double-beds'
    | 'adults-badge'
    | 'bath-amenities';
  className?: string;
}> = ({ type, className = 'w-10 h-10' }) => {
  switch (type) {
    case 'robes':
      return (
        <img
<<<<<<< Updated upstream
          src="/assets/icons/amenities/simple/cowboy_robe.svg"
=======
          src="/assets/icons/icons-simple/cowboy_robe.svg"
>>>>>>> Stashed changes
          alt="Pendleton Wool Robes"
          className={`${className} object-contain select-none`}
        />
      );

    case 'bed':
      return (
        <img
<<<<<<< Updated upstream
          src="/assets/icons/amenities/simple/one_bed.svg"
=======
          src="/assets/icons/icons-simple/one_bed.svg"
>>>>>>> Stashed changes
          alt="Bed"
          className={`${className} object-contain select-none`}
        />
      );

    case 'double-beds':
      return (
        <img
<<<<<<< Updated upstream
          src="/assets/icons/amenities/simple/double_beds.svg"
=======
          src="/assets/icons/icons-simple/double_beds.svg"
>>>>>>> Stashed changes
          alt="Double Beds"
          className={`${className} object-contain select-none`}
        />
      );

    case 'stove':
      return (
        <img
<<<<<<< Updated upstream
          src="/assets/icons/amenities/simple/enameled_gas_fireplace.svg"
=======
          src="/assets/icons/icons-simple/enameled_gas_fireplace.svg"
>>>>>>> Stashed changes
          alt="Cast Iron Wood Stove"
          className={`${className} object-contain select-none`}
        />
      );

    case 'stone-fireplace':
      return (
        <img
<<<<<<< Updated upstream
          src="/assets/icons/amenities/simple/river_stone_hearth_fireplace.svg"
=======
          src="/assets/icons/icons-simple/river_stone_hearth_fireplace.svg"
>>>>>>> Stashed changes
          alt="River Stone Hearth Fireplace"
          className={`${className} object-contain select-none`}
        />
      );

    case 'cedar-tub':
      return (
        <img
<<<<<<< Updated upstream
          src="/assets/icons/amenities/simple/outdoor_cedar_soaking_tub.svg"
=======
          src="/assets/icons/icons-simple/outdoor_cedar_soaking_tub.svg"
>>>>>>> Stashed changes
          alt="Outdoor Cedar Soaking Tub"
          className={`${className} object-contain select-none`}
        />
      );

    case 'clawfoot-tub':
      return (
        <img
<<<<<<< Updated upstream
          src="/assets/icons/amenities/simple/copper_clawfoot_soaking_tub.svg"
=======
          src="/assets/icons/icons-simple/copper_clawfoot_soaking_tub.svg"
>>>>>>> Stashed changes
          alt="Copper Clawfoot Soaking Tub"
          className={`${className} object-contain select-none`}
        />
      );

    case 'desk':
      return (
        <img
<<<<<<< Updated upstream
          src="/assets/icons/amenities/simple/letter_writing_desk.svg"
=======
          src="/assets/icons/icons-simple/letter_writing_desk.svg"
>>>>>>> Stashed changes
          alt="Letter Writing Desk"
          className={`${className} object-contain select-none`}
        />
      );

    case 'separate-living':
      return (
        <img
<<<<<<< Updated upstream
          src="/assets/icons/amenities/simple/separate_living_room.svg"
=======
          src="/assets/icons/icons-simple/separate_living_room.svg"
>>>>>>> Stashed changes
          alt="Separate Living Room"
          className={`${className} object-contain select-none`}
        />
      );

    case 'adults-badge':
      return (
        <img
          src="/assets/icons/amenities/detailed/adults_only.svg"
          alt="21+ Adults Only"
          className={`${className} object-contain select-none`}
        />
      );

    case 'bath-amenities':
      return (
        <svg
          viewBox="0 0 100 80"
          fill="none"
          stroke="var(--foreground)"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`${className} object-contain select-none`}
        >
          {/* Left pump bottle */}
          <g transform="translate(10, 16)">
            <path d="M12 0 L12 6" strokeWidth="1.5" />
            <path d="M4 0 L15 0 C16 0, 17 1, 17 2 L17 4 C17 5, 16 6, 15 6 L12 6" fill="var(--foreground)" />
            <path d="M3 1 L0 3 L0 4 L4 3 Z" fill="var(--foreground)" />
            <rect x="9" y="6" width="6" height="5" rx="0.5" fill="var(--foreground)" stroke="var(--foreground)" />
            <rect x="7" y="11" width="10" height="2" rx="0.5" fill="var(--foreground)" stroke="var(--foreground)" />
            <path d="M7 13 C4 15, 2 18, 2 22 L2 52 C2 54, 4 56, 6 56 L18 56 C20 56, 22 54, 22 52 L22 22 C22 18, 20 15, 17 13 Z" strokeWidth="1.5" />
            <line x1="4" y1="52" x2="20" y2="52" strokeWidth="0.8" />
            <rect x="5" y="24" width="14" height="22" rx="1" strokeWidth="1" />
            <line x1="8" y1="28" x2="16" y2="28" strokeWidth="0.8" />
            <line x1="7" y1="32" x2="17" y2="32" strokeWidth="0.8" />
            <line x1="9" y1="36" x2="15" y2="36" strokeWidth="0.8" />
            <line x1="12" y1="13" x2="12" y2="52" strokeWidth="0.8" strokeDasharray="2 2" opacity="0.6" />
          </g>
          {/* Center bottle */}
          <g transform="translate(38, 14)">
            <path d="M12 0 L12 6" strokeWidth="1.5" />
            <path d="M4 0 L15 0 C16 0, 17 1, 17 2 L17 4 C17 5, 16 6, 15 6 L12 6" fill="var(--foreground)" />
            <path d="M3 1 L0 3 L0 4 L4 3 Z" fill="var(--foreground)" />
            <rect x="9" y="6" width="6" height="5" rx="0.5" fill="var(--foreground)" stroke="var(--foreground)" />
            <rect x="7" y="11" width="10" height="2" rx="0.5" fill="var(--foreground)" stroke="var(--foreground)" />
            <path d="M7 13 C4 15, 2 18, 2 22 L2 54 C2 56, 4 58, 6 58 L18 58 C20 56, 22 56, 22 54 L22 22 C22 18, 20 15, 17 13 Z" strokeWidth="1.5" />
            <line x1="4" y1="54" x2="20" y2="54" strokeWidth="0.8" />
            <rect x="5" y="24" width="14" height="24" rx="1" strokeWidth="1" />
            <line x1="8" y1="28" x2="16" y2="28" strokeWidth="0.8" />
            <line x1="7" y1="32" x2="17" y2="32" strokeWidth="0.8" />
            <line x1="9" y1="36" x2="15" y2="36" strokeWidth="0.8" />
            <line x1="12" y1="13" x2="12" y2="54" strokeWidth="0.8" strokeDasharray="2 2" opacity="0.6" />
          </g>
          {/* Right bottle */}
          <g transform="translate(66, 16)">
            <path d="M12 0 L12 6" strokeWidth="1.5" />
            <path d="M4 0 L15 0 C16 0, 17 1, 17 2 L17 4 C17 5, 16 6, 15 6 L12 6" fill="var(--foreground)" />
            <path d="M3 1 L0 3 L0 4 L4 3 Z" fill="var(--foreground)" />
            <rect x="9" y="6" width="6" height="5" rx="0.5" fill="var(--foreground)" stroke="var(--foreground)" />
            <rect x="7" y="11" width="10" height="2" rx="0.5" fill="var(--foreground)" stroke="var(--foreground)" />
            <path d="M7 13 C4 15, 2 18, 2 22 L2 52 C2 54, 4 56, 6 56 L18 56 C20 56, 22 54, 22 52 L22 22 C22 18, 20 15, 17 13 Z" strokeWidth="1.5" />
            <line x1="4" y1="52" x2="20" y2="52" strokeWidth="0.8" />
            <rect x="5" y="24" width="14" height="22" rx="1" strokeWidth="1" />
            <line x1="8" y1="28" x2="16" y2="28" strokeWidth="0.8" />
            <line x1="7" y1="32" x2="17" y2="32" strokeWidth="0.8" />
            <line x1="9" y1="36" x2="15" y2="36" strokeWidth="0.8" />
            <line x1="12" y1="13" x2="12" y2="52" strokeWidth="0.8" strokeDasharray="2 2" opacity="0.6" />
          </g>
        </svg>
      );

    case 'radiant':
      return (
        <svg
          viewBox="0 0 100 80"
          fill="none"
          stroke="var(--foreground)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`${className} object-contain select-none`}
        >
          {/* Three rising curved heat waves */}
          <path d="M38 24 C34 18, 42 12, 38 4" strokeWidth="2.2" />
          <path d="M50 24 C46 18, 54 12, 50 4" strokeWidth="2.2" />
          <path d="M62 24 C58 18, 66 12, 62 4" strokeWidth="2.2" />

          {/* Aztec / Southwestern geometric rug in perspective */}
          <polygon points="24,34 76,34 90,58 10,58" strokeWidth="2" fill="none" />
          <polygon points="26,37 74,37 86,55 14,55" strokeWidth="1.2" fill="none" />

          {/* Left Chevron / Arrows <<< */}
          <path d="M26 46 L34 40 M26 46 L34 52" strokeWidth="1.8" />
          <path d="M32 46 L40 40 M32 46 L40 52" strokeWidth="1.8" />

          {/* Center Aztec Diamond */}
          <polygon points="50,38 58,46 50,54 42,46" strokeWidth="2" fill="var(--foreground)" />
          <polygon points="50,41 54,46 50,51 46,46" fill="var(--background)" />

          {/* Right Chevron / Arrows >>> */}
          <path d="M74 46 L66 40 M74 46 L66 52" strokeWidth="1.8" />
          <path d="M68 46 L60 40 M68 46 L60 52" strokeWidth="1.8" />

          {/* Top & bottom fringe dashes */}
          <line x1="20" y1="31" x2="80" y2="31" strokeWidth="1" strokeDasharray="2 3" />
          <line x1="8" y1="61" x2="92" y2="61" strokeWidth="1.5" strokeDasharray="3 3" />
        </svg>
      );

    case 'minibar':
      return (
        <svg
          viewBox="0 0 80 100"
          fill="none"
          stroke="var(--foreground)"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`${className} object-contain select-none`}
        >
          {/* Wine / spirit bottle on top */}
          <path d="M18 10 L18 18 L16 22 L16 32 L22 32 L22 22 L20 18 L20 10 Z" strokeWidth="1.2" />
          <line x1="16" y1="25" x2="22" y2="25" strokeWidth="0.8" />
          {/* Cocktail shaker */}
          <path d="M42 16 L48 16 L49 20 L47 32 L39 32 L37 20 L38 16 Z" strokeWidth="1.2" />
          <line x1="39" y1="22" x2="47" y2="22" strokeWidth="0.8" />
          <path d="M41 16 C41 12, 45 12, 45 16" strokeWidth="1.2" />
          {/* Tumbler Glass */}
          <path d="M28 22 L34 22 L33 32 L29 32 Z" strokeWidth="1.2" />
          <rect x="30" y="25" width="2.5" height="2.5" strokeWidth="0.8" />

          {/* Countertop slab */}
          <rect x="10" y="32" width="60" height="4" rx="1" fill="var(--foreground)" stroke="var(--foreground)" />
          <line x1="8" y1="36" x2="72" y2="36" strokeWidth="1.5" />

          {/* Cabinet body */}
          <rect x="12" y="36" width="56" height="46" rx="1" strokeWidth="1.5" />
          {/* Center divide */}
          <line x1="40" y1="36" x2="40" y2="82" strokeWidth="1.5" />

          {/* Left door glass pane */}
          <rect x="16" y="40" width="20" height="38" rx="1" strokeWidth="1.2" />
          <path d="M20 54 L20 50 L22 50 L22 54 L24 56 L24 74 L18 74 L18 56 Z" strokeWidth="0.9" />
          <path d="M28 52 L28 48 L30 48 L30 52 L32 54 L32 74 L26 74 L26 54 Z" strokeWidth="0.9" />
          <circle cx="33" cy="60" r="1.5" fill="var(--foreground)" />

          {/* Right door glass pane */}
          <rect x="44" y="40" width="20" height="38" rx="1" strokeWidth="1.2" />
          <path d="M48 54 L48 50 L50 50 L50 54 L52 56 L52 74 L46 74 L46 56 Z" strokeWidth="0.9" />
          <path d="M55 52 L59 52 L57 58 L57 64 M55 64 L59 64" strokeWidth="0.9" />
          <circle cx="58" cy="70" r="3" strokeWidth="0.9" />
          <circle cx="47" cy="60" r="1.5" fill="var(--foreground)" />

          {/* Bottom apron */}
          <line x1="12" y1="82" x2="68" y2="82" strokeWidth="1.5" />

          {/* Turned legs */}
          <path d="M14 82 L14 96 C14 98, 17 98, 17 96 L18 82" strokeWidth="1.3" />
          <path d="M62 82 L63 96 C63 98, 66 98, 66 96 L66 82" strokeWidth="1.3" />
        </svg>
      );

    case 'wifi':
      return (
        <svg viewBox="0 0 48 48" fill="none" stroke="var(--foreground)" strokeWidth="1.5" className={className}>
          {/* Vintage Postmark Stamp with Wifi waves */}
          <rect x="6" y="8" width="36" height="32" strokeWidth="1.5" strokeDasharray="3 2" rx="2" />
          <path d="M14 20 C18 16, 30 16, 34 20" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M18 24 C21 21, 27 21, 30 24" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M22 28 C23 27, 25 27, 26 28" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="24" cy="32" r="1.5" fill="var(--foreground)" />
        </svg>
      );

    default:
      return (
        <img
<<<<<<< Updated upstream
          src="/assets/icons/amenities/simple/outdoor_cedar_soaking_tub.svg"
=======
          src="/assets/icons/icons-simple/outdoor_cedar_soaking_tub.svg"
>>>>>>> Stashed changes
          alt="Outdoor Cedar Soaking Tub"
          className={`${className} object-contain select-none`}
        />
      );
  }
};
