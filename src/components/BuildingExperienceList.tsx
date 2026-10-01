import React, { useState } from 'react';
import { SearchCriteria, RoomType } from '../types';
import { BUILDINGS, ROOMS } from '../data/hotelData';
import { RoomsListCard } from './RoomsListCard';
import {
  AlpineHausWoodcut,
  WaldenHausWoodcut,
  LodgeWoodcut,
} from './WoodcutArt';
import {
  Calendar,
  Sparkles,
  ArrowLeft,
  BookOpen,
  LayoutGrid
} from 'lucide-react';

interface BuildingExperienceListProps {
  criteria: SearchCriteria;
  onUpdateCriteria: (c: SearchCriteria) => void;
  onSelectRoom: (room: RoomType) => void;
  onOpenRoomDetails: (room: RoomType) => void;
  onOpenHelpMeChoose: () => void;
  onBackToSearch: () => void;
  /**
   * Slot allowing custom or specialized cards to be injected for complex room configurations
   */
  roomCardSlot?: (props: {
    room: RoomType;
    defaultCard: React.ReactNode;
    onSelectRoom: (room: RoomType) => void;
    onOpenRoomDetails: (room: RoomType) => void;
  }) => React.ReactNode;
}

export const BuildingExperienceList: React.FC<BuildingExperienceListProps> = ({
  criteria,
  onUpdateCriteria,
  onSelectRoom,
  onOpenRoomDetails,
  onOpenHelpMeChoose,
  onBackToSearch,
  roomCardSlot
}) => {
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('all');
  const [activeFeatureFilter, setActiveFeatureFilter] = useState<string>('all');
  const [layoutMode, setLayoutMode] = useState<'spread' | 'catalog'>('spread');

  // Slot resolver for rooms list cards
  const renderRoomCard = (
    room: RoomType | undefined,
    defaultCard: React.ReactNode
  ) => {
    if (!room) return defaultCard;
    if (roomCardSlot) {
      return roomCardSlot({ room, defaultCard, onSelectRoom, onOpenRoomDetails });
    }
    return defaultCard;
  };

  // Filter rooms
  const filteredRooms = ROOMS.filter((room) => {
    if (selectedBuildingId !== 'all' && room.buildingId !== selectedBuildingId) {
      return false;
    }
    if (activeFeatureFilter === 'dog' && !room.isDogFriendly) return false;
    if (activeFeatureFilter === 'cedar' && room.soakType !== 'outdoor-cedar-tub') return false;
    if (
      activeFeatureFilter === 'fireplace' &&
      !room.features.some((f) => f.toLowerCase().includes('stove') || f.toLowerCase().includes('fire'))
    )
      return false;
    return true;
  });

  return (
    <div className="w-full texture-linen min-h-screen pb-24">
      {/* Top Editorial Bar */}
      <div className="booking-shell border-b border-[#4E332D]/15 pb-6 pt-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <button
              onClick={onBackToSearch}
              className="inline-flex items-center gap-2 font-woodblock text-[11px] uppercase tracking-widest text-[#73716D] hover:text-[#4E332D] mb-3 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Dates</span>
            </button>
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#221C18] uppercase tracking-tight">
              Find Your Stay
            </h1>
            <p className="font-editorial text-sm sm:text-base text-[#4E332D]/80 mt-1 max-w-2xl">
              8 Distinct Room Experiences Available. Each one with its own way of doing Cowboy.
              Whether you’re looking for a quiet retreat, a little adventure, or room to gather,
              explore the soul of each building.
            </p>
          </div>

          {/* Action buttons & View toggle */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenHelpMeChoose}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FAF9F9] border border-[#4E332D]/30 hover:border-[#4E332D] font-woodblock text-xs uppercase tracking-wider text-[#4E332D] shadow-xs transition-all hover:bg-white cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#9A5636]" />
              <span>Help Me Choose</span>
            </button>

            {/* Layout switch: Magazine Spread vs Catalog */}
            <div className="flex items-center bg-[#FAF9F9] border border-[#4E332D]/20 rounded-full p-1 text-xs font-woodblock uppercase tracking-wider text-[#4E332D]">
              <button
                onClick={() => setLayoutMode('spread')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all cursor-pointer ${
                  layoutMode === 'spread'
                    ? 'bg-[#4E332D] text-[#EBE8E0] shadow-xs'
                    : 'text-[#73716D] hover:text-[#4E332D]'
                }`}
              >
                <BookOpen className="w-3 h-3" />
                <span>Editorial Spread</span>
              </button>
              <button
                onClick={() => setLayoutMode('catalog')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all cursor-pointer ${
                  layoutMode === 'catalog'
                    ? 'bg-[#4E332D] text-[#EBE8E0] shadow-xs'
                    : 'text-[#73716D] hover:text-[#4E332D]'
                }`}
              >
                <LayoutGrid className="w-3 h-3" />
                <span>Story Catalog</span>
              </button>
            </div>

            {/* Active search pill */}
            <div className="px-4 py-2 rounded-full border border-[#4E332D]/20 bg-[#FAF9F9] font-woodblock text-xs uppercase tracking-wider text-[#4E332D] flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-[#9A5636]" />
              <span>
                {criteria.checkIn} — {criteria.checkOut} · {criteria.guests} Adults
              </span>
            </div>
          </div>
        </div>

        {/* Building Filter Pills & Craft Tags */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-4 border-t border-[#4E332D]/10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-woodblock text-[11px] uppercase tracking-wider text-[#73716D] mr-2">
              Filter by Building:
            </span>
            <button
              onClick={() => setSelectedBuildingId('all')}
              className={`px-3.5 py-1 rounded-full text-xs font-woodblock uppercase tracking-wider transition-colors cursor-pointer ${
                selectedBuildingId === 'all'
                  ? 'bg-[#4E332D] text-[#EBE8E0]'
                  : 'bg-[#FAF9F9] text-[#4E332D] border border-[#4E332D]/20 hover:border-[#4E332D]'
              }`}
            >
              All Buildings
            </button>
            {BUILDINGS.map((b) => (
              <button
                key={b.id}
                onClick={() => setSelectedBuildingId(b.id)}
                className={`px-3.5 py-1 rounded-full text-xs font-woodblock uppercase tracking-wider transition-colors cursor-pointer ${
                  selectedBuildingId === b.id
                    ? 'bg-[#4E332D] text-[#EBE8E0]'
                    : 'bg-[#FAF9F9] text-[#4E332D] border border-[#4E332D]/20 hover:border-[#4E332D]'
                }`}
              >
                {b.name}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveFeatureFilter(activeFeatureFilter === 'cedar' ? 'all' : 'cedar')}
              className={`px-3 py-1 rounded-full text-[11px] font-woodblock uppercase tracking-wider transition-colors cursor-pointer ${
                activeFeatureFilter === 'cedar'
                  ? 'bg-[#9A5636] text-[#EBE8E0]'
                  : 'bg-[#FAF9F9] text-[#4E332D] border border-[#4E332D]/20 hover:border-[#4E332D]'
              }`}
            >
              Outdoor Cedar Tub
            </button>
            <button
              onClick={() => setActiveFeatureFilter(activeFeatureFilter === 'dog' ? 'all' : 'dog')}
              className={`px-3 py-1 rounded-full text-[11px] font-woodblock uppercase tracking-wider transition-colors cursor-pointer ${
                activeFeatureFilter === 'dog'
                  ? 'bg-[#9A5636] text-[#EBE8E0]'
                  : 'bg-[#FAF9F9] text-[#4E332D] border border-[#4E332D]/20 hover:border-[#4E332D]'
              }`}
            >
              Dog-Friendly
            </button>
            <button
              onClick={() => setActiveFeatureFilter(activeFeatureFilter === 'fireplace' ? 'all' : 'fireplace')}
              className={`px-3 py-1 rounded-full text-[11px] font-woodblock uppercase tracking-wider transition-colors cursor-pointer ${
                activeFeatureFilter === 'fireplace'
                  ? 'bg-[#9A5636] text-[#EBE8E0]'
                  : 'bg-[#FAF9F9] text-[#4E332D] border border-[#4E332D]/20 hover:border-[#4E332D]'
              }`}
            >
              Fireplace / Stove
            </button>
          </div>
        </div>
      </div>

      {/* SPREAD MODE: Exact Artboards from User PDF Screenshots 1 & 4 */}
      {layoutMode === 'spread' && (
        <div className="booking-shell space-y-20 py-10">
          {/* SECTION 1: ALPINE HAUS SPREAD (Exact layout from Screenshot 1!) */}
          {(selectedBuildingId === 'all' || selectedBuildingId === 'alpine') && (
            <div className="relative">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Architectural Woodcut + Story (Screenshot 1 left) */}
                <div className="lg:col-span-4 flex flex-col items-center lg:items-start text-center lg:text-left pt-2 pb-6 border-b lg:border-b-0 lg:border-r border-[#4E332D]/15 pr-0 lg:pr-8">
                  <div className="mb-4 inline-block">
                    <AlpineHausWoodcut className="w-60 h-36 sm:w-64 sm:h-40" />
                  </div>

                  <h2 className="font-desert font-bold text-4xl sm:text-5xl text-[#221C18] tracking-tight leading-none mb-1">
                    Alpine Haus
                  </h2>
                  <span className="font-woodblock text-xs uppercase tracking-[0.25em] text-[#9A5636] font-bold block mt-1 mb-4">
                    The Iconic Indoor Soak
                  </span>

                  <p className="font-editorial text-sm sm:text-base text-[#4E332D]/85 leading-relaxed mb-4">
                    Built into the hillside above the Lodge, Alpine is home to ten of the Cowboy's
                    most iconic rooms. Every suite puts a freestanding clawfoot tub in front of a
                    picture window, with the forest and mountains doing the decorating outside.
                  </p>
                  <p className="font-editorial italic text-sm text-[#4E332D]/90 font-medium mb-5">
                    This is where you come to soak, slow down and disappear for a while.
                  </p>

                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBE8E0] border border-[#4E332D]/20 text-[11px] font-woodblock uppercase tracking-wider text-[#4E332D] font-bold">
                    <span>✦ Alpine is reserved for guests 21+</span>
                  </div>
                </div>

                {/* Right Bento / Collage Grid: 3 Editorial Rooms + Photo Collages (Screenshot 1) */}
                <div className="lg:col-span-8 space-y-6">
                  {/* Top Card: Alpine Bathing Suite with Den */}
                  {renderRoomCard(
                    ROOMS.find((r) => r.id === 'alpine-bathing-suite-den'),
                    <RoomsListCard
                      room={ROOMS.find((r) => r.id === 'alpine-bathing-suite-den')!}
                      color="paper"
                      layout="left"
                      onSelectRoom={onSelectRoom}
                      onOpenRoomDetails={onOpenRoomDetails}
                    />
                  )}

                  {/* Middle Card: Alpine Penthouse Bathing Suite */}
                  {renderRoomCard(
                    ROOMS.find((r) => r.id === 'alpine-penthouse'),
                    <RoomsListCard
                      room={ROOMS.find((r) => r.id === 'alpine-penthouse')!}
                      color="copper"
                      layout="right"
                      onSelectRoom={onSelectRoom}
                      onOpenRoomDetails={onOpenRoomDetails}
                    />
                  )}

                  {/* Bottom Card: Alpine Bathing Suite */}
                  {renderRoomCard(
                    ROOMS.find((r) => r.id === 'alpine-bathing-suite'),
                    <RoomsListCard
                      room={ROOMS.find((r) => r.id === 'alpine-bathing-suite')!}
                      color="smoke"
                      layout="left"
                      onSelectRoom={onSelectRoom}
                      onOpenRoomDetails={onOpenRoomDetails}
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: WALDEN HAUS SPREAD */}
          {(selectedBuildingId === 'all' || selectedBuildingId === 'walden') && (
            <div className="relative text-[#221C18] border-t border-[#4E332D]/15 pt-16">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Woodcut + Walden Story */}
                <div className="lg:col-span-4 flex flex-col items-center lg:items-start text-center lg:text-left pt-2 pb-6 border-b lg:border-b-0 lg:border-r border-[#4E332D]/15 pr-0 lg:pr-8">
                  <div className="mb-4 inline-block">
                    <WaldenHausWoodcut className="w-60 h-36 sm:w-64 sm:h-40" />
                  </div>

                  <h2 className="font-desert font-bold text-4xl sm:text-5xl text-[#221C18] tracking-tight leading-none mb-1">
                    Walden Haus
                  </h2>
                  <span className="font-woodblock text-xs uppercase tracking-[0.25em] text-[#9A5636] font-bold block mt-1 mb-4">
                    Deep in the Pines · Outdoor Soaks
                  </span>

                  <p className="font-editorial text-sm sm:text-base text-[#4E332D]/85 leading-relaxed mb-4">
                    Walden sits closer to the woods. Its ten cabin-style rooms trade Alpine’s
                    lodge-like romance for something quieter and more elemental: private decks,
                    forest views and, in the bathing suites, cedar tubs made for soaking outside.
                  </p>
                  <p className="font-editorial italic text-sm text-[#4E332D]/90 font-medium mb-5">
                    This is where the Cowboy gets a little wilder.
                  </p>

                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#4E332D]/10 border border-[#4E332D]/20 text-[11px] font-woodblock uppercase tracking-wider text-[#4E332D] font-bold">
                    <span>✦ Walden is reserved for guests 21+</span>
                  </div>
                </div>

                {/* Right Rooms Grid for Walden */}
                <div className="lg:col-span-8 space-y-6">
                  {/* Walden Forest Bathing Suite */}
                  {renderRoomCard(
                    ROOMS.find((r) => r.id === 'walden-forest-bathing'),
                    <RoomsListCard
                      room={ROOMS.find((r) => r.id === 'walden-forest-bathing')!}
                      color="paper"
                      layout="left"
                      onSelectRoom={onSelectRoom}
                      onOpenRoomDetails={onOpenRoomDetails}
                    />
                  )}

                  {/* Walden King (Simple, warm, cabin era) */}
                  {renderRoomCard(
                    ROOMS.find((r) => r.id === 'walden-king'),
                    <RoomsListCard
                      room={ROOMS.find((r) => r.id === 'walden-king')!}
                      color="forest"
                      layout="right"
                      onSelectRoom={onSelectRoom}
                      onOpenRoomDetails={onOpenRoomDetails}
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: THE LODGE SPREAD (Exact layout from Screenshot 4!) */}
          {(selectedBuildingId === 'all' || selectedBuildingId === 'lodge') && (
            <div className="relative border-t border-[#4E332D]/15 pt-16">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left/Middle Column: 3 Lodge Rooms Collage (Screenshot 4) */}
                <div className="lg:col-span-8 order-2 lg:order-1 space-y-6">
                  {/* Card 1: Lodge Three-Bedroom Suite */}
                  {renderRoomCard(
                    ROOMS.find((r) => r.id === 'lodge-three-bedroom'),
                    <RoomsListCard
                      room={ROOMS.find((r) => r.id === 'lodge-three-bedroom')!}
                      color="paper"
                      layout="left"
                      onSelectRoom={onSelectRoom}
                      onOpenRoomDetails={onOpenRoomDetails}
                    />
                  )}

                  {/* Card 2: Lodge Penthouse */}
                  {renderRoomCard(
                    ROOMS.find((r) => r.id === 'lodge-penthouse'),
                    <RoomsListCard
                      room={ROOMS.find((r) => r.id === 'lodge-penthouse')!}
                      color="copper"
                      layout="right"
                      onSelectRoom={onSelectRoom}
                      onOpenRoomDetails={onOpenRoomDetails}
                    />
                  )}

                  {/* Card 3: Lodge King */}
                  {renderRoomCard(
                    ROOMS.find((r) => r.id === 'lodge-king'),
                    <RoomsListCard
                      room={ROOMS.find((r) => r.id === 'lodge-king')!}
                      color="smoke"
                      layout="left"
                      onSelectRoom={onSelectRoom}
                      onOpenRoomDetails={onOpenRoomDetails}
                    />
                  )}
                </div>

                {/* Right Column: Woodcut + Lodge Narrative (Screenshot 4 right) */}
                <div className="lg:col-span-4 order-1 lg:order-2 flex flex-col items-center lg:items-start text-center lg:text-left pt-2 pb-6 border-b lg:border-b-0 lg:border-l border-[#4E332D]/15 pl-0 lg:pl-8">
                  <div className="mb-4 inline-block">
                    <LodgeWoodcut className="w-64 h-40 sm:w-72 sm:h-44" />
                  </div>

                  <h2 className="font-desert font-bold text-4xl sm:text-5xl text-[#221C18] tracking-tight leading-none mb-1">
                    The Lodge
                  </h2>
                  <span className="font-woodblock text-xs uppercase tracking-[0.25em] text-[#9A5636] font-bold block mt-1 mb-4">
                    Stay in the Middle of It All.
                  </span>

                  <p className="font-editorial text-sm sm:text-base text-[#4E332D]/85 leading-relaxed mb-4">
                    The Lodge rooms sit directly above the restaurant, bar and fireside gathering
                    spaces—the right choice for guests who want the Cowboy close at hand.
                  </p>
                  <p className="font-editorial italic text-sm text-[#4E332D]/90 font-medium mb-5">
                    Book one room or take over the floor with your people. Either way, you're never
                    far from dinner, drinks or the fire.
                  </p>

                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBE8E0] border border-[#4E332D]/20 text-[11px] font-woodblock uppercase tracking-wider text-[#4E332D] font-bold">
                    <span>✦ Family-friendly & Gathering Suites</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CATALOG MODE: Longitudinal narrative with tactile room cards */}
      {layoutMode === 'catalog' && (
        <div className="booking-shell space-y-12 py-10">
          {BUILDINGS.filter(
            (b) => selectedBuildingId === 'all' || selectedBuildingId === b.id
          ).map((building) => {
            const buildingRooms = filteredRooms.filter((r) => r.buildingId === building.id);
            if (buildingRooms.length === 0) return null;

            return (
              <div key={building.id} className="space-y-6">
                {/* Building Header Banner */}
                <div className="bg-[#FAF9F9] border-2 border-[#4E332D] rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
                  <div className="flex-1">
                    <span className="font-woodblock text-xs uppercase tracking-widest text-[#9A5636] font-bold block mb-1">
                      {building.number} · {building.badge}
                    </span>
                    <h2 className="font-desert font-bold text-3xl sm:text-4xl text-[#221C18]">
                      {building.name}
                    </h2>
                    <p className="font-editorial text-sm text-[#4E332D]/80 mt-2 max-w-xl">
                      {building.description}
                    </p>
                  </div>
                  <div className="shrink-0">
                    {building.id === 'alpine' && <AlpineHausWoodcut className="w-48 h-32" />}
                    {building.id === 'walden' && <WaldenHausWoodcut className="w-48 h-32" />}
                    {building.id === 'lodge' && <LodgeWoodcut className="w-52 h-36" />}
                  </div>
                </div>

                {/* Rooms Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {buildingRooms.map((room) =>
                    renderRoomCard(
                      room,
                      <div
                        key={room.id}
                        className="bg-white rounded-3xl border-stitched overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
                      >
                        <div className="h-56 relative overflow-hidden">
                          <img
                            src={room.images[0]}
                            alt={room.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-3 left-3 bg-[#FAF9F9]/90 px-3 py-1 rounded-full text-[10px] font-woodblock uppercase tracking-wider text-[#4E332D] font-bold">
                            {room.soakHighlight}
                          </div>
                        </div>

                        <div className="p-5 flex-1 flex flex-col justify-between">
                          <div>
                            <span className="font-woodblock text-[10px] uppercase tracking-wider text-[#9A5636] block mb-1 font-bold">
                              {room.eyebrow}
                            </span>
                            <h3 className="font-brothers font-bold text-xl text-[#221C18] uppercase tracking-wide">
                              {room.name}
                            </h3>
                            <p className="font-editorial text-xs text-[#4E332D]/80 mt-2 line-clamp-3">
                              {room.description}
                            </p>
                          </div>

                          <div className="pt-4 mt-4 border-t border-[#4E332D]/15 flex items-center justify-between">
                            <div>
                              <span className="font-woodblock text-sm font-bold text-[#4E332D]">
                                ${room.basePrice}
                              </span>
                              <span className="text-[11px] text-[#73716D] font-sans"> / night</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => onOpenRoomDetails(room)}
                                className="font-woodblock text-xs uppercase tracking-wider text-[#4E332D] hover:underline cursor-pointer"
                              >
                                Details
                              </button>
                              <button
                                onClick={() => onSelectRoom(room)}
                                className="bg-[#4E332D] hover:bg-[#343833] text-white px-4 py-1.5 rounded-full font-woodblock text-xs uppercase tracking-wider cursor-pointer"
                              >
                                Rates →
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
