/**
 * AEVUM — Catalog Mode Detection
 *
 * Distinguishes between the primary AEVUM Fine Art Gallery mode (default)
 * and the CorePro Day 3 Course Compatibility mode (?mode=course or ?api_mode=*).
 * Ensures zero interference with course integration tests while presenting
 * the Nocturne Pavilion exhibition by default.
 */

export type CatalogMode = "gallery" | "course";

/**
 * Detects catalog mode from window.location.search or custom search string.
 * Gallery Mode is active by default.
 * Course Mode is triggered if mode=course or any api_mode parameter is present.
 */
export function detectCatalogMode(search?: string): CatalogMode {
  const query =
    search !== undefined ? search : typeof window !== "undefined" ? window.location.search : "";

  const params = new URLSearchParams(query);
  if (params.get("mode") === "course" || params.has("api_mode")) {
    return "course";
  }
  return "gallery";
}

export function isGalleryMode(search?: string): boolean {
  return detectCatalogMode(search) === "gallery";
}

export function isCourseMode(search?: string): boolean {
  return detectCatalogMode(search) === "course";
}
