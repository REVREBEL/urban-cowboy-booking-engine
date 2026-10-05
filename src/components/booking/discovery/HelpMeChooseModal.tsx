import React, { useState } from 'react';
import { RoomType } from '../types';
import { ROOMS } from '../data/hotelData';
import { X, Compass, Sparkles, Check, ArrowRight, Bath, Trees, Flame, Dog } from 'lucide-react';

interface HelpMeChooseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRoom: (room: RoomType) => void;
}

export const HelpMeChooseModal: React.FC<HelpMeChooseModalProps> = ({
  isOpen,
  onClose,
  onSelectRoom
}) => {
  if (!isOpen) return null;

  const [vibe, setVibe] = useState<'soak' | 'forest' | 'penthouse' | 'loft'>('soak');
  const [soakPref, setSoakPref] = useState<'clawfoot' | 'cedar-outdoor' | 'copper-fire'>('clawfoot');
  const [hasDog, setHasDog] = useState<boolean>(true);

  // Recommendation engine
  const getRecommendation = (): RoomType => {
    if (vibe === 'penthouse') {
      return ROOMS.find(r => r.id === 'alpine-penthouse') || ROOMS[0];
    }
    if (vibe === 'forest' || soakPref === 'cedar-outdoor') {
      if (hasDog) {
        return ROOMS.find(r => r.id === 'walden-forest-bathing') || ROOMS[4];
      } else {
        return ROOMS.find(r => r.id === 'walden-forest-den') || ROOMS[5];
      }
    }
    if (vibe === 'loft') {
      return ROOMS.find(r => r.id === 'lodge-chalet-loft') || ROOMS[7];
    }
    if (soakPref === 'copper-fire') {
      return ROOMS.find(r => r.id === 'alpine-bathing-suite-den') || ROOMS[1];
    }
    // Default Alpine bathing suite
    return ROOMS.find(r => r.id === 'alpine-bathing-suite') || ROOMS[0];
  };

  const matchedRoom = getRecommendation();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#FAF9F9] rounded-3xl overflow-hidden shadow-2xl border-2 border-[#4E332D] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#EBE8E0] border-b border-[#D1C9BE]">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#9A5636]" />
            <h3 className="font-display font-bold text-lg text-[#4E332D] uppercase tracking-wide">
              Cowboy Stay Matcher
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-[#4E332D] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Questionnaire Form */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          <div>
            <span className="font-woodblock text-xs uppercase tracking-widest text-[#9A5636] font-bold block mb-1">
              QUESTION 1 OF 3
            </span>
            <h4 className="font-serif font-bold text-lg text-[#221C18] mb-3">
              What kind of mountain feeling are you chasing?
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: 'soak', title: 'Slow Soaking & Mountain Views', desc: 'Hillside picture windows, clawfoot tubs, deep rest.' },
                { id: 'forest', title: 'Wild Forest & Cedar Tubs', desc: 'Tucked into the pines with steaming outdoor cedar soaking.' },
                { id: 'penthouse', title: 'Grand Cathedral Romance', desc: 'High ceilings, timber balcony, and cozy fireplace.' },
                { id: 'loft', title: 'Lodge Heart & Historic Hearth', desc: 'Above the saloon and fireplace parlor in the main chalet.' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setVibe(item.id as any)}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    vibe === item.id
                      ? 'bg-[#4E332D] text-white border-[#4E332D] shadow-sm'
                      : 'bg-white text-[#4E332D] border-[#D1C9BE] hover:border-[#4E332D]'
                  }`}
                >
                  <span className="font-woodblock text-xs uppercase tracking-wider block font-bold">
                    {item.title}
                  </span>
                  <span className="text-[11px] opacity-80 mt-1 block">
                    {item.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="font-woodblock text-xs uppercase tracking-widest text-[#9A5636] font-bold block mb-1">
              QUESTION 2 OF 3
            </span>
            <h4 className="font-serif font-bold text-lg text-[#221C18] mb-3">
              Your ideal soaking ritual:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'clawfoot', title: 'Window Clawfoot Tub', desc: 'Picture window looking into woods' },
                { id: 'cedar-outdoor', title: 'Outdoor Cedar Tub', desc: 'On private secluded forest deck' },
                { id: 'copper-fire', title: 'Copper Tub + Fireplace', desc: 'Hammered copper beside warm hearth' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSoakPref(item.id as any)}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    soakPref === item.id
                      ? 'bg-[#9A5636] text-white border-[#9A5636] shadow-sm'
                      : 'bg-white text-[#4E332D] border-[#D1C9BE] hover:border-[#9A5636]'
                  }`}
                >
                  <span className="font-woodblock text-xs uppercase tracking-wider block font-bold">
                    {item.title}
                  </span>
                  <span className="text-[11px] opacity-80 mt-1 block">
                    {item.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="font-woodblock text-xs uppercase tracking-widest text-[#9A5636] font-bold block mb-1">
              QUESTION 3 OF 3
            </span>
            <h4 className="font-serif font-bold text-lg text-[#221C18] mb-3">
              Bringing a dog to the mountains?
            </h4>
            <div className="flex gap-4">
              <button
                onClick={() => setHasDog(true)}
                className={`flex-1 py-3 px-4 rounded-xl border font-woodblock text-xs uppercase tracking-wider transition-colors cursor-pointer ${
                  hasDog
                    ? 'bg-[#221C18] text-white border-[#221C18]'
                    : 'bg-white text-[#4E332D] border-[#D1C9BE]'
                }`}
              >
                Yes, Dog-Friendly Room
              </button>
              <button
                onClick={() => setHasDog(false)}
                className={`flex-1 py-3 px-4 rounded-xl border font-woodblock text-xs uppercase tracking-wider transition-colors cursor-pointer ${
                  !hasDog
                    ? 'bg-[#221C18] text-white border-[#221C18]'
                    : 'bg-white text-[#4E332D] border-[#D1C9BE]'
                }`}
              >
                No / Pet-Free Sanctuary
              </button>
            </div>
          </div>

          {/* Recommended Result Match */}
          <div className="mt-6 p-5 bg-[#EBE8E0] border-2 border-[#9A5636] rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-[#9A5636]" />
              <span className="font-woodblock text-xs uppercase tracking-widest text-[#9A5636] font-bold">
                YOUR PERFECT STAY MATCH
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <img
                src={matchedRoom.images[0]}
                alt={matchedRoom.name}
                className="w-full sm:w-28 h-24 rounded-xl object-cover border border-[#4E332D]/20 shrink-0"
              />
              <div className="flex-1 text-center sm:text-left">
                <span className="text-[10px] font-woodblock uppercase tracking-wider text-[#8A7E74]">
                  {matchedRoom.buildingName} · {matchedRoom.eyebrow}
                </span>
                <h4 className="font-display font-bold text-xl text-[#221C18]">
                  {matchedRoom.name}
                </h4>
                <p className="font-editorial text-xs text-[#6B6259] mt-0.5">
                  ✦ {matchedRoom.soakHighlight}
                </p>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onSelectRoom(matchedRoom);
                }}
                className="w-full sm:w-auto bg-[#4E332D] hover:bg-[#343833] text-white px-6 py-2.5 rounded-full font-woodblock text-xs uppercase tracking-widest cursor-pointer shadow-sm transition-transform active:scale-95 shrink-0"
              >
                View Rates
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
