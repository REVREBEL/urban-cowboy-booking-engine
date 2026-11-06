import type { ReactNode } from "react";
import { RoomTypeCard, type RoomTypeCardProps } from "./RoomTypeCard";

export type RoomListItemLayout = "Default" | "Row" | "RowReverse";

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
 * Figma explicitly documents the six card slots as illustrative. The React
 * implementation therefore preserves the three Figma layouts while rendering
 * the supplied room collection in order.
 */
export function RoomListItem({
  className = "",
  buildingSectionSlot = null,
  displayBuilding = true,
  layout = "Default",
  roomTypes,
}: RoomListItemProps) {
  const isDefault = layout === "Default";
  const isRowReverse = layout === "RowReverse";

  const buildingPanel =
    displayBuilding && buildingSectionSlot ? (
      <div
        data-name="BuildingSectionSlot"
        className={[
          "flex shrink-0 flex-col items-start",
          isDefault
            ? "w-full bg-[var(--room-list-building-panel,var(--alpine-linen-fade))] p-[32px]"
            : [
                "min-w-px max-w-[350px] flex-[1_0_0] self-stretch justify-center bg-[var(--room-list-building-panel,var(--secondary-foreground))] py-[40px]",
                isRowReverse ? "px-[10px]" : "px-[20px]",
              ].join(" "),
        ].join(" ")}
      >
        {buildingSectionSlot}
      </div>
    ) : null;

  const list = (
    <div
      data-name="List"
      className={[
        "flex flex-wrap",
        isDefault
          ? "w-full items-start gap-[20px]"
          : [
              "min-w-px flex-[1_0_0] content-center items-center gap-[15px] p-[20px]",
              isRowReverse ? "justify-end" : "justify-start",
            ].join(" "),
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
        isDefault ? "1352:2645" : isRowReverse ? "1378:17281" : "1352:15461"
      }
      data-layout={layout}
      className={[
        "w-full",
        isDefault
          ? "flex max-w-[1460px] flex-col items-start gap-[30px] py-[20px]"
          : [
              "flex max-w-[1542px] items-center gap-[20px] bg-primary-foreground py-[20px]",
              isRowReverse ? "px-[20px]" : "px-[10px]",
            ].join(" "),
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {isRowReverse ? list : buildingPanel}
      {isDefault ? list : isRowReverse ? buildingPanel : list}
    </div>
  );
}

export default RoomListItem;
