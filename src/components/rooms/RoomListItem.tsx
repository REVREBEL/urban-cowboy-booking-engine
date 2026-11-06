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
          ? "flex w-full min-w-0 flex-col items-start bg-[var(--room-list-building-panel,var(--alpine-linen-fade))] p-[32px]"
          : "flex w-full min-w-0 self-stretch flex-col items-start justify-center bg-[var(--room-list-building-panel,var(--secondary-foreground))] px-[20px] py-[40px] xl:w-[400px] xl:shrink-0"
      }
    >
      {buildingContent}
    </div>
  ) : null;

  const list = (
    <div
      data-name="List"
      className={[
        "grid w-full min-w-0 grid-cols-[repeat(auto-fit,minmax(min(100%,330px),1fr))] items-start gap-[20px]",
        isDefault
          ? ""
          : "p-[20px]",
      ].join(" ")}
    >
      {roomTypes.map(({ id, ...roomType }) => (
        <RoomTypeCard key={id} {...roomType} className={["w-full", roomType.className].filter(Boolean).join(" ")} />
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
        // The 1790px Figma frame defines proportions, not a minimum viewport.
        // Let cards reflow within Storybook, mobile, and real booking layouts.
        "w-full min-w-0 max-w-full",
        isDefault
          ? "flex flex-col items-stretch gap-[30px] py-[20px]"
          : "flex flex-col items-stretch gap-[40px] bg-primary-foreground p-[20px] xl:flex-row xl:items-start",
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
