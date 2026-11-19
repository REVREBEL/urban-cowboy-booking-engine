// COW-72 room photo gallery panel, backed by the D1 media registry.
import { useCallback, useEffect, useState } from "react";
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
  tags: string[] | null;
  currentVersionId: string | null;
  cloudinaryPublicId: string | null;
  cloudinaryVersion: string | null;
  sha256: string | null;
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
          Registry source
        </Pill>
      </div>

      <p className="text-sm text-muted-foreground">
        Gallery order, alt text and placement come from the D1 media registry. Image delivery URLs are
        supplied by the Cloudinary contract once ingestion is enabled.
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
  // Never show cached data while the new request is pending or has failed.
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
            <li key={item.placementId} className="flex flex-col gap-3 rounded-lg border border-border p-4">
              <div className="flex aspect-square items-center justify-center rounded-md bg-muted text-sm text-muted-foreground">
                {item.altText || item.originalFilename || "Untitled image"}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Pill size="small" textCase="title">#{item.displayOrder}</Pill>
                {item.width && item.height && (
                  <Pill variant="outline" size="small">{item.width}×{item.height}</Pill>
                )}
              </div>
              <dl className="space-y-1 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Media ID</dt>
                  <dd className="truncate font-mono text-xs">{item.mediaAssetId}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Version</dt>
                  <dd className="truncate font-mono text-xs">{item.currentVersionId ?? "none"}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Cloudinary</dt>
                  <dd className="truncate font-mono text-xs">{item.cloudinaryPublicId ?? "not ingested"}</dd>
                </div>
                {item.caption && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Caption</dt>
                    <dd className="text-right">{item.caption}</dd>
                  </div>
                )}
              </dl>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
