import React, { useState, useMemo } from 'react';
import { RoomType, RateOption, SearchCriteria } from '../../../types';
import { ROOMS, RATE_OPTIONS } from '../../../data/hotelData';
import { 
  Users, User, Heart, Users2, Dog, Sparkles, Check, ArrowRight, ArrowLeft, Share2, Mail, RotateCcw, Bed, Bath, CheckCircle2, X
} from 'lucide-react';

interface RoomMatcherPageProps {
  onSelectRoomAndBook: (room: RoomType) => void;
  onViewAllRooms: () => void;
  onReturnToSite?: () => void;
  criteria?: SearchCriteria;
}

export type TravelerType = 'solo' | 'couple' | 'friends' | 'family';

export interface FocusOption {
  id: string;
  title: string;
  tagline: string;
  iconPath: string;
  associatedTags: string[];
}

export const FOCUS_OPTIONS: FocusOption[] = [
  {
    id: 'connection-with-nature',
    title: 'Connection with Nature',
    tagline: 'Forest views, outdoor cedar tubs & creek trail access',
    iconPath: '/assets/illustrations/interaction/find-your-stay/connection_with_nature.svg',
    associatedTags: ['nature', 'outdoor-tub', 'creek', 'woods']
  },
  {
    id: 'indoor-sanctuaries',
    title: 'Indoor Sanctuaries',
    tagline: 'Deep freestanding tubs, crackling stoves & restorative quiet',
    iconPath: '/assets/illustrations/interaction/find-your-stay/indoor_sancuaries.svg',
    associatedTags: ['copper-tub', 'clawfoot', 'fireplace', 'sanctuary']
  },
  {
    id: 'minimal-distractions',
    title: 'Minimal Distractions',
    tagline: 'Unplugged woodland serenity & peaceful contemplation',
    iconPath: '/assets/illustrations/interaction/find-your-stay/minimal_distractions.svg',
    associatedTags: ['unplugged', 'peaceful', 'quiet', 'solitude']
  },
  {
    id: 'scenic-mountain-views',
    title: 'Scenic Mountain Views',
    tagline: 'Picture windows framing the Catskill canopy & sunrise light',
    iconPath: '/assets/illustrations/interaction/find-your-stay/scenic_mountain_views.svg',
    associatedTags: ['mountain-views', 'balcony', 'picture-window', 'sunrise']
  },
  {
    id: 'simple-comforts',
    title: 'Simple Comforts',
    tagline: 'Plush Aireloom beds, heated floors & easy lodge access',
    iconPath: '/assets/illustrations/interaction/find-your-stay/simple_comforts.svg',
    associatedTags: ['comfort', 'bed', 'hearth-access', 'heated-floors']
  },
  {
    id: 'spaces-for-connection',
    title: 'Spaces for Connection',
    tagline: 'Intimate soaking suites, chaise dens & romantic alcoves',
    iconPath: '/assets/illustrations/interaction/find-your-stay/spaces_for_connection.svg',
    associatedTags: ['romance', 'chaise-den', 'couples', 'intimate']
  },
  {
    id: 'spaces-to-gather',
    title: 'Spaces to Gather',
    tagline: 'Spacious parlors, multiple bedrooms & wraparound verandas',
    iconPath: '/assets/illustrations/interaction/find-your-stay/spaces_to_gather.svg',
    associatedTags: ['gather', 'multiple-bedrooms', 'parlor', 'group']
  },
  {
    id: 'your-own-hideaway',
    title: 'Your Own Hideaway',
    tagline: 'Tucked beneath cathedral eaves with private balcony seclusion',
    iconPath: '/assets/illustrations/interaction/find-your-stay/your_own_hideaway.svg',
    associatedTags: ['hideaway', 'penthouse', 'private-deck', 'seclusion']
  }
];

