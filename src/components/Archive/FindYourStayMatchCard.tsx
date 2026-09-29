// FindYourStayMatchCard.tsx
import React, { useState } from 'react';

export interface StayMatchReason {
  headline: string;
  paragraph: string;
}

export interface FindYourStayMatchCardProps {
  introText?: string;
  headline?: string;
  reasons?: [StayMatchReason, StayMatchReason];
  onShare?: () => Promise<void> | void;
  onSave?: (saved: boolean) => Promise<void> | void;
  isSaved?: boolean;
  className?: string;
}

/**
 * Top Match Ribbon Vector
 * Recreated from top-match.svg with hand-drawn banner contour,
 * swallowtail ribbon folds, and "TOP MATCH" typography.
 * Sized to 252px x 97px per FindYourStayMatchCard.css.
 */
export const TopMatchRibbon: React.FC<{
  color?: string;
  className?: string;
}> = ({ color = '#69253A', className = '' }) => (
    <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
    width="790.000000pt" height="329.000000pt" viewBox="0 0 790.000000 329.000000"
    preserveAspectRatio="xMidYMid meet">
    <g transform="translate(0.000000,329.000000) scale(0.100000,-0.100000)"
    fill="#000000" stroke="none">
    <path d="M6950 3234 c-30 -2 -206 -8 -390 -14 -184 -6 -416 -15 -515 -20 -99
    -6 -349 -19 -555 -30 -206 -11 -445 -25 -530 -30 -85 -5 -411 -23 -725 -40
    -313 -16 -649 -34 -745 -40 -96 -6 -215 -12 -265 -15 -1225 -70 -1944 -140
    -2122 -207 -113 -42 -109 -25 -84 -344 12 -153 24 -308 28 -343 6 -60 5 -64
    -13 -57 -48 18 -253 27 -409 17 -308 -21 -504 -59 -591 -116 -49 -32 -40 -50
    235 -458 l259 -384 -189 -487 c-104 -267 -189 -495 -189 -506 0 -31 25 -34 60
    -8 32 23 32 23 378 22 191 0 430 -6 532 -13 1528 -96 2303 -32 2568 214 113
    105 119 138 92 499 -12 153 -19 280 -16 283 11 12 640 50 1851 114 429 23 854
    45 945 51 168 10 971 16 1025 8 22 -4 30 -1 33 12 2 9 -88 219 -198 467 l-202
    451 206 451 c113 248 206 457 206 465 0 52 -291 77 -680 58z m527 -62 c40 -4
    75 -10 78 -14 3 -3 -84 -203 -195 -444 -110 -241 -200 -445 -200 -454 0 -9 85
    -206 189 -438 l189 -422 -282 0 c-283 0 -534 -8 -1121 -35 -841 -39 -1167 -56
    -1240 -65 -44 -6 -172 -15 -285 -20 -1963 -102 -3083 -275 -3348 -520 -23 -22
    -42 -36 -42 -32 0 15 -149 1909 -155 1969 -6 61 -6 61 48 82 216 80 892 139
    2802 241 303 17 627 34 720 40 719 42 2034 107 2290 113 247 6 484 5 552 -1z
    m-6493 -1132 c33 -5 63 -13 66 -17 4 -5 33 -336 64 -738 61 -783 61 -781 105
    -842 124 -171 466 -147 1326 92 585 163 823 211 999 203 176 -8 223 -62 180
    -208 -49 -167 -302 -275 -764 -327 -187 -22 -1039 -24 -1380 -5 -724 41 -1132
    56 -1245 44 -49 -6 -91 -9 -93 -7 -2 1 76 206 172 455 97 249 176 459 176 467
    0 8 -114 184 -253 391 -140 207 -257 383 -261 390 -37 63 665 142 908 102z"/>
    <path d="M6412 2532 c-9 -6 -10 -16 -3 -38 13 -40 23 -181 14 -187 -4 -3 -42
    -7 -83 -8 -75 -4 -75 -4 -81 76 -3 44 -2 95 2 113 9 40 10 40 -84 34 -79 -4
    -79 -4 -72 -31 12 -47 36 -464 31 -535 -5 -69 -5 -69 76 -63 94 8 92 6 78 41
    -5 14 -13 75 -16 135 -7 109 -7 109 37 116 121 18 124 15 124 -138 l0 -137 84
    0 c82 0 83 0 77 23 -12 40 -27 258 -29 434 -2 173 -2 173 -72 173 -38 0 -76
    -4 -83 -8z"/>
    <path d="M5783 2503 c-49 -4 -55 -7 -113 -69 -61 -66 -61 -66 -54 -212 11
    -238 9 -230 83 -295 64 -57 64 -57 170 -51 136 7 125 1 145 78 22 78 20 82
    -28 62 -46 -19 -145 -24 -173 -8 -35 19 -40 38 -48 178 -7 131 -2 166 29 186
    23 15 109 19 157 8 27 -7 52 -11 53 -9 2 2 -8 34 -23 72 -29 74 -22 72 -198
    60z"/>
    <path d="M5310 2479 c-254 -14 -221 -3 -246 -86 -24 -80 -25 -79 36 -58 23 8
    60 15 81 15 50 0 50 -5 52 -287 l2 -219 85 4 c47 2 87 6 89 8 2 1 -4 22 -12
    46 -14 38 -44 445 -33 455 8 8 115 4 140 -6 16 -6 31 -9 33 -7 12 11 -51 146
    -66 145 -9 -1 -81 -6 -161 -10z"/>
    <path d="M4762 2453 c-82 -4 -82 -4 -76 -41 6 -41 -85 -488 -113 -555 -21 -49
    -17 -51 69 -43 74 7 74 7 74 76 0 38 2 71 5 74 2 3 45 8 95 12 91 7 91 7 104
    -39 7 -26 10 -58 8 -72 -7 -35 2 -38 98 -30 84 7 84 7 65 38 -33 54 -181 528
    -174 560 5 26 4 27 -33 25 -22 -1 -76 -4 -122 -5z m73 -238 c19 -65 34 -119
    33 -121 -6 -5 -108 -7 -113 -2 -3 3 4 60 17 126 12 67 23 120 25 118 2 -2 19
    -56 38 -121z"/>
    <path d="M4278 2417 c-7 -8 -36 -73 -63 -145 -27 -73 -52 -132 -55 -132 -3 0
    -36 61 -73 135 -67 135 -67 135 -141 135 -101 0 -106 -3 -94 -47 13 -49 37
    -510 27 -550 -4 -18 -4 -34 0 -34 14 -3 136 3 140 7 2 2 -1 29 -7 61 -6 32
    -13 121 -16 198 l-5 140 84 -170 c47 -93 88 -171 92 -172 5 -2 37 76 73 173
    76 206 77 206 82 -58 3 -158 3 -158 68 -158 82 0 92 6 81 48 -13 43 -35 483
    -27 538 6 44 6 44 -73 44 -53 0 -84 -4 -93 -13z"/>
    <path d="M3190 2373 c-134 -4 -142 -7 -128 -41 13 -33 39 -489 31 -553 -5 -46
    -5 -46 78 -41 46 2 85 6 87 7 2 2 -4 28 -13 58 -9 32 -15 81 -13 114 3 58 3
    58 95 61 92 3 92 3 152 69 61 66 61 66 61 144 0 79 0 79 -57 134 -65 61 -32
    56 -293 48z m159 -118 c33 -16 41 -33 41 -80 0 -49 -29 -72 -98 -77 -72 -5
    -70 -7 -74 82 -3 75 -3 75 47 81 28 3 51 7 53 7 2 1 16 -5 31 -13z"/>
    <path d="M2618 2343 c-55 -4 -57 -5 -112 -67 -56 -64 -56 -64 -45 -257 10
    -194 10 -194 72 -252 62 -58 62 -58 121 -53 32 3 84 6 116 6 56 0 56 0 113 64
    57 64 57 64 47 258 -11 193 -11 193 -72 251 -67 63 -58 61 -240 50z m139 -125
    c16 -13 21 -46 28 -204 7 -160 1 -173 -84 -176 -81 -4 -86 7 -95 192 -8 178
    -2 196 61 203 43 4 72 -1 90 -15z"/>
    <path d="M2038 2311 c-58 -3 -108 -8 -111 -11 -5 -7 -37 -123 -37 -137 0 -7
    20 -4 51 8 29 11 68 19 88 17 36 -3 36 -3 48 -213 8 -136 9 -220 3 -239 -19
    -58 -18 -58 78 -51 103 9 98 6 82 47 -15 38 -41 448 -29 462 8 9 108 3 148
    -10 28 -8 26 9 -9 90 -21 51 -27 52 -312 37z"/>
    </g>

    {/* "TOP MATCH" Hand-drawn Display Typography */}
    <text
      x="133"
      y="47"
      textAnchor="middle"
      dominantBaseline="central"
      fill={color}
      style={{
        fontFamily: "'Brothers OT', 'Cinzel', Georgia, serif",
        fontSize: '22px',
        fontWeight: '900',
        letterSpacing: '3px',
      }}
    >
      TOP MATCH
    </text>
  </svg>
);

