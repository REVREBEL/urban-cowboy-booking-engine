export interface MewsCategoryImageAssignment {
  CategoryId?: string | null;
  ImageId?: string | null;
  Ordering?: number | null;
}

/**
 * Resolve category images in the order configured in Mews Operations.
 *
 * `ImageIds` is retained as a compatibility fallback, but Mews' supported
 * ordering contract lives on `CategoryImageAssignments.Ordering`.
 */
export function orderedCategoryImageIds(
  categoryId: string,
  assignments: readonly MewsCategoryImageAssignment[] | null | undefined,
  legacyImageIds: readonly string[] | null | undefined,
): string[] {
  const assigned = (assignments ?? [])
    .map((assignment, sourceIndex) => ({ assignment, sourceIndex }))
    .filter(
      ({ assignment }) =>
        assignment.CategoryId === categoryId &&
        typeof assignment.ImageId === "string" &&
        assignment.ImageId.length > 0,
    )
    .sort(
      (a, b) =>
        (a.assignment.Ordering ?? Number.MAX_SAFE_INTEGER) -
          (b.assignment.Ordering ?? Number.MAX_SAFE_INTEGER) ||
        a.sourceIndex - b.sourceIndex,
    )
    .map(({ assignment }) => assignment.ImageId as string);

  return assigned.length ? [...new Set(assigned)] : [...new Set(legacyImageIds ?? [])];
}
