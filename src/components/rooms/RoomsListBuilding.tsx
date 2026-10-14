import type { ReactNode } from "react";
import { BuildingWoodcut } from "@/components/icons/BuildingWoodcut";
import { RoomsListCard, type RoomCardLayout, type RoomCardTheme } from "@/components/rooms/RoomsListCard";
import type { BuildingCms } from "@/types/building-cms";
import type { ShapedRoom } from "@/types/mews";

export interface RoomsListBuildingRoomSlotProps {
  room: ShapedRoom;
  defaultCard: ReactNode;
  onSelectRoom: (room: ShapedRoom) => void;
  onOpenRoomDetails: (room: ShapedRoom) => void;
}

interface RoomsListBuildingProps {
  building: BuildingCms;
  rooms: ShapedRoom[];
  imageBaseUrl: string;
  onSelectRoom: (room: ShapedRoom) => void;
  onOpenRoomDetails: (room: ShapedRoom) => void;
  roomCardSlot?: (props: RoomsListBuildingRoomSlotProps) => ReactNode;
  className?: string;
}

const cardTheme = (index: number, total: number): RoomCardTheme => {
  if (total <= 1 || index === 0) return "paper";
  if (index === total - 1) return "lake-forest";
  return "copper";
};

const cardLayout = (index: number): RoomCardLayout =>
  index % 2 === 0 ? "left" : "right";

export function RoomsListBuilding({
  building,
  rooms,
  imageBaseUrl,
  onSelectRoom,
  onOpenRoomDetails,
  roomCardSlot,
  className = "",
}: RoomsListBuildingProps) {
  return (
    <section
      className={`relative border-t border-foreground/15 pt-16 text-foreground ${className}`}
      aria-labelledby={`building-${building.groupKey}`}
    >
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        <div className="flex flex-col items-center border-b border-foreground/15 pb-6 pt-2 text-center lg:col-span-4 lg:items-start lg:border-b-0 lg:border-r lg:pr-8 lg:text-left">
          <div className="mb-4 inline-block">
            <BuildingWoodcut group={building.groupKey} className="h-36 w-60 sm:h-40 sm:w-64" />
          </div>

          <h2
            id={`building-${building.groupKey}`}
            className="mb-1 text-balance font-heading text-4xl font-bold leading-none tracking-tight text-foreground sm:text-5xl"
          >
            {building.name}
          </h2>

          {building.subheading && (
            <p className="mb-4 mt-1 block text-balance font-label text-xs font-bold uppercase tracking-[0.25em] text-accent">
              {building.subheading}
            </p>
          )}

          {building.shortDescription && (
            <p className="mb-4 font-body text-sm leading-relaxed text-foreground/85 sm:text-base">
              {building.shortDescription}
            </p>
          )}

          {building.featureBenefits && (
            <p className="mb-5 font-body text-sm font-medium italic text-foreground/90">
              {building.featureBenefits}
            </p>
          )}

          {building.policy.length > 0 && (
            <ul className="flex flex-wrap justify-center gap-2 lg:justify-start" aria-label={`${building.name} policies`}>
              {building.policy.map((policy) => (
                <li
                  key={policy.id}
                  className="inline-flex items-center rounded-button-sm border border-foreground/20 bg-foreground/10 px-3 pb-1 pt-2 font-label text-[11px] font-bold uppercase tracking-wider text-foreground"
                >
                  <span aria-hidden="true">✦&nbsp;</span>
                  {policy.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-6 lg:col-span-8">
          {rooms.map((room, index) => {
            const defaultCard = (
              <RoomsListCard
                room={room}
                imageBaseUrl={imageBaseUrl}
                theme={cardTheme(index, rooms.length)}
                layout={cardLayout(index)}
                onSelectRoom={onSelectRoom}
                onOpenRoomDetails={onOpenRoomDetails}
              />
            );

            return (
              <div key={room.roomTypeId}>
                {roomCardSlot
                  ? roomCardSlot({ room, defaultCard, onSelectRoom, onOpenRoomDetails })
                  : defaultCard}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
