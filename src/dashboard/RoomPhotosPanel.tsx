// COW-84 room photo gallery editor, backed by the D1 media registry.
// Read and write paths are tenant scoped by the Worker; this panel only holds
// unsaved form state and never supplies a tenant itself.
import { useCallback, useEffect, useState } from "react";
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
  width: number | null;
  height: number | null;
  altText: string | null;
  caption: string | null;
  description: string | null;
  sourceUrl: string | null;
  isExcluded: boolean;
  tags: string[] | null;
  currentVersionId: string | null;
  cloudinaryPublicId: string | null;
  cloudinaryVersion: string | null;
  sha256: string | null;
}

type GalleryDraft = {
  displayOrder: number;
  altText: string;
  caption: string;
  description: string;
  isExcluded: boolean;
};

function draftFrom(item: GalleryItem): GalleryDraft {
  return {
    displayOrder: item.displayOrder,
    altText: item.altText ?? "",
    caption: item.caption ?? "",
    description: item.description ?? "",
    isExcluded: item.isExcluded,
  };
}

function PhotoPreview({ item }: { item: GalleryItem }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [item.sourceUrl]);
  const label = item.altText || item.originalFilename || "Untitled image";

  if (!item.sourceUrl || failed) {
    return (
      <div
        role="img"
        aria-label={label}
        className="flex aspect-square items-center justify-center rounded-md bg-muted px-3 text-center text-sm text-muted-foreground"
      >
        {item.sourceUrl ? `${label} (preview unavailable)` : "No source URL in D1"}
      </div>
    );
  }
  return (
    <img
      src={item.sourceUrl}
      alt={label}
      loading="lazy"
      onError={() => setFailed(true)}
      className="aspect-square w-full rounded-md object-cover"
    />
  );
}

function GalleryCard({
  api,
  roomId,
  item,
  onChanged,
}: {
  api: DashboardApi;
  roomId: string;
  item: GalleryItem;
  onChanged: () => void;
}) {
  const [draft, setDraft] = useState<GalleryDraft>(() => draftFrom(item));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [confirmUnlink, setConfirmUnlink] = useState(false);

  useEffect(() => setDraft(draftFrom(item)), [item]);
  const dirty = JSON.stringify(draft) !== JSON.stringify(draftFrom(item));

  const save = async () => {
    if (!dirty) return;
    setBusy(true);
    setMessage("");
    try {
      await api.updateRoomGalleryItem(roomId, item.placementId, {
        displayOrder: draft.displayOrder,
        altText: draft.altText || null,
        caption: draft.caption || null,
        description: draft.description || null,
        excluded: draft.isExcluded,
      });
      setMessage("Saved to D1");
      onChanged();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Save failed");
    } finally {
      setBusy(false);
    }
  };

  const unlink = async () => {
    if (!confirmUnlink) {
      setConfirmUnlink(true);
      setMessage("Confirm unlink to remove this placement");
      return;
    }
    setBusy(true);
    try {
      await api.unlinkRoomGalleryItem(roomId, item.placementId);
      onChanged();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unlink failed");
      setBusy(false);
    }
  };

  return (
    <li className="flex flex-col gap-3 rounded-lg border border-border p-4">
      <div className={item.isExcluded ? "opacity-60" : undefined}>
        <PhotoPreview item={item} />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Pill size="small" textCase="title">#{draft.displayOrder}</Pill>
        {item.width && item.height && (
          <Pill variant="outline" size="small">{item.width}×{item.height}</Pill>
        )}
        {item.isExcluded && <Pill colorScheme="bandana-red" size="small">Excluded</Pill>}
      </div>

      <label className="flex flex-col gap-1 text-sm">
        Alt text
        <input
          value={draft.altText}
          onChange={(event) => setDraft({ ...draft, altText: event.target.value })}
          className="rounded-md border border-border bg-background px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Caption
        <input
          value={draft.caption}
          onChange={(event) => setDraft({ ...draft, caption: event.target.value })}
          className="rounded-md border border-border bg-background px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Description
        <textarea
          value={draft.description}
          onChange={(event) => setDraft({ ...draft, description: event.target.value })}
          rows={2}
          className="rounded-md border border-border bg-background px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Display order
        <input
          type="number"
          min={0}
          max={10000}
          value={draft.displayOrder}
          onChange={(event) => setDraft({ ...draft, displayOrder: Number(event.target.value) })}
          className="rounded-md border border-border bg-background px-3 py-2"
        />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={draft.isExcluded}
          onChange={(event) => setDraft({ ...draft, isExcluded: event.target.checked })}
        />
        Exclude from published gallery
      </label>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          colorScheme="copper"
          size="small"
          textCase="title"
          disabled={!dirty || busy}
          isLoading={busy}
          onClick={save}
        >
          Save changes
        </Button>
        <Button
          type="button"
          variant="outline"
          colorScheme="lake-forest"
          size="small"
          textCase="title"
          disabled={!dirty || busy}
          onClick={() => {
            setDraft(draftFrom(item));
            setConfirmUnlink(false);
            setMessage("");
          }}
        >
          Reset
        </Button>
        <Button
          type="button"
          variant="transparent"
          colorScheme="bandana-red"
          size="small"
          textCase="title"
          disabled={busy}
          onClick={unlink}
        >
          {confirmUnlink ? "Confirm unlink" : "Unlink"}
        </Button>
      </div>
      <p className="text-sm text-muted-foreground" role="status">{message}</p>
      <p className="truncate font-mono text-xs text-muted-foreground">
        {item.mediaAssetId}
      </p>
    </li>
  );
}

