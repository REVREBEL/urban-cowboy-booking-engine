import { useState } from "react";
import { FocusAmenityAction } from "./FocusAmenityAction";
import { CmsAmenityIcon } from "./CmsAmenityIcon";
import type { TourIcon } from "@/journey/tour";

export interface SideFocusAmenityItem {
  id: string;
  title: string;
  description?: string | null;
  iconPath?: string | null;
  icon: TourIcon;
}
export interface SideFocusAmenityBarProps {
  amenities: readonly SideFocusAmenityItem[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

/** Receives the ordered amenities not marked on the currently visible photo. */
export function SideFocusAmenityBar({ amenities, open, onOpenChange, className = "" }: SideFocusAmenityBarProps) {
  const [localOpen, setLocalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const expanded = open ?? localOpen;
  const selectedIndex = Math.max(0, amenities.findIndex((item) => item.id === selectedId));
  const selected = amenities[selectedIndex];
  const toggle = (value: boolean) => {
    if (open === undefined) setLocalOpen(value);
    onOpenChange?.(value);
  };
  const cycle = (direction: number) => {
    if (amenities.length) setSelectedId(amenities[(selectedIndex + direction + amenities.length) % amenities.length].id);
  };
  if (!amenities.length) return null;

  return (
    <section aria-label="More amenities and features" className={`w-full max-w-[680px] ${className}`}>
      {!expanded ? (
        <button type="button" aria-expanded={false} onClick={() => toggle(true)}
          className="flex w-full items-center gap-5 py-3 text-left text-primary focus-visible:outline-2 focus-visible:outline-offset-4">
          <span className="grid size-[50px] shrink-0 place-items-center bg-primary-foreground shadow-[0_0_28px_rgba(242,242,242,.8)]">
            <FocusAmenityAction state="Active" className="size-[35px]" />
          </span>
          <span className="flex min-w-0 flex-col font-heading uppercase leading-none tracking-[1px] drop-shadow-[0_0_55px_#363333]">
            <span className="text-[clamp(23px,4vw,41px)]">More amenities</span>
            <span className="text-[clamp(32px,6vw,62px)]">&amp; Features</span>
          </span>
        </button>
      ) : (
        <div className="flex h-[min(581px,80dvh)] min-h-0 items-end gap-6">
          <div className="relative flex h-full w-[164px] shrink-0 items-end">
            <div className="flex h-full min-h-0 w-[149px] flex-col rounded-[40px] bg-primary p-[2px] shadow-[0_0_10px_rgba(242,242,242,.8)]">
              <div className="flex min-h-0 flex-1 flex-col rounded-[39px] border-[1.5px] border-accent bg-secondary-foreground p-[2px]">
                <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain rounded-[35px] border-[1.5px] border-accent bg-secondary-foreground px-2 pb-6 pt-10">
                  {amenities.map((item) => (
                    <button key={item.id} type="button" aria-pressed={selected?.id === item.id} aria-label={item.title}
                      onClick={() => setSelectedId(item.id)}
                      className={`grid min-h-[110px] w-full shrink-0 place-items-center rounded-xl border-2 p-2 focus-visible:outline-2 ${selected?.id === item.id ? "border-accent bg-primary/35" : "border-transparent hover:border-accent/50"}`}>
                      <CmsAmenityIcon iconPath={item.iconPath} fallback={item.icon} className="max-h-[92px] max-w-full object-contain" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button type="button" aria-label="Close amenities" onClick={() => toggle(false)}
              className="absolute left-[60px] top-6 z-10 grid size-[45px] place-items-center bg-accent text-primary focus-visible:outline-2">
              <FocusAmenityAction state="Active" className="size-[35px] border-0 bg-transparent text-primary" />
            </button>
            <div className="absolute left-[142px] top-1/2 flex -translate-y-1/2 flex-col gap-3">
              <button type="button" aria-label="Previous amenity" onClick={() => cycle(-1)} className="grid size-8 place-items-center focus-visible:outline-2">
                <img src="/assets/icons/ui/ui-arrow_single_line_up.svg" alt="" className="h-8 w-8 object-contain" />
              </button>
              <button type="button" aria-label="Next amenity" onClick={() => cycle(1)} className="grid size-8 place-items-center focus-visible:outline-2">
                <img src="/assets/icons/ui/ui-arrow_single_line_down.svg" alt="" className="h-8 w-8 object-contain" />
              </button>
            </div>
          </div>
          <div className="min-w-0 flex-1 self-center" aria-live="polite">
            {selected && <div key={selected.id} className="max-h-[min(350px,70dvh)] overflow-y-auto rounded-xl bg-white p-6 text-secondary shadow-lg sm:p-8">
              <h3 className="font-heading text-[clamp(20px,3vw,24px)] leading-tight text-accent">{selected.title}</h3>
              {selected.description && <p className="mt-3 font-body text-[15px] leading-relaxed">{selected.description}</p>}
            </div>}
          </div>
        </div>
      )}
    </section>
  );
}
export default SideFocusAmenityBar;
