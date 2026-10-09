import type { ComponentType, SVGProps } from "react";

type IconC = ComponentType<SVGProps<SVGSVGElement>>;

export type RoomTag = {
  key: string;
  label: string;
  Icon: IconC;
};

// Pure presentation only. Room facts and merchandising rules belong in the
// property/domain layer, not inside reusable UI components.
export function RoomBenefitsOverlay({ tags = [] }: { tags?: RoomTag[] }) {
  if (!tags.length) return null;
  return (
    <div className="pointer-events-none absolute right-2 top-2 flex flex-col items-end gap-1.5">
      {tags.map((tag) => (
        <span
          key={tag.key}
          className="inline-flex items-center gap-1 rounded-full bg-smoke/65 px-2 py-1 text-[11px] font-semibold text-cream shadow-sm backdrop-blur"
        >
          <tag.Icon aria-hidden="true" className="h-3.5 w-3.5" /> {tag.label}
        </span>
      ))}
    </div>
  );
}

export function RoomTagsPanel({ tags = [] }: { tags?: RoomTag[] }) {
  if (!tags.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <span
          key={tag.key}
          className="inline-flex items-center gap-1.5 rounded-full bg-turquoise/10 px-2.5 py-1 text-xs font-semibold text-teal-deep"
        >
          <tag.Icon aria-hidden="true" className="h-3.5 w-3.5" /> {tag.label}
        </span>
      ))}
    </div>
  );
}
