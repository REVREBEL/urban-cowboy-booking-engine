// COW-84 hotspot editor: durable pins on D1 room photos. Geometry is normalized
// source-space X/Y; the Worker validates room and amenity eligibility and
// writes COW-34 revision snapshots. No guest cutover happens here.
import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import { containedRect, nudgePoint, pointToSource, type ImageRect, type Size } from "@/lib/hotspotCanvas";
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

interface GalleryPhoto {
  placementId: string;
  mediaAssetId: string;
  sourceUrl: string | null;
  excluded: boolean;
  currentVersionId: string | null;
  altText: string | null;
  displayOrder: number;
}

interface GalleryResponse {
  items: GalleryPhoto[];
}

interface Amenity {
  id: string;
  name: string;
}

interface Hotspot {
  id: string;
  mediaAssetId: string;
  placementId: string | null;
  amenityId: string;
  sourceX: number;
  sourceY: number;
  sourceVersionId: string;
  displayOrder: number;
  status: "draft" | "published";
  reviewState: "none" | "pending" | "approved";
  reviewReason: string | null;
  hasDraft?: boolean;
  pendingDelete?: boolean;
}

interface HotspotResponse {
  roomId: string;
  items: Hotspot[];
  amenities: Amenity[];
}

interface Feedback {
  tone: "success" | "error";
  message: string;
}

const clamp = (value: number) => Math.min(1, Math.max(0, value));

