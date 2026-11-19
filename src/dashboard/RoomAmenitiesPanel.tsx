// COW-73 room amenity editor. Canonical values come from D1; edits are saved
// through the shared COW-38 revision API and only affect guests on publish.
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Lock, LockOpen, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import type { DashboardApi } from "./api";
import { EmptyPanel, ErrorPanel, LoadingPanel } from "./states";
import { useDashboardResource } from "./useDashboardResource";

interface Room {
  id: string;
  name: string;
  slug: string | null;
}

interface RevisionSummary {
  id: string;
  revision: number;
  publishedAt: string | null;
  createdAt: string;
}

interface AmenityContentPayload {
  name?: string;
  shortName: string;
  shortDescription: string | null;
  longDescription: string | null;
  imagePath: string | null;
  imageName: string | null;
  active: boolean;
}

interface CatalogAmenity {
  id: string;
  name: string;
  sortOrder: number;
  imageName: string | null;
  imagePath: string | null;
  shortName: string;
  shortDescription: string | null;
  longDescription: string | null;
  active: boolean;
  itemId: string | null;
  status: string | null;
  hasUnpublishedDraft: boolean;
  workingRevisionId: string | null;
  revisions: RevisionSummary[];
  draft: AmenityContentPayload | null;
}

interface Assignment {
  amenityId: string;
  displayOrder: number;
  excluded: boolean;
}

interface RoomAmenitiesResponse {
  roomId: string;
  roomName: string;
  items: Assignment[];
  itemId: string | null;
  status: string | null;
  hasUnpublishedDraft: boolean;
  workingRevisionId: string | null;
  revisions: RevisionSummary[];
  draft: { items: Assignment[] } | null;
}

type Feedback = { tone: "success" | "error"; message: string } | null;

const ICON_PATH = /^assets\/icons\/[a-z0-9_-]+(?:\/[a-z0-9_-]+)*\.svg$/i;
const ICON_NAME = /^[a-z0-9_-]+\.svg$/i;

function FormFeedback({ feedback }: { feedback: Feedback }) {
  if (!feedback) return null;
  return (
    <p
      className="text-sm"
      role={feedback.tone === "error" ? "alert" : "status"}
      aria-live="polite"
      data-tone={feedback.tone}
    >
      {feedback.message}
    </p>
  );
}

export function RoomAmenitiesPanel({ api }: { api: DashboardApi }) {
  const loadRooms = useCallback(() => api.getAdminRooms<Room>(), [api]);
  const loadCatalog = useCallback(() => api.getAdminAmenities<CatalogAmenity>(), [api]);
  const rooms = useDashboardResource(loadRooms);
  const catalog = useDashboardResource(loadCatalog);
  const [roomId, setRoomId] = useState("");
  const [mode, setMode] = useState<"assignments" | "content">("assignments");

  useEffect(() => {
    if (!roomId && rooms.data?.length) setRoomId(rooms.data[0].id);
  }, [roomId, rooms.data]);

  if (rooms.loading || catalog.loading) return <LoadingPanel label="Loading room amenities" />;
  if (rooms.error) return <ErrorPanel message={rooms.error} onRetry={rooms.reload} />;
  if (catalog.error) return <ErrorPanel message={catalog.error} onRetry={catalog.reload} />;
  if (!rooms.data?.length) return <EmptyPanel message="No room types are available in D1 yet." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4">
        <label className="flex min-w-64 flex-1 flex-col gap-1 text-sm">
          Room type
          <select
            value={roomId}
            onChange={(event) => setRoomId(event.target.value)}
            className="rounded-md border border-border bg-background px-3 py-2"
          >
            {rooms.data.map((room) => (
              <option key={room.id} value={room.id}>{room.name}</option>
            ))}
          </select>
        </label>
        <Pill variant="outline" colorScheme="lake-forest" size="small" textCase="title">
          D1 published source
        </Pill>
      </div>

      <div role="tablist" aria-label="Amenity editor" className="flex flex-wrap gap-2">
        <Button
          role="tab"
          id="tab-assignments"
          aria-selected={mode === "assignments"}
          aria-controls="panel-assignments"
          variant={mode === "assignments" ? "filled" : "outline"}
          colorScheme="lake-forest"
          size="small"
          textCase="title"
          onClick={() => setMode("assignments")}
        >
          Room assignments
        </Button>
        <Button
          role="tab"
          id="tab-content"
          aria-selected={mode === "content"}
          aria-controls="panel-content"
          variant={mode === "content" ? "filled" : "outline"}
          colorScheme="lake-forest"
          size="small"
          textCase="title"
          onClick={() => setMode("content")}
        >
          Amenity content
        </Button>
      </div>

      {mode === "assignments" ? (
        <div role="tabpanel" id="panel-assignments" aria-labelledby="tab-assignments">
          {roomId ? (
            <RoomAssignments
              key={roomId}
              api={api}
              roomId={roomId}
              amenities={catalog.data ?? []}
              onPublished={catalog.reload}
            />
          ) : (
            <EmptyPanel message="Select a room type to edit its amenities." />
          )}
        </div>
      ) : (
        <div role="tabpanel" id="panel-content" aria-labelledby="tab-content">
          <AmenityContentEditor api={api} amenities={catalog.data ?? []} onSaved={catalog.reload} />
        </div>
      )}
    </div>
  );
}

