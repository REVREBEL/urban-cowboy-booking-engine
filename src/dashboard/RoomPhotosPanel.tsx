// COW-72 read-only gallery + COW-84 editing. All values come from D1 and edits
// go through the shared COW-38 editor; guests only see published placements.
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, EyeOff, Eye, Plus, X } from "lucide-react";
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

interface GalleryItem {
  placementId: string;
  mediaAssetId: string;
  displayOrder: number;
  originalFilename: string | null;
  sourceUrl: string | null;
  sourceAssetId: string | null;
  excluded: boolean;
  width: number | null;
  height: number | null;
  altText: string | null;
  caption: string | null;
  description: string | null;
  tags: string[] | null;
  currentVersionId: string | null;
  cloudinaryPublicId: string | null;
  cloudinaryVersion: string | null;
  sha256: string | null;
}

interface DraftItem {
  mediaAssetId: string;
  displayOrder: number;
  excluded: boolean;
  altText: string | null;
  caption: string | null;
  description: string | null;
}

interface Revision {
  id: string;
  revision: number;
  publishedAt: string | null;
  createdAt: string;
}

interface GalleryResponse {
  roomId: string;
  items: GalleryItem[];
  itemId: string | null;
  status: string | null;
  workingRevisionId: string | null;
  hasUnpublishedDraft: boolean;
  revisions: Revision[];
  draft: { items: DraftItem[] } | null;
}

interface MediaItem {
  id: string;
  filename: string | null;
  sourceAssetId: string | null;
  sourceUrl: string | null;
  width: number | null;
  height: number | null;
  altText: string | null;
}

type Feedback = { tone: "success" | "error"; message: string } | null;

export function RoomPhotosPanel({ api }: { api: DashboardApi }) {
  const loadRooms = useCallback(() => api.getAdminRooms<Room>(), [api]);
  const loadMedia = useCallback(() => api.getAdminMedia<MediaItem>(), [api]);
  const rooms = useDashboardResource(loadRooms);
  const media = useDashboardResource(loadMedia);
  const [roomId, setRoomId] = useState("");

  useEffect(() => {
    if (!roomId && rooms.data?.length) setRoomId(rooms.data[0].id);
  }, [roomId, rooms.data]);

  if (rooms.loading || media.loading) return <LoadingPanel label="Loading room gallery" />;
  if (rooms.error) return <ErrorPanel message={rooms.error} onRetry={rooms.reload} />;
  if (media.error) return <ErrorPanel message={media.error} onRetry={media.reload} />;
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
          Squarespace URL registry
        </Pill>
      </div>

      <p className="text-sm text-muted-foreground">
        Photos are imported as ordered source-URL references. Images are shown directly from the
        registry; no upload or Cloudinary account is needed. Edits are saved as drafts and only
        affect guests after publishing.
      </p>

      {roomId ? (
        <RoomGallery
          key={roomId}
          api={api}
          roomId={roomId}
          catalog={media.data ?? []}
        />
      ) : (
        <EmptyPanel message="Select a room type to edit its gallery." />
      )}
    </div>
  );
}

