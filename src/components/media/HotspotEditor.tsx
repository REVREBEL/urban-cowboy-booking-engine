import { useState } from "react";
import type { FocusHotspot } from "@/lib/mediaRegistry";

interface Props {
  hotspots: FocusHotspot[];
  onChange: (next: FocusHotspot[]) => void;
}

export function HotspotEditor({ hotspots, onChange }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  const update = (id: string, patch: Partial<FocusHotspot>) => {
    onChange(hotspots.map((h) => (h.id === id ? { ...h, ...patch } : h)));
  };

  return (
    <div className="space-y-2">
      {hotspots.map((h) => (
        <div
          key={h.id}
          className={`border rounded p-2 cursor-pointer ${selected === h.id ? "ring-2 ring-primary" : ""}`}
          onClick={() => setSelected(h.id)}
        >
          <div className="text-sm font-medium">{h.label ?? h.id}</div>
          <div className="text-xs text-muted-foreground">
            x={h.x.toFixed(3)} y={h.y.toFixed(3)} v{h.mediaVersion}
          </div>
          {selected === h.id && (
            <div className="mt-2 flex gap-2">
              <button
                className="text-xs underline"
                onClick={(e) => {
                  e.stopPropagation();
                  update(h.id, { x: Math.min(1, h.x + 0.01) });
                }}
              >
                +x
              </button>
              <button
                className="text-xs underline"
                onClick={(e) => {
                  e.stopPropagation();
                  update(h.id, { y: Math.min(1, h.y + 0.01) });
                }}
              >
                +y
              </button>
            </div>
          )}
        </div>
      ))}
      {hotspots.length === 0 && (
        <p className="text-sm text-muted-foreground">No hotspots.</p>
      )}
    </div>
  );
}