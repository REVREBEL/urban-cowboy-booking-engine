import React, { useState } from 'react';
import type { SearchCriteria } from '../types';
import type { ShapedRoom } from '@/types/mews';
import { ROOM_TYPE_GROUPS } from '../data/roomTypeGroups';
import { ROOM_TYPE_GROUP_PRESENTATION } from '../data/roomTypeGroupPresentation';
import { RoomsListCard, type RoomCardColor, type RoomCardLayout } from '@/components/RoomsListCard';
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
  rooms: ShapedRoom[];
  imageBaseUrl: string;
  onUpdateCriteria: (c: SearchCriteria) => void;
  onSelectRoom: (room: ShapedRoom) => void;
  onOpenRoomDetails: (room: ShapedRoom) => void;
  onOpenHelpMeChoose: () => void;
  onBackToSearch: () => void;
  /**
   * Slot allowing custom or specialized cards to be injected for complex room configurations
   */
  roomCardSlot?: (props: {
    room: ShapedRoom;
    defaultCard: React.ReactNode;
    onSelectRoom: (room: ShapedRoom) => void;
    onOpenRoomDetails: (room: ShapedRoom) => void;
  }) => React.ReactNode;
}

export const BuildingExperienceList: React.FC<BuildingExperienceListProps> = ({
  criteria,
  rooms,
  imageBaseUrl,
  onUpdateCriteria,
  onSelectRoom,
  onOpenRoomDetails,
  onOpenHelpMeChoose,
  onBackToSearch,
  roomCardSlot
}) => {
  const [selectedRoomTypeGroupKey, setSelectedRoomTypeGroupKey] = useState<string>('all');
  const [activeFeatureFilter, setActiveFeatureFilter] = useState<string>('all');
  const [layoutMode, setLayoutMode] = useState<'spread' | 'catalog'>('spread');

  // Slot resolver for rooms list cards
  const renderRoomCard = (
    room: ShapedRoom | undefined,
    defaultCard: React.ReactNode
  ) => {
    if (!room) return defaultCard;
    if (roomCardSlot) {
      return roomCardSlot({ room, defaultCard, onSelectRoom, onOpenRoomDetails });
    }
    return defaultCard;
  };

  const roomTypeGroup = (room: ShapedRoom) =>
    room.merchandising?.roomTypeGroupKey ?? "other";

  // Filter the live Mews Room Types using our resolved lodging-domain profile.
  // Room Type Group is a Cowboy-defined hierarchy because Mews does not provide one.
  const filteredRooms = rooms.filter((room) => {
    if (selectedRoomTypeGroupKey !== "all" && roomTypeGroup(room) !== selectedRoomTypeGroupKey) {
      return false;
    }
    if (activeFeatureFilter === "dog" && room.merchandising?.dogPolicy !== "allowed") return false;
    if (activeFeatureFilter === "cedar" && !room.merchandising?.features.outdoorSoak) return false;
    if (activeFeatureFilter === "fireplace" && !room.merchandising?.features.fireplace) return false;
    return true;
  });

  const roomByKey = (key: string) =>
    filteredRooms.find((room) => room.merchandising?.key === key);

  const hasRoomTypeGroup = (groupKey: string) =>
    filteredRooms.some((room) => roomTypeGroup(room) === groupKey);

  const orderedRoomsForGroup = (groupKey: typeof ROOM_TYPE_GROUPS[number]["key"]) => {
    const order = ROOM_TYPE_GROUP_PRESENTATION[groupKey].roomOrder;
    const orderIndex = new Map(order.map((key, index) => [key, index]));
    return filteredRooms
      .filter((room) => roomTypeGroup(room) === groupKey)
      .sort((a, b) => {
        const aIndex = orderIndex.get(a.merchandising?.key ?? "") ?? Number.MAX_SAFE_INTEGER;
        const bIndex = orderIndex.get(b.merchandising?.key ?? "") ?? Number.MAX_SAFE_INTEGER;
        return aIndex - bIndex;
      });
  };

  const additionalRoomTypeGroups = ROOM_TYPE_GROUPS
    .filter((group) => !["alpine", "walden", "lodge"].includes(group.key))
    .map((group) => ({
      group,
      presentation: ROOM_TYPE_GROUP_PRESENTATION[group.key],
      rooms: orderedRoomsForGroup(group.key),
    }))
    .filter(({ rooms: groupRooms }) => groupRooms.length > 0);

  const roomCardColorForPosition = (
    index: number,
    total: number,
  ): RoomCardColor => {
    if (total <= 1 || index === 0) return "paper";
    if (index === total - 1) return "lake-forest";
    return "copper";
  };

  const roomCardLayoutForPosition = (index: number): RoomCardLayout =>
    index % 2 === 0 ? "left" : "right";

  const renderConfiguredRoom = (
    room: ShapedRoom,
    index: number,
    total: number,
  ) =>
    renderRoomCard(
      room,
      <RoomsListCard
        key={room.roomTypeId}
        room={room}
        imageBaseUrl={imageBaseUrl}
        color={roomCardColorForPosition(index, total)}
        layout={roomCardLayoutForPosition(index)}
        onSelectRoom={onSelectRoom}
        onOpenRoomDetails={onOpenRoomDetails}
      />,
    );

  const knownRoomTypeGroupKeys = new Set(ROOM_TYPE_GROUPS.map((group) => group.key));
  const unresolvedRooms = filteredRooms.filter(
    (room) => !knownRoomTypeGroupKeys.has(roomTypeGroup(room) as typeof ROOM_TYPE_GROUPS[number]["key"]),
  );

  const renderMappedRoom = (
    key: string,
    color: RoomCardColor,
    layout: RoomCardLayout,
  ) => {
    const room = roomByKey(key);
    if (!room) return null;
    return renderRoomCard(
      room,
      <RoomsListCard
        room={room}
        imageBaseUrl={imageBaseUrl}
        color={color}
        layout={layout}
        onSelectRoom={onSelectRoom}
        onOpenRoomDetails={onOpenRoomDetails}
      />,
    );
  };

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
              {filteredRooms.length} Distinct Room Experiences Available. Each one with its own way of doing Cowboy.
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
              onClick={() => setSelectedRoomTypeGroupKey('all')}
              className={`px-3.5 py-1 rounded-full text-xs font-woodblock uppercase tracking-wider transition-colors cursor-pointer ${
                selectedRoomTypeGroupKey === 'all'
                  ? 'bg-[#4E332D] text-[#EBE8E0]'
                  : 'bg-[#FAF9F9] text-[#4E332D] border border-[#4E332D]/20 hover:border-[#4E332D]'
              }`}
            >
              All Buildings
            </button>
            {ROOM_TYPE_GROUPS.map((group) => (
              <button
                key={group.key}
                onClick={() => setSelectedRoomTypeGroupKey(group.key)}
                className={`px-3.5 py-1 rounded-full text-xs font-woodblock uppercase tracking-wider transition-colors cursor-pointer ${
                  selectedRoomTypeGroupKey === group.key
                    ? 'bg-[#4E332D] text-[#EBE8E0]'
                    : 'bg-[#FAF9F9] text-[#4E332D] border border-[#4E332D]/20 hover:border-[#4E332D]'
                }`}
              >
                {group.name}
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
          {(selectedRoomTypeGroupKey === 'all' || selectedRoomTypeGroupKey === 'alpine') && hasRoomTypeGroup("alpine") && (
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
                  {renderMappedRoom("alpine-bathing-suite", "paper", "left")}
                  {renderMappedRoom("alpine-bathing-suite-den", "copper", "right")}
                  {renderMappedRoom("alpine-penthouse-bathing-suite", "lake-forest", "left")}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: WALDEN HAUS SPREAD */}
          {(selectedRoomTypeGroupKey === 'all' || selectedRoomTypeGroupKey === 'walden') && hasRoomTypeGroup("walden") && (
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
                  {renderMappedRoom("walden-king", "paper", "left")}
                  {renderMappedRoom("walden-forest-bathing-suite", "copper", "right")}
                  {renderMappedRoom("walden-forest-bathing-suite-den", "copper", "left")}
                  {renderMappedRoom("walden-sunrise-bathing-suite", "lake-forest", "right")}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: THE LODGE SPREAD (Exact layout from Screenshot 4!) */}
          {(selectedRoomTypeGroupKey === 'all' || selectedRoomTypeGroupKey === 'lodge') && hasRoomTypeGroup("lodge") && (
            <div className="relative border-t border-[#4E332D]/15 pt-16">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left/Middle Column: 3 Lodge Rooms Collage (Screenshot 4) */}
                <div className="lg:col-span-8 order-2 lg:order-1 space-y-6">
                  {renderMappedRoom("lodge-king", "paper", "left")}
                  {renderMappedRoom("lodge-2-bedroom", "copper", "right")}
                  {renderMappedRoom("lodge-3-bedroom-suite", "copper", "left")}
                  {renderMappedRoom("lodge-penthouse-suite", "lake-forest", "right")}
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

                </div>
              </div>
            </div>
          )}

          {additionalRoomTypeGroups.map(({ group, presentation, rooms: groupRooms }) => (
            <div key={group.key} className="relative border-t border-[#4E332D]/15 pt-16">
              <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
                <div className="flex flex-col items-center border-b border-[#4E332D]/15 pb-6 text-center lg:col-span-4 lg:items-start lg:border-b-0 lg:border-r lg:pr-8 lg:text-left">
                  <img
                    src={presentation.iconPath}
                    alt=""
                    aria-hidden="true"
                    className="mb-4 h-40 w-64 object-contain"
                  />

                  <h2 className="mb-1 font-desert text-4xl font-bold leading-none tracking-tight text-[#221C18] sm:text-5xl">
                    {group.name}
                  </h2>

                  {presentation.headline && (
                    <span className="mt-1 mb-4 block font-woodblock text-xs font-bold uppercase tracking-[0.25em] text-[#9A5636]">
                      {presentation.headline}
                    </span>
                  )}

                  {presentation.paragraphs.map((paragraph) => (
                    <p
                      key={paragraph}
                      className="mb-4 font-editorial text-sm leading-relaxed text-[#4E332D]/85 sm:text-base"
                    >
                      {paragraph}
                    </p>
                  ))}

                  {presentation.callout && (
                    <p className="mb-5 font-editorial text-sm font-medium italic text-[#4E332D]/90">
                      {presentation.callout}
                    </p>
                  )}

                  {presentation.badge && (
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-[#4E332D]/20 bg-[#EBE8E0] px-3 py-1 font-woodblock text-[11px] font-bold uppercase tracking-wider text-[#4E332D]">
                      <span>✦ {presentation.badge}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-6 lg:col-span-8">
                  {groupRooms.map((room, index) => (
                    <React.Fragment key={room.roomTypeId}>
                      {renderConfiguredRoom(room, index, groupRooms.length)}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {unresolvedRooms.length > 0 && (
            <div className="relative border-t border-[#4E332D]/15 pt-16">
              <div className="mb-6">
                <p className="font-eyebrow text-xs uppercase tracking-[0.25em] text-[#9A5636]">
                  Live Mews Inventory
                </p>
                <h2 className="mt-1 font-heading text-3xl uppercase text-[#221C18]">
                  Unassigned Room Types
                </h2>
                <p className="mt-2 max-w-2xl font-body text-sm text-[#4E332D]/75">
                  These Mews Room Types do not yet have a Cowboy Room Type Group assignment.
                </p>
              </div>
              <div className="space-y-6">
                {unresolvedRooms.map((room, index) => (
                  <RoomsListCard
                    key={room.roomTypeId}
                    room={room}
                    imageBaseUrl={imageBaseUrl}
                    color={(["paper", "copper", "smoke", "forest"] as RoomCardColor[])[index % 4]}
                    layout={index % 2 === 0 ? "left" : "right"}
                    onSelectRoom={onSelectRoom}
                    onOpenRoomDetails={onOpenRoomDetails}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* CATALOG MODE: Longitudinal narrative with tactile room cards */}
      {layoutMode === 'catalog' && (
        <div className="booking-shell space-y-12 py-10">
          {ROOM_TYPE_GROUPS.map((group) => {
            if (
              selectedRoomTypeGroupKey !== "all" &&
              selectedRoomTypeGroupKey !== group.key
            ) {
              return null;
            }

            const groupRooms = orderedRoomsForGroup(group.key);
            if (groupRooms.length === 0) return null;
            const presentation = ROOM_TYPE_GROUP_PRESENTATION[group.key];

            return (
              <div key={group.key} className="space-y-6">
                <div className="flex flex-col items-center justify-between gap-6 rounded-3xl border-2 border-[#4E332D] bg-[#FAF9F9] p-6 shadow-md sm:p-8 md:flex-row">
                  <div className="flex-1">
                    {presentation.headline && (
                      <span className="mb-1 block font-woodblock text-xs font-bold uppercase tracking-widest text-[#9A5636]">
                        {presentation.headline}
                      </span>
                    )}
                    <h2 className="font-desert text-3xl font-bold text-[#221C18] sm:text-4xl">
                      {group.name}
                    </h2>
                    {presentation.paragraphs.map((paragraph) => (
                      <p
                        key={paragraph}
                        className="mt-2 max-w-2xl font-editorial text-sm text-[#4E332D]/80"
                      >
                        {paragraph}
                      </p>
                    ))}
                    {presentation.callout && (
                      <p className="mt-3 max-w-2xl font-editorial text-sm italic text-[#4E332D]/90">
                        {presentation.callout}
                      </p>
                    )}
                    {presentation.badge && (
                      <p className="mt-3 font-woodblock text-[11px] font-bold uppercase tracking-wider text-[#4E332D]">
                        ✦ {presentation.badge}
                      </p>
                    )}
                  </div>
                  <img
                    src={presentation.iconPath}
                    alt=""
                    aria-hidden="true"
                    className="h-36 w-52 shrink-0 object-contain"
                  />
                </div>

                <div className="space-y-6">
                  {groupRooms.map((room, index) => (
                    <React.Fragment key={room.roomTypeId}>
                      {renderConfiguredRoom(room, index, groupRooms.length)}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            );
          })}

          {unresolvedRooms.length > 0 && (
            <div className="space-y-6">
              <div className="rounded-3xl border-2 border-[#4E332D] bg-[#FAF9F9] p-6 sm:p-8">
                <p className="font-eyebrow text-xs uppercase tracking-[0.25em] text-[#9A5636]">
                  Live Mews Inventory
                </p>
                <h2 className="mt-1 font-heading text-3xl uppercase text-[#221C18]">
                  Unassigned Room Types
                </h2>
                <p className="mt-2 max-w-2xl font-body text-sm text-[#4E332D]/75">
                  These Mews Room Types do not yet have a Cowboy Room Type Group assignment.
                </p>
              </div>
              <div className="space-y-6">
                {unresolvedRooms.map((room, index) => (
                  <RoomsListCard
                    key={room.roomTypeId}
                    room={room}
                    imageBaseUrl={imageBaseUrl}
                    color={(["paper", "copper", "smoke", "forest"] as RoomCardColor[])[index % 4]}
                    layout={index % 2 === 0 ? "left" : "right"}
                    onSelectRoom={onSelectRoom}
                    onOpenRoomDetails={onOpenRoomDetails}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