function RoomGallery({ api, roomId, catalog }: {
  api: DashboardApi;
  roomId: string;
  catalog: MediaItem[];
}) {
  const load = useCallback(() => api.getRoomGallery<GalleryResponse>(roomId), [api, roomId]);
  const gallery = useDashboardResource(load);
  const [items, setItems] = useState<DraftItem[]>([]);
  const [dirty, setDirty] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [saving, setSaving] = useState(false);
  const [rollbackId, setRollbackId] = useState("");
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [addId, setAddId] = useState("");

  useEffect(() => {
    if (!gallery.data) return;
    const source = gallery.data.draft?.items ?? gallery.data.items;
    setItems(source.map((item, index) => ({
      mediaAssetId: item.mediaAssetId,
      displayOrder: index + 1,
      excluded: item.excluded ?? false,
      altText: item.altText ?? null,
      caption: item.caption ?? null,
      description: item.description ?? null,
    })));
    setRollbackId(gallery.data.revisions[0]?.id ?? "");
    setDirty(false);
    setFailedImages(new Set());
  }, [gallery.data]);

  const previewFor = (mediaAssetId: string): string | null =>
    catalog.find((entry) => entry.id === mediaAssetId)?.sourceUrl ?? null;

  const change = (next: DraftItem[], message: string) => {
    setItems(next.map((item, index) => ({ ...item, displayOrder: index + 1 })));
    setDirty(true);
    setFeedback({ tone: "success", message });
  };

  const move = (index: number, direction: -1 | 1) => {
    const destination = index + direction;
    if (destination < 0 || destination >= items.length) return;
    const next = [...items];
    [next[index], next[destination]] = [next[destination], next[index]];
    change(next, `Moved ${next[destination].mediaAssetId} in the gallery.`);
  };

  const add = () => {
    if (!addId || items.some((item) => item.mediaAssetId === addId)) return;
    const mediaItem = catalog.find((entry) => entry.id === addId);
    change([...items, {
      mediaAssetId: addId, displayOrder: items.length + 1, excluded: false,
      altText: mediaItem?.altText ?? null, caption: null, description: null,
    }], "Photo linked. Save the draft to keep it.");
    setAddId("");
  };

  const saveDraft = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      const payload = { items };
      if (gallery.data?.itemId && gallery.data.workingRevisionId) {
        await api.saveEditorDraft(gallery.data.itemId, {
          payload, expectedRevisionId: gallery.data.workingRevisionId,
        });
      } else {
        await api.createEditorItem({ kind: "room_gallery", slug: roomId, payload });
      }
      setDirty(false);
      setFeedback({ tone: "success", message: "Draft saved. Publish to update the guest gallery." });
      gallery.reload();
    } catch (cause) {
      setFeedback({ tone: "error", message: cause instanceof Error ? cause.message : String(cause) });
    } finally {
      setSaving(false);
    }
  };

  const publish = async () => {
    if (dirty || !gallery.data?.itemId) {
      setFeedback({ tone: "error", message: "Save your changes before publishing." });
      return;
    }
    setSaving(true);
    setFeedback(null);
    try {
      const result = await api.publishEditorItem<{
        snapshotRefreshed?: boolean; amenitySnapshotsRefreshed?: boolean;
      }>(gallery.data.itemId);
      const refreshed = result.snapshotRefreshed !== false && result.amenitySnapshotsRefreshed !== false;
      setFeedback(refreshed
        ? { tone: "success", message: "Published. The guest gallery now uses these values." }
        : { tone: "error", message: "Published, but the snapshot refresh failed. Please retry." });
      gallery.reload();
    } catch (cause) {
      setFeedback({ tone: "error", message: cause instanceof Error ? cause.message : String(cause) });
    } finally {
      setSaving(false);
    }
  };

  const rollback = async () => {
    if (!gallery.data?.itemId || !rollbackId) return;
    setSaving(true);
    setFeedback(null);
    try {
      await api.rollbackEditorItem(gallery.data.itemId, rollbackId);
      setFeedback({ tone: "success", message: "Rolled back to the selected revision." });
      gallery.reload();
    } catch (cause) {
      setFeedback({ tone: "error", message: cause instanceof Error ? cause.message : String(cause) });
    } finally {
      setSaving(false);
    }
  };

  if (gallery.loading) return <LoadingPanel label="Loading gallery" />;
  if (gallery.error) return <ErrorPanel message={gallery.error} onRetry={gallery.reload} />;
  if (!gallery.data) return <EmptyPanel message="No gallery data for this room." />;

  const available = catalog.filter((entry) => !items.some((item) => item.mediaAssetId === entry.id));

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
        {dirty
          ? "You have unsaved edits. Save the draft before publishing."
          : gallery.data.hasUnpublishedDraft
            ? "This room has unpublished gallery changes. Guests still see the published version."
            : "Showing published gallery order and metadata."}
      </p>
      {feedback && (
        <p className="text-sm" role={feedback.tone === "error" ? "alert" : "status"} data-tone={feedback.tone}>
          {feedback.message}
        </p>
      )}

      {items.length === 0 ? (
        <EmptyPanel message="No photos are linked to this room yet. Link one below." />
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => {
            const url = previewFor(item.mediaAssetId);
            const failed = failedImages.has(item.mediaAssetId);
            const meta = gallery.data!.items.find((row) => row.mediaAssetId === item.mediaAssetId);
            return (
              <li key={item.mediaAssetId} className="flex flex-col gap-3 rounded-lg border border-border p-4">
                {url && !failed ? (
                  <img
                    src={url}
                    alt={item.altText ?? meta?.originalFilename ?? "Room photo"}
                    className="aspect-square w-full rounded-md object-cover"
                    onError={() => setFailedImages((current) => new Set(current).add(item.mediaAssetId))}
                  />
                ) : (
                  <div className="flex aspect-square items-center justify-center rounded-md bg-muted text-sm text-muted-foreground">
                    {failed ? "Image unavailable" : "No preview URL in the registry"}
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-2">
                  <Pill size="xsmall" variant="outline">#{index + 1}</Pill>
                  {item.excluded && <Pill size="xsmall" colorScheme="copper">Excluded</Pill>}
                  <span className="truncate text-xs text-muted-foreground">
                    {meta?.originalFilename ?? item.mediaAssetId}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button iconOnly icon={<ArrowLeft />} aria-label={`Move ${item.mediaAssetId} earlier`}
                    variant="outline" colorScheme="light" size="xsmall" textCase="title"
                    disabled={index === 0} onClick={() => move(index, -1)} />
                  <Button iconOnly icon={<ArrowRight />} aria-label={`Move ${item.mediaAssetId} later`}
                    variant="outline" colorScheme="light" size="xsmall" textCase="title"
                    disabled={index === items.length - 1} onClick={() => move(index, 1)} />
                  <Button iconOnly icon={item.excluded ? <EyeOff /> : <Eye />}
                    aria-label={`${item.excluded ? "Include" : "Exclude"} ${item.mediaAssetId}`}
                    aria-pressed={item.excluded}
                    variant={item.excluded ? "filled" : "outline"} colorScheme="copper"
                    size="xsmall" textCase="title"
                    onClick={() => change(items.map((entry, position) => position === index
                      ? { ...entry, excluded: !entry.excluded } : entry), "Exclusion updated.")} />
                  <Button iconOnly icon={<X />} aria-label={`Unlink ${item.mediaAssetId}`}
                    variant="outline" colorScheme="light" size="xsmall" textCase="title"
                    onClick={() => change(items.filter((_, position) => position !== index), "Photo unlinked.")} />
                </div>
                <label className="flex flex-col gap-1 text-xs">
                  Alt text
                  <input className="rounded-md border border-border bg-background px-2 py-1"
                    value={item.altText ?? ""}
                    onChange={(event) => change(items.map((entry, position) => position === index
                      ? { ...entry, altText: event.target.value || null } : entry), "Alt text updated.")} />
                </label>
                <label className="flex flex-col gap-1 text-xs">
                  Caption
                  <input className="rounded-md border border-border bg-background px-2 py-1"
                    value={item.caption ?? ""}
                    onChange={(event) => change(items.map((entry, position) => position === index
                      ? { ...entry, caption: event.target.value || null } : entry), "Caption updated.")} />
                </label>
                <label className="flex flex-col gap-1 text-xs">
                  Description
                  <textarea rows={2} className="rounded-md border border-border bg-background px-2 py-1"
                    value={item.description ?? ""}
                    onChange={(event) => change(items.map((entry, position) => position === index
                      ? { ...entry, description: event.target.value || null } : entry), "Description updated.")} />
                </label>
              </li>
            );
          })}
        </ul>
      )}

      <section aria-labelledby="link-photo" className="card flex flex-wrap items-end gap-3 p-4">
        <div>
          <h3 id="link-photo" className="font-heading text-lg">Link a photo</h3>
          <p className="text-sm text-muted-foreground">Choose an image already in the tenant registry.</p>
        </div>
        {available.length === 0 ? (
          <EmptyPanel message="Every tenant image is already linked to this room." />
        ) : (
          <>
            <label className="flex min-w-56 flex-1 flex-col gap-1 text-sm">
              Registry image
              <select value={addId} onChange={(event) => setAddId(event.target.value)}
                className="rounded-md border border-border bg-background px-3 py-2">
                <option value="">Select an image</option>
                {available.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.filename ?? entry.id}
                  </option>
                ))}
              </select>
            </label>
            <Button icon={<Plus />} variant="outline" colorScheme="lake-forest" size="small"
              textCase="title" disabled={!addId} onClick={add}>
              Link photo
            </Button>
          </>
        )}
      </section>

      <section aria-labelledby="gallery-publish" className="card flex flex-wrap items-end gap-3 p-4">
        <h3 id="gallery-publish" className="font-heading text-lg">Save and publish</h3>
        <Button variant="outline" colorScheme="lake-forest" size="small" textCase="title"
          isLoading={saving} onClick={() => void saveDraft()}>
          Save draft
        </Button>
        <Button variant="filled" colorScheme="lake-forest" size="small" textCase="title"
          isLoading={saving} disabled={!gallery.data.itemId || dirty} onClick={() => void publish()}>
          Publish
        </Button>
        {gallery.data.revisions.length > 0 && (
          <>
            <label className="flex flex-col gap-1 text-sm">
              Revision
              <select value={rollbackId} onChange={(event) => setRollbackId(event.target.value)}
                className="rounded-md border border-border bg-background px-3 py-2">
                {gallery.data.revisions.map((revision) => (
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
          </>
        )}
      </section>
    </div>
  );
}
