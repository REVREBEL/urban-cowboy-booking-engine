import type { ReactNode } from "react";
import { RoomTypeCard, type RoomTypeCardProps } from "./RoomTypeCard";

export type RoomListItemLayout =
  | "Default"
  | "Row"
  | "RowReverse"
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
  const normalizedLayout = layout === "Row Reverse" ? "RowReverse" : layout;
  const isDefault = normalizedLayout === "Default";
  const isRowReverse = normalizedLayout === "RowReverse";

  const buildingPanel =
    displayBuilding && buildingSectionSlot ? (
      <div
        data-name="BuildingSectionSlot"
        className={[
          "flex shrink-0 flex-col items-start",
          isDefault
            ? "w-full bg-[var(--room-list-building-panel,var(--alpine-linen-fade))] p-[32px]"
            : [
                "order-1 w-full self-stretch justify-center bg-[var(--room-list-building-panel,var(--secondary-foreground))] py-[40px] xl:min-w-px xl:max-w-[350px] xl:flex-[1_0_0]",
                isRowReverse
                  ? "px-[10px] xl:order-2"
                  : "px-[20px] xl:order-1",
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
              "order-2 w-full content-center items-center gap-[15px] p-[20px] xl:min-w-px xl:flex-[1_0_0]",
              isRowReverse
                ? "justify-start xl:order-1 xl:justify-end"
                : "justify-start xl:order-2",
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
      data-layout={normalizedLayout}
      className={[
        "w-full",
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
      {buildingPanel}
      {list}
    </div>
  );
}

export default RoomListItem;