function RoomAssignments({
  api, roomId, amenities, onPublished,
}: {
  api: DashboardApi;
  roomId: string;
  amenities: CatalogAmenity[];
  onPublished: () => void;
}) {
  const load = useCallback(
    () => api.getRoomAmenities<RoomAmenitiesResponse>(roomId),
    [api, roomId],
  );
  const room = useDashboardResource(load);
  const [items, setItems] = useState<Assignment[]>([]);
  const [dirty, setDirty] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [saving, setSaving] = useState(false);
  const [rollbackId, setRollbackId] = useState("");

  useEffect(() => {
    if (!room.data) return;
    const next = room.data.draft?.items ?? room.data.items;
    setItems(next.map((item, index) => ({ ...item, displayOrder: index })));
    setRollbackId(room.data.revisions[0]?.id ?? "");
    setDirty(false);
  }, [room.data]);

  const nameFor = (id: string) => amenities.find((amenity) => amenity.id === id)?.name ?? id;
  const assigned = useMemo(() => new Set(items.map((item) => item.amenityId)), [items]);
  const available = amenities.filter((amenity) => !assigned.has(amenity.id));

  const change = (next: Assignment[], message: string) => {
    setItems(next.map((item, index) => ({ ...item, displayOrder: index })));
    setDirty(true);
    setFeedback({ tone: "success", message });
  };

  const move = (index: number, direction: -1 | 1) => {
    const destination = index + direction;
    if (destination < 0 || destination >= items.length) return;
    const next = [...items];
    [next[index], next[destination]] = [next[destination], next[index]];
    change(next, `Moved ${nameFor(next[destination].amenityId)}.`);
  };

  const toggleRestricted = (index: number) => {
    const next = items.map((item, position) =>
      position === index ? { ...item, excluded: !item.excluded } : item);
    change(next, next[index].excluded
      ? `Restricted ${nameFor(next[index].amenityId)} to photo tags.`
      : `${nameFor(next[index].amenityId)} is visible in the general list again.`);
  };

  const add = (amenityId: string) => {
    if (assigned.has(amenityId)) return;
    change([...items, { amenityId, displayOrder: items.length, excluded: false }],
      `Added ${nameFor(amenityId)}.`);
  };

  const remove = (amenityId: string) => {
    change(items.filter((item) => item.amenityId !== amenityId), `Removed ${nameFor(amenityId)}.`);
  };

  const saveDraft = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      const payload = { items: items.map((item, index) => ({ ...item, displayOrder: index })) };
      if (room.data?.itemId && room.data.workingRevisionId) {
        await api.saveEditorDraft(room.data.itemId, {
          payload, expectedRevisionId: room.data.workingRevisionId,
        });
      } else {
        await api.createEditorItem({ kind: "room_amenities", slug: roomId, payload });
      }
      setDirty(false);
      setFeedback({ tone: "success", message: "Draft saved. Publish to update the guest experience." });
      room.reload();
    } catch (cause) {
      setFeedback({ tone: "error", message: cause instanceof Error ? cause.message : String(cause) });
    } finally {
      setSaving(false);
    }
  };

  const publish = async () => {
    if (!room.data?.itemId) {
      setFeedback({ tone: "error", message: "Save a draft before publishing." });
      return;
    }
    setSaving(true);
    setFeedback(null);
    try {
      await api.publishEditorItem(room.data.itemId);
      setFeedback({ tone: "success", message: "Published. Room cards and details now use these values." });
      room.reload();
      onPublished();
    } catch (cause) {
      setFeedback({ tone: "error", message: cause instanceof Error ? cause.message : String(cause) });
    } finally {
      setSaving(false);
    }
  };

  const rollback = async () => {
    if (!room.data?.itemId || !rollbackId) {
      setFeedback({ tone: "error", message: "Choose a revision to roll back to." });
      return;
    }
    setSaving(true);
    setFeedback(null);
    try {
      await api.rollbackEditorItem(room.data.itemId, rollbackId);
      setFeedback({ tone: "success", message: "Rolled back to the selected revision." });
      room.reload();
      onPublished();
    } catch (cause) {
      setFeedback({ tone: "error", message: cause instanceof Error ? cause.message : String(cause) });
    } finally {
      setSaving(false);
    }
  };

  if (room.loading) return <LoadingPanel label="Loading room assignments" />;
  if (room.error) return <ErrorPanel message={room.error} onRetry={room.reload} />;
  if (!room.data) return <EmptyPanel message="No assignment data for this room." />;

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        {dirty
          ? "You have unsaved edits. Save the draft before publishing."
          : room.data.hasUnpublishedDraft
            ? "This room has unpublished changes. Published values are still shown to guests."
            : "Published assignments are shown below. Edit and publish to change the guest experience."}
      </p>
      <FormFeedback feedback={feedback} />

      <section aria-labelledby="assigned-heading" className="space-y-3">
        <h3 id="assigned-heading" className="font-heading text-lg">
          Assigned amenities <Pill size="xsmall">{items.length}</Pill>
        </h3>
        {items.length === 0 ? (
          <EmptyPanel message="No amenities are assigned to this room yet." />
        ) : (
          <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, index) => (
              <li key={item.amenityId} className="flex flex-col gap-2 rounded-lg border border-border p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">{nameFor(item.amenityId)}</span>
                  <Pill size="xsmall" variant="outline">#{index}</Pill>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    iconOnly
                    icon={<ArrowLeft />}
                    aria-label={`Move ${nameFor(item.amenityId)} earlier`}
                    variant="outline"
                    colorScheme="light"
                    size="xsmall"
                    textCase="title"
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                  />
                  <Button
                    iconOnly
                    icon={<ArrowRight />}
                    aria-label={`Move ${nameFor(item.amenityId)} later`}
                    variant="outline"
                    colorScheme="light"
                    size="xsmall"
                    textCase="title"
                    disabled={index === items.length - 1}
                    onClick={() => move(index, 1)}
                  />
                  <Button
                    iconOnly
                    icon={item.excluded ? <Lock /> : <LockOpen />}
                    aria-label={`${item.excluded ? "Unrestrict" : "Restrict"} ${nameFor(item.amenityId)}`}
                    aria-pressed={item.excluded}
                    variant={item.excluded ? "filled" : "outline"}
                    colorScheme="copper"
                    size="xsmall"
                    textCase="title"
                    onClick={() => toggleRestricted(index)}
                  />
                  <Button
                    iconOnly
                    icon={<X />}
                    aria-label={`Remove ${nameFor(item.amenityId)} from this room`}
                    variant="outline"
                    colorScheme="light"
                    size="xsmall"
                    textCase="title"
                    onClick={() => remove(item.amenityId)}
                  />
                </div>
                {item.excluded && (
                  <p className="text-xs text-muted-foreground">
                    Hidden from the general list unless tagged on a room photo.
                  </p>
                )}
              </li>
            ))}
          </ol>
        )}
      </section>

      <section aria-labelledby="available-heading" className="space-y-3">
        <h3 id="available-heading" className="font-heading text-lg">Available amenities</h3>
        {available.length === 0 ? (
          <EmptyPanel message="Every amenity in this tenant is assigned to this room." />
        ) : (
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {available.map((amenity) => (
              <li key={amenity.id}>
                <Button
                  icon={<Plus />}
                  aria-label={`Add ${amenity.name} to this room`}
                  variant="outline"
                  colorScheme="light"
                  size="small"
                  textCase="title"
                  className="w-full"
                  onClick={() => add(amenity.id)}
                >
                  {amenity.name}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="publish-heading" className="card space-y-3 p-4">
        <h3 id="publish-heading" className="font-heading text-lg">Save and publish</h3>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" colorScheme="lake-forest" size="small" textCase="title"
            isLoading={saving} onClick={() => void saveDraft()}>
            Save draft
          </Button>
          <Button variant="filled" colorScheme="lake-forest" size="small" textCase="title"
            isLoading={saving} disabled={!room.data.itemId || dirty} onClick={() => void publish()}>
            Publish
          </Button>
        </div>
        {room.data.revisions.length > 0 && (
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1 text-sm">
              Revision
              <select value={rollbackId} onChange={(event) => setRollbackId(event.target.value)}
                className="rounded-md border border-border bg-background px-3 py-2">
                {room.data.revisions.map((revision) => (
                  <option key={revision.id} value={revision.id}>
                    r{revision.revision}{revision.publishedAt ? " (published)" : ""}
                  </option>
                ))}
              </select>
            </label>
            <Button variant="outline" colorScheme="copper" size="small" textCase="title"
              isLoading={saving} onClick={() => void rollback()}>
              Roll back
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}

function AmenityContentEditor({
  api, amenities, onSaved,
}: {
  api: DashboardApi;
  amenities: CatalogAmenity[];
  onSaved: () => void;
}) {
  const [selectedId, setSelectedId] = useState("");
  const [form, setForm] = useState<AmenityContentPayload | null>(null);
  const [editorItemId, setEditorItemId] = useState<string | null>(null);
  const [expectedRevisionId, setExpectedRevisionId] = useState<string | null>(null);
  const [revisions, setRevisions] = useState<RevisionSummary[]>([]);
  const [rollbackId, setRollbackId] = useState("");
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [saving, setSaving] = useState(false);

  const selected = amenities.find((amenity) => amenity.id === selectedId) ?? null;

  useEffect(() => {
    if (!selected) {
      setForm(null);
      setEditorItemId(null);
      setExpectedRevisionId(null);
      setRevisions([]);
      return;
    }
    const source = selected.draft ?? {
      name: selected.name,
      shortName: selected.shortName,
      shortDescription: selected.shortDescription,
      longDescription: selected.longDescription,
      imagePath: selected.imagePath,
      imageName: selected.imageName,
      active: selected.active,
    };
    setForm({
      shortName: source.shortName || selected.name,
      shortDescription: source.shortDescription ?? null,
      longDescription: source.longDescription ?? null,
      imagePath: source.imagePath ?? null,
      imageName: source.imageName ?? null,
      active: source.active ?? true,
    });
    setEditorItemId(selected.itemId);
    setExpectedRevisionId(selected.workingRevisionId);
    setRevisions(selected.revisions);
    setRollbackId(selected.revisions[0]?.id ?? "");
    setFeedback(null);
  }, [selected]);

  const set = <K extends keyof AmenityContentPayload>(key: K, value: AmenityContentPayload[K]) => {
    setForm((current) => (current ? { ...current, [key]: value } : current));
  };

  const validate = (): string | null => {
    if (!form) return "Select an amenity first.";
    if (!form.shortName.trim()) return "Short name is required.";
    if (form.imagePath && !ICON_PATH.test(form.imagePath)) {
      return "Icon path must be a site-local assets/icons/*.svg path.";
    }
    if (form.imageName && !ICON_NAME.test(form.imageName)) {
      return "Icon name must be a *.svg filename.";
    }
    return null;
  };

  const saveDraft = async () => {
    const invalid = validate();
    if (invalid || !form) {
      setFeedback({ tone: "error", message: invalid ?? "Invalid form." });
      return;
    }
    setSaving(true);
    setFeedback(null);
    try {
      const payload = { ...form, shortName: form.shortName.trim() };
      let itemId = editorItemId;
      if (itemId && expectedRevisionId) {
        const result = await api.saveEditorDraft<{ id: string; revisionId: string }>(itemId, {
          payload, expectedRevisionId,
        });
        itemId = result.id;
        setExpectedRevisionId(result.revisionId);
        setRevisions((current) => [
          ...current,
          { id: result.revisionId, revision: current.length + 1, publishedAt: null, createdAt: "" },
        ]);
      } else {
        const result = await api.createEditorItem<{ id: string; revisionId: string }>({
          kind: "amenity_content", slug: selectedId, payload,
        });
        itemId = result.id;
        setEditorItemId(result.id);
        setExpectedRevisionId(result.revisionId);
        setRevisions((current) => [
          ...current,
          { id: result.revisionId, revision: current.length + 1, publishedAt: null, createdAt: "" },
        ]);
      }
      setFeedback({ tone: "success", message: "Draft saved. Publish to update guest content." });
      onSaved();
    } catch (cause) {
      setFeedback({ tone: "error", message: cause instanceof Error ? cause.message : String(cause) });
    } finally {
      setSaving(false);
    }
  };

  const publish = async () => {
    if (!editorItemId) {
      setFeedback({ tone: "error", message: "Save a draft before publishing." });
      return;
    }
    setSaving(true);
    setFeedback(null);
    try {
      await api.publishEditorItem(editorItemId);
      setFeedback({ tone: "success", message: "Published. Descriptions and icons now use these values." });
      onSaved();
    } catch (cause) {
      setFeedback({ tone: "error", message: cause instanceof Error ? cause.message : String(cause) });
    } finally {
      setSaving(false);
    }
  };

  const rollback = async () => {
    if (!editorItemId || !rollbackId) {
      setFeedback({ tone: "error", message: "Choose a revision to roll back to." });
      return;
    }
    setSaving(true);
    setFeedback(null);
    try {
      await api.rollbackEditorItem(editorItemId, rollbackId);
      setFeedback({ tone: "success", message: "Rolled back to the selected revision." });
      onSaved();
    } catch (cause) {
      setFeedback({ tone: "error", message: cause instanceof Error ? cause.message : String(cause) });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(14rem,1fr)_2fr]">
      <section aria-labelledby="amenity-list-heading" className="space-y-2">
        <h3 id="amenity-list-heading" className="font-heading text-lg">Amenity</h3>
        <ul className="flex max-h-125 flex-col gap-1 overflow-y-auto rounded-md border border-border p-2">
          {amenities.map((amenity) => (
            <li key={amenity.id}>
              <Button
                aria-pressed={selectedId === amenity.id}
                variant={selectedId === amenity.id ? "filled" : "outline"}
                colorScheme="light"
                size="small"
                textCase="title"
                className="w-full"
                onClick={() => setSelectedId(amenity.id)}
              >
                {amenity.shortName || amenity.name}
              </Button>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="amenity-form-heading" className="card space-y-4 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <h3 id="amenity-form-heading" className="font-heading text-lg">
            {selected ? selected.name : "Select an amenity"}
          </h3>
          {selected?.hasUnpublishedDraft && <Pill size="xsmall" colorScheme="copper">Unpublished draft</Pill>}
        </div>
        <FormFeedback feedback={feedback} />
        {!selected || !form ? (
          <EmptyPanel message="Choose an amenity on the left to edit its published content." />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm">
                Short name
                <input className="rounded-md border border-border bg-background px-3 py-2"
                  value={form.shortName} onChange={(event) => set("shortName", event.target.value)} />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                Icon path
                <input className="rounded-md border border-border bg-background px-3 py-2"
                  placeholder="assets/icons/icons-simple/name.svg"
                  value={form.imagePath ?? ""}
                  onChange={(event) => set("imagePath", event.target.value.trim() || null)} />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                Icon name (used when path is blank)
                <input className="rounded-md border border-border bg-background px-3 py-2"
                  placeholder="name.svg"
                  value={form.imageName ?? ""}
                  onChange={(event) => set("imageName", event.target.value.trim() || null)} />
              </label>
              <label className="flex items-center gap-2 self-end text-sm">
                <input type="checkbox" checked={form.active}
                  onChange={(event) => set("active", event.target.checked)} />
                Active (visible on the live site)
              </label>
            </div>
            <label className="flex flex-col gap-1 text-sm">
              Short description
              <textarea className="rounded-md border border-border bg-background px-3 py-2" rows={2}
                value={form.shortDescription ?? ""}
                onChange={(event) => set("shortDescription", event.target.value.trim() || null)} />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Long description
              <textarea className="rounded-md border border-border bg-background px-3 py-2" rows={4}
                value={form.longDescription ?? ""}
                onChange={(event) => set("longDescription", event.target.value.trim() || null)} />
            </label>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" colorScheme="lake-forest" size="small" textCase="title"
                isLoading={saving} onClick={() => void saveDraft()}>
                Save draft
              </Button>
              <Button variant="filled" colorScheme="lake-forest" size="small" textCase="title"
                isLoading={saving} disabled={!editorItemId} onClick={() => void publish()}>
                Publish
              </Button>
            </div>
            {revisions.length > 0 && (
              <div className="flex flex-wrap items-end gap-3">
                <label className="flex flex-col gap-1 text-sm">
                  Revision
                  <select value={rollbackId} onChange={(event) => setRollbackId(event.target.value)}
                    className="rounded-md border border-border bg-background px-3 py-2">
                    {revisions.map((revision) => (
                      <option key={revision.id} value={revision.id}>
                        r{revision.revision}{revision.publishedAt ? " (published)" : ""}
                      </option>
                    ))}
                  </select>
                </label>
                <Button variant="outline" colorScheme="copper" size="small" textCase="title"
                  isLoading={saving} onClick={() => void rollback()}>
                  Roll back
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
