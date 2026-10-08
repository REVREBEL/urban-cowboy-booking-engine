// RusticLodgeSignboard.tsx
import React, { useState, useRef, ChangeEvent } from 'react';

export interface LodgeSignboardProps {
  /** Source URL for the background wood wall image */
  backgroundImage?: string;
  /** Source URL for the serrated timber sign backboard layer */
  backboardImage?: string;
  /** Slot for content inside the jagged sign (e.g. title text, badges, or custom UI) */
  textSlot?: React.ReactNode;
  /** Slot for the top right button */
  buttonSlotTop?: React.ReactNode;
  /** Slot for the bottom right button */
  buttonSlotBottom?: React.ReactNode;
  /** Main sign text when using the default textSlot layout */
  title?: string;
  /** Optional secondary subtitle */
  subtitle?: string;
  /** Toggle mockup wireframe slot outlines for alignment verification */
  showGuides?: boolean;
  /** Additional container styling classes */
  className?: string;
}

const CabinIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const CompassIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="currentColor" />
  </svg>
);

const KeyIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="7.5" cy="15.5" r="5.5" />
    <path d="m21 2-9.6 9.6" />
    <path d="m15.5 7.5 3 3" />
    <path d="m18.5 4.5 3 3" />
  </svg>
);

const CheckIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const UploadIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

export interface RusticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'wood' | 'accent' | 'stone';
  icon?: React.ReactNode;
  isLoading?: boolean;
}