export const RoomMatcherPage: React.FC<RoomMatcherPageProps> = ({
  onSelectRoomAndBook,
  onViewAllRooms,
  onReturnToSite,
  criteria
}) => {
  // Step state: 1 = Traveler Profile, 2 = Focus Selection, 3 = Matched Results
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Questionnaire responses
  const [travelerType, setTravelerType] = useState<TravelerType | null>(null);
  const [withPup, setWithPup] = useState<boolean | null>(null);
  const [kidsUnder10, setKidsUnder10] = useState<boolean | null>(null);
  const [selectedFocusIds, setSelectedFocusIds] = useState<string[]>([]);

  // Modals & Feedback
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Toggle Focus Selection (up to 2 choices)
  const handleToggleFocus = (id: string) => {
    setSelectedFocusIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(fId => fId !== id);
      }
      if (prev.length >= 2) {
        // Replace oldest or cap at 2
        return [prev[1], id];
      }
      return [...prev, id];
    });
  };

  // Reset all choices
  const handleReset = () => {
    setTravelerType(null);
    setWithPup(null);
    setKidsUnder10(null);
    setSelectedFocusIds([]);
    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Can advance from Step 1?
  const canAdvanceStep1 = travelerType !== null && withPup !== null && (travelerType !== 'family' || kidsUnder10 !== null);

  // Can advance from Step 2?
  const canAdvanceStep2 = selectedFocusIds.length > 0;

  // Matching Logic & Narrative Generator
  const matchedResults = useMemo(() => {
    // Score each room in hotelData based on selections
    const scoredRooms = ROOMS.map(room => {
      let score = 50; // base score
      const reasons: string[] = [];

      // 1. Pup Filter / Bonus
      if (withPup === true) {
        if (room.isDogFriendly) {
          score += 40;
          reasons.push("Fully dog-friendly with plush beds and house treats waiting");
        } else {
          score -= 100; // Incompatible with pup
        }
      }

      // 2. Family & Kids Policy
      if (travelerType === 'family') {
        if (kidsUnder10 === true) {
          if (!room.ageRestricted21) {
            score += 50;
            reasons.push("All-ages welcoming in The Lodge, separate from the 21+ quiet zones");
          } else {
            score -= 150; // Alpine and Walden are strictly 21+
          }
        }
        if (room.id === 'lodge-three-bedroom') {
          score += 45;
          reasons.push("Three independent king bedrooms around a shared timber parlor");
        }
      }

      // 3. Traveler Type Alignment
      if (travelerType === 'couple') {
        if (room.soakType === 'copper-den' || room.soakType === 'copper-tub-fireplace' || room.soakType === 'outdoor-cedar-tub') {
          score += 35;
          reasons.push("Romantic signature soaking tub made for long candlelit evenings together");
        }
      } else if (travelerType === 'solo') {
        if (room.id === 'walden-king' || room.id === 'alpine-bathing-suite') {
          score += 35;
          reasons.push("Contemplative private haven with acoustic sound, writing desk, and forest views");
        }
      } else if (travelerType === 'friends') {
        if (room.id === 'lodge-three-bedroom' || room.id === 'alpine-bathing-suite-den' || room.id === 'lodge-penthouse') {
          score += 35;
          reasons.push("Plenty of comfortable lounge seating and daybed spaces to hang out together");
        }
      }

      // 4. Escape Focus Matching
      selectedFocusIds.forEach(focusId => {
        if (focusId === 'connection-with-nature') {
          if (room.soakType === 'outdoor-cedar-tub' || room.buildingId === 'walden') {
            score += 25;
            reasons.push("Deep woods setting with outdoor cedar tub and hemlock breeze");
          }
        } else if (focusId === 'indoor-sanctuaries') {
          if (room.id === 'alpine-bathing-suite-den' || room.id === 'alpine-penthouse') {
            score += 25;
            reasons.push("Cozy cast-iron stove, deep copper tub, and plush reading chaise");
          }
        } else if (focusId === 'minimal-distractions') {
          if (room.id === 'walden-king' || room.id === 'alpine-bathing-suite') {
            score += 25;
            reasons.push("Analog sanctuary designed to unplug, read, and slow down time");
          }
        } else if (focusId === 'scenic-mountain-views') {
          if (room.buildingId === 'alpine') {
            score += 25;
            reasons.push("Panoramic picture windows overlooking the Catskill ridge and changing light");
          }
        } else if (focusId === 'simple-comforts') {
          if (room.buildingId === 'lodge' || room.id === 'lodge-king') {
            score += 25;
            reasons.push("Steps from the dining parlor hearth with radiant heated bathroom floors");
          }
        } else if (focusId === 'spaces-for-connection') {
          if (room.id === 'alpine-bathing-suite-den' || room.id === 'lodge-penthouse') {
            score += 25;
            reasons.push("Warm lantern light, crackling fire, and intimate dual lounging spaces");
          }
        } else if (focusId === 'spaces-to-gather') {
          if (room.id === 'lodge-three-bedroom' || room.id === 'lodge-penthouse') {
            score += 30;
            reasons.push("Spacious private living room, wet bar, and wraparound deck");
          }
        } else if (focusId === 'your-own-hideaway') {
          if (room.id === 'alpine-penthouse' || room.id === 'walden-king') {
            score += 25;
            reasons.push("Tucked quietly beneath cathedral rooflines with a private deck");
          }
        }
      });

      return {
        room,
        score,
        reasons
      };
    });

    // Sort by descending score
    const sorted = scoredRooms.sort((a, b) => b.score - a.score);
    const topRoom = sorted[0];
    const alternativeRooms = sorted.slice(1, 3);

    // Build bespoke narrative rationale for top room matching exact user specification style
    let confirmationIntro = '';
    if (travelerType === 'couple') {
      confirmationIntro = `This room is perfect for a couples getaway because it includes ${
        topRoom?.room.soakType === 'copper-den' || topRoom?.room.soakType === 'copper-tub-fireplace'
          ? 'a hand-hammered copper soaking tub made for candlelit evenings, an intimate fireside lounging den, and cathedral timber rafters'
          : 'a romantic freestanding clawfoot tub positioned before forest canopy windows, king bed comfort, and quiet mountain seclusion'
      }.`;
    } else if (travelerType === 'family') {
      confirmationIntro = `Perfect for the family because ${
        kidsUnder10
          ? 'it is located in our all-ages historic Lodge (welcoming children under 10), featuring spacious gathering areas and separate sleeping quarters without 21+ restrictions.'
          : 'it offers generous communal living space, comfortable sleeping quarters, and effortless proximity to the dining parlor and nature trails.'
      }`;
    } else if (travelerType === 'solo') {
      confirmationIntro = `Solo travelers love this room because it provides ${
        topRoom?.room.id === 'walden-king'
          ? 'a tranquil analog sanctuary deep in the hemlocks, complete with a private morning writing deck and restorative forest stillness.'
          : 'a contemplative personal haven with deep soaking tub, serene woodland vistas, and space to unwind and recharge.'
      }`;
    } else if (travelerType === 'friends') {
      confirmationIntro = `Ideal for friends traveling together because it features ${
        topRoom?.room.id === 'lodge-three-bedroom'
          ? 'three independent private king suites surrounding a shared timber parlor with wet bar and stone fireplace.'
          : 'comfortable dual lounging seating, scenic outdoor porch access, and easy walking distance to the evening firepit.'
      }`;
    } else {
      confirmationIntro = `This room is the premier match for your Catskill stay, pairing signature handcrafted timber design with restorative comfort.`;
    }

    const focusTitles = selectedFocusIds
      .map(id => FOCUS_OPTIONS.find(f => f.id === id)?.title)
      .filter(Boolean)
      .join(' and ');

    const focusAddon = selectedFocusIds.length > 0 
      ? ` Tailored to your focus on ${focusTitles}, highlighting ${topRoom?.reasons.slice(0, 2).join(' and ') || 'tailored craftsmanship'}.`
      : '';

    const pupAddon = withPup 
      ? " Best of all, traveling with your pup is effortless here—plush canine bedding, feeding bowls, and house-baked organic treats will be waiting in your suite upon arrival."
      : "";

    const topRationale = `${confirmationIntro}${focusAddon}${pupAddon}`;

    return {
      topRoom: topRoom?.room || ROOMS[0],
      topRationale,
      topReasons: topRoom?.reasons || [],
      alternativeRooms: alternativeRooms.map(item => ({
        room: item.room,
        reason: item.reasons[0] || 'Matches your comfort and relaxation preferences'
      }))
    };
  }, [travelerType, withPup, kidsUnder10, selectedFocusIds]);

  // Handle Share Click
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My Matched Suite at Urban Cowboy Catskills',
        text: `Check out our matched suite: ${matchedResults.topRoom.name}!`,
        url: window.location.href
      }).catch(() => {
        navigator.clipboard.writeText(window.location.href);
        showToast('Sharable link copied to clipboard!');
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Sharable link copied to clipboard!');
    }
  };

  // Handle Save to Email
  const handleSaveEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }
    setIsEmailModalOpen(false);
    setEmailInput('');
    showToast(`Your curated room matches have been sent to ${emailInput}!`);
  };

  return (
    <div className="w-full min-h-screen bg-[#FAF9F9] text-[#1C1917] font-sans antialiased selection:bg-[#4E332D] selection:text-white pb-24">
      
      {/* ================= QUIET TOP NAVIGATION ================= */}
      <header className="border-b border-[#EBE8E0] bg-white sticky top-0 z-30">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-woodblock text-lg sm:text-xl tracking-[0.25em] text-[#1C1917] font-bold">
              URBAN COWBOY
            </span>
            <span className="text-[#D1C9BE]" aria-hidden="true">|</span>
            <span className="font-mono text-xs uppercase tracking-wider text-[#73716D]">
              ROOM FINDER & EXPERIENCE MATCHER
            </span>
          </div>

          <div className="flex items-center gap-4">
            {onReturnToSite && (
              <button
                type="button"
                onClick={onReturnToSite}
                className="text-xs font-woodblock uppercase tracking-wider text-[#73716D] hover:text-[#4E332D] transition-colors cursor-pointer"
              >
                Return to Site
              </button>
            )}
            <button
              type="button"
              onClick={onViewAllRooms}
              className="text-xs font-woodblock uppercase tracking-wider text-[#9A5636] hover:text-[#4E332D] font-bold cursor-pointer"
            >
              Browse All Rooms →
            </button>
          </div>
        </div>
      </header>

      {/* ================= STEPPER PROGRESS BAR ================= */}
      <div className="bg-[#EBE8E0]/40 border-b border-[#EBE8E0] py-3.5 px-4">
        <div className="max-w-[1000px] mx-auto flex items-center justify-between text-xs font-mono text-[#73716D]">
          <div className="flex items-center gap-2">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
              currentStep >= 1 ? 'bg-[#4E332D] text-white' : 'bg-[#D1C9BE] text-[#73716D]'
            }`}>
              1
            </span>
            <span className={currentStep === 1 ? 'font-bold text-[#1C1917]' : ''}>The Travelers</span>
          </div>

          <div className="w-12 sm:w-24 h-0.5 bg-[#D1C9BE]" />

          <div className="flex items-center gap-2">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
              currentStep >= 2 ? 'bg-[#4E332D] text-white' : 'bg-[#D1C9BE] text-[#73716D]'
            }`}>
              2
            </span>
            <span className={currentStep === 2 ? 'font-bold text-[#1C1917]' : ''}>The Focus</span>
          </div>

          <div className="w-12 sm:w-24 h-0.5 bg-[#D1C9BE]" />

          <div className="flex items-center gap-2">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
              currentStep === 3 ? 'bg-[#0E301A] text-white' : 'bg-[#D1C9BE] text-[#73716D]'
            }`}>
              3
            </span>
            <span className={currentStep === 3 ? 'font-bold text-[#0E301A]' : ''}>Your Curated Matches</span>
          </div>
        </div>
      </div>

      {/* ================= MAIN QUESTIONNAIRE CANVAS ================= */}
      <div className="max-w-[1360px] 2xl:max-w-[1440px] mx-auto px-4 sm:px-8 py-10 sm:py-16">

        {/* ========================================================================= */}
        {/* STEP 1: TRAVELER DETAILS & PUP COMPANION                                  */}
        {/* ========================================================================= */}
        {currentStep === 1 && (
          <div className="space-y-12 animate-in fade-in duration-300">
            
            {/* Header */}
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="font-woodblock text-xs uppercase tracking-[0.25em] text-[#9A5636] font-bold block">
                STEP 1 OF 2 · TRAVELER PROFILE
              </span>
              <h1 className="font-display font-light text-3xl sm:text-5xl text-[#1C1917] uppercase tracking-wide">
                Tell us about the traveler(s) for this trip
              </h1>
              <p className="font-sans text-sm sm:text-base text-[#60605E]">
                Whether you're sneaking away for quiet solitude, celebrating romance, or gathering friends, we'll guide you to the suites built for your company.
              </p>
            </div>

            {/* Question 1A: Solo, Couple, Friends, Family */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { id: 'solo', label: 'Solo', sub: 'Quiet solitude & creative space', icon: User },
                { id: 'couple', label: 'Couple', sub: 'Romance, soaking & fireside den', icon: Heart },
                { id: 'friends', label: 'Friends', sub: 'Shared porches & communal hearth', icon: Users },
                { id: 'family', label: 'Family', sub: 'Generous suites & gathering lofts', icon: Users2 }
              ].map(item => {
                const isSelected = travelerType === item.id;
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setTravelerType(item.id as TravelerType);
                      if (item.id !== 'family') {
                        setKidsUnder10(null);
                      }
                    }}
                    className={`p-6 sm:p-8 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between group ${
                      isSelected
                        ? 'border-[#4E332D] bg-[#EBE8E0]/70 ring-1 ring-[#4E332D] shadow-sm'
                        : 'border-[#EBE8E0] bg-white hover:border-[#4E332D]/40 hover:bg-[#FAF9F9]'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <IconComponent className={`w-6 h-6 ${isSelected ? 'text-[#4E332D]' : 'text-[#73716D]'}`} />
                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-[#0E301A] text-white flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <span className="font-brothers text-lg sm:text-xl uppercase tracking-wide text-[#1C1917] block font-bold">
                        {item.label}
                      </span>
                    </div>
                    <span className="text-xs text-[#60605E] font-sans mt-3 block leading-relaxed">
                      {item.sub}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Question 1B: Traveling with your pup? */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border-2 border-[#EBE8E0] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#EBE8E0]/60 flex items-center justify-center shrink-0">
                    <Dog className="w-5 h-5 text-[#9A5636]" />
                  </div>
                  <div>
                    <h3 className="font-brothers text-base sm:text-lg uppercase tracking-wide text-[#1C1917] font-bold">
                      Traveling with your pup?
                    </h3>
                    <p className="font-sans text-xs sm:text-sm text-[#60605E]">
                      We'll keep your matches strictly to suites where four-legged adventurers are welcome to join.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setWithPup(true)}
                    className={`px-6 py-2.5 rounded-full text-xs font-woodblock uppercase tracking-wider transition-all cursor-pointer border ${
                      withPup === true
                        ? 'bg-[#4E332D] text-white border-[#4E332D] shadow-xs font-bold'
                        : 'bg-white text-[#1C1917] border-[#D1C9BE] hover:bg-[#FAF9F9]'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setWithPup(false)}
                    className={`px-6 py-2.5 rounded-full text-xs font-woodblock uppercase tracking-wider transition-all cursor-pointer border ${
                      withPup === false
                        ? 'bg-[#4E332D] text-white border-[#4E332D] shadow-xs font-bold'
                        : 'bg-white text-[#1C1917] border-[#D1C9BE] hover:bg-[#FAF9F9]'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>
            </div>

            {/* Conditional Question 1C: If Family is selected, display Kids Under 10 option */}
            {travelerType === 'family' && (
              <div className="bg-white p-6 sm:p-8 rounded-2xl border-2 border-[#EBE8E0] space-y-4 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-brothers text-base sm:text-lg uppercase tracking-wide text-[#1C1917] font-bold">
                      Kids Under 10 Traveling with you?
                    </h3>
                    <p className="font-sans text-xs sm:text-sm text-[#60605E] max-w-xl">
                      Urban Cowboy's Alpine and Walden Haus are 21+ tranquil zones. If bringing children under 10, we'll pair you with our spacious all-ages suites in The Lodge!
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={() => setKidsUnder10(true)}
                      className={`px-6 py-2.5 rounded-full text-xs font-woodblock uppercase tracking-wider transition-all cursor-pointer border ${
                        kidsUnder10 === true
                          ? 'bg-[#4E332D] text-white border-[#4E332D] shadow-xs font-bold'
                          : 'bg-white text-[#1C1917] border-[#D1C9BE] hover:bg-[#FAF9F9]'
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => setKidsUnder10(false)}
                      className={`px-6 py-2.5 rounded-full text-xs font-woodblock uppercase tracking-wider transition-all cursor-pointer border ${
                        kidsUnder10 === false
                          ? 'bg-[#4E332D] text-white border-[#4E332D] shadow-xs font-bold'
                          : 'bg-white text-[#1C1917] border-[#D1C9BE] hover:bg-[#FAF9F9]'
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Continue to Step 2 */}
            <div className="flex items-center justify-between pt-6 border-t border-[#EBE8E0]">
              <span className="text-xs text-[#73716D] font-mono">
                {travelerType ? `Traveler: ${travelerType.toUpperCase()}` : 'Select your traveler profile'}
                {withPup !== null ? ` · Pup: ${withPup ? 'YES' : 'NO'}` : ''}
              </span>

              <button
                type="button"
                onClick={() => {
                  if (canAdvanceStep1) {
                    setCurrentStep(2);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                disabled={!canAdvanceStep1}
                className={`px-8 py-3.5 rounded-full text-xs font-woodblock uppercase tracking-widest transition-all flex items-center gap-2 ${
                  canAdvanceStep1
                    ? 'bg-[#4E332D] hover:bg-[#221C18] text-white cursor-pointer shadow-md hover:shadow-lg active:scale-95'
                    : 'bg-[#D1C9BE] text-[#73716D] cursor-not-allowed opacity-60'
                }`}
              >
                <span>Continue to Escape Focus</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: THE FOCUS FOR THIS ESCAPE (USING PUBLIC/ASSETS/BUTTONS ICONS)     */}
        {/* ========================================================================= */}
        {currentStep === 2 && (
          <div className="space-y-10 animate-in fade-in duration-300">
            
            {/* Header */}
            <div className="text-center max-w-4xl mx-auto space-y-3">
              <span className="font-woodblock text-xs uppercase tracking-[0.25em] text-[#9A5636] font-bold block">
                STEP 2 OF 2 · ESCAPE INTENTION
              </span>
              <h1 className="font-display font-light text-2xl sm:text-3xl md:text-4xl lg:text-[44px] xl:text-5xl text-[#1C1917] uppercase tracking-wide sm:whitespace-nowrap leading-tight">
                The Focus for this Escape is:
              </h1>
              <p className="font-sans text-sm sm:text-base text-[#60605E]">
                Choose up to two, and we'll point you toward the rooms that fit your kind of escape.
              </p>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EBE8E0]/70 text-xs font-mono text-[#4E332D]">
                <span>{selectedFocusIds.length} of 2 selected</span>
              </div>
            </div>

            {/* Grid of the 8 Focus Choices with SVG icons from public/assets/buttons - Scaled +15% */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-5 sm:gap-6 lg:gap-8 max-w-[1360px] mx-auto">
              {FOCUS_OPTIONS.map(option => {
                const isSelected = selectedFocusIds.includes(option.id);
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleToggleFocus(option.id)}
                    aria-label={option.title}
                    aria-pressed={isSelected}
                    title={option.title}
                    className={`relative w-full aspect-square p-4 sm:p-6 lg:p-7 rounded-2xl sm:rounded-3xl border-2 transition-all duration-200 cursor-pointer flex items-center justify-center group overflow-hidden ${
                      isSelected
                        ? 'border-[#4E332D] bg-[#EBE8E0]/90 shadow-xl ring-2 ring-[#4E332D] ring-offset-2 scale-[1.02]'
                        : 'border-[#EBE8E0] bg-white hover:border-[#4E332D]/40 hover:bg-[#FAF9F9] hover:shadow-lg hover:scale-[1.015]'
                    }`}
                  >
                    {/* The Icon IS the entire button */}
                    <img
                      src={option.iconPath}
                      alt={option.title}
                      className="w-full h-full object-contain filter contrast-125 transition-transform duration-200 group-hover:scale-105 select-none"
                    />

                    {/* Active Selected Checkmark Indicator */}
                    {isSelected && (
                      <div className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#0E301A] text-white flex items-center justify-center shadow-md animate-in zoom-in-50 duration-150">
                        <Check className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Stepper Navigation Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-[#EBE8E0]">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-6 py-3 rounded-full text-xs font-woodblock uppercase tracking-wider text-[#73716D] hover:text-[#4E332D] transition-colors cursor-pointer flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Travelers</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (canAdvanceStep2) {
                    setCurrentStep(3);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                disabled={!canAdvanceStep2}
                className={`px-8 py-3.5 rounded-full text-xs font-woodblock uppercase tracking-widest transition-all flex items-center gap-2 ${
                  canAdvanceStep2
                    ? 'bg-[#4E332D] hover:bg-[#221C18] text-white cursor-pointer shadow-md hover:shadow-lg active:scale-95'
                    : 'bg-[#D1C9BE] text-[#73716D] cursor-not-allowed opacity-60'
                }`}
              >
                <span>Reveal Top Room Matches</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: MATCH RESULTS (HERO TOP CHOICE + 2 RUNNER-UPS + ACTIONS)          */}
        {/* ========================================================================= */}
        {currentStep === 3 && (
          <div className="space-y-12 animate-in fade-in duration-300">
            
            {/* Results Title Banner */}
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <span className="font-woodblock text-xs uppercase tracking-[0.25em] text-[#0E301A] font-bold block">
                ✦ CURATED MATCH RESULTS
              </span>
              <h1 className="font-display font-light text-3xl sm:text-5xl text-[#1C1917] uppercase tracking-wide">
                Your Handpicked Catskill Matches
              </h1>
              <p className="font-sans text-sm sm:text-base text-[#60605E]">
                Based on your party of {travelerType?.toUpperCase()}{withPup ? ' (with your dog companion)' : ''} and your escape focus on{' '}
                <strong className="text-[#4E332D]">
                  {selectedFocusIds.map(id => FOCUS_OPTIONS.find(f => f.id === id)?.title).join(' & ')}
                </strong>.
              </p>
            </div>

            {/* ================= HERO #1 TOP ROOM CHOICE ================= */}
            <div className="bg-white border-2 border-[#4E332D] rounded-3xl overflow-hidden shadow-xl">
              
              <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
                
                {/* Hero Image (5 cols) */}
                <div className="lg:col-span-5 relative min-h-[320px] lg:min-h-[460px] overflow-hidden">
                  <img
                    src={matchedResults.topRoom.images[0]}
                    alt={matchedResults.topRoom.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-[#0E301A] text-white px-3.5 py-1.5 rounded-full text-xs font-woodblock uppercase tracking-wider font-bold shadow-md flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#F2AAA9]" />
                    <span>#1 TOP MATCH</span>
                  </div>
                  <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-xs px-3 py-1 rounded-md text-xs font-mono text-[#1C1917] font-bold">
                    From ${matchedResults.topRoom.basePrice} / night
                  </div>
                </div>

                {/* Narrative & Room Details (7 cols) */}
                <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between space-y-6">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#9A5636] font-bold mb-1">
                      <span>{matchedResults.topRoom.buildingName}</span>
                      <span aria-hidden="true">·</span>
                      <span>{matchedResults.topRoom.bedType}</span>
                    </div>

                    <h2 className="font-display font-normal text-2xl sm:text-4xl text-[#1C1917] uppercase tracking-wide">
                      {matchedResults.topRoom.name}
                    </h2>

                    {/* The Bespoke "Why It's Your Perfect Match" Confirmation */}
                    <div className="mt-4 p-5 rounded-2xl bg-[#EBE8E0]/60 border border-[#4E332D]/20 space-y-2">
                      <span className="font-woodblock text-xs uppercase tracking-widest text-[#4E332D] font-bold block flex items-center gap-1.5">
                        <Check className="w-4 h-4 text-[#0E301A]" />
                        <span>WHY THIS IS YOUR PERFECT MATCH:</span>
                      </span>
                      <p className="font-sans text-xs sm:text-sm text-[#4E332D] leading-relaxed">
                        {matchedResults.topRationale}
                      </p>
                    </div>

                    {/* Room Key Highlights */}
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs text-[#60605E]">
                      <div className="flex items-center gap-1.5">
                        <Bath className="w-3.5 h-3.5 text-[#9A5636]" />
                        <span>{matchedResults.topRoom.soakHighlight}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Bed className="w-3.5 h-3.5 text-[#9A5636]" />
                        <span>{matchedResults.topRoom.squareFeet} Sq Ft</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Dog className="w-3.5 h-3.5 text-[#9A5636]" />
                        <span>{matchedResults.topRoom.isDogFriendly ? 'Dog-Friendly' : 'Adults 21+'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Primary Action Button */}
                  <div className="pt-4 border-t border-[#EBE8E0] flex flex-col sm:flex-row items-center justify-between gap-4">
                    <span className="text-xs text-[#73716D] font-sans">
                      Rates start at <strong>${matchedResults.topRoom.basePrice}/night</strong> with flexible cancellation.
                    </span>

                    <button
                      type="button"
                      onClick={() => onSelectRoomAndBook(matchedResults.topRoom)}
                      className="w-full sm:w-auto bg-[#4E332D] hover:bg-[#221C18] text-white px-8 py-3.5 rounded-full font-woodblock text-xs sm:text-sm uppercase tracking-widest transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center gap-2"
                    >
                      <span>Confirm & Reserve #1 Match Now</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                </div>

              </div>
            </div>

            {/* ================= TWO OTHER RUNNER-UP MATCHES ================= */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between border-b border-[#EBE8E0] pb-2">
                <h3 className="font-woodblock text-xs sm:text-sm uppercase tracking-[0.2em] text-[#1C1917] font-bold">
                  TWO OTHER EXCELLENT MATCHES FOR YOUR STAY
                </h3>
                <span className="text-xs text-[#73716D] font-mono hidden sm:block">Alternative architectural layouts</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {matchedResults.alternativeRooms.map(({ room: altRoom, reason }, idx) => (
                  <div
                    key={altRoom.id}
                    className="bg-white border border-[#D1C9BE] rounded-2xl overflow-hidden p-5 flex flex-col justify-between hover:shadow-md transition-shadow space-y-4"
                  >
                    <div>
                      <div className="relative h-48 rounded-xl overflow-hidden mb-4">
                        <img
                          src={altRoom.images[0]}
                          alt={altRoom.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2.5 left-2.5 bg-[#FAF9F9]/90 px-2.5 py-1 rounded-md text-[11px] font-mono font-bold text-[#1C1917]">
                          Option #{idx + 2} Match
                        </div>
                        <div className="absolute bottom-2.5 right-2.5 bg-black/80 text-white px-2.5 py-1 rounded-md text-[11px] font-mono">
                          From ${altRoom.basePrice} / nt
                        </div>
                      </div>

                      <span className="text-[11px] font-mono uppercase tracking-wider text-[#9A5636] font-bold block">
                        {altRoom.buildingName} · {altRoom.bedType}
                      </span>
                      <h4 className="font-brothers text-lg uppercase text-[#1C1917] font-bold mt-0.5">
                        {altRoom.name}
                      </h4>
                      <p className="font-sans text-xs text-[#60605E] mt-2 line-clamp-2">
                        {altRoom.description}
                      </p>

                      <div className="mt-3 p-3 rounded-xl bg-[#FAF9F9] border border-[#EBE8E0] text-xs text-[#4E332D]">
                        <strong>Why it also fits:</strong> {reason}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onSelectRoomAndBook(altRoom)}
                      className="w-full border-2 border-[#4E332D] text-[#4E332D] hover:bg-[#4E332D] hover:text-white py-2.5 rounded-full font-woodblock text-xs uppercase tracking-wider transition-colors cursor-pointer text-center"
                    >
                      Select & Reserve This Option
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* ================= VALUE-ADDED UTILITY ACTIONS (SHARE, SAVE, VIEW ALL) ================= */}
            <div className="bg-[#EBE8E0]/70 rounded-2xl p-6 sm:p-8 border border-[#D1C9BE] flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-1 text-center md:text-left">
                <span className="font-woodblock text-xs uppercase tracking-widest text-[#4E332D] font-bold block">
                  KEEP THESE CURATED MATCHES
                </span>
                <p className="font-sans text-xs sm:text-sm text-[#60605E]">
                  Share this recommendation with your fellow traveler, save to your inbox for later, or browse our entire lodging collection.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
                {/* Confirm Match Button */}
                <button
                  type="button"
                  onClick={() => onSelectRoomAndBook(matchedResults.topRoom)}
                  className="px-5 py-2.5 rounded-full bg-[#4E332D] hover:bg-[#221C18] text-white text-xs font-woodblock uppercase tracking-wider font-bold transition-all cursor-pointer flex items-center gap-2 shadow-sm"
                >
                  <Check className="w-3.5 h-3.5 text-[#F2AAA9]" />
                  <span>Confirm & Book Match</span>
                </button>

                {/* Share Button */}
                <button
                  type="button"
                  onClick={handleShare}
                  className="px-5 py-2.5 rounded-full bg-white hover:bg-stone-50 border border-[#D1C9BE] text-xs font-woodblock uppercase tracking-wider text-[#1C1917] transition-all cursor-pointer flex items-center gap-2 shadow-2xs"
                >
                  <Share2 className="w-3.5 h-3.5 text-[#9A5636]" />
                  <span>Share</span>
                </button>

                {/* Save via Email Button */}
                <button
                  type="button"
                  onClick={() => setIsEmailModalOpen(true)}
                  className="px-5 py-2.5 rounded-full bg-white hover:bg-stone-50 border border-[#D1C9BE] text-xs font-woodblock uppercase tracking-wider text-[#1C1917] transition-all cursor-pointer flex items-center gap-2 shadow-2xs"
                >
                  <Mail className="w-3.5 h-3.5 text-[#9A5636]" />
                  <span>Save via Email</span>
                </button>

                {/* Retake Questionnaire */}
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-5 py-2.5 rounded-full bg-transparent hover:bg-white/60 text-xs font-woodblock uppercase tracking-wider text-[#73716D] transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retake</span>
                </button>
              </div>
            </div>

            {/* View All Rooms Secondary Callout */}
            <div className="text-center pt-4">
              <button
                type="button"
                onClick={onViewAllRooms}
                className="inline-flex items-center gap-2 text-xs font-woodblock uppercase tracking-[0.2em] text-[#4E332D] hover:text-[#9A5636] font-bold underline transition-colors cursor-pointer"
              >
                <span>Prefer to browse our full collection? View All 10 Rooms & Suites</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        )}

      </div>

      {/* ================= EMAIL SAVE MODAL ================= */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border-2 border-[#4E332D] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative space-y-4">
            <button
              type="button"
              onClick={() => setIsEmailModalOpen(false)}
              className="absolute top-4 right-4 text-[#73716D] hover:text-black cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="font-woodblock text-xs uppercase tracking-widest text-[#9A5636] font-bold block">
                SAVE YOUR MATCHES
              </span>
              <h3 className="font-display font-normal text-2xl text-[#1C1917] uppercase">
                Send to Your Inbox
              </h3>
              <p className="font-sans text-xs text-[#60605E]">
                Enter your email address and we'll send a direct link to your curated matches for {matchedResults.topRoom.name}.
              </p>
            </div>

            <form onSubmit={handleSaveEmail} className="space-y-3 pt-2">
              <input
                type="email"
                required
                value={emailInput}
                onChange={e => setEmailInput(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full bg-[#FAF9F9] border border-[#D1C9BE] rounded-xl px-4 py-3 text-sm text-[#1C1917] focus:outline-none focus:border-[#4E332D]"
              />

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-[#4E332D] hover:bg-[#221C18] text-white py-3 rounded-full text-xs font-woodblock uppercase tracking-wider font-bold cursor-pointer transition-colors"
                >
                  Send My Curated Matches
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= FLOATING TOAST CONFIRMATION ================= */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#0E301A] text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 text-xs font-mono animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-[#F2AAA9]" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
};
