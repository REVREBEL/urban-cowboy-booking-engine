/**
 * COW-99: provider-neutral contract for temporary image-URL sources.
 *
 * Webflow is the current adapter. A later Squarespace adapter implements the
 * same `parse` contract and emits `sameAs` aliases for photos that replace an
 * already imported image. The importer resolves aliases to permanent master
 * media IDs, so switching providers changes only the adapter and the URL.
 */

export interface ProviderAlias {
  aliasType: string;
  aliasValue: string;
}

export interface CanonicalRoomType {
  id: string;
  name: string;
  slug: string | null;
  mewsRoomCategoryId: string | null;
}

export interface SourcePhoto {
  /** Stable identifier within the source provider. Never used as a master ID. */
  sourceAssetId: string;
  /** Mutable delivery URL. */
  url: string;
  /** Canonical D1 room type ID, resolved from an explicit source reference. */
  roomTypeRef: string;
  /** One-based gallery position. Ordering is a placement attribute, not identity. */
  position: number;
  altText: string | null;
  width: number | null;
  height: number | null;
  /** Stable source identifiers used to resolve the permanent master media ID. */
  aliases: ProviderAlias[];
  /** Provider-neutral key used only when a brand-new master ID must be derived. */
  logicalKey: string;
  /** Explicit link to an existing alias when a provider swaps the image source. */
  sameAs?: ProviderAlias;
}

export type SourceIssueKind =
  | "unmatched-room"
  | "invalid-url"
  | "unresolved-reference"
  | "duplicate-source-id";

export interface SourceIssue {
  kind: SourceIssueKind;
  detail: string;
}

export interface PhotoSourceSnapshot {
  provider: string;
  sourceUrl: string;
  fetchedAt: string;
  digest: string;
  photos: SourcePhoto[];
  /** Rooms seen in the source, including ones whose gallery is now empty. */
  roomTypeRefs: string[];
  issues: SourceIssue[];
}

export interface PhotoSourceAdapterInput {
  payload: unknown;
  roomTypes: readonly CanonicalRoomType[];
  sourceUrl?: string;
  fetchedAt?: string;
  digest?: string;
}

export interface PhotoSourceAdapter {
  readonly provider: string;
  parse(input: PhotoSourceAdapterInput): PhotoSourceSnapshot;
}