export const RusticButton: React.FC<RusticButtonProps> = ({
  children,
  variant = 'wood',
  icon,
  isLoading = false,
  disabled,
  className = "",
  ...props
}) => {
  const baseStyles = "relative w-full px-5 py-3.5 sm:py-4 rounded-md font-bold tracking-wider uppercase text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all duration-150 transform active:translate-y-0.5 shadow-md select-none border";

  const variants = {
    wood: "bg-[#6d422a] hover:bg-[#7e4e32] text-amber-100 border-[#4a2b1a] shadow-[0_4px_0_#331c10] active:shadow-[0_1px_0_#331c10]",
    accent: "bg-[#e5a812] hover:bg-[#f6b720] text-[#331c0c] border-[#b88006] shadow-[0_4px_0_#7d5300] active:shadow-[0_1px_0_#7d5300]",
    stone: "bg-[#544e49] hover:bg-[#66605a] text-stone-100 border-[#3d3733] shadow-[0_4px_0_#24201d] active:shadow-[0_1px_0_#24201d]"
  };

  const isDisabled = disabled || isLoading;

  return (
    <button
      disabled={isDisabled}
      className={`${baseStyles} ${variants[variant]} ${isDisabled ? 'opacity-60 cursor-not-allowed transform-none shadow-none' : ''} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
      ) : (
        icon && <span className="inline-flex shrink-0">{icon}</span>
      )}
      <span className="truncate">{children}</span>
    </button>
  );
};

export const LodgeSignboard: React.FC<LodgeSignboardProps> = ({
  backgroundImage = 'background.jpg',
  backboardImage = 'backboard-layer.jpg',
  textSlot,
  buttonSlotTop,
  buttonSlotBottom,
  title = "LODGE",
  subtitle,
  showGuides = false,
  className = ""
}) => {
  const [bgLoadError, setBgLoadError] = useState(false);
  const [signLoadError, setSignLoadError] = useState(false);

  // Polygon matching the serrated edges of backboard-layer.jpg to cleanly clip the black backdrop
  const serratedClipPath = `polygon(
    0% 1.5%, 3.5% 5.5%, 0% 9.5%, 3.5% 13.5%, 0% 17.5%, 3.5% 21.5%, 0% 25.5%, 3.5% 29.5%, 0% 33.5%, 3.5% 37.5%, 0% 41.5%, 3.5% 45.5%, 0% 49.5%, 3.5% 53.5%, 0% 57.5%, 3.5% 61.5%, 0% 65.5%, 3.5% 69.5%, 0% 73.5%, 3.5% 77.5%, 0% 81.5%, 3.5% 85.5%, 0% 89.5%, 3.5% 93.5%, 0% 98%,
    100% 98%, 96.5% 93.5%, 100% 89.5%, 96.5% 85.5%, 100% 81.5%, 96.5% 77.5%, 100% 73.5%, 96.5% 69.5%, 100% 65.5%, 96.5% 61.5%, 100% 57.5%, 96.5% 53.5%, 100% 49.5%, 96.5% 45.5%, 100% 41.5%, 96.5% 37.5%, 100% 33.5%, 96.5% 29.5%, 100% 25.5%, 96.5% 21.5%, 100% 17.5%, 96.5% 13.5%, 100% 9.5%, 96.5% 5.5%, 100% 1.5%
  )`;

  return (
    <div 
      className={`relative w-full max-w-6xl mx-auto rounded-xl overflow-hidden shadow-2xl bg-[#452211] select-none ${className}`}
      style={{ aspectRatio: '16 / 9' }}
    >
      {/* LAYER 1: Photo Wall Background */}
      {!bgLoadError ? (
        <img
          src={backgroundImage}
          alt="Lodge Plank Wall Background"
          onError={() => setBgLoadError(true)}
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
        />
      ) : (
        /* CSS Fallback when background.jpg image file is unavailable */
        <div 
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{
            backgroundColor: '#4e2815',
            backgroundImage: `
              repeating-linear-gradient(
                90deg,
                #64331a 0px, #64331a 5.5%,
                #3b1c0c 5.6%, #3b1c0c 5.8%,
                #733b1e 5.9%, #733b1e 11.2%,
                #2f1508 11.3%, #2f1508 11.5%
              ),
              linear-gradient(180deg, rgba(0,0,0,0.35) 0%, transparent 25%, transparent 75%, rgba(0,0,0,0.55) 100%)
            `
          }}
        />
      )}

      {/* LAYER 2: Backboard Drop Shadow */}
      <div 
        className="absolute pointer-events-none transition-all"
        style={{
          left: '35.2%',
          top: '18.2%',
          width: '28.8%',
          height: '43.2%',
          clipPath: serratedClipPath,
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
          filter: 'blur(8px)',
          transform: 'translate(4px, 8px)'
        }}
      />

      {/* LAYER 2: Serrated Sign Backboard Photo Layer */}
      <div 
        className="absolute pointer-events-none overflow-hidden"
        style={{
          left: '35.2%',
          top: '17.2%',
          width: '28.8%',
          height: '43.2%',
          clipPath: serratedClipPath
        }}
      >
        {!signLoadError ? (
          <img
            src={backboardImage}
            alt="Serrated Timber Backboard"
            onError={() => setSignLoadError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          /* CSS Fallback if backboard-layer.jpg is not found */
          <div 
            className="w-full h-full"
            style={{
              backgroundColor: '#503828',
              backgroundImage: `
                linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(0,0,0,0.4) 100%),
                repeating-linear-gradient(0deg, transparent, transparent 24px, rgba(0,0,0,0.22) 25px, rgba(255,255,255,0.04) 26px)
              `
            }}
          />
        )}
      </div>

      {/* LAYER 3: Interactive Overlays and Component Slots */}
      {/* TEXT SLOT: Centered within the jagged wooden sign */}
      <div 
        className={`absolute z-10 flex items-center justify-center transition-all ${
          showGuides ? 'bg-stone-400/80 outline-2 outline-dashed outline-sky-400' : ''
        }`}
        style={{
          left: '37.8%',
          top: '21.0%',
          width: '23.6%',
          height: '35.6%'
        }}
      >
        {showGuides && (
          <span className="absolute top-1 left-2 text-[10px] font-mono uppercase font-bold tracking-widest text-stone-800 bg-white/70 px-1 rounded">
            TEXT SLOT
          </span>
        )}

        {textSlot ? (
          textSlot
        ) : (
          /* Default "LODGE" extruded yellow title style from reference image */
          <div className="flex flex-col items-center justify-center text-center p-2">
            <h1 
              className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-wider text-[#FED136] select-none"
              style={{
                fontFamily: 'Impact, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                textShadow: `
                  0 2px 0 #af8302,
                  0 4px 0 #7c5c00,
                  0 6px 1px rgba(0, 0, 0, 0.45),
                  0 8px 12px rgba(0, 0, 0, 0.65)
                `
              }}
            >
              {title}
            </h1>
            {subtitle && (
              <span className="mt-1 text-[9px] sm:text-xs tracking-widest uppercase text-amber-100 font-semibold drop-shadow-md">
                {subtitle}
              </span>
            )}
          </div>
        )}
      </div>

      {/* BUTTON SLOT TOP: Positioned at right side matching mockup-slots.jpg */}
      <div 
        className={`absolute z-10 flex items-center justify-center transition-all ${
          showGuides ? 'bg-stone-400/80 outline-2 outline-dashed outline-amber-400' : ''
        }`}
        style={{
          left: '66.2%',
          top: '28.0%',
          width: '15.2%',
          height: '11.0%'
        }}
      >
        {showGuides && (
          <span className="absolute top-1 left-2 text-[9px] font-mono uppercase font-bold tracking-widest text-stone-800 bg-white/70 px-1 rounded">
            BUTTON SLOT
          </span>
        )}

        <div className="w-full h-full flex items-center justify-center p-0.5">
          {buttonSlotTop ? (
            buttonSlotTop
          ) : (
            <RusticButton 
              variant="accent"
              icon={<KeyIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#331c0c]" />}
              className="h-full !py-0 text-[10px] sm:text-xs md:text-sm font-bold"
            >
              CHECK IN
            </RusticButton>
          )}
        </div>
      </div>

      {/* BUTTON SLOT BOTTOM: Positioned directly beneath Top Button */}
      <div 
        className={`absolute z-10 flex items-center justify-center transition-all ${
          showGuides ? 'bg-stone-400/80 outline-2 outline-dashed outline-amber-400' : ''
        }`}
        style={{
          left: '66.2%',
          top: '42.4%',
          width: '15.2%',
          height: '11.0%'
        }}
      >
        {showGuides && (
          <span className="absolute top-1 left-2 text-[9px] font-mono uppercase font-bold tracking-widest text-stone-800 bg-white/70 px-1 rounded">
            BUTTON SLOT
          </span>
        )}

        <div className="w-full h-full flex items-center justify-center p-0.5">
          {buttonSlotBottom ? (
            buttonSlotBottom
          ) : (
            <RusticButton 
              variant="wood"
              icon={<CompassIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-200" />}
              className="h-full !py-0 text-[10px] sm:text-xs md:text-sm font-semibold"
            >
              TRAIL MAP
            </RusticButton>
          )}
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [title, setTitle] = useState<string>("LODGE");
  const [subtitle, setSubtitle] = useState<string>("EST. 1928");
  const [showGuides, setShowGuides] = useState<boolean>(false);
  const [customSlotMode, setCustomSlotMode] = useState<boolean>(false);

  // Status state adhering to React UI Patterns (SKILL.md)
  const [topActionLoading, setTopActionLoading] = useState<boolean>(false);
  const [topActionDone, setTopActionDone] = useState<boolean>(false);
  const [bottomActionLoading, setBottomActionLoading] = useState<boolean>(false);

  // Layer image paths with support for local file selection
  const [bgImage, setBgImage] = useState<string>("background.jpg");
  const [signImage, setSignImage] = useState<string>("backboard-layer.jpg");

  const bgInputRef = useRef<HTMLInputElement | null>(null);
  const signInputRef = useRef<HTMLInputElement | null>(null);

  const handleBgFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setBgImage(url);
    }
  };

  const handleSignFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSignImage(url);
    }
  };

  const handleTopClick = () => {
    setTopActionLoading(true);
    setTimeout(() => {
      setTopActionLoading(false);
      setTopActionDone(true);
      setTimeout(() => setTopActionDone(false), 2000);
    }, 800);
  };

  const handleBottomClick = () => {
    setBottomActionLoading(true);
    setTimeout(() => {
      setBottomActionLoading(false);
    }, 1000);
  };

  return (
    <main className="min-h-screen bg-[#1c1917] text-stone-200 p-4 sm:p-8 flex flex-col items-center justify-center font-sans">
      <div className="w-full max-w-6xl space-y-6">
        
        {/* Navigation & Header */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-800 pb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-amber-400 flex items-center gap-2">
              <CabinIcon className="w-6 h-6 text-amber-500" />
              Lodge Photo Layer & Slot Signboard
            </h1>
            <p className="text-xs sm:text-sm text-stone-400 mt-0.5">
              Overlaying dynamic slots on top of <code className="text-amber-300">background.jpg</code> and <code className="text-amber-300">backboard-layer.jpg</code>
            </p>
          </div>

          {/* Quick Mockup Alignment Guide Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowGuides(!showGuides)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-all ${
                showGuides 
                  ? 'bg-amber-500 text-stone-950 border-amber-400' 
                  : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700'
              }`}
            >
              {showGuides ? '✓ Mockup Guides Visible' : 'Show Mockup Guides'}
            </button>
          </div>
        </header>

        {/* Live Photographic Signboard with Overlaid Slots */}
        <LodgeSignboard
          backgroundImage={bgImage}
          backboardImage={signImage}
          title={title}
          subtitle={subtitle}
          showGuides={showGuides}
          textSlot={
            customSlotMode ? (
              <div className="p-3 bg-stone-900/90 rounded border border-amber-500/40 text-center space-y-1 backdrop-blur-sm shadow-xl max-w-[90%]">
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                  ACTIVE TEXT SLOT
                </span>
                <p className="text-xs sm:text-sm font-semibold text-amber-100 leading-tight">
                  Welcome to Mountain Pass
                </p>
                <p className="text-[10px] text-stone-400 hidden sm:block">
                  Elevation: 5,420 ft • Temp: 62°F
                </p>
              </div>
            ) : undefined
          }
          buttonSlotTop={
            <RusticButton
              variant="accent"
              isLoading={topActionLoading}
              icon={topActionDone ? <CheckIcon className="w-4 h-4 text-emerald-950" /> : <KeyIcon className="w-4 h-4 text-[#331c0c]" />}
              onClick={handleTopClick}
              className="h-full !py-0 text-[10px] sm:text-xs md:text-sm font-bold"
            >
              {topActionDone ? "CHECKED IN" : "CHECK IN"}
            </RusticButton>
          }
          buttonSlotBottom={
            <RusticButton
              variant="wood"
              isLoading={bottomActionLoading}
              icon={<CompassIcon className="w-4 h-4 text-amber-200" />}
              onClick={handleBottomClick}
              className="h-full !py-0 text-[10px] sm:text-xs md:text-sm font-semibold"
            >
              TRAIL MAP
            </RusticButton>
          }
        />

        {/* Customization Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-stone-900/90 p-5 rounded-xl border border-stone-800 text-sm">
          
          {/* Sign Text Inputs */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Text Slot Content
            </h3>
            <div>
              <label className="block text-[11px] text-stone-400 mb-1">Signboard Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={customSlotMode}
                className="w-full px-3 py-1.5 bg-stone-950 border border-stone-700 rounded text-amber-300 font-bold tracking-wider focus:outline-none focus:border-amber-500 disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-[11px] text-stone-400 mb-1">Subtitle</label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                disabled={customSlotMode}
                className="w-full px-3 py-1.5 bg-stone-950 border border-stone-700 rounded text-stone-200 focus:outline-none focus:border-amber-500 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Layer Source Uploaders */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Photo Layer Sources
            </h3>
            
            <input 
              type="file" 
              ref={bgInputRef} 
              onChange={handleBgFile} 
              accept="image/*" 
              className="hidden" 
            />
            <button
              onClick={() => bgInputRef.current?.click()}
              className="w-full flex items-center justify-between px-3 py-2 bg-stone-950 border border-stone-700 rounded hover:border-amber-500/50 transition-colors text-xs text-stone-300"
            >
              <span className="truncate">Wall: {bgImage.length > 25 ? 'custom file' : bgImage}</span>
              <UploadIcon className="w-4 h-4 text-stone-400 shrink-0 ml-2" />
            </button>

            <input 
              type="file" 
              ref={signInputRef} 
              onChange={handleSignFile} 
              accept="image/*" 
              className="hidden" 
            />
            <button
              onClick={() => signInputRef.current?.click()}
              className="w-full flex items-center justify-between px-3 py-2 bg-stone-950 border border-stone-700 rounded hover:border-amber-500/50 transition-colors text-xs text-stone-300"
            >
              <span className="truncate">Sign: {signImage.length > 25 ? 'custom file' : signImage}</span>
              <UploadIcon className="w-4 h-4 text-stone-400 shrink-0 ml-2" />
            </button>
          </div>

          {/* Mode Toggles */}
          <div className="space-y-3 flex flex-col justify-end">
            <label className="flex items-center gap-3 cursor-pointer select-none bg-stone-950 border border-stone-800 hover:border-stone-700 px-3 py-2 rounded transition-colors">
              <input
                type="checkbox"
                checked={customSlotMode}
                onChange={(e) => setCustomSlotMode(e.target.checked)}
                className="w-4 h-4 accent-amber-500 rounded"
              />
              <span className="text-xs font-medium text-stone-300">
                Inject Custom Slot Component
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer select-none bg-stone-950 border border-stone-800 hover:border-stone-700 px-3 py-2 rounded transition-colors">
              <input
                type="checkbox"
                checked={showGuides}
                onChange={(e) => setShowGuides(e.target.checked)}
                className="w-4 h-4 accent-amber-500 rounded"
              />
              <span className="text-xs font-medium text-stone-300">
                Show Grey Mockup Slot Guides
              </span>
            </label>
          </div>

        </div>

      </div>
    </main>
  );
}