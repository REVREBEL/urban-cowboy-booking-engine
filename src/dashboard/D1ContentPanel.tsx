import { useEffect, useState } from "react";
import { fetchD1Module } from "@/lib/d1Client";
import type { D1Event } from "@/types/content";

export function D1ContentPanel() {
  const [events, setEvents] = useState<D1Event[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchD1Module<D1Event>("events")
      .then(setEvents)
      .catch((e) => setError(String(e)));
  }, []);

  return (
    <section className="p-4 space-y-3">
      <h2 className="text-lg font-semibold">D1 Events</h2>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <ul className="space-y-2">
        {events.map((e) => (
          <li key={e.id} className="border rounded p-2">
            <div className="font-medium">{e.title}</div>
            <div className="text-sm text-muted-foreground">{e.startsAt}</div>
          </li>
        ))}
      </ul>
      {events.length === 0 && !error && (
        <p className="text-sm text-muted-foreground">No events.</p>
      )}
    </section>
  );
}