interface UnlinkedItem {
  placementId: string;
  mediaAssetId: string;
  placementType: string;
  displayOrder: number;
  altText: string | null;
  caption: string | null;
  description: string | null;
  excluded: boolean;
  note: string | null;
}

function UnlinkedGallery({
  api,
  roomId,
  onRestored,
}: {
  api: DashboardApi;
  roomId: string;
  onRestored: () => void;
}) {
  const load = useCallback(() => api.getUnlinkedRoomGallery<UnlinkedItem>(roomId), [api, roomId]);
  const unlinked = useDashboardResource(load);
  const [busyId, setBusyId] = useState("");
  const [message, setMessage] = useState("");

  if (unlinked.loading) return <LoadingPanel label="Loading unlinked photos" />;
  if (unlinked.error) return <ErrorPanel message={unlinked.error} onRetry={unlinked.reload} />;
  if (!unlinked.data?.length) return null;

  const restore = async (placementId: string) => {
    setBusyId(placementId);
    setMessage("");
    try {
      await api.restoreRoomGalleryItem(roomId, placementId);
      setMessage("Placement restored with its original metadata");
      unlinked.reload();
      onRestored();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Restore failed");
    } finally {
      setBusyId("");
    }
  };

  return (
    <section className="space-y-3 rounded-lg border border-dashed border-border p-4">
      <h2 className="text-sm font-semibold">Unlinked photos</h2>
      <p className="text-sm text-muted-foreground">
        Unlinking keeps a D1 snapshot of the placement and its editorial state so it can be restored.
      </p>
      <ul className="space-y-2">
        {unlinked.data.map((item) => (
          <li key={item.placementId} className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="truncate font-mono text-xs">{item.mediaAssetId}</span>
            <span className="text-muted-foreground">#{item.displayOrder} · {item.placementType}</span>
            <Button
              type="button"
              variant="outline"
              colorScheme="lake-forest"
              size="small"
              textCase="title"
              isLoading={busyId === item.placementId}
              disabled={Boolean(busyId)}
              onClick={() => restore(item.placementId)}
            >
              Restore
            </Button>
          </li>
        ))}
      </ul>
      <p className="text-sm text-muted-foreground" role="status">{message}</p>
    </section>
  );
}

export function RoomPhotosPanel({ api }: { api: DashboardApi }) {
  const loadRooms = useCallback(() => api.getAdminRooms<Room>(), [api]);
  const rooms = useDashboardResource(loadRooms);
  const [roomId, setRoomId] = useState("");

  useEffect(() => {
    if (!roomId && rooms.data?.length) setRoomId(rooms.data[0].id);
  }, [roomId, rooms.data]);

  if (rooms.loading) return <LoadingPanel label="Loading room types" />;
  if (rooms.error) return <ErrorPanel message={rooms.error} onRetry={rooms.reload} />;
  if (!rooms.data?.length) return <EmptyPanel message="No room types are published in D1 yet." />;

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
          D1 media registry
        </Pill>
      </div>

      <p className="text-sm text-muted-foreground">
        Previews use the Squarespace source URLs stored by the COW-67 importer. Edits save to the
        tenant-scoped D1 gallery and are audited; guest Photo Journey reads stay on the published
        source until the cutover gate passes.
      </p>

      {roomId ? (
        // Remounting on room change resets the resource so the previous room's
        // photos can never render under a new selection or alongside an error.
        <RoomGallery key={roomId} api={api} roomId={roomId} />
      ) : (
        <EmptyPanel message="Select a room type to view its gallery." />
      )}
    </div>
  );
}

function RoomGallery({ api, roomId }: { api: DashboardApi; roomId: string }) {
  const loadGallery = useCallback(
    () => api.getRoomGallery<GalleryItem>(roomId),
    [api, roomId],
  );
  const gallery = useDashboardResource(loadGallery);
  // Only render when we have fresh data for the current room; hide the
  // previous room's cached results while loading or after a failed request.
  const ready = !gallery.loading && !gallery.error && (gallery.data?.length ?? 0) > 0;

  return (
    <>
      {gallery.loading && <LoadingPanel label="Loading gallery" />}
      {gallery.error && <ErrorPanel message={gallery.error} onRetry={gallery.reload} />}
      {!gallery.loading && !gallery.error && !gallery.data?.length && (
        <EmptyPanel message="No media placements are linked to this room yet." />
      )}

      {ready && (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(gallery.data ?? []).map((item) => (
            <GalleryCard
              key={item.placementId}
              api={api}
              roomId={roomId}
              item={item}
              onChanged={gallery.reload}
            />
          ))}
        </ul>
      )}

      <UnlinkedGallery api={api} roomId={roomId} onRestored={gallery.reload} />
    </>
  );
}