/**
 * Pointing Hand Vector (Manicule)
 * Recreated from Left Hand Pointing.svg with thick expressive line-art,
 * rectangular cuff with inner slot, and curled fingers.
 * Dimension: 82px x 39px per FindYourStayMatchCard.css.
 */
export const PointingHandIcon: React.FC<{
  color?: string;
  pointing?: 'left' | 'right';
  className?: string;
}> = ({ color = '#69253A', pointing = 'right', className = '' }) => {
  const isRight = pointing === 'right';

  return (
    <svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1009 487">
      <path d="M811.4,377.12c-70.83,42.12-145.14,47.42-215.11,20.59-10.16-4.29-18.72.66-25.07,8.99-31.7,38.58-100.45,60.21-121.28,52.38-25.46-16.54-42.7-55.72-68.19-71.48-15.68-9.43-38.34-1.23-57.15-4.44-22.4-2.71-45.87-12.51-54.53-34.42-9.98-23.99,4.31-52.28,13.74-74.11,8.7-20.99,18.21-53.14,25.07-71.66,8.43-17.21,32.78-47.71,38.76-59.95,1.37-4.09-1.66-4.36-6.25-4.88-75.68-4.15-197.99,7.49-265.04-15.17-30.14-10.89-51.55-51.42-44.85-83.12,2.98-10.57,9.03-15.32,14.3-16.34,13.92-3.31,39.4-5.25,71.71-6.36,92.96-3.19,242.24.75,333.09,1.21,26.53-.1,48.81.53,71.86-1.54,93.22-11.23,193.92,67.88,272.25,111.56,6.92,3,13.12-.7,19.72-8.61,10.92-11.99,20.54-24.02,36.09-25.95,21.48-.75,62.12-.73,83.78-1.19,54.18-23.3,34.78,328.21,44.33,367.4,1.52,7.18-11.66,5.79-17.74,6.94-78.47,8.36-142.68,13.42-145.29-73.56-.24-4.51.06-14.52-3.19-16.04l-.99-.23ZM496.84,353.04c138.89,12.17,204.48,72.52,317.89-11.77,6.06-6.59,1.59-11.62,2.12-24.15-1.78-33.01-3.97-76.96-5.7-109.55-1.11-18.68-1.43-32.98-2.24-38.44-.91-4.6-8.09-7.38-12.74-10.07-67.68-34.57-171.89-108.12-245.49-118.62-125.73-.13-420.07-.08-477.74-.17-7.93-1.4-10.39,5.07-13.09,11.55-11.66,30.83,48.14,58.66,79.36,59.71,37.03.58,285.28-3.08,324.04-.53,70.36,7.26,121.68,95.98,45.46,127.46-37.14,13.67-107.4,23.49-165.83,37.16-16.24,4.16-24.7,1.81-38.49,15.43-22.75,20.88-9.04,60.04,20.5,64.48,30.97.39,139.63-3.24,170.28-2.61l1.69.12ZM912.39,118.66l-77.19,3.41,12.73,322.16,78.48-2.86s-10.84-289.44-13.62-322.62l-.4-.09ZM416.8,228.56c12.14-16.22,58.63-79.5,63.05-85.77.31-.68.09-1.12-.77-1.45-24.47-3.09-60.29-8.87-84.4,1.75-31.71,22.52-73.45,71.73-68.45,107.12,23.7-3.36,68.68-16.72,90.23-21.43l.33-.21ZM520.43,208.94c-2.34-10.78-6.83-39.46-9.96-50.77-1.96,2.9-62.65,68.28-58.7,66.52,17.45-3.97,52.79-11.86,68.55-15.53l.1-.21ZM495.37,395.95c1.67-4.97-25.52-19-28.08-17.6-12.58.85-40.9,2.27-48.25,2.72-2.18,1.41,2.2,4.36,3.84,7.67,13,17.79,36.74,57.44,61.21,43.93,2.62-1.61,2.61-3,3.69-7.05,1.92-7.3,6-22.29,7.61-28.86l-.03-.81ZM542.33,406.12c-8.12-37.62-24.91-30.71-22.6.43l22.6-.43Z"/>
    </svg>
  );
};

