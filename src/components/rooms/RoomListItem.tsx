import type { ReactNode } from "react";
import { RoomTypeCard, type RoomTypeCardProps } from "./RoomTypeCard";

export type RoomListItemLayout = "Default" | "Row" | "Row Reverse";

export type RoomTypeCardData = RoomTypeCardProps & {
  id: string;
};

export interface RoomListItemProps {
  className?: string;
  buildingSectionSlot?: ReactNode | null;
  displayBuilding?: boolean;
  layout?: RoomListItemLayout;
  roomTypes: readonly RoomTypeCardData[];
}

/**
 * Figma RoomListItem component set (1352:15460).
 *
 * Figma documents the card slots as illustrative only. The React version keeps
 * the exact three layout variants while populating the card list from the
 * supplied collection, in the supplied order.
 */
export function RoomListItem({
  className = "",
  buildingSectionSlot = null,
  displayBuilding = true,
  layout = "Default",
  roomTypes,
}: RoomListItemProps) {
  const isDefault = layout === "Default";
  const isRow = layout === "Row";
  const isRowReverse = layout === "Row Reverse";

  const buildingContent = buildingSectionSlot;

  const buildingPanel = displayBuilding && buildingContent ? (
    <div
      data-name="BuildingSectionSlot"
      className={
        isDefault
          ? "flex w-[1790px] shrink-0 flex-col items-start bg-[var(--room-list-building-panel,var(--alpine-linen-fade))] p-[32px]"
          : "flex w-[400px] shrink-0 self-stretch flex-col items-start justify-center bg-[var(--room-list-building-panel,var(--secondary-foreground))] px-[20px] py-[40px]"
      }
    >
      {buildingContent}
    </div>
  ) : null;

  const list = (
    <div
      data-name="List"
      className={[
        "flex shrink-0 flex-wrap content-start items-start gap-[20px]",
        isDefault
          ? "w-[1790px]"
          : "w-[1330px] p-[20px]",
      ].join(" ")}
    >
      {roomTypes.map(({ id, ...roomType }) => (
        <RoomTypeCard key={id} {...roomType} />
      ))}
    </div>
  );

  return (
    <div
      data-figma-node={
        isDefault ? "1352:2645" : isRow ? "1352:15461" : "1357:16356"
      }
      data-layout={layout}
      className={[
        // Preserve the owning Figma component's exact frame geometry:
        // 1790px frame, 20px row padding, 400px building slot, 40px gap,
        // and 1330px list. The source component intentionally paints 20px
        // beyond the nominal frame in Row variants.
        "w-[1790px] overflow-visible",
        isDefault
          ? "flex flex-col flex-wrap content-start items-start gap-[30px] py-[20px]"
          : "flex items-center gap-[40px] bg-primary-foreground p-[20px]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {isRowReverse ? list : buildingPanel}
      {isDefault ? list : isRow ? list : buildingPanel}
    </div>
  );
}

export default RoomListItem;
