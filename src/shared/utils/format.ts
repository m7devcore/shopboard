/**
 * Shared String Formatting & HTML Sanitization Utilities
 *
 * Provides safe HTML character escaping to prevent XSS injection attacks
 * when dynamically rendering user- or catalog-provided text into the DOM.
 */

/**
 * Escapes characters for safe HTML injection to prevent XSS vulnerabilities.
 * Handles ampersands (&), less-than (<), greater-than (>), double quotes ("), and single quotes (').
 *
 * @param str - The raw string to escape.
 * @returns The escaped HTML string safe for template interpolation.
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