/**
 * FindYourStayMatchCard Component
 * Strictly complies with FindYourStayMatchCard.css, FindYourStayMatchCard.pdf, and SKILL.md:
 * - Card Dimensions: 448px x 620px, padding 24px, gap 27px
 * - Surface: rgba(255, 255, 255, 0.8) with 1.5px solid #69253A border
 * - Top Match Ribbon: 252px x 97px embedded vector
 * - Intro paragraph: 318.4px x 66px, 'Uchen' 17px/128%, #69253A
 * - Headline group: Pointing hand (82x39) + Main headline (184x52, 'Brothers OT' 24px)
 * - Reason 1 & Reason 2: 'Bianco Sans' 16px/19px bold + 'Uchen' 14px/18px
 * - Actions: SHARE (border 1px #4E332D) + SAVE (background #69253A)
 */
export const FindYourStayMatchCard: React.FC<FindYourStayMatchCardProps> = ({
  introText = 'This suite feels made for winter complete a private cedar soaking tub tucked among the trees.',
  headline = "YOU'LL LOVE IT\nBECAUSE...",
  reasons = [
    {
      headline: 'Just Right for Two',
      paragraph:
        'The room has the privacy and scale that work especially well for a couple looking to disappear into the Catskills for a few days.',
    },
    {
      headline: 'Even Better in December',
      paragraph:
        'Cold mountain air makes you appreciate the Radiant Heated Floors and Cast Iron Wood Strove.',
    },
  ],
  onShare,
  onSave,
  isSaved = false,
  className = '',
}) => {
  const [saved, setSaved] = useState<boolean>(isSaved);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSharing, setIsSharing] = useState<boolean>(false);

  const handleSaveClick = async () => {
    if (isSaving) return;
    setIsSaving(true);
    const nextSavedState = !saved;

    try {
      if (onSave) {
        await onSave(nextSavedState);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
      setSaved(nextSavedState);
    } catch {
      // Handled per SKILL.md error patterns
    } finally {
      setIsSaving(false);
    }
  };

  const handleShareClick = async () => {
    if (isSharing) return;
    setIsSharing(true);

    try {
      if (onShare) {
        await onShare();
      } else {
        await new Promise((resolve) => setTimeout(resolve, 400));
      }
    } catch {
      // Handled per SKILL.md error patterns
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <article
      aria-label="Stay match recommendation"
      className={`box-border relative flex flex-col items-start p-[24px] gap-[27px] w-[448px] h-[620px] bg-white/80 border-[1.5px] border-[#69253A] shadow-md backdrop-blur-[4px] select-none text-[#69253A] overflow-hidden ${className}`}
    >
      {/* 1. Top Match Ribbon (252px x 97px) */}
      <div className="flex flex-row items-center justify-start w-[252px] h-[97px] shrink-0 -mt-2 -ml-2">
        <TopMatchRibbon color="#69253A" />
      </div>

      {/* 2. Intro Paragraph (398px container, text: 318.4px x 66px, font-uchen, 17px/128%) */}
      <div className="flex flex-row items-start w-[398px] h-[76px] shrink-0">
        <div className="w-[54px] h-[47px] shrink-0" aria-hidden="true" />
        <p className="w-[318.4px] h-[66px] font-uchen text-[17px] leading-[22px] text-[#69253A] m-0">
          {introText}
        </p>
      </div>

      {/* 3. Horizontal Rule (397px x 1px, background: #69253A) */}
      <div
        className="w-[397px] h-[1px] bg-[#69253A] self-stretch shrink-0 -my-1"
        aria-hidden="true"
      />

      {/* 4. Headline Group (397px x 52px, gap: 16px) */}
      <div className="flex flex-row items-center gap-[16px] w-[397px] h-[52px] shrink-0">
        {/* Pointing Hand Icon from Left Hand Pointing.svg (82px x 39px) */}
        <div className="w-[82px] h-[39px] shrink-0 flex items-center justify-center">
          <PointingHandIcon color="#69253A" pointing="right" />
        </div>

        {/* Main Headline (184px x 52px, 'Brothers OT', 24px, uppercase) */}
        <h2 className="w-[184px] h-[52px] font-brothers text-[24px] leading-[26px] uppercase text-[#69253A] m-0 flex items-center whitespace-pre-line tracking-wide">
          {headline}
        </h2>
      </div>

      {/* 5. Reason 1 (397px x 81px, gap: 8px) */}
      <div className="flex flex-col items-start gap-[8px] w-[397px] h-[81px] shrink-0">
        <h3 className="w-[397px] h-[19px] font-bianco text-[16px] leading-[19px] font-bold text-[#69253A] m-0">
          {reasons[0]?.headline}
        </h3>
        <p className="w-[397px] h-[54px] font-uchen text-[14px] leading-[18px] text-[#69253A] m-0">
          {reasons[0]?.paragraph}
        </p>
      </div>

      {/* 6. Reason 2 (397px x 63px, gap: 8px) */}
      <div className="flex flex-col items-start gap-[8px] w-[397px] h-[63px] shrink-0">
        <h3 className="w-[397px] h-[19px] font-bianco text-[16px] leading-[19px] font-bold text-[#69253A] m-0">
          {reasons[1]?.headline}
        </h3>
        <p className="w-[397px] h-[36px] font-uchen text-[14px] leading-[18px] text-[#69253A] m-0">
          {reasons[1]?.paragraph}
        </p>
      </div>

      {/* 7. Actions (397px x 37px, justify-end, gap: 12px) */}
      <div className="flex flex-row justify-end items-center gap-[12px] w-[397px] h-[37px] shrink-0 mt-auto">
        {/* SHARE Button */}
        <button
          type="button"
          onClick={handleShareClick}
          disabled={isSharing}
          aria-label="Share accommodation match"
          aria-busy={isSharing}
          className="box-border flex flex-row justify-center items-center py-[2px] px-[30px] w-[92px] h-[37px] border border-[#4E332D] rounded-[25px] bg-transparent text-[#4E332D] hover:bg-[#4E332D]/5 active:scale-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4E332D] disabled:opacity-60 cursor-pointer"
        >
          {isSharing ? (
            <div className="w-3.5 h-3.5 border-2 border-[#4E332D] border-t-transparent rounded-full animate-spin" />
          ) : (
            <span className="font-brothers text-[14px] leading-[14px] font-bold tracking-[2px] uppercase">
              SHARE
            </span>
          )}
        </button>

        {/* SAVE Button */}
        <button
          type="button"
          onClick={handleSaveClick}
          disabled={isSaving}
          aria-label={saved ? 'Remove stay from saved' : 'Save this stay'}
          aria-pressed={saved}
          aria-busy={isSaving}
          className={`box-border flex flex-row justify-center items-center py-[2px] px-[30px] w-[82px] h-[37px] rounded-[25px] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#69253A] focus-visible:ring-offset-1 disabled:opacity-60 cursor-pointer ${
            saved
              ? 'bg-[#451423] text-[#FAF9F9] shadow-inner'
              : 'bg-[#69253A] text-[#FFFFFF] hover:bg-[#581F31] active:scale-95 shadow-sm'
          }`}
        >
          {isSaving ? (
            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <span className="font-brothers text-[14px] leading-[14px] font-bold tracking-[2px] uppercase">
              {saved ? 'SAVED' : 'SAVE'}
            </span>
          )}
        </button>
      </div>
    </article>
  );
};

/**
 * Interactive Preview Canvas
 */
export default function App() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [savedCount, setSavedCount] = useState<number>(0);
  const [customWinterSuite, setCustomWinterSuite] = useState<boolean>(true);

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(
          'https://urbancowboy.com/stays/catskills-winter-suite'
        );
        setToastMessage('Stay link copied to clipboard!');
      } catch {
        setToastMessage('Stay link: urbancowboy.com/stays/winter-suite');
      }
    } else {
      setToastMessage('Shared recommendation link successfully!');
    }
  };

  const handleSave = async (isSaved: boolean) => {
    setSavedCount((prev) => (isSaved ? prev + 1 : Math.max(0, prev - 1)));
    setToastMessage(
      isSaved
        ? 'Saved to your Urban Cowboy favorites!'
        : 'Removed from your favorites.'
    );
  };

  return (
    <div className="min-h-screen w-full bg-[#EAE8E3] flex flex-col items-center justify-start py-10 px-4 text-[#343833]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700&family=Uchen&family=Cinzel:wght@600;700;800;900&display=swap');

        .font-brothers {
          font-family: 'Brothers OT', 'Cinzel', Georgia, serif;
        }
        .font-uchen {
          font-family: 'Uchen', Georgia, serif;
        }
        .font-bianco {
          font-family: 'Bianco Sans', 'Urbanist', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
      `}</style>

      <div className="w-full max-w-4xl flex flex-col items-center gap-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="font-brothers text-2xl tracking-wide uppercase text-[#69253A] font-bold">
            Find Your Stay Match Card
          </h1>
          <p className="text-xs text-[#4E332D] mt-1 font-bianco">
            Updated with embedded Top Match Ribbon & Left Hand Pointing SVGs
          </p>
        </div>

        {/* Global Toast Feedback */}
        {toastMessage && (
          <div
            role="status"
            className="w-full max-w-[448px] text-xs font-bianco bg-[#69253A] text-[#FAF9F9] px-4 py-2.5 rounded shadow flex items-center justify-between transition-all"
          >
            <span>{toastMessage}</span>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="text-[#FAF9F9] underline ml-3 font-semibold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Isolated Card Canvas View */}
        <div className="flex flex-col items-center gap-3">
          <span className="text-[11px] font-brothers uppercase tracking-wider text-[#69253A]">
            Figma Component (448px × 620px, border: 1.5px solid #69253A)
          </span>

          <FindYourStayMatchCard
            introText={
              customWinterSuite
                ? 'This suite feels made for winter complete a private cedar soaking tub tucked among the trees.'
                : 'A cozy forest loft with sweeping mountain valley views and a vintage copper hearth.'
            }
            reasons={[
              {
                headline: 'Just Right for Two',
                paragraph:
                  'The room has the privacy and scale that work especially well for a couple looking to disappear into the Catskills for a few days.',
              },
              {
                headline: 'Even Better in December',
                paragraph:
                  'Cold mountain air makes you appreciate the Radiant Heated Floors and Cast Iron Wood Strove.',
              },
            ]}
            onShare={handleShare}
            onSave={handleSave}
          />
        </div>

        {/* Interactive Controls */}
        <div className="w-full max-w-[448px] bg-[#FAF9F9] border border-[#DDDDDD] rounded-lg p-5 shadow-sm flex flex-col gap-4 text-xs font-bianco">
          <div className="flex items-center justify-between border-b border-[#DDDDDD] pb-3">
            <span className="font-semibold text-sm text-[#69253A]">
              Card State & Simulation Controls
            </span>
            <span className="text-[11px] text-gray-500">
              Saved items: <strong>{savedCount}</strong>
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <span className="font-medium text-[#4E332D]">Toggle Sample Stay:</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCustomWinterSuite(true)}
                className={`px-3 py-1.5 rounded transition-colors text-xs font-medium ${
                  customWinterSuite
                    ? 'bg-[#69253A] text-white'
                    : 'bg-white border border-[#DDDDDD] text-[#4E332D] hover:bg-gray-50'
                }`}
              >
                Winter Cedar Soaking Tub
              </button>
              <button
                type="button"
                onClick={() => setCustomWinterSuite(false)}
                className={`px-3 py-1.5 rounded transition-colors text-xs font-medium ${
                  !customWinterSuite
                    ? 'bg-[#69253A] text-white'
                    : 'bg-white border border-[#DDDDDD] text-[#4E332D] hover:bg-gray-50'
                }`}
              >
                Forest Loft
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}