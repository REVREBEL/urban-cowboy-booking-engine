import type { ReactNode } from "react";
import { RoomTypeCard, type RoomTypeCardProps } from "./RoomTypeCard";

export type RoomListItemLayout =
  | "Default"
  | "Row"
  | "RowReverse"
  /** @deprecated Use "RowReverse", matching the current Figma variant name. */
  | "Row Reverse";

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
  const normalizedLayout = layout === "Row Reverse" ? "RowReverse" : layout;
  const isDefault = normalizedLayout === "Default";
  const isRow = normalizedLayout === "Row";
  const isRowReverse = normalizedLayout === "RowReverse";

  const buildingContent = buildingSectionSlot;

  const buildingPanel = displayBuilding && buildingContent ? (
    <div
      data-name="BuildingSectionSlot"
      className={
        [
          isDefault
            ? "flex w-full min-w-0 flex-col items-start bg-[var(--room-list-building-panel,var(--alpine-linen-fade))] p-[32px]"
            : "flex w-full min-w-0 self-stretch flex-col items-start justify-center bg-[var(--room-list-building-panel,var(--secondary-foreground))] px-[20px] py-[40px] xl:w-[350px] xl:shrink-0",
          isRowReverse ? "order-first xl:order-none" : "",
        ]
          .filter(Boolean)
          .join(" ")
      }
    >
      {buildingContent}
    </div>
  ) : null;

  const list = (
    <div
      data-name="List"
      className={[
        "flex w-full min-w-0 flex-wrap content-start items-start",
        isDefault ? "gap-[20px]" : "flex-1 gap-[15px] p-[20px]",
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
        isDefault ? "1352:2645" : isRow ? "1352:15461" : "1378:17281"
      }
      data-layout={normalizedLayout}
      className={[
        "w-full min-w-0",
        isDefault
          ? "flex max-w-[1460px] flex-col items-start gap-[30px] py-[20px]"
          : [
              "flex max-w-[1542px] flex-col items-stretch gap-[20px] bg-primary-foreground py-[20px] xl:flex-row xl:items-center",
              isRowReverse ? "px-[20px]" : "px-[10px]",
            ].join(" "),
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {isRowReverse ? (
        <>
          {list}
          {buildingPanel}
        </>
      ) : (
        <>
          {buildingPanel}
          {list}
        </>
      )}
    </div>
  );
}

export default RoomListItem;
