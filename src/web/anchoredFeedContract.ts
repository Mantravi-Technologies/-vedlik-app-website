/**
 * Share-landing behaviour for the web feed (“anchored feed” UX).
 *
 * Contract (single feed surface):
 * - Home `/` and share `/signal/:segment` render the same feed component (`WebHomePage`).
 * - Initial request (no cursor): `GET …/articles?…&anchorSlug=<segment>`; omit `intent` unless the share URL intentionally carries persona.
 * - Subsequent pages: same `uiCategory` / `sort`, only `cursor` — never resend `anchorSlug`.
 * - Category changes: discard cursor semantics by refetching from page 1 and drop `anchorSlug` (anchoring is a landing gesture only).
 * - Share resolution must not walk the feed with repeated `cursor` calls; cap work to the anchored
 *   list + optional direct `GET …/articles/:slug` — deep pagination is a backend/index concern.
 */