function HotspotEditorCard({
  api,
  roomId,
  photo,
  hotspot,
  amenities,
  onChanged,
}: {
  api: DashboardApi;
  roomId: string;
  photo: GalleryPhoto;
  hotspot: Hotspot;
  amenities: Amenity[];
  onChanged: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [x, setX] = useState(hotspot.sourceX);
  const [y, setY] = useState(hotspot.sourceY);
  const [amenityId, setAmenityId] = useState(hotspot.amenityId);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  useEffect(() => {
    setX(hotspot.sourceX);
    setY(hotspot.sourceY);
    setAmenityId(hotspot.amenityId);
  }, [hotspot.sourceX, hotspot.sourceY, hotspot.amenityId]);

  const save = async () => {
    setBusy(true);
    setFeedback(null);
    try {
      await api.updateRoomHotspot(roomId, hotspot.id, {
        sourceX: clamp(x), sourceY: clamp(y), amenityId,
      });
      setFeedback({ tone: "success", message: "Pin updated in draft" });
      onChanged();
    } catch (error) {
      setFeedback({ tone: "error", message: error instanceof Error ? error.message : "Update failed" });
    } finally {
      setBusy(false);
    }
  };

  const review = async (reviewState: "approved" | "pending") => {
    setBusy(true);
    try {
      await api.updateRoomHotspot(roomId, hotspot.id, { reviewState });
      setFeedback({ tone: "success", message: `Review set to ${reviewState}` });
      onChanged();
    } catch (error) {
      setFeedback({ tone: "error", message: error instanceof Error ? error.message : "Review update failed" });
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setFeedback({ tone: "error", message: "Confirm removal; publish to apply" });
      return;
    }
    setBusy(true);
    try {
      await api.deleteRoomHotspot(roomId, hotspot.id);
      setFeedback({ tone: "success", message: "Removal staged — publish to apply" });
      onChanged();
    } catch (error) {
      setFeedback({ tone: "error", message: error instanceof Error ? error.message : "Removal failed" });
    } finally {
      setBusy(false);
      setConfirmDelete(false);
    }
  };

  return (
    <li className="space-y-3 rounded-lg border border-border p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Pill size="small" textCase="title">#{hotspot.displayOrder + 1}</Pill>
        <Pill variant="outline" size="small" textCase="title">{hotspot.status}</Pill>
        {hotspot.pendingDelete && <Pill colorScheme="bandana-red" size="small">Pending deletion</Pill>}
        {hotspot.hasDraft && !hotspot.pendingDelete && <Pill size="small">Unpublished edit</Pill>}
        <Pill
          colorScheme={hotspot.reviewState === "pending" ? "bandana-red" : "lake-forest"}
          size="small"
          textCase="title"
        >
          {hotspot.reviewState}
        </Pill>
      </div>
      <label className="flex flex-col gap-1 text-sm">
        Amenity
        <select
          value={amenityId}
          onChange={(event) => setAmenityId(event.target.value)}
          className="rounded-md border border-border bg-background px-3 py-2"
        >
          {amenities.map((amenity) => (
            <option key={amenity.id} value={amenity.id}>{amenity.name}</option>
          ))}
          {!amenities.some((amenity) => amenity.id === hotspot.amenityId) && (
            <option value={hotspot.amenityId}>{hotspot.amenityId}</option>
          )}
        </select>
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Source X
          <input
            type="number" min={0} max={1} step={0.01} value={x}
            onChange={(event) => setX(Number(event.target.value))}
            className="rounded-md border border-border bg-background px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Source Y
          <input
            type="number" min={0} max={1} step={0.01} value={y}
            onChange={(event) => setY(Number(event.target.value))}
            className="rounded-md border border-border bg-background px-3 py-2"
          />
        </label>
      </div>
      <p className="truncate font-mono text-xs text-muted-foreground">
        {photo.mediaAssetId} · {hotspot.sourceVersionId}
      </p>
      <div className="flex flex-wrap gap-2">
        <Button type="button" colorScheme="copper" size="small" textCase="title" disabled={busy} isLoading={busy} onClick={save}>
          Save pin
        </Button>
        <Button
          type="button" variant="outline" colorScheme="lake-forest" size="small" textCase="title"
          disabled={busy || hotspot.reviewState === "approved"} onClick={() => review("approved")}
        >
          Approve
        </Button>
        <Button
          type="button" variant="outline" colorScheme="bandana-red" size="small" textCase="title"
          disabled={busy || hotspot.reviewState === "pending"} onClick={() => review("pending")}
        >
          Flag review
        </Button>
        <Button
          type="button" variant="transparent" colorScheme="bandana-red" size="small" textCase="title"
          disabled={busy || hotspot.pendingDelete} onClick={remove}
        >
          {confirmDelete ? "Confirm delete" : "Delete pin"}
        </Button>
      </div>
      {feedback && <p className={`text-sm ${feedback.tone === "error" ? "text-destructive" : "text-muted-foreground"}`} role="status">{feedback.message}</p>}
    </li>
  );
}

function PhotoCanvas({
  photo,
  pins,
  preview,
  onPreview,
  onPlace,
}: {
  photo: GalleryPhoto;
  pins: Hotspot[];
  preview: { x: number; y: number } | null;
  onPreview: (point: { x: number; y: number }) => void;
  onPlace: (x: number, y: number) => void;
}) {
  const [failed, setFailed] = useState(false);
  const [natural, setNatural] = useState<Size | null>(null);
  const [container, setContainer] = useState<Size>({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setFailed(false);
    setNatural(null);
  }, [photo.sourceUrl]);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const measure = () => {
      const rect = node.getBoundingClientRect();
      setContainer({ width: rect.width, height: rect.height });
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const imageRect: ImageRect = natural
    ? containedRect(container, natural)
    : { left: 0, top: 0, width: container.width, height: container.height };
  const place = (event: MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const source = pointToSource(
      { x: event.clientX - rect.left, y: event.clientY - rect.top },
      imageRect,
    );
    if (source) onPlace(source.x, source.y);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      const point = preview ?? { x: 0.5, y: 0.5 };
      event.preventDefault();
      onPlace(point.x, point.y);
      return;
    }
    const next = nudgePoint(preview ?? { x: 0.5, y: 0.5 }, event.key);
    if (next) {
      event.preventDefault();
      onPreview(next);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-muted focus-visible:ring-2 focus-visible:ring-fd-ring"
      onClick={place}
      onKeyDown={onKeyDown}
      role="button"
      tabIndex={0}
      aria-label="Photo pin placement. Click, or use arrow keys to move the crosshair then press Enter to place a pin."
      data-hotspot-canvas=""
    >
      {photo.sourceUrl && !failed ? (
        <img
          src={photo.sourceUrl}
          alt={photo.altText || "Room photo"}
          onLoad={(event) => setNatural({
            width: event.currentTarget.naturalWidth,
            height: event.currentTarget.naturalHeight,
          })}
          onError={() => setFailed(true)}
          className="size-full object-contain"
        />
      ) : (
        <p className="flex size-full items-center justify-center text-sm text-muted-foreground">
          {photo.sourceUrl ? "Preview unavailable — use the X/Y inputs" : "No source URL in D1"}
        </p>
      )}
      {pins.map((pin) => (
        <span
          key={pin.id}
          aria-hidden="true"
          className="absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-paper bg-oxblood"
          style={{
            left: `${imageRect.left + pin.sourceX * imageRect.width}px`,
            top: `${imageRect.top + pin.sourceY * imageRect.height}px`,
          }}
        />
      ))}
      {preview && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-paper bg-copper/40"
          style={{
            left: `${imageRect.left + preview.x * imageRect.width}px`,
            top: `${imageRect.top + preview.y * imageRect.height}px`,
          }}
        />
      )}
    </div>
  );
}

export function RoomHotspotsPanel({ api }: { api: DashboardApi }) {
  const rooms = useDashboardResource(useCallback(() => api.getAdminRooms<Room>(), [api]));
  const [roomId, setRoomId] = useState("");
  const [placementId, setPlacementId] = useState("");
  const [placement, setPlacement] = useState<{ x: number; y: number } | null>(null);
  const [amenityId, setAmenityId] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [busy, setBusy] = useState(false);
  const [versionId, setVersionId] = useState("");
  const [fromVersionId, setFromVersionId] = useState("");
  const [toVersionId, setToVersionId] = useState("");
  const [urlOnly, setUrlOnly] = useState(false);
  const [approveReview, setApproveReview] = useState(false);
  const [replacementPlan, setReplacementPlan] = useState<{ decision: string; reviewRequired: boolean } | null>(null);

  useEffect(() => {
    if (!roomId && rooms.data?.length) setRoomId(rooms.data[0].id);
  }, [roomId, rooms.data]);

  const gallery = useDashboardResource(useCallback(
    () => roomId
      ? api.getRoomGallery<GalleryResponse>(roomId)
      : Promise.resolve({ items: [] } as GalleryResponse),
    [api, roomId],
  ));
  const hotspots = useDashboardResource(useCallback(
    () => roomId
      ? api.getRoomHotspots<HotspotResponse>(roomId)
      : Promise.resolve({ roomId, items: [], amenities: [] } as HotspotResponse),
    [api, roomId],
  ));
  const photos = (gallery.data?.items ?? []).filter((item) => !item.excluded);
  // Room and photo changes must never carry a stale selection or version.
  useEffect(() => {
    setPlacementId("");
    setPlacement(null);
    setAmenityId("");
    setVersionId("");
    setFromVersionId("");
    setToVersionId("");
    setReplacementPlan(null);
    setFeedback(null);
  }, [roomId]);
  useEffect(() => {
    if (!photos.some((item) => item.placementId === placementId)) {
      setPlacementId(photos[0]?.placementId ?? "");
      setPlacement(null);
      setVersionId("");
      setToVersionId("");
      setReplacementPlan(null);
    }
  }, [photos, placementId]);
  const photo = photos.find((item) => item.placementId === placementId);
  const pins = (hotspots.data?.items ?? []).filter(
    (pin) => pin.mediaAssetId === photo?.mediaAssetId && pin.placementId === photo?.placementId,
  );
  useEffect(() => {
    if (!versionId && photo?.currentVersionId) setVersionId(photo.currentVersionId);
    if (!fromVersionId && photo?.currentVersionId) setFromVersionId(photo.currentVersionId);
  }, [versionId, fromVersionId, photo?.currentVersionId]);

  if (rooms.loading) return <LoadingPanel label="Loading room types" />;
  if (rooms.error) return <ErrorPanel message={rooms.error} onRetry={rooms.reload} />;
  if (!rooms.data?.length) return <EmptyPanel message="No room types are published in D1 yet." />;

  const addPin = async () => {
    if (!photo || !amenityId) {
      setFeedback({ tone: "error", message: "Select an eligible amenity and place a pin first" });
      return;
    }
    setBusy(true);
    setFeedback(null);
    try {
      const created = await api.createRoomHotspot<{ mapping: Hotspot }>(roomId, {
        mediaAssetId: photo.mediaAssetId,
        placementId: photo.placementId,
        amenityId,
        sourceX: placement?.x ?? 0.5,
        sourceY: placement?.y ?? 0.5,
        sourceVersionId: photo.currentVersionId ?? versionId,
        displayOrder: pins.length,
      });
      setFeedback({
        tone: "success",
        message: created.mapping.reviewState === "pending" ? "Pin saved — review required" : "Pin saved as draft",
      });
      setPlacement(null);
      hotspots.reload();
    } catch (error) {
      setFeedback({ tone: "error", message: error instanceof Error ? error.message : "Add failed" });
    } finally {
      setBusy(false);
    }
  };

  const publish = async () => {
    if (!photo) return;
    setBusy(true);
    setFeedback(null);
    try {
      const result = await api.publishRoomHotspots<{ ok: boolean; error?: string; published?: number }>(roomId, {
        mediaAssetId: photo.mediaAssetId,
        placementId: photo.placementId,
      });
      setFeedback(result.ok
        ? { tone: "success", message: `Published ${result.published} pins` }
        : { tone: "error", message: result.error ?? "Publish blocked" });
      hotspots.reload();
    } catch (error) {
      setFeedback({ tone: "error", message: error instanceof Error ? error.message : "Publish failed" });
    } finally {
      setBusy(false);
    }
  };

  const rollback = async () => {
    if (!photo || !versionId) return;
    setBusy(true);
    try {
      const result = await api.rollbackRoomHotspots<{ ok: boolean; error?: string; restored?: number }>(roomId, {
        mediaAssetId: photo.mediaAssetId,
        placementId: photo.placementId,
        toVersionId: versionId,
      });
      setFeedback(result.ok
        ? { tone: "success", message: `Restored ${result.restored} pins` }
        : { tone: "error", message: result.error ?? "Rollback blocked" });
      hotspots.reload();
    } catch (error) {
      setFeedback({ tone: "error", message: error instanceof Error ? error.message : "Rollback failed" });
    } finally {
      setBusy(false);
    }
  };

  const replacementInput = () => ({
    mediaAssetId: photo?.mediaAssetId,
    placementId: photo?.placementId,
    fromVersionId,
    toVersionId,
    urlOnly,
    approveReview,
  });

  const plan = async () => {
    if (!photo || !fromVersionId || !toVersionId) return;
    setBusy(true);
    setFeedback(null);
    try {
      const result = await api.planHotspotReplacement<{
        decision: string; reviewRequired: boolean;
      }>(roomId, replacementInput());
      setReplacementPlan(result);
      setFeedback({
        tone: result.reviewRequired ? "error" : "success",
        message: result.reviewRequired
          ? `Decision ${result.decision} requires review before publishing`
          : `Decision ${result.decision} is safe to publish`,
      });
    } catch (error) {
      setFeedback({ tone: "error", message: error instanceof Error ? error.message : "Planning failed" });
    } finally {
      setBusy(false);
    }
  };

  const apply = async () => {
    if (!photo || !fromVersionId || !toVersionId) return;
    setBusy(true);
    setFeedback(null);
    try {
      const result = await api.applyHotspotReplacement<{
        decision: string; reviewRequired: boolean; written: number;
      }>(roomId, replacementInput());
      setReplacementPlan({ decision: result.decision, reviewRequired: result.reviewRequired });
      setFeedback({
        tone: result.reviewRequired ? "error" : "success",
        message: result.reviewRequired
          ? `${result.written} pins staged for review (${result.decision})`
          : `${result.written} pins updated (${result.decision})`,
      });
      hotspots.reload();
    } catch (error) {
      setFeedback({ tone: "error", message: error instanceof Error ? error.message : "Apply failed" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4">
        <label className="flex min-w-64 flex-1 flex-col gap-1 text-sm">
          Room type
          <select value={roomId} onChange={(event) => setRoomId(event.target.value)} className="rounded-md border border-border bg-background px-3 py-2">
            {rooms.data.map((room) => <option key={room.id} value={room.id}>{room.name}</option>)}
          </select>
        </label>
        {photos.length > 0 && (
          <label className="flex min-w-64 flex-1 flex-col gap-1 text-sm">
            Room photo
            <select value={placementId} onChange={(event) => setPlacementId(event.target.value)} className="rounded-md border border-border bg-background px-3 py-2">
              {photos.map((item) => (
                <option key={item.placementId} value={item.placementId}>
                  {item.altText || item.mediaAssetId} · #{item.displayOrder + 1}
                </option>
              ))}
            </select>
          </label>
        )}
        <Pill variant="outline" colorScheme="lake-forest" size="small" textCase="title">COW-34 revisioned</Pill>
      </div>

      <p className="text-sm text-muted-foreground">
        Click the photo to drop a pin, choose a room-eligible amenity, then save. Pending review blocks
        publishing until an editor approves the geometry.
      </p>

      {gallery.loading && <LoadingPanel label="Loading room photos" />}
      {gallery.error && <ErrorPanel message={gallery.error} onRetry={gallery.reload} />}
      {hotspots.loading && <LoadingPanel label="Loading hotspots" />}
      {hotspots.error && <ErrorPanel message={hotspots.error} onRetry={hotspots.reload} />}
      {!gallery.loading && !gallery.error && photos.length === 0 && (
        <EmptyPanel message="No linked photos in this room gallery yet." />
      )}

      {photo && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <PhotoCanvas
              photo={photo}
              pins={pins}
              preview={placement}
              onPreview={setPlacement}
              onPlace={(x, y) => setPlacement({ x, y })}
            />
            <label className="flex flex-col gap-1 text-sm">
              Amenity
              <select value={amenityId} onChange={(event) => setAmenityId(event.target.value)} className="rounded-md border border-border bg-background px-3 py-2">
                <option value="">Select an amenity</option>
                {(hotspots.data?.amenities ?? []).map((amenity) => (
                  <option key={amenity.id} value={amenity.id}>{amenity.name}</option>
                ))}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1 text-sm">
                New pin source X
                <input
                  type="number" min={0} max={1} step={0.01}
                  value={placement?.x ?? 0.5}
                  onChange={(event) => setPlacement({ x: clamp(Number(event.target.value)), y: placement?.y ?? 0.5 })}
                  className="rounded-md border border-border bg-background px-3 py-2"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                New pin source Y
                <input
                  type="number" min={0} max={1} step={0.01}
                  value={placement?.y ?? 0.5}
                  onChange={(event) => setPlacement({ x: placement?.x ?? 0.5, y: clamp(Number(event.target.value)) })}
                  className="rounded-md border border-border bg-background px-3 py-2"
                />
              </label>
            </div>
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {placement
                ? `Pin at ${placement.x.toFixed(3)}, ${placement.y.toFixed(3)}`
                : "Click the photo, use arrow keys then Enter, or enter X/Y above"}
            </p>
            <Button type="button" colorScheme="copper" size="small" textCase="title" disabled={busy} onClick={addPin}>
              Add pin
            </Button>
          </div>
          <div className="space-y-3">
            {pins.length === 0 && <EmptyPanel message="No pins on this photo yet." />}
            <ul className="grid gap-3">
              {pins.map((pin) => (
                <HotspotEditorCard
                  key={pin.id}
                  api={api}
                  roomId={roomId}
                  photo={photo}
                  hotspot={pin}
                  amenities={hotspots.data?.amenities ?? []}
                  onChanged={hotspots.reload}
                />
              ))}
            </ul>
          </div>
        </div>
      )}

      {photo && (
        <section className="space-y-3 rounded-lg border border-border p-4">
          <h2 className="text-sm font-semibold">Publication</h2>
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1 text-sm">
              Version for rollback
              <input value={versionId} onChange={(event) => setVersionId(event.target.value)} className="rounded-md border border-border bg-background px-3 py-2" />
            </label>
            <Button type="button" colorScheme="copper" size="small" textCase="title" disabled={busy} onClick={publish}>Publish pins</Button>
            <Button type="button" variant="outline" colorScheme="lake-forest" size="small" textCase="title" disabled={busy || !versionId} onClick={rollback}>Rollback</Button>
          </div>
          {feedback && (
            <p className={`text-sm ${feedback.tone === "error" ? "text-destructive" : "text-muted-foreground"}`} role="status">
              {feedback.message}
            </p>
          )}
        </section>
      )}

      {photo && (
        <section className="space-y-3 rounded-lg border border-border p-4">
          <h2 className="text-sm font-semibold">Source replacement and crop review</h2>
          <p className="text-sm text-muted-foreground">
            Planning never writes. Ambiguous geometry is classified for review and cannot publish
            until an editor approves it.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm">
              From version
              <input value={fromVersionId} onChange={(event) => setFromVersionId(event.target.value)} className="rounded-md border border-border bg-background px-3 py-2" />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              To version (same asset)
              <input value={toVersionId} onChange={(event) => setToVersionId(event.target.value)} className="rounded-md border border-border bg-background px-3 py-2" />
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={urlOnly} onChange={(event) => setUrlOnly(event.target.checked)} />
              URL-only change
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={approveReview} onChange={(event) => setApproveReview(event.target.checked)} />
              I approve a pending geometry review
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" colorScheme="lake-forest" size="small" textCase="title" disabled={busy || !fromVersionId || !toVersionId} onClick={plan}>Plan replacement</Button>
            <Button type="button" colorScheme="copper" size="small" textCase="title" disabled={busy || !fromVersionId || !toVersionId} onClick={apply}>Apply plan</Button>
          </div>
          {replacementPlan && (
            <p className="text-sm text-muted-foreground" role="status">
              Decision: {replacementPlan.decision} · {replacementPlan.reviewRequired ? "review required" : "safe to publish"}
            </p>
          )}
        </section>
      )}
    </div>
  );
}